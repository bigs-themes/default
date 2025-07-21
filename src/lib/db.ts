import { createClient } from '@libsql/client';
export const prerender = false;
import dotenv from 'dotenv';
dotenv.config();
export async function getDb(shopId: string) {
  const dbUrl = process.env.TURSO_DATABASE_URL || 'libsql://{shopId}-bigsmulti.aws-ap-northeast-1.turso.io';
  const url = dbUrl.replace('{shopId}', shopId);
  console.log('Connecting to DB:', url, 'for shopId:', shopId);
  // console.log('process.env.TURSO_AUTH_TOKEN:', process.env.TURSO_AUTH_TOKEN);
  return createClient({
    url: url,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
}

export function getDbForShop(shopId: string) {
  const dbUrl = process.env.TURSO_DATABASE_URL || 'libsql://{shopId}-bigsmulti.aws-ap-northeast-1.turso.io';
  const url = dbUrl.replace('{shopId}', shopId);
  return createClient({
    url: url,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
}
