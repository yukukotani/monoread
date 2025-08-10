#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// 開発モードかどうかを判定
const isDev = process.env.NODE_ENV === 'development' || process.argv.includes('--dev');

if (isDev) {
  // 開発モード: tsxでTypeScriptを直接実行
  const { spawn } = await import('child_process');
  
  const tsxPath = join(projectRoot, 'node_modules', '.bin', 'tsx');
  const indexPath = join(projectRoot, 'src', 'index.ts');
  
  const child = spawn(tsxPath, [indexPath, ...process.argv.slice(2)], {
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'development' }
  });
  
  child.on('exit', (code) => {
    process.exit(code || 0);
  });
} else {
  // 本番モード: コンパイル済みのJSを実行
  const { pathToFileURL } = await import('url');
  const indexPath = join(projectRoot, 'dist', 'index.js');
  await import(pathToFileURL(indexPath).href);
}