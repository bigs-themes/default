import type { APIRoute } from 'astro';
import { execSync } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { shopId } = body;

    if (!shopId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required parameter: shopId'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const devDir = path.join(process.cwd(), 'dev', shopId);
    const productionDir = path.join(process.cwd(), 'production', shopId);

    // Step 1: Check if dev theme exists (as per workflow)
    try {
      await fs.access(devDir);
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: `Dev theme for shop ${shopId} not found`
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Step 2: Create production directory if not exists
    try {
      await fs.mkdir(productionDir, { recursive: true });
    } catch (error) {
      console.error('Error creating production directory:', error);
    }

    // Step 3: Copy dev theme to production (as per workflow)
    console.log(`🚀 Publishing theme for shop ${shopId}...`);
    
    // Remove existing production theme
    const productionThemeDir = path.join(productionDir, 'theme');
    try {
      await fs.rm(productionThemeDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore if directory doesn't exist
    }

    // Copy theme directory
    execSync(`cp -r "${path.join(devDir, 'theme')}" "${productionThemeDir}"`, {
      stdio: 'inherit'
    });

    // Copy config.json
    const devConfig = path.join(devDir, 'config.json');
    const productionConfig = path.join(productionDir, 'config.json');
    try {
      await fs.copyFile(devConfig, productionConfig);
    } catch (error) {
      console.warn('Warning: Could not copy config.json:', error);
    }

    console.log('✅ Theme published successfully!');
    console.log(`📁 Production location: ${productionDir}`);

    return new Response(JSON.stringify({
      success: true,
      message: 'Theme published successfully',
      data: {
        shopId,
        productionPath: productionDir,
        themePath: productionThemeDir
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Error publishing theme:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 