import type { APIRoute } from 'astro';
import ApiService from '@/services/ApiService';

export const GET: APIRoute = async ({ request }) => {
  try {
    return await ApiService.getFeaturedProducts(request);
  } catch (error) {
    return ApiService.createErrorResponse(error as Error);
  }
}; 