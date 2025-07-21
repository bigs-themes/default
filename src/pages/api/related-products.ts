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

    const take = Number(url.searchParams.get('take')) || 4;
    const sectionArr = url.searchParams.get('sectionArr');
    const productId = url.searchParams.get('productId');

    if (!sectionArr || !productId) {
      return new Response(JSON.stringify({
        error: 'sectionArr and productId are required'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    const sectionIds = JSON.parse(sectionArr);
    
    const query = `
      SELECT DISTINCT p.* 
      FROM Product p
      INNER JOIN ProductSection ps ON p.id = ps.productId
      WHERE ps.sectionId IN (${sectionIds.map(() => '?').join(',')})
        AND p.id != ? 
        AND p.status = 'active'
      ORDER BY p.createdAt DESC
      LIMIT ?
    `;

    const result = await DatabaseService.executeQuery(
      shopId,
      query,
      [...sectionIds, productId, take],
      { cache: true, ttl: 5 * 60 * 1000 } // 5 minutes cache
    );

    return new Response(JSON.stringify({
      data: result,
      total: result.length
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300' // 5 minutes cache
      }
    });
  } catch (error) {
    console.error('Error fetching related products:', error);
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