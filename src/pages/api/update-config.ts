import type { APIRoute } from 'astro';
import fs from 'fs/promises';
import path from 'path';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { shopId, config, isPreview = true } = body;

    if (!shopId || !config) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required parameters: shopId, config'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Determine config path based on preview/production
    const configDir = isPreview ? 'dev' : 'production';
    const configPath = path.join(process.cwd(), configDir, shopId, 'config.json');

    // Create directory if not exists
    const configDirPath = path.dirname(configPath);
    try {
      await fs.mkdir(configDirPath, { recursive: true });
    } catch (error) {
      console.error('Error creating config directory:', error);
    }

    // Update config.json
    try {
      await fs.writeFile(configPath, JSON.stringify(config, null, 2));
      console.log(`✅ Config updated for shop ${shopId} (${isPreview ? 'preview' : 'production'})`);
    } catch (error) {
      console.error('Error writing config file:', error);
      throw error;
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Config updated successfully',
      data: {
        shopId,
        configPath,
        isPreview
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Error updating config:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 