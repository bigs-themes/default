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

    const path = url.searchParams.get('path');
    
    if (!path) {
      return new Response(JSON.stringify({
        error: 'Path parameter is required'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    const query = `
      SELECT p.*
      FROM Product p
      WHERE p.url = ? AND p.status = 'active'
      LIMIT 1
    `;

    const result = await DatabaseService.executeQuery(
      shopId,
      query,
      [path],
      { cache: true, ttl: 10 * 60 * 1000 } // 10 minutes cache for product details
    );

    if (result.length === 0) {
      return new Response(JSON.stringify({
        error: 'Product not found'
      }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    return new Response(JSON.stringify({
      data: result[0]
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=600' // 10 minutes cache
      }
    });
  } catch (error) {
    console.error('Error fetching product by path:', error);
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