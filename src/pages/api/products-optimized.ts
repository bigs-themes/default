import type { APIRoute } from 'astro';
import ApiService from '@/services/ApiService';

export const GET: APIRoute = async ({ request }) => {
  try {
    const result = await ApiService.getProducts(request);
    return ApiService.createSuccessResponse(result);
  } catch (error) {
    console.error('Products API Error:', error);
    return ApiService.createErrorResponse(error as Error);
  }
}; 