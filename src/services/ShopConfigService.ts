export interface ShopConfig {
  shopId: string;
  templateId: string;
  domain: string;
  isPreview: boolean;
  settings: {
    colors: {
      primary: string;
      secondary: string;
      neutral: string;
      semantic: string;
      background: string;
      surface: string;
      text: string;
      textSecondary: string;
    };
    fonts: {
      heading: string;
      body: string;
    };
  };
  styles: {
    button: {
      config: {
        primary: any;
        secondary: any;
      };
    };
    card: {
      config: any;
    };
  };
  pageInterface: {
    announcementBarSettings: {
      visible: boolean;
      content: string;
      textColor: string;
      backgroundColor: string;
      showOnHomepageOnly: boolean;
    };
  };
}

export class ShopConfigService {
  /**
   * Fetch config từ database dựa vào shopId
   */
  static async fetchShopConfig(shopId: string): Promise<ShopConfig | null> {
    try {
      console.log(`🔍 Fetching config from database for shop: ${shopId}`);
      
      // Sử dụng ShopStyleService có sẵn
      const { shopStyleService } = await import('./ShopStyleService');
      
      // Lấy config từ ShopStyleService
      const styleConfig = await shopStyleService.getShopStyleConfig(shopId);
      
      if (!styleConfig) {
        console.log(`⚠️ No config found for shop: ${shopId}`);
        return null;
      }
      
      console.log(`✅ Config fetched from ShopStyleService for shop: ${shopId}`);
      
      // Transform ShopStyleConfig to ShopConfig format
      return {
        shopId,
        templateId: styleConfig.templateId || 'classic',
        domain: `${shopId}.bigs.vn`,
        isPreview: !styleConfig.isPublished,
        settings: {
          colors: {
            primary: styleConfig.settings.colors.primary,
            secondary: styleConfig.settings.colors.secondary,
            neutral: styleConfig.settings.colors.neutral,
            semantic: styleConfig.settings.colors.semantic,
            background: styleConfig.settings.colors.background || '#FFFFFF',
            surface: styleConfig.settings.colors.surface || '#FAFAFA',
            text: styleConfig.settings.colors.text || '#000000',
            textSecondary: styleConfig.settings.colors.textSecondary || '#666666'
          },
          fonts: styleConfig.settings.fonts
        },
        styles: {
          button: {
            config: {
              primary: styleConfig.settings.styles.button.primary,
              secondary: styleConfig.settings.styles.button.secondary
            }
          },
          card: {
            config: styleConfig.settings.styles.card.default
          }
        },
        pageInterface: {
          announcementBarSettings: styleConfig.pageInterface.announcementBarSettings || {
            visible: true,
            content: '🔥 Khuyến mãi mùa hè: Giảm giá lên đến 50%',
            textColor: '#ffffff',
            backgroundColor: '#000000',
            showOnHomepageOnly: false
          }
        }
      };
    } catch (error) {
      console.error(`❌ Error fetching config from ShopStyleService for shop ${shopId}:`, error);
      return null;
    }
  }

  /**
   * Get default config cho development
   */
  static getDefaultConfig(shopId: string): ShopConfig {
    return {
      shopId,
      templateId: 'classic',
      domain: `${shopId}.bigs.vn`,
      isPreview: true,
      settings: {
        colors: {
          primary: '#000000',
          secondary: '#555555',
          neutral: '#CCCCCC',
          semantic: '#FFFFFF',
          background: '#FFFFFF',
          surface: '#FAFAFA',
          text: '#000000',
          textSecondary: '#666666'
        },
        fonts: {
          heading: 'Inter',
          body: 'Inter'
        }
      },
      styles: {
        button: {
          config: {
            primary: {
              bg: '#000000',
              text: '#FFFFFF',
              border: '#000000',
              radius: '4px',
              shadow: 'none',
              padding: '12px 24px',
              fontSize: '16px',
              hoverBg: '#333333',
              hoverText: '#FFFFFF',
              hoverEffect: 'none'
            },
            secondary: {
              bg: '#FFFFFF',
              text: '#000000',
              border: '#000000',
              radius: '4px',
              shadow: 'none',
              padding: '10px 22px',
              fontSize: '14px',
              hoverBg: '#F0F0F0',
              hoverText: '#000000',
              hoverEffect: 'darken'
            }
          }
        },
        card: {
          config: {
            bg: '#FFFFFF',
            border: '1px solid #E5E5E5',
            radius: '8px',
            shadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            padding: '20px',
            hoverEffect: 'none'
          }
        }
      },
      pageInterface: {
        announcementBarSettings: {
          visible: true,
          content: '🔥 Khuyến mãi mùa hè: Giảm giá lên đến 50%',
          textColor: '#ffffff',
          backgroundColor: '#000000',
          showOnHomepageOnly: false
        }
      }
    };
  }
} 