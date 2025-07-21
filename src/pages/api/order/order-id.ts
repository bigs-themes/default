export const prerender = false;
import type { APIRoute } from 'astro';
import { DatabaseService } from '@/lib/database';

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const host = url.hostname;
    const shopId = host ? host.split('.')[0] : '';
    
    if (!shopId) {
      return new Response(JSON.stringify({
        error: 'Shop ID is required'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    const orderCode = url.searchParams.get('orderCode');
    const buyerPhone = url.searchParams.get('buyerPhone');

    if (!orderCode && !buyerPhone) {
      return new Response(JSON.stringify({
        error: 'Order ID or phone number is required'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    const orders = await DatabaseService.executeQuery(
      shopId,
      `SELECT * FROM "Order" WHERE (orderCode = ? OR buyerPhone = ?) AND status NOT IN ('cancelled', 'delivered')
       ORDER BY createdAt DESC`,
      [orderCode, buyerPhone],
      { cache: true, ttl: 1 * 60 * 1000 } // 1 minute cache
    );

    if (orders.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        data: [],
        message: 'Không tìm thấy đơn hàng nào'
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Get order products for each order
    const ordersWithProducts = await Promise.all(orders.map(async (order) => {
      const orderProducts = await DatabaseService.executeQuery(
        shopId,
        `SELECT * FROM OrderProduct WHERE orderId = ?`,
        [order.id],
        { cache: true, ttl: 1 * 60 * 1000 } // 1 minute cache
      );

      return {
        ...order,
        orderProducts: orderProducts.map(row => ({
          ...row,
          itemMedia: row.itemMedia ? row.itemMedia.toString() : null
        }))
      };
    }));

    return new Response(JSON.stringify({
      success: true,
      data: ordersWithProducts
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60' // 1 minute cache
      }
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    return new Response(JSON.stringify({
      error: 'Internal Server Error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}; 