import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function songScannerPlugin() {
  const songsDir = path.resolve(__dirname, 'public/songs');
  const manifestPath = path.resolve(songsDir, 'manifest.json');
  const AUDIO_EXTS = ['.mp3', '.m4a', '.mpeg', '.wav', '.ogg', '.flac', '.aac', '.webm'];

  function parseSongName(filename) {
    let clean = filename.replace(/\.(m4a\.mpeg|mp3|m4a|mpeg|wav|ogg|flac|aac|webm)$/i, '');
    clean = clean.replace(/\s+/g, ' ').trim();
    let title = clean;
    let artist = 'Avengers OST';
    if (clean.includes(' - ')) {
      const parts = clean.split(' - ');
      artist = parts[0].trim();
      title = parts.slice(1).join(' - ').trim();
    } else if (clean.includes('   ')) {
      const parts = clean.split('   ');
      title = parts[0].trim();
      artist = parts.slice(1).join(' & ').trim();
    }
    return { title, artist };
  }

  function syncManifest() {
    try {
      if (!fs.existsSync(songsDir)) return;
      const files = fs.readdirSync(songsDir);
      const audioFiles = files.filter((f) => {
        const lower = f.toLowerCase();
        return AUDIO_EXTS.some((ext) => lower.endsWith(ext)) && !lower.endsWith('.json');
      });

      let existingManifest = {
        updatedAt: new Date().toISOString(),
        totalTracks: 0,
        defaultCrossfadeSeconds: 4,
        supportedFormats: AUDIO_EXTS,
        songs: [],
      };

      if (fs.existsSync(manifestPath)) {
        try {
          const raw = fs.readFileSync(manifestPath, 'utf8');
          existingManifest = JSON.parse(raw);
        } catch {
          // ignore corrupted manifest read
        }
      }

      const existingSongs = Array.isArray(existingManifest.songs) ? existingManifest.songs : [];
      const songMap = new Map();
      existingSongs.forEach((s) => {
        if (s.filename) songMap.set(s.filename, s);
      });

      const heroBadges = [
        { badge: 'IRON MAN • MARK VII', theme: 'Iron Man', accent: '#ED1D24', sec: '#FFD700', img: '/MARVEL/Iron Man.jpg' },
        { badge: 'THOR • GOD OF THUNDER', theme: 'Thor', accent: '#00D4FF', sec: '#FFFFFF', img: '/MARVEL/Iron Man.jpg' },
        { badge: 'SPIDER-MAN • MULTIVERSE', theme: 'Spider-Man', accent: '#ED1D24', sec: '#00A8FF', img: '/MARVEL/Spider-man.png' },
        { badge: 'STAR-LORD • AWESOME MIX', theme: 'Guardians of the Galaxy', accent: '#FF7B00', sec: '#00D4FF', img: '/MARVEL/MCU Multiverse Saga.jpg' },
        { badge: 'BLACK PANTHER • WAKANDA', theme: 'Black Panther', accent: '#9D4EDD', sec: '#00D4FF', img: '/MARVEL/MCU Multiverse Saga.jpg' },
        { badge: 'AVENGERS • ASSEMBLE', theme: 'Avengers', accent: '#FFD700', sec: '#ED1D24', img: '/logo.png' },
      ];

      const mergedSongs = audioFiles.map((filename, idx) => {
        const existing = songMap.get(filename);
        if (existing) {
          return {
            ...existing,
            url: `/songs/${encodeURIComponent(filename)}`,
          };
        }
        const { title, artist } = parseSongName(filename);
        const hero = heroBadges[idx % heroBadges.length];
        return {
          id: `track-${idx + 1}`,
          filename,
          url: `/songs/${encodeURIComponent(filename)}`,
          title,
          artist,
          duration: 180,
          theme: hero.theme,
          heroBadge: hero.badge,
          accentColor: hero.accent,
          secondaryColor: hero.sec,
          coverImage: hero.img,
          highlight: {
            startTime: 15,
            dropTime: 30,
            endTime: 75,
            description: 'High-energy festival highlight section',
          },
        };
      });

      const updated = {
        updatedAt: new Date().toISOString(),
        totalTracks: mergedSongs.length,
        defaultCrossfadeSeconds: existingManifest.defaultCrossfadeSeconds || 4,
        supportedFormats: AUDIO_EXTS,
        songs: mergedSongs,
      };

      fs.writeFileSync(manifestPath, JSON.stringify(updated, null, 2), 'utf8');
    } catch {
      // ignore sync errors
    }
  }

  return {
    name: 'vite-plugin-song-scanner',
    buildStart() {
      syncManifest();
    },
    configureServer(server) {
      syncManifest();

      server.middlewares.use((req, res, next) => {
        const url = req.url || '';
        if (url.startsWith('/songs/')) {
          res.setHeader('Accept-Ranges', 'bytes');
          if (url.endsWith('.m4a.mpeg') || url.includes('.m4a.mpeg?')) {
            res.setHeader('Content-Type', 'audio/mp4');
          } else if (url.endsWith('.mp3') || url.includes('.mp3?')) {
            res.setHeader('Content-Type', 'audio/mpeg');
          }
        }
        next();
      });

      if (server.watcher) {
        server.watcher.add(songsDir);
        server.watcher.on('add', (file) => {
          if (file.startsWith(songsDir) && !file.endsWith('.json')) syncManifest();
        });
        server.watcher.on('unlink', (file) => {
          if (file.startsWith(songsDir) && !file.endsWith('.json')) syncManifest();
        });
      }
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react(), songScannerPlugin()],
  define: {
    'process.env': {},
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'next/link': path.resolve(__dirname, './src/shims/next-link.tsx'),
      'next/image': path.resolve(__dirname, './src/shims/next-image.tsx'),
      'next/navigation': path.resolve(__dirname, './src/shims/next-navigation.tsx'),
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'framer-motion', 'axios'],
  },
  build: {
    sourcemap: false,          // No source maps — DevTools won't show readable source
    cssCodeSplit: true,
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,    // Strip all console.* at build time
        drop_debugger: true,   // Strip debugger statements
        pure_funcs: [          // Treat these as side-effect free (tree-shake them)
          "console.log", "console.debug", "console.info",
          "console.warn", "console.error", "console.table",
          "console.dir", "console.trace", "console.group",
          "console.groupEnd", "console.time", "console.timeEnd",
        ],
      },
      mangle: {
        toplevel: true,        // Mangle top-level names for extra obfuscation
      },
      format: {
        comments: false,       // Strip all comments from output
      },
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("framer-motion")) return "vendor-motion";
            if (
              id.includes("react-dom") ||
              id.includes("react-router") ||
              id.includes("/react/") ||
              id.endsWith("/react") ||
              id.includes("\\react\\")
            ) {
              return "vendor-react";
            }
          }
          return undefined;
        },
      },
    },
  },
  server: {
    host: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/media': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/media': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
})
