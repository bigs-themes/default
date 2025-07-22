import type { APIRoute } from 'astro';
import ProductService from './ProductService';
import { DatabaseService } from '@/lib/database';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  total?: number;
}

class ApiService {
  /**
   * Extract shop ID from request
   */
  static getShopId(request: Request): string {
    const url = new URL(request.url);
    const host = url.hostname;
    return host ? host.split('.')[0] : '';
  }

  /**
   * Create success response
   */
  static createSuccessResponse(data: any, total?: number): Response {
    const response: ApiResponse = { data };
    if (total !== undefined) {
      response.total = total;
    }

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300' // 5 minutes cache
      }
    });
  }

  /**
   * Create error response
   */
  static createErrorResponse(error: Error, status: number = 500): Response {
    console.error('API Error:', error);

    return new Response(JSON.stringify({
      error: error.message || 'Internal Server Error'
    }), {
      status,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Validate shop ID
   */
  static validateShopId(shopId: string): Response | null {
    if (!shopId) {
      return this.createErrorResponse(
        new Error('Shop ID is required'),
        400
      );
    }
    return null;
  }

  /**
   * Get products API handler
   */
  static async getProducts(request: Request): Promise<any> {
    const shopId = this.getShopId(request);
    const validationError = this.validateShopId(shopId);
    if (validationError) return validationError;

    const url = new URL(request.url);
    const take = url.searchParams.get('take');
    const fields = url.searchParams.get('fields');
    const sectionArr = url.searchParams.get('sectionArr');
    const productId = url.searchParams.get('productId');

    // Parse options
    const options: any = {};
    
    if (take && take !== 'all') {
      options.limit = Number(take) || 4;
    }
    
    if (fields && fields !== 'all') {
      options.fields = fields.split(',').map(f => f.trim());
    }
    
    if (sectionArr) {
      options.sections = JSON.parse(sectionArr);
    }
    
    if (productId) {
      options.excludeProductId = productId;
    }

    const products = await ProductService.getProducts(shopId, options);
    
    return this.createSuccessResponse(products, products.length);
  }

  /**
   * Get featured products API handler
   */
  static async getFeaturedProducts(request: Request): Promise<any> {
    const shopId = this.getShopId(request);
    const validationError = this.validateShopId(shopId);
    if (validationError) return validationError;

    const url = new URL(request.url);
    const take = Number(url.searchParams.get('take')) || 8;

    const products = await ProductService.getFeaturedProducts(shopId, take);
    
    return this.createSuccessResponse(products);
  }

  /**
   * Get product by ID API handler
   */
  static async getProductById(request: Request): Promise<any> {
    const shopId = this.getShopId(request);
    const validationError = this.validateShopId(shopId);
    if (validationError) return validationError;

    const url = new URL(request.url);
    const productId = url.searchParams.get('productId');

    if (!productId) {
      return this.createErrorResponse(
        new Error('Product ID is required'),
        400
      );
    }

    const product = await ProductService.getProductById(shopId, productId);
    
    if (!product) {
      return this.createErrorResponse(
        new Error('Product not found'),
        404
      );
    }

    return this.createSuccessResponse(product);
  }

  /**
   * Get related products API handler
   */
  static async getRelatedProducts(request: Request): Promise<any> {
    const shopId = this.getShopId(request);
    const validationError = this.validateShopId(shopId);
    if (validationError) return validationError;

    const url = new URL(request.url);
    const productId = url.searchParams.get('productId');
    const limit = Number(url.searchParams.get('limit')) || 4;

    if (!productId) {
      return this.createErrorResponse(
        new Error('Product ID is required'),
        400
      );
    }

    const products = await ProductService.getRelatedProducts(shopId, productId, limit);
    
    return this.createSuccessResponse(products);
  }

  /**
   * Search products API handler
   */
  static async searchProducts(request: Request): Promise<any> {
    const shopId = this.getShopId(request);
    const validationError = this.validateShopId(shopId);
    if (validationError) return validationError;

    const url = new URL(request.url);
    const searchTerm = url.searchParams.get('q');
    const limit = Number(url.searchParams.get('limit')) || 20;

    if (!searchTerm) {
      return this.createErrorResponse(
        new Error('Search term is required'),
        400
      );
    }

    const products = await ProductService.searchProducts(shopId, searchTerm, limit);
    
    return this.createSuccessResponse(products);
  }

  /**
   * Get products by section API handler
   */
  static async getProductsBySection(request: Request): Promise<any> {
    const shopId = this.getShopId(request);
    const validationError = this.validateShopId(shopId);
    if (validationError) return validationError;

    const url = new URL(request.url);
    const sectionId = url.searchParams.get('sectionId');
    const limit = url.searchParams.get('limit') ? Number(url.searchParams.get('limit')) : undefined;

    if (!sectionId) {
      return this.createErrorResponse(
        new Error('Section ID is required'),
        400
      );
    }

    const products = await ProductService.getProductsBySection(shopId, sectionId, limit);
    
    return this.createSuccessResponse(products);
  }

  /**
   * Get sections API handler
   */
  static async getSections(request: Request): Promise<any> {
    const shopId = this.getShopId(request);
    const validationError = this.validateShopId(shopId);
    if (validationError) return validationError;

    const sections = await DatabaseService.getSectionsWithProducts(shopId);

    const processedSections = sections.map((section: any) => ({
      id: section.id,
      name: section.name,
      url: section.url,
      displayOrdering: section.displayOrdering,
      description: section.description,
      _count: {
        products: parseInt(section.product_count) || 0
      },
      products: section.products ? JSON.parse(section.products).filter((p: any) => p.id !== null) : []
    }));

    return this.createSuccessResponse(processedSections);
  }

  /**
   * Get cache status API handler
   */
  static async getCacheStatus(): Promise<any> {
    const stats = DatabaseService.getCacheStats();
    return this.createSuccessResponse(stats);
  }

  /**
   * Clear cache API handler
   */
  static async clearCache(request: Request): Promise<any> {
    const url = new URL(request.url);
    const shopId = url.searchParams.get('shopId');

    if (shopId) {
      DatabaseService.invalidateProductCache(shopId);
    } else {
      DatabaseService.clearCache();
    }

    return this.createSuccessResponse({ message: 'Cache cleared successfully' });
  }
}

export default ApiService; 