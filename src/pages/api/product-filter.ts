import type { APIRoute } from 'astro';
import { DatabaseService } from '@/lib/database';

export const prerender = false;

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

    const query = Object.fromEntries(url.searchParams.entries());
    const skip = Number(query.skip) || 0;
    const take = Number(query.take) || 20;
    const maxPrice = Number(query.maxPrice) || 1000000000;
    const minPrice = Number(query.minPrice) || 0;
    const section = query.section || 'all';
    const search = query.search || '';
    const sort = query.sort || 'newest';

    // Build SQL WHERE conditions
    let whereClauses = [
      'p.status = "active"',
      'p.url IS NOT NULL',
      "p.url != ''",
      `p.price BETWEEN ${minPrice} AND ${maxPrice}`
    ];
    
    if (section !== 'all' && section !== '' && section !== 'Tất cả') {
      whereClauses.push(`ps.sectionId = '${section}'`);
    }
    
    if (search) {
      whereClauses.push(`LOWER(p.title) LIKE '%${search.toLowerCase()}%'`);
    }
    
    const whereSQL = whereClauses.length ? 'WHERE ' + whereClauses.join(' AND ') : '';

    // Simple ORDER BY for regular sorting
    let orderBySQL = `ORDER BY ${
      sort === 'newest' ? 'p.createdAt DESC' : 
      sort === 'price-asc' ? 'p.price ASC' :
      sort === 'price-desc' ? 'p.price DESC' :
      'p.featured DESC, p.createdAt DESC'
    }`;

    // Get all products without pagination to handle pinned positions properly
    const queryProduct = `
      SELECT 
        p.*
      FROM product p
      LEFT JOIN ProductSection ps ON ps.productId = p.id
      ${whereSQL}
      GROUP BY p.id
      ${orderBySQL}
    `;
    
    const resultProduct = await DatabaseService.executeQuery(
      shopId,
      queryProduct,
      [],
      { cache: true, ttl: 2 * 60 * 1000 } // 2 minutes cache
    );
    
    // Query for total count
    const queryCount = `
      SELECT COUNT(DISTINCT p.id) as total
      FROM product p
      LEFT JOIN ProductSection ps ON ps.productId = p.id
      ${whereSQL}
    `;
    
    const resultCount = await DatabaseService.executeQuery(
      shopId,
      queryCount,
      [],
      { cache: true, ttl: 2 * 60 * 1000 } // 2 minutes cache
    );
    
    const total = Number(resultCount[0]?.total) || 0;

    // Format data
    let products = resultProduct.map((p: any) => ({
      ...p,
      additionalMedia: typeof p.additionalMedia === 'string' ? JSON.parse(p.additionalMedia) : p.additionalMedia
    }));

    // Handle pinned positions in JavaScript
    const pinnedProducts = products.filter(p => p.pinnedPosition && p.pinnedPosition > 0);
    const regularProducts = products.filter(p => !p.pinnedPosition || p.pinnedPosition <= 0);
    
    // Create a new array with the correct order
    let sortedProducts = [...regularProducts];
    
    // Insert pinned products at their specified positions
    pinnedProducts.forEach(product => {
      const position = product.pinnedPosition - 1; // Convert to 0-based index
      
      // Ensure we don't go out of bounds
      if (position >= 0) {
        // If position is beyond current array length, pad with nulls
        while (sortedProducts.length < position) {
          sortedProducts.push(null);
        }
        
        // Insert at position, pushing other items down
        sortedProducts.splice(position, 0, product);
      }
    });
    
    // Remove any null placeholders
    sortedProducts = sortedProducts.filter(p => p !== null);
    
    // Apply pagination
    const paginatedProducts = sortedProducts.slice(skip, skip + take);

    return new Response(
      JSON.stringify({
        data: paginatedProducts,
        total,
        page: Math.floor(skip / take) + 1,
        pageSize: take,
        totalPages: Math.ceil(total / take)
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=120' // 2 minutes cache
        }
      }
    );
  } catch (error) {
    console.error('Error fetching products:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};