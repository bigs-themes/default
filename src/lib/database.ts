import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@libsql/client';

// Connection pool for TursoDB
class DatabasePool {
  private static instance: DatabasePool;
  private connections: Map<string, ReturnType<typeof createClient>> = new Map();
  private connectionPromises: Map<string, Promise<ReturnType<typeof createClient>>> = new Map();

  private constructor() {}

  static getInstance(): DatabasePool {
    if (!DatabasePool.instance) {
      DatabasePool.instance = new DatabasePool();
    }
    return DatabasePool.instance;
  }

  async getConnection(shopId: string): Promise<ReturnType<typeof createClient>> {
    // Check if connection already exists
    if (this.connections.has(shopId)) {
      return this.connections.get(shopId)!;
    }

    // Check if connection is being created
    if (this.connectionPromises.has(shopId)) {
      return this.connectionPromises.get(shopId)!;
    }

    // Create new connection
    const connectionPromise = this.createConnection(shopId);
    this.connectionPromises.set(shopId, connectionPromise);

    try {
      const connection = await connectionPromise;
      this.connections.set(shopId, connection);
      this.connectionPromises.delete(shopId);
      return connection;
    } catch (error) {
      this.connectionPromises.delete(shopId);
      throw error;
    }
  }

  private async createConnection(shopId: string): Promise<ReturnType<typeof createClient>> {
    const dbUrl = process.env.TURSO_DATABASE_URL || 'libsql://{shopId}-bigsmulti.aws-ap-northeast-1.turso.io';
    const url = dbUrl.replace('{shopId}', shopId);
    
    return createClient({
      url: url,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }

  closeConnection(shopId: string): void {
    if (this.connections.has(shopId)) {
      this.connections.delete(shopId);
    }
  }

  closeAllConnections(): void {
    this.connections.clear();
    this.connectionPromises.clear();
  }
}

// Query cache for frequently used queries
class QueryCache {
  private static instance: QueryCache;
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
  private cacheStats: { hits: number; misses: number; sets: number; invalidations: number } = { hits: 0, misses: 0, sets: 0, invalidations: 0 };

  private constructor() {}

  static getInstance(): QueryCache {
    if (!QueryCache.instance) {
      QueryCache.instance = new QueryCache();
    }
    return QueryCache.instance;
  }

  get(key: string): any | null {
    this.cacheStats.misses++;
    const item = this.cache.get(key);
    if (!item) {
      this.cacheStats.misses--; // Revert miss if not found
      return null;
    }

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      this.cacheStats.invalidations++;
      return null;
    }

    this.cacheStats.hits++;
    return item.data;
  }

  set(key: string, data: any, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
    this.cacheStats.sets++;
  }

  invalidate(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
        this.cacheStats.invalidations++;
      }
    }
  }

  clear(): void {
    this.cache.clear();
    this.cacheStats = { hits: 0, misses: 0, sets: 0, invalidations: 0 };
  }

  // Cache monitoring methods
  getStats() {
    const total = this.cacheStats.hits + this.cacheStats.misses;
    const hitRate = total > 0 ? (this.cacheStats.hits / total * 100).toFixed(2) : '0.00';
    
    return {
      ...this.cacheStats,
      hitRate: `${hitRate}%`,
      currentSize: this.cache.size,
      total: total
    };
  }

  getCacheKeys(): string[] {
    return Array.from(this.cache.keys());
  }
}

// Main database service
export class DatabaseService {
  private static pool = DatabasePool.getInstance();
  private static cache = QueryCache.getInstance();

  static async getConnection(shopId: string): Promise<ReturnType<typeof createClient>> {
    return this.pool.getConnection(shopId);
  }

  static async executeQuery<T = any>(
    shopId: string, 
    query: string, 
    params: any[] = [], 
    options: { 
      cache?: boolean; 
      ttl?: number; 
      cacheKey?: string;
    } = {}
  ): Promise<T[]> {
    const { cache: useCache = false, ttl, cacheKey } = options;
    
    // Generate cache key if not provided
    const key = cacheKey || `${shopId}:${query}:${JSON.stringify(params)}`;
    
    // Check cache first
    if (useCache) {
      const cached = this.cache.get(key);
      if (cached) {
        // console.log('Cache hit for query:', key);
        return cached;
      }
    }

    // Execute query
    const connection = await this.getConnection(shopId);
    const result = await connection.execute(query, params);
    
    // Cache result if requested
    if (useCache) {
      this.cache.set(key, result.rows, ttl);
    }

    return result.rows as T[];
  }

  static async executeTransaction<T>(
    shopId: string, 
    operations: (connection: ReturnType<typeof createClient>) => Promise<T>
  ): Promise<T> {
    const connection = await this.getConnection(shopId);
    return operations(connection);
  }

  // Optimized query builders
  static buildProductQuery(options: {
    fields?: string[];
    sections?: string[];
    excludeProductId?: string;
    limit?: number;
    offset?: number;
    status?: string;
  } = {}) {
    const {
      fields = ['*'],
      sections,
      excludeProductId,
      limit,
      offset,
      status = 'active'
    } = options;

    let query = `
      SELECT ${fields.includes('*') ? 'p.*' : fields.map(f => `p.${f}`).join(', ')}
      FROM Product p
    `;

    const params: any[] = [];
    const conditions: string[] = [`p.status = ?`];
    params.push(status);

    if (sections && sections.length > 0) {
      query += ` INNER JOIN ProductSection ps ON p.id = ps.productId`;
      conditions.push(`ps.sectionId IN (${sections.map(() => '?').join(',')})`);
      params.push(...sections);
    }

    if (excludeProductId) {
      conditions.push(`p.id != ?`);
      params.push(excludeProductId);
    }

    query += ` WHERE ${conditions.join(' AND ')}`;

    if (limit) {
      query += ` LIMIT ?`;
      params.push(limit);
    }

    if (offset) {
      query += ` OFFSET ?`;
      params.push(offset);
    }

    return { query, params };
  }

  // Predefined optimized queries
  static async getProductsBySection(
    shopId: string, 
    sectionId: string, 
    limit: number = 20
  ) {
    return this.executeQuery(
      shopId,
      `SELECT p.* FROM Product p 
       INNER JOIN ProductSection ps ON p.id = ps.productId 
       WHERE ps.sectionId = ? AND p.status = 'active' 
       ORDER BY p.createdAt DESC 
       LIMIT ?`,
      [sectionId, limit],
      { cache: true, ttl: 2 * 60 * 1000 } // 2 minutes cache
    );
  }

  static async getProductWithDetails(shopId: string, productId: string) {
    const [product, sections, variants, variantGroups] = await Promise.all([
      this.executeQuery(shopId, 'SELECT * FROM Product WHERE id = ?', [productId]),
      this.executeQuery(
        shopId,
        `SELECT s.* FROM Section s 
         INNER JOIN ProductSection ps ON s.id = ps.sectionId 
         WHERE ps.productId = ?`,
        [productId]
      ),
      this.executeQuery(
        shopId,
        `SELECT v.*, vo1.name as option1Name, vo2.name as option2Name, vo3.name as option3Name
         FROM ProductVariant v
         LEFT JOIN VariantOption vo1 ON v.option1Id = vo1.id
         LEFT JOIN VariantOption vo2 ON v.option2Id = vo2.id
         LEFT JOIN VariantOption vo3 ON v.option3Id = vo3.id
         WHERE v.productId = ?`,
        [productId]
      ),
      this.executeQuery(
        shopId,
        `SELECT vg.*, 
         (SELECT json_group_array(json_object('id', vo.id, 'name', vo.name))
          FROM VariantOption vo WHERE vo.groupId = vg.id) as options
         FROM VariantGroup vg 
         WHERE vg.productId = ?`,
        [productId]
      )
    ]);

    if (!product[0]) return null;

    return {
      ...product[0],
      sections,
      variants,
      variantGroups: variantGroups.map(vg => ({
        ...vg,
        options: vg.options ? JSON.parse(vg.options) : []
      }))
    };
  }

  static async getSectionsWithProducts(shopId: string) {
    return this.executeQuery(
      shopId,
      `SELECT 
        s.*,
        COUNT(DISTINCT ps.productId) as product_count
      FROM section s
      LEFT JOIN ProductSection ps ON ps.sectionId = s.id
      LEFT JOIN product p ON p.id = ps.productId AND p.status = 'active'
      GROUP BY s.id, s.name, s.url, s.displayOrdering
      ORDER BY s.displayOrdering ASC`,
      [],
      { cache: true, ttl: 5 * 60 * 1000 } // 5 minutes cache
    );
  }

  // Cache management
  static invalidateProductCache(shopId: string): void {
    this.cache.invalidate(`${shopId}:product`);
  }

  static invalidateSectionCache(shopId: string): void {
    this.cache.invalidate(`${shopId}:section`);
  }

  static clearCache(): void {
    this.cache.clear();
  }

  // Cache monitoring methods
  static getCacheStats() {
    return this.cache.getStats();
  }

  static getCacheKeys() {
    return this.cache.getCacheKeys();
  }

  static logCacheStatus() {
    const stats = this.getCacheStats();
    // Cache status logging removed
  }
}

// Backward compatibility
export const getDb = DatabaseService.getConnection;
export const getDbForShop = DatabaseService.getConnection; 