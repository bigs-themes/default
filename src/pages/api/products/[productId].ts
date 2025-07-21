export const prerender = false;
import type { APIRoute } from 'astro';
import { DatabaseService } from '@/lib/database';

export const GET: APIRoute = async ({ request, params }) => {
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

    const productId = params.productId;
    
    if (!productId) {
      return new Response(JSON.stringify({
        error: 'Product ID is required'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Get product with all related data using optimized method
    const product = await DatabaseService.getProductWithDetails(shopId, productId);

    if (!product) {
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
      data: product
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=600' // 10 minutes cache
      }
    });
  } catch (error) {
    console.error('Error fetching product:', error);
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