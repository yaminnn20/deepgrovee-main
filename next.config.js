/** @type {import('next').NextConfig} */

const CopyPlugin = require("copy-webpack-plugin");

const wasmPaths = [
  "./node_modules/onnxruntime-web/dist/ort-wasm.wasm",
  "./node_modules/onnxruntime-web/dist/ort-wasm-threaded.wasm",
  "./node_modules/onnxruntime-web/dist/ort-wasm-simd.wasm",
  "./node_modules/onnxruntime-web/dist/ort-wasm-simd.jsep.wasm",
  "./node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.wasm",
  "./node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.jsep.wasm",
  "./node_modules/onnxruntime-web/dist/ort-training-wasm-simd.wasm",
  "./node_modules/@ricky0123/vad-web/dist/silero_vad.onnx",
  "./node_modules/@ricky0123/vad-web/dist/vad.worklet.bundle.min.js",
];

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  productionBrowserSourceMaps: false, // Disable source maps in production
  webpack(config, { dev, isServer }) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    config.resolve.alias = {
      ...config.resolve.alias,
      sharp$: false,
      "onnxruntime-node$": false,
    };

    // Production optimizations
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        minimize: true,
        minimizer: [
          ...config.optimization.minimizer,
          new (require('terser-webpack-plugin'))({
            terserOptions: {
              compress: {
                drop_console: true, // Remove console.logs
                drop_debugger: true,
              },
              mangle: true, // Mangle variable names
              output: {
                comments: false, // Remove comments
              },
            },
          }),
        ],
      };
    }

    config.plugins.push(
      new CopyPlugin({
        patterns: wasmPaths.map((p) => ({
          from: p,
          to: "static/chunks/app",
        })),
      })
    );

    // vercel
    config.plugins.push(
      new CopyPlugin({
        patterns: wasmPaths.map((p) => ({
          from: p,
          to: "static/chunks",
        })),
      })
    );

    return config;
  },
  reactStrictMode: false,
  async headers() {
    return [
      {
        source: "/_next/(.*)",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "require-corp",
          },
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "require-corp",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
