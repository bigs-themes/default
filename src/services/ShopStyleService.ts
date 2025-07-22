import { DatabaseService } from '@/lib/database';
import cuid from 'cuid';

export interface SettingsConfig {
  colors: {
    primary: string;
    secondary: string;
    neutral: string;
    semantic: string;
    background?: string;
    surface?: string;
    text?: string;
    textSecondary?: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  styles: {
    button: {
      primary: {
        bg: string;
        text: string;
        border: string;
        hoverBg: string;
        hoverText: string;
        radius: string;
        shadow: string;
        padding: string;
        fontSize: string;
        hoverEffect: string;
      };
      secondary: {
        bg: string;
        text: string;
        border: string;
        hoverBg: string;
        hoverText: string;
        radius: string;
        shadow: string;
        padding: string;
        fontSize: string;
        hoverEffect: string;
      };
    };
    card: {
      default: {
        bg: string;
        border: string;
        radius: string;
        shadow: string;
        hoverEffect: string;
      };
    };

  };
  logos?: { [key: string]: any };
  typography?: any;
  spacing?: any;
}

export interface PageInterfaceConfig {
  layout: {
    homepage: string;
    product: string;
  };
  menuSettings?: {
    menuType: string;
    showSearch: boolean;
    transparentBackground: boolean;
  };
  pageLayoutSettings?: {
    fullWidthGrid: boolean;
    productsPerRow: number;
    productsPerRowMobile: number;
    itemsPerPage: number;
  };
  footerSettings?: {
    showProductCategories: boolean;
    showCustomPages: boolean;
    footerText: string;
  };
  announcementBarSettings?: {
    visible: boolean;
    content: string;
    textColor: string;
    backgroundColor: string;
    showOnHomepageOnly: boolean;
  };
}

export interface ShopStyleConfig {
  id?: string;
  templateId: string;
  settings: SettingsConfig;
  pageInterface: PageInterfaceConfig;
  isPublished?: boolean;
}

export class ShopStyleService {
  private static instance: ShopStyleService;
  private cache: Map<string, ShopStyleConfig> = new Map();
  private cacheExpiry: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  public static getInstance(): ShopStyleService {
    if (!ShopStyleService.instance) {
      ShopStyleService.instance = new ShopStyleService();
    }
    return ShopStyleService.instance;
  }

  /**
   * Lấy cấu hình style cho shop
   * @param shopAlias - Tên shop
   * @param forceDraft - Bắt buộc lấy bản nháp
   * @returns Promise với cấu hình
   */
  async getShopStyleConfig(shopAlias?: string, forceDraft: boolean = false): Promise<ShopStyleConfig | null> {
    try {
      // Nếu không có shopAlias, lấy từ subdomain
      if (!shopAlias) {
        shopAlias = this.getShopAliasFromSubdomain();
      }
      
      if (!shopAlias) {
        return this.getDefaultConfig();
      }

      // Kiểm tra cache trước
      const cacheKey = `shop_style_config_${shopAlias}_${forceDraft}`;
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        return cached || null;
      }

      // Truy cập trực tiếp database
      // Ưu tiên lấy bản nháp trước, nếu không có thì lấy bản published
      let config = await DatabaseService.executeQuery(
        shopAlias,
        `SELECT * FROM shopStyleConfig WHERE shopId = ? AND isPublished = ? ORDER BY updatedAt DESC LIMIT 1`,
        [shopAlias, false],
        { cache: true, ttl: 300000 } // 5 minutes cache
      );
      
      if (!config || config.length === 0) {
        config = await DatabaseService.executeQuery(
          shopAlias,
          `SELECT * FROM shopStyleConfig WHERE shopId = ? AND isPublished = ? ORDER BY updatedAt DESC LIMIT 1`,
          [shopAlias, true],
          { cache: true, ttl: 300000 } // 5 minutes cache
        );
      }
      
      if (config && config.length > 0 && config[0].templateSettings) {
        try {
          const parsedConfig = JSON.parse(config[0].templateSettings);
          
          // Include id từ database record
          parsedConfig.id = config[0].id;
          parsedConfig.isPublished = config[0].isPublished;
          
          // Cache kết quả
          this.cache.set(cacheKey, parsedConfig);
          
          return parsedConfig;
        } catch (parseError) {
          console.error('Error parsing template settings:', parseError);
        }
      }

      return this.getDefaultConfig();

    } catch (error) {
      console.error('Error getting shop style config:', error);
      return this.getDefaultConfig();
    }
  }

  /**
   * Lấy shop alias từ subdomain
   */
  private getShopAliasFromSubdomain(): string | undefined {
    if (typeof window === 'undefined') return undefined;
    
    const host = window.location.hostname;
    const parts = host.split('.');
    
    // Loại bỏ localhost, 127.0.0.1, etc.
    if (parts.length < 2 || parts[0] === 'localhost' || parts[0] === '127') {
      return undefined;
    }
    
    return parts[0];
  }

  /**
   * Cấu hình mặc định khi không có dữ liệu từ database
   */
  private getDefaultConfig(): ShopStyleConfig {
    return {
      templateId: 'classic_theme',
      settings: {
        colors: {
          primary: '#3B82F6',
          secondary: '#10B981',
          neutral: '#6B7280',
          semantic: '#F59E0B',
          background: '#FFFFFF',
          surface: '#F9FAFB',
          text: '#111827',
          textSecondary: '#6B7280'
        },
        fonts: {
          heading: 'Inter',
          body: 'Inter'
        },
        styles: {
          button: {
            primary: {
              bg: '#1e90ff',
              text: '#ffffff',
              border: '#1e90ff',
              hoverBg: '#1c86ee',
              hoverText: '#ffffff',
              radius: '8px',
              shadow: '0 2px 4px rgba(0,0,0,0.1)',
              padding: '12px 24px',
              fontSize: '16px',
              hoverEffect: 'scale'
            },
            secondary: {
              bg: '#f0f0f0',
              text: '#333333',
              border: '#cccccc',
              hoverBg: '#e0e0e0',
              hoverText: '#000000',
              radius: '6px',
              shadow: 'none',
              padding: '10px 20px',
              fontSize: '14px',
              hoverEffect: 'darken'
            }
          },
          card: {
            default: {
              bg: '#ffffff',
              border: '1px solid #eeeeee',
              radius: '12px',
              shadow: '0 2px 8px rgba(0,0,0,0.05)',
              hoverEffect: 'lift'
            }
          }
        },
        logos: {}
      },
      pageInterface: {
        layout: {
          homepage: '',
          product: ''
        },
        menuSettings: {
          menuType: 'main_nav',
          showSearch: true,
          transparentBackground: false
        },
        pageLayoutSettings: {
          fullWidthGrid: false,
          productsPerRow: 4,
          productsPerRowMobile: 2,
          itemsPerPage: 16
        },
        footerSettings: {
          showProductCategories: true,
          showCustomPages: true,
          footerText: '© 2024 BigS. All rights reserved.'
        },
        announcementBarSettings: {
          visible: true,
          content: '🔥 Khuyến mãi mùa hè: Giảm giá lên đến 50% + Miễn phí vận chuyển cho đơn hàng từ 500.000₫',
          textColor: '#ffffff',
          backgroundColor: '#000000',
          showOnHomepageOnly: false
        }
      },
      isPublished: true
    };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    this.cacheExpiry = 0;
  }

  /**
   * Lấy cấu hình announcement bar
   */
  async getAnnouncementBarConfig(shopAlias?: string): Promise<PageInterfaceConfig['announcementBarSettings'] | null> {
    const config = await this.getShopStyleConfig(shopAlias);
    return config?.pageInterface?.announcementBarSettings || null;
  }

  /**
   * Lấy cấu hình colors
   */
  async getColorsConfig(shopAlias?: string): Promise<SettingsConfig['colors'] | null> {
    const config = await this.getShopStyleConfig(shopAlias);
    return config?.settings?.colors || null;
  }

  /**
   * Lấy cấu hình fonts
   */
  async getFontsConfig(shopAlias?: string): Promise<SettingsConfig['fonts'] | null> {
    const config = await this.getShopStyleConfig(shopAlias);
    return config?.settings?.fonts || null;
  }

  /**
   * Lấy cấu hình menu settings
   */
  async getMenuSettings(shopAlias?: string): Promise<PageInterfaceConfig['menuSettings'] | null> {
    const config = await this.getShopStyleConfig(shopAlias);
    return config?.pageInterface?.menuSettings || null;
  }

  /**
   * Lấy cấu hình page layout settings
   */
  async getPageLayoutSettings(shopAlias?: string): Promise<PageInterfaceConfig['pageLayoutSettings'] | null> {
    const config = await this.getShopStyleConfig(shopAlias);
    return config?.pageInterface?.pageLayoutSettings || null;
  }

  /**
   * Lấy cấu hình footer settings
   */
  async getFooterSettings(shopAlias?: string): Promise<PageInterfaceConfig['footerSettings'] | null> {
    const config = await this.getShopStyleConfig(shopAlias);
    return config?.pageInterface?.footerSettings || null;
  }

  /**
   * Lấy logo configuration
   * @param shopAlias - Tên shop (từ subdomain)
   * @returns Promise với logo config hoặc null
   */
  async getLogosConfig(shopAlias?: string): Promise<{ [key: string]: any } | null> {
    try {
      const config = await this.getShopStyleConfig(shopAlias);
      return config?.settings?.logos || null;
    } catch (error) {
      console.error('Error getting logos config:', error);
      return null;
    }
  }

  /**
   * Lấy primary logo URL
   * @param shopAlias - Tên shop (từ subdomain)
   * @returns Promise với primary logo URL hoặc null
   */
  async getPrimaryLogoUrl(shopAlias?: string): Promise<string | null> {
    try {
      const logos = await this.getLogosConfig(shopAlias);
      if (logos?.primaryLogo?.preview) {
        return logos.primaryLogo.preview;
      }
      return null;
    } catch (error) {
      console.error('Error getting primary logo URL:', error);
      return null;
    }
  }

  /**
   * Lấy secondary logo URL
   * @param shopAlias - Tên shop (từ subdomain)
   * @returns Promise với secondary logo URL hoặc null
   */
  async getSecondaryLogoUrl(shopAlias?: string): Promise<string | null> {
    try {
      const logos = await this.getLogosConfig(shopAlias);
      if (logos?.secondaryLogo?.preview) {
        return logos.secondaryLogo.preview;
      }
      return null;
    } catch (error) {
      console.error('Error getting secondary logo URL:', error);
      return null;
    }
  }

  /**
   * Cập nhật cấu hình style cho shop
   * @param shopAlias - Tên shop
   * @param config - Cấu hình mới
   * @returns Promise với cấu hình đã cập nhật
   */
  async updateShopStyleConfig(shopAlias: string, config: Partial<ShopStyleConfig>): Promise<ShopStyleConfig> {
    try {
      // Lấy cấu hình hiện tại
      const currentConfig = await this.getShopStyleConfig(shopAlias) || this.getDefaultConfig();
      
      // Merge cấu hình mới với cấu hình hiện tại
      const updatedConfig: ShopStyleConfig = {
        ...currentConfig,
        ...config,
        settings: {
          ...currentConfig.settings,
          ...config.settings
        },
        pageInterface: {
          ...currentConfig.pageInterface,
          ...config.pageInterface
        }
      };

      // Lưu vào database - ID tự động tạo
      const templateSettings = JSON.stringify(updatedConfig);
      const configId = cuid(); // Tạo ID thủ công
      
      // Xóa record cũ trước khi insert mới
      await DatabaseService.executeQuery(
        shopAlias,
        `DELETE FROM shopStyleConfig WHERE shopId = ? AND isPublished = ?`,
        [shopAlias, false]
      );
      
      // Insert record mới với ID tự động tạo
      await DatabaseService.executeQuery(
        shopAlias,
        `INSERT INTO shopStyleConfig (id, shopId, templateId, templateSettings, isPublished, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        [configId, shopAlias, updatedConfig.templateId, templateSettings, false]
      );

      // Clear cache
      this.clearCache();

      console.log(`✅ Updated shop style config for: ${shopAlias}`);
      return updatedConfig;

    } catch (error) {
      console.error('Error updating shop style config:', error);
      throw error;
    }
  }

  /**
   * Publish cấu hình (chuyển từ draft sang published)
   * @param shopAlias - Tên shop
   * @returns Promise với cấu hình đã publish
   */
  async publishShopStyleConfig(shopAlias: string): Promise<ShopStyleConfig> {
    try {
      // Lấy cấu hình draft trực tiếp từ database (không qua cache)
      let draftConfig = await DatabaseService.executeQuery(
        shopAlias,
        `SELECT * FROM shopStyleConfig WHERE shopId = ? AND isPublished = ? ORDER BY updatedAt DESC LIMIT 1`,
        [shopAlias, false]
      );
      
      if (!draftConfig || draftConfig.length === 0) {
        throw new Error('No draft configuration found');
      }

      // Parse config từ database
      const parsedDraftConfig = JSON.parse(draftConfig[0].templateSettings);
      
      // Tạo bản published
      const publishedConfig: ShopStyleConfig = {
        ...parsedDraftConfig,
        isPublished: true
      };

      // Lưu bản published - ID tự động tạo
      const templateSettings = JSON.stringify(publishedConfig);
      const publishedConfigId = cuid(); // Tạo ID thủ công cho published
      
      // Xóa record published cũ trước khi insert mới
      await DatabaseService.executeQuery(
        shopAlias,
        `DELETE FROM shopStyleConfig WHERE shopId = ? AND isPublished = ?`,
        [shopAlias, true]
      );
      
      // Insert record published mới với ID tự động tạo
      await DatabaseService.executeQuery(
        shopAlias,
        `INSERT INTO shopStyleConfig (id, shopId, templateId, templateSettings, isPublished, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        [publishedConfigId, shopAlias, publishedConfig.templateId, templateSettings, true]
      );

      // Cập nhật bản draft để giống bản published
      const draftConfigId = cuid(); // Tạo ID mới cho draft
      
      // Xóa record draft cũ
      await DatabaseService.executeQuery(
        shopAlias,
        `DELETE FROM shopStyleConfig WHERE shopId = ? AND isPublished = ?`,
        [shopAlias, false]
      );
      
      // Insert record draft mới giống published
      await DatabaseService.executeQuery(
        shopAlias,
        `INSERT INTO shopStyleConfig (id, shopId, templateId, templateSettings, isPublished, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        [draftConfigId, shopAlias, publishedConfig.templateId, templateSettings, false]
      );

      // Clear cache
      this.clearCache();

      console.log(`✅ Published shop style config for: ${shopAlias}`);
      console.log(`📝 Updated both draft and published configs to be identical`);
      return publishedConfig;

    } catch (error) {
      console.error('Error publishing shop style config:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const shopStyleService = ShopStyleService.getInstance(); 