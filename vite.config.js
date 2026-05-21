import fs from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'vite';

function normalizeBasePath(value = '') {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (raw === '/') return '/';

  const withLeadingSlash = raw.startsWith('/') ? raw : `/${raw}`;
  return withLeadingSlash.endsWith('/') ? withLeadingSlash : `${withLeadingSlash}/`;
}

const DEFAULT_PAGES_BASE = '/Nymo/';
const configuredPagesBase = normalizeBasePath(process.env.VITE_BASE_PATH);
const pagesBase = configuredPagesBase || DEFAULT_PAGES_BASE;
const hmrHost = String(process.env.VITE_HMR_HOST || '').trim();
const hmrProtocol = String(process.env.VITE_HMR_PROTOCOL || '').trim();
const hmrPort = Number.parseInt(process.env.VITE_HMR_PORT || '', 10);
const hmrClientPort = Number.parseInt(process.env.VITE_HMR_CLIENT_PORT || '', 10);
const hasCustomHmrConfig = Boolean(
  hmrHost
  || hmrProtocol
  || Number.isFinite(hmrPort)
  || Number.isFinite(hmrClientPort)
);

const hmrConfig = hasCustomHmrConfig
  ? {
      ...(hmrProtocol ? { protocol: hmrProtocol } : {}),
      ...(hmrHost ? { host: hmrHost } : {}),
      ...(Number.isFinite(hmrPort) ? { port: hmrPort } : {}),
      ...(Number.isFinite(hmrClientPort) ? { clientPort: hmrClientPort } : {})
    }
  : undefined;

function buildPwaManifest(basePath) {
  const base = normalizeBasePath(basePath) || '/';
  const iconQuery = '?v=3';
  return {
    name: 'Nymo',
    short_name: 'Nymo',
    id: base,
    description: 'Nymo messenger as an installable progressive web app.',
    lang: 'uk',
    start_url: base,
    scope: base,
    display: 'standalone',
    display_override: ['window-controls-overlay', 'standalone', 'minimal-ui'],
    orientation: 'portrait',
    background_color: '#050505',
    theme_color: '#050505',
    prefer_related_applications: false,
    categories: ['communication', 'social', 'productivity'],
    icons: [
      {
        src: `${base}pwa/icon-192.png${iconQuery}`,
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable'
      },
      {
        src: `${base}pwa/icon-512.png${iconQuery}`,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable'
      }
    ]
  };
}

function nymoPwaManifestPlugin(basePath) {
  return {
    name: 'nymo-pwa-manifest',
    apply: 'build',
    closeBundle() {
      const outDir = path.resolve(process.cwd(), 'dist');
      const manifestPath = path.join(outDir, 'manifest.webmanifest');
      fs.writeFileSync(
        manifestPath,
        `${JSON.stringify(buildPwaManifest(basePath), null, 2)}\n`,
        'utf8'
      );
    }
  };
}

export default defineConfig(({ command }) => ({
  plugins: command === 'build' ? [nymoPwaManifestPlugin(pagesBase)] : [],
  base: command === 'build' ? pagesBase : '/',
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    ...(hmrConfig ? { hmr: hmrConfig } : {})
  },
  build: {
    // Modern targets only — drops legacy transforms and shrinks the bundle.
    target: 'es2020',
    cssCodeSplit: true,
    sourcemap: false,
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      input: {
        main: 'index.html',
        auth: 'auth/index.html'
      },
      output: {
        // Split big / rarely-used dependencies into their own chunks so the
        // main entry stays small and the browser can cache vendor code across
        // deploys.
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('qrcode')) return 'vendor-qrcode';
          if (id.includes('three')) return 'vendor-three';
          return 'vendor';
        }
      }
    }
  }
}));
