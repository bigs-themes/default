import type { APIRoute } from 'astro';
import { execSync } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { shopId, templateId, repoUrl, branch = 'main' } = body;

    if (!shopId || !templateId || !repoUrl) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required parameters: shopId, templateId, repoUrl'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Step 1: Create dev directory if not exists (as per workflow)
    const devDir = path.join(process.cwd(), 'dev', shopId);
    try {
      await fs.mkdir(devDir, { recursive: true });
    } catch (error) {
      console.error('Error creating dev directory:', error);
    }

    // Step 2: Theme directory path
    const themeDir = path.join(devDir, 'theme');

    // Step 3: Remove existing theme directory if exists
    try {
      await fs.rm(themeDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore if directory doesn't exist
    }

    // Step 4: Clone theme repository (as per workflow)
    console.log(`🔄 Cloning theme ${templateId} for shop ${shopId}...`);
    console.log(`📦 Repository: ${repoUrl}`);
    console.log(`🌿 Branch: ${branch}`);

    execSync(`git clone -b ${branch} ${repoUrl} "${themeDir}"`, {
      stdio: 'inherit',
      cwd: devDir
    });

    // Step 5: Install dependencies if package.json exists
    const packageJsonPath = path.join(themeDir, 'package.json');
    try {
      const packageJsonExists = await fs.access(packageJsonPath).then(() => true).catch(() => false);
      if (packageJsonExists) {
        console.log('📦 Installing theme dependencies...');
        execSync('npm install', {
          stdio: 'inherit',
          cwd: themeDir
        });
      }
    } catch (error) {
      console.warn('Warning: Could not install theme dependencies:', error);
    }

    // Step 6: Create config.json if not exists (as per workflow)
    const configPath = path.join(devDir, 'config.json');
    try {
      await fs.access(configPath);
      console.log('📝 Config.json already exists');
    } catch (error) {
      // Create default config
      const defaultConfig = {
        shopId,
        templateId,
        domain: `${shopId}.bigs.vn`,
        isPreview: true,
        theme: {
          repo: repoUrl,
          branch,
          path: './theme'
        },
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

      await fs.writeFile(configPath, JSON.stringify(defaultConfig, null, 2));
      console.log('📝 Created default config.json');
    }

    console.log('✅ Theme cloned successfully!');
    console.log(`📁 Theme location: ${themeDir}`);

    return new Response(JSON.stringify({
      success: true,
      message: 'Theme cloned successfully',
      data: {
        shopId,
        templateId,
        themePath: themeDir,
        configPath
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Error cloning theme:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 