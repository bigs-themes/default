export const prerender = false;
import type { APIRoute } from 'astro';
import { DatabaseService } from '@/lib/database';

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action');

    switch (action) {
      case 'stats':
        return new Response(JSON.stringify({
          success: true,
          data: DatabaseService.getCacheStats()
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });

      case 'keys':
        return new Response(JSON.stringify({
          success: true,
          data: DatabaseService.getCacheKeys()
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });

      case 'clear':
        DatabaseService.clearCache();
        return new Response(JSON.stringify({
          success: true,
          message: 'Cache cleared successfully'
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });

      default:
        return new Response(JSON.stringify({
          success: true,
          data: {
            stats: DatabaseService.getCacheStats(),
            keys: DatabaseService.getCacheKeys(),
            actions: ['stats', 'keys', 'clear']
          }
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
    }
  } catch (error) {
    console.error('Cache status API error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), { status: 500 });
  }
}; 