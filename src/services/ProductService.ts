import { DatabaseService as NewDatabaseService } from '@/lib/database';

export interface Product {
  id: string;
  title: string;
  description?: string;
  price: number;
  mainImage: string;
  calculatedDiscount?: number;
  status: string;
  featured?: boolean;
  createdAt: string;
  sections?: any[];
  variantGroups?: any[];
  variants?: any[];
}

export interface ProductQueryOptions {
  sections?: string[];
  limit?: number;
  excludeProductId?: string;
  fields?: string[];
  featured?: boolean;
}

class ProductService {
  /**
   * Get products with optimized query
   */
  static async getProducts(shopId: string, options: ProductQueryOptions = {}) {
    const { sections, limit, excludeProductId, fields = ['*'] } = options;
    
    // Build optimized query
    const { query, params } = NewDatabaseService.buildProductQuery({
      sections,
      limit,
      excludeProductId,
      fields
    });

    // Execute with caching
    const result = await NewDatabaseService.executeQuery(
      shopId,
      query,
      params,
      { cache: true, ttl: 2 * 60 * 1000 } // 2 minutes cache
    );

    return result;
  }

  /**
   * Get featured products
   */
  static async getFeaturedProducts(shopId: string, limit: number = 8) {
    const query = `
      SELECT p.*
      FROM Product p
      WHERE p.status = 'active'
      ORDER BY 
        CASE WHEN p.featured = 1 THEN 0 ELSE 1 END,
        p.createdAt DESC
      LIMIT ?
    `;

    const result = await NewDatabaseService.executeQuery(
      shopId,
      query,
      [limit],
      { cache: true, ttl: 5 * 60 * 1000 } // 5 minutes cache for featured products
    );

    return result;
  }

  /**
   * Get product by ID with all related data
   */
  static async getProductById(shopId: string, productId: string) {
    const product = await NewDatabaseService.getProductWithDetails(shopId, productId);
    return product;
  }

  /**
   * Get product by slug (url) with all related data
   */
  static async getProductBySlug(shopId: string, slug: string) {
    // Get product by slug
    const result = await NewDatabaseService.executeQuery(
      shopId,
      'SELECT * FROM Product WHERE url = ? LIMIT 1',
      [slug],
      { cache: true, ttl: 2 * 60 * 1000 }
    );
    
    if (!result[0]) return null;
    
    const product = { ...result[0] };
    
    // Parse additionalMedia from JSON string to array
    if (product.additionalMedia) {
      try {
        product.additionalMedia = JSON.parse(product.additionalMedia);
      } catch (e) {
        console.error('Error parsing additionalMedia:', e);
        product.additionalMedia = [];
      }
    } else {
      product.additionalMedia = [];
    }

    // Lấy sections
    const sections = await NewDatabaseService.executeQuery(
      shopId,
      `SELECT s.* FROM Section s
       INNER JOIN ProductSection ps ON ps.sectionId = s.id
       WHERE ps.productId = ?`,
      [product.id]
    );
    product.sections = sections.map(row => ({ ...row }));

    // Lấy variant groups và options cho từng group
    const variantGroups = await NewDatabaseService.executeQuery(
      shopId,
      'SELECT vg.* FROM VariantGroup vg WHERE vg.productId = ?',
      [product.id]
    );
    
    for (const group of variantGroups) {
      const groupObj = { ...group };
      const options = await NewDatabaseService.executeQuery(
        shopId,
        'SELECT * FROM VariantOption WHERE groupId = ?',
        [group.id]
      );
      groupObj.options = options.map(row => ({ ...row }));
      product.variantGroups = product.variantGroups || [];
      product.variantGroups.push(groupObj);
    }

    // Lấy variants
    const variants = await NewDatabaseService.executeQuery(
      shopId,
      `SELECT v.*, vo1.name as option1Name, vo2.name as option2Name, vo3.name as option3Name
       FROM ProductVariant v
       LEFT JOIN VariantOption vo1 ON v.option1Id = vo1.id
       LEFT JOIN VariantOption vo2 ON v.option2Id = vo2.id
       LEFT JOIN VariantOption vo3 ON v.option3Id = vo3.id
       WHERE v.productId = ?`,
      [product.id]
    );
    product.variants = variants.map(row => ({ ...row }));

    return product;
  }

  /**
   * Get related products
   */
  static async getRelatedProducts(shopId: string, productId: string, limit: number = 4) {
    const query = `
      SELECT p.*
      FROM Product p
      WHERE p.status = 'active' 
        AND p.id != ?
        AND p.id IN (
          SELECT DISTINCT ps2.productId
          FROM ProductSection ps1
          JOIN ProductSection ps2 ON ps1.sectionId = ps2.sectionId
          WHERE ps1.productId = ?
        )
      ORDER BY p.createdAt DESC
      LIMIT ?
    `;

    const result = await NewDatabaseService.executeQuery(
      shopId,
      query,
      [productId, productId, limit],
      { cache: true, ttl: 5 * 60 * 1000 }
    );

    return result;
  }

  /**
   * Search products
   */
  static async searchProducts(shopId: string, searchTerm: string, limit: number = 20) {
    const query = `
      SELECT p.*
      FROM Product p
      WHERE p.status = 'active'
        AND (p.title LIKE ? OR p.description LIKE ?)
      ORDER BY 
        CASE WHEN p.title LIKE ? THEN 0 ELSE 1 END,
        p.createdAt DESC
      LIMIT ?
    `;

    const searchPattern = `%${searchTerm}%`;
    const exactPattern = `${searchTerm}%`;

    const result = await NewDatabaseService.executeQuery(
      shopId,
      query,
      [searchPattern, searchPattern, exactPattern, limit],
      { cache: true, ttl: 1 * 60 * 1000 } // 1 minute cache for search
    );

    return result;
  }

  /**
   * Get products by section
   */
  static async getProductsBySection(shopId: string, sectionId: string, limit?: number) {
    const result = await NewDatabaseService.getProductsBySection(shopId, sectionId, limit || 20);
    return result;
  }

  /**
   * Invalidate product cache
   */
  static invalidateCache(shopId: string) {
    NewDatabaseService.invalidateProductCache(shopId);
    console.log(`Invalidated product cache for shop: ${shopId}`);
  }
}

export default ProductService; 