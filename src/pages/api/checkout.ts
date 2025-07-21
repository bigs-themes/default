export const prerender = false;
import type { APIRoute } from 'astro';
import { DatabaseService } from '@/lib/database';
import { z } from 'zod';

const OrderSchema = z.object({
  buyerName: z.string().min(2).max(100),
  buyerAddress: z.string().min(5).max(255),
  buyerPhone: z.string().min(8).max(20),
  buyerNotes: z.string().max(255).optional(),
  paymentMethod: z.enum(['COD', 'VietQR', 'Payoo', 'Fundiin']),
  products: z.array(z.object({
    id: z.string(),
    quantity: z.number().min(1),
    variant: z.string().optional()
  })).min(1)
});

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const formData = await request.formData();
    // Lấy CSRF token từ form và cookie
    const csrfToken = formData.get('csrfToken');
    const csrfTokenCookie = cookies.get('csrfToken')?.value;
    if (!csrfToken || csrfToken !== csrfTokenCookie) {
      return new Response(JSON.stringify({ error: 'CSRF token không hợp lệ' }), { status: 403 });
    }
    
    // Lấy các trường từ form
    const buyerName = formData.get('buyerName')?.toString() || '';
    const buyerEmail = formData.get('buyerEmail')?.toString() || '';
    const buyerAddress = formData.get('buyerAddress')?.toString() || '';
    const buyerPhone = formData.get('buyerPhone')?.toString() || '';
    const buyerNotes = formData.get('buyerNotes')?.toString() || '';
    const shippingDetails = formData.get('shippingDetails')?.toString() || '';
    const shippingFee = formData.get('shippingFee')?.toString() || '0';
    const paymentMethod = formData.get('paymentMethod')?.toString() as 'COD'|'VietQR'|'Payoo'|'Fundiin';
   
    // products là JSON string
    let products: any[] = [];
    try {
      products = JSON.parse(formData.get('products')?.toString() || '[]');
    } catch {
      return new Response(JSON.stringify({ error: 'Dữ liệu sản phẩm không hợp lệ' }), { status: 400 });
    }
    
    // Validate
    const parsed = OrderSchema.safeParse({ buyerName, buyerEmail, buyerAddress, buyerPhone, buyerNotes, paymentMethod, products });
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: 'Dữ liệu không hợp lệ', details: parsed.error.errors }), { status: 400 });
    }
    
    // Lấy lại thông tin sản phẩm từ DB để tính giá và kiểm tra tồn kho
    const url = new URL(request.url);
    const host = url.hostname; // ví dụ: shop1.domain.com
    const shopId = host.split('.')[0]; // shop1
    console.log('shopId:', shopId);
    
    // Kiểm tra shopId có tồn tại không, nếu không thì tạo mới
    const shopExists = await DatabaseService.executeQuery(
      shopId,
      'SELECT 1 FROM Shop WHERE id = ?',
      [shopId]
    );
    
    if (shopExists.length === 0) {
      console.log('Shop không tồn tại, tạo mới shop:', shopId);
      try {
        await DatabaseService.executeQuery(
          shopId,
          'INSERT INTO Shop (id, name) VALUES (?, ?)',
          [shopId, `Shop ${shopId.toUpperCase()}`]
        );
        console.log('Đã tạo shop mới:', shopId);
      } catch (error) {
        console.error('Lỗi khi tạo shop:', error);
        return new Response(JSON.stringify({ error: 'Không thể tạo shop' }), { status: 500 });
      }
    }
    
    const productIds = products.map(p => `'${p.id}'`).join(',');
    const dbProducts = await DatabaseService.executeQuery(
      shopId,
      `SELECT id, price, title FROM Product WHERE id IN (${productIds})`
    );
    
    const dbProductIds = dbProducts.map((row: any) => row.id);
    const missingIds = products.filter(p => !dbProductIds.includes(p.id)).map(p => p.id);
    if (missingIds.length > 0) {
      return new Response(JSON.stringify({ error: 'Một số sản phẩm không tồn tại', missingIds }), { status: 400 });
    }
    
    // Tính tổng tiền
    let total = 0;
    const orderProducts = products.map(p => {
      const prod = dbProducts.find((row: any) => row.id === p.id);
      const price = Number(prod?.price) || 0;
      total += price * Number(p.quantity);
      return {
        productId: p.id,
        quantity: Number(p.quantity),
        listedPrice: price,
        salesPrice: price,
        itemName: prod?.title,
        itemVariant: p.variant || '',
        itemMedia: p?.image || ''
      };
    });

    // Sinh orderId không trùng
    async function generateUniqueOrderId(shopId: string): Promise<string> {
      let orderId: string;
      let exists = true;
      do {
        orderId = crypto.randomUUID();
        const result = await DatabaseService.executeQuery(
          shopId,
          'SELECT 1 FROM "Order" WHERE id = ?',
          [orderId]
        );
        exists = result.length > 0;
      } while (exists);
      return orderId;
    }
    
    function generateOrderCode() {
      const now = new Date();
      const date = now.toISOString().slice(0,10).replace(/-/g, ''); // YYYYMMDD
      const rand = Math.floor(1000 + Math.random() * 9000); // random 4 số
      return `ORD-${date}-${rand}`;
    }
    
    let orderCode: string = '';
    let exists = true;
    // Lặp cho tới khi tạo được mã không trùng
    while (exists) {
      orderCode = generateOrderCode();
      const result = await DatabaseService.executeQuery(
        shopId,
        'SELECT 1 FROM "Order" WHERE orderCode = ?',
        [orderCode]
      );
      exists = result.length > 0;
    }

    // Tạo đơn hàng
    const orderId = await generateUniqueOrderId(shopId);

    try {
      // Get connection for transaction
      const connection = await DatabaseService.getConnection(shopId);
      
      // Thực hiện tất cả các thao tác trong một transaction
      await connection.batch([
        {
          sql: `INSERT INTO "Order" (id, orderCode, status, paymentStatus, paymentMethod, createdAt, internalNotes, buyerName, buyerEmail, buyerAddress, buyerPhone, buyerNotes, shippingDetails, price, coupon, discounted, tax, shippingFee, finalPrice, shopId)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            orderId,
            orderCode,
            'new',
            paymentMethod === 'COD' ? 'pending' : 'paid',
            paymentMethod,
            new Date().toISOString(),
            '', // internalNotes
            buyerName,
            buyerEmail,
            buyerAddress,
            buyerPhone,
            buyerNotes || '',
            shippingDetails,
            total,
            '', // coupon
            0, // discounted
            0, // tax
            Number(shippingFee),
            total + Number(shippingFee),
            shopId
          ]
        },
        // Thêm trạng thái đầu tiên vào OrderStatusHistory
        {
          sql: `INSERT INTO OrderStatusHistory (id, orderId, status, note, updatedBy, createdAt)
               VALUES (?, ?, ?, ?, ?, ?)`,
          args: [
            crypto.randomUUID(),
            orderId,
            'new',
            'Đơn hàng mới được tạo',
            'system',
            new Date().toISOString()
          ]
        },
        ...orderProducts.map(op => ({
          sql: `INSERT INTO OrderProduct (id, orderId, productId, quantity, listedPrice, salesPrice, itemName, itemVariant, itemMedia)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            crypto.randomUUID(),
            orderId,
            op.productId,
            op.quantity,
            op.listedPrice,
            op.salesPrice,
            op.itemName,
            op.itemVariant,
            op.itemMedia
          ]
        }))
      ]);

      return new Response(JSON.stringify({ success: true, orderId }), { status: 201 });
    } catch (error) {
      console.error('Lỗi trong quá trình xử lý đơn hàng:', error);
      return new Response(JSON.stringify({ 
        error: 'Có lỗi xảy ra khi xử lý đơn hàng',
        details: error instanceof Error ? error.message : 'Unknown error'
      }), { status: 500 });
    }
  } catch (err) {
    console.error('Lỗi checkout:', err);
    return new Response(JSON.stringify({ error: 'Lỗi máy chủ' }), { status: 500 });
  }
}; 