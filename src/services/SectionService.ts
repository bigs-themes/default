import { DatabaseService } from '@/lib/database';

export interface Section {
  id: string;
  name: string;
  url: string;
  displayOrdering: number;
  description?: string;
  product_count?: number;
  products?: any[];
}

export class SectionService {
  static async getSectionsWithProducts(shopId: string): Promise<Section[]> {
    const sections = await DatabaseService.getSectionsWithProducts(shopId);
    
    return sections.map(section => ({
      ...section,
      products: section.products ? JSON.parse(section.products).filter((p: any) => p.id !== null) : []
    }));
  }

  static async getSections(shopId: string): Promise<Section[]> {
    return DatabaseService.executeQuery<Section>(
      shopId,
      `SELECT 
        s.*,
        COUNT(DISTINCT ps.productId) as product_count
      FROM section s
      LEFT JOIN ProductSection ps ON ps.sectionId = s.id
      GROUP BY s.id
      ORDER BY s.displayOrdering ASC`,
      [],
      { cache: true, ttl: 10 * 60 * 1000 } // 10 minutes cache
    );
  }

  static async getSectionById(shopId: string, sectionId: string): Promise<Section | null> {
    const sections = await DatabaseService.executeQuery<Section>(
      shopId,
      `SELECT 
        s.*,
        COUNT(DISTINCT ps.productId) as product_count
      FROM section s
      LEFT JOIN ProductSection ps ON ps.sectionId = s.id
      WHERE s.id = ?
      GROUP BY s.id`,
      [sectionId],
      { cache: true, ttl: 5 * 60 * 1000 }
    );

    return sections[0] || null;
  }

  static async getSectionByUrl(shopId: string, url: string): Promise<Section | null> {
    const sections = await DatabaseService.executeQuery<Section>(
      shopId,
      `SELECT 
        s.*,
        COUNT(DISTINCT ps.productId) as product_count
      FROM section s
      LEFT JOIN ProductSection ps ON ps.sectionId = s.id
      WHERE s.url = ?
      GROUP BY s.id`,
      [url],
      { cache: true, ttl: 5 * 60 * 1000 }
    );

    return sections[0] || null;
  }

  static async getSectionProducts(
    shopId: string, 
    sectionId: string, 
    options: {
      limit?: number;
      offset?: number;
      sortBy?: 'newest' | 'price-asc' | 'price-desc' | 'featured';
    } = {}
  ): Promise<{ products: any[]; total: number }> {
    const { limit = 20, offset = 0, sortBy = 'newest' } = options;

    let orderBy = 'ORDER BY p.createdAt DESC';
    switch (sortBy) {
      case 'price-asc':
        orderBy = 'ORDER BY p.price ASC';
        break;
      case 'price-desc':
        orderBy = 'ORDER BY p.price DESC';
        break;
      case 'featured':
        orderBy = 'ORDER BY p.featured DESC, p.createdAt DESC';
        break;
    }

    const [products, countResult] = await Promise.all([
      DatabaseService.executeQuery(
        shopId,
        `SELECT p.*, ps.pinnedPosition
         FROM Product p
         INNER JOIN ProductSection ps ON p.id = ps.productId
         WHERE ps.sectionId = ? AND p.status = 'active'
         ${orderBy}
         LIMIT ? OFFSET ?`,
        [sectionId, limit, offset],
        { cache: true, ttl: 2 * 60 * 1000 }
      ),
      DatabaseService.executeQuery(
        shopId,
        `SELECT COUNT(*) as total
         FROM Product p
         INNER JOIN ProductSection ps ON p.id = ps.productId
         WHERE ps.sectionId = ? AND p.status = 'active'`,
        [sectionId],
        { cache: true, ttl: 5 * 60 * 1000 }
      )
    ]);

    return {
      products,
      total: countResult[0]?.total || 0
    };
  }

  // Cache management
  static invalidateCache(shopId: string): void {
    DatabaseService.invalidateSectionCache(shopId);
  }
} 