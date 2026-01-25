import { defineConfig } from 'vite';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';

/**
 * Copy directory recursively
 */
function copyDir(src: string, dest: string): void {
  mkdirSync(dest, { recursive: true });
  const entries = readdirSync(src);

  for (const entry of entries) {
    const srcPath = join(src, entry);
    const destPath = join(dest, entry);

    if (statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      mkdirSync(dirname(destPath), { recursive: true });
      copyFileSync(srcPath, destPath);
    }
  }
}

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    lib: {
      entry: resolve(__dirname, 'src/dnd35zukus.ts'),
      formats: ['es'],
      fileName: () => 'dnd35zukus.js'
    },
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') return 'styles/system.css';
          return assetInfo.name || 'asset';
        }
      }
    }
  },
  plugins: [
    {
      name: 'copy-static-files',
      closeBundle() {
        // Copy system.json
        copyFileSync(
          resolve(__dirname, 'system.json'),
          resolve(__dirname, 'dist/system.json')
        );

        // Copy template.json
        copyFileSync(
          resolve(__dirname, 'template.json'),
          resolve(__dirname, 'dist/template.json')
        );

        // Copy templates
        copyDir(
          resolve(__dirname, 'templates'),
          resolve(__dirname, 'dist/templates')
        );

        // Copy lang
        copyDir(
          resolve(__dirname, 'lang'),
          resolve(__dirname, 'dist/lang')
        );

        console.log('Static files copied to dist/');
      }
    }
  ]
});
