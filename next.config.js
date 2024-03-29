require('dotenv').config();
const path = require('path');
const nextEnv = require('next-env');
const withTypescript = require('@zeit/next-typescript');
const withCSS = require('@zeit/next-css');
const Dotenv = require('dotenv-webpack');
const FilterWarningsPlugin = require('webpack-filter-warnings-plugin');
const withNextEnv = nextEnv();
const webpackImport = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin;
const compose = require('lodash/fp/compose');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

const withOffline = moduleExists('next-offline')
  ? require('next-offline')
  : config => config;

if (typeof require !== 'undefined') {
  require.extensions['.css'] = file => {};
}

const IMAGE_CACHE_CONFIG = {
  urlPattern: /static\/.*\.(?:png|jpg|jpeg|svg)$/,
  handler: 'CacheFirst',
  options: {
    cacheName: 'pp-images',
    expiration: {
      maxEntries: 20
    }
  }
};

const BASE_CONFIG = {
  target: 'serverless',
  generateInDevMode: false,
  workboxOpts: {
    skipWaiting: true,
    swDest: 'static/service-worker.js',
    runtimeCaching: [IMAGE_CACHE_CONFIG]
  },
  env: {
    NEXT_PUBLIC_ENDPOINT_URL: process.env.NEXT_PUBLIC_ENDPOINT_URL,
    NEXT_PUBLIC_GRAPHQL_ENDPOINT: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT,
    NEXT_PUBLIC_WEBSOCKET_URL: process.env.NEXT_PUBLIC_WEBSOCKET_URL,
    NEXT_PUBLIC_SPOTIFY_REFRESH_TOKEN_URL:
      'https://accounts.spotify.com/api/token',
    NEXT_PUBLIC_FRONTEND_URL: process.env.NOW_URL
  },

  webpack: config => {
    config.plugins = config.plugins || [];

    config.module.rules.push({
      loader: 'webpack-ant-icon-loader',
      enforce: 'pre',
      include: [path.resolve('node_modules/@ant-design/icons/lib/dist')]
    });

    config.module.rules.push({
      test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
      use: [
        {
          loader: 'babel-loader'
        },
        {
          loader: '@svgr/webpack',
          options: {
            babel: false,
            icon: true
          }
        }
      ]
    });

    // paths from tsconfig
    if (config.resolve.plugins) {
      config.resolve.plugins.push(new TsconfigPathsPlugin());
    } else {
      config.resolve.plugins = [new TsconfigPathsPlugin()];
    }

    config.plugins.push(
      new FilterWarningsPlugin({
        exclude: /mini-css-extract-plugin[^]*Conflicting order between:/
      })
    );
    config.plugins.push(new webpackImport.IgnorePlugin(/\/iconv-loader$/));

    // config.resolve.alias = {
    //   ...config.resolve.alias,
    //   '@components': path.resolve(__dirname, 'src/components'),
    //   '@generated': path.resolve(__dirname, 'generated'),
    //   '@shared': path.resolve(__dirname, 'src/shared'),
    //   '@pages': path.resolve(__dirname, 'pages'),
    //   '@hooks': path.resolve(__dirname, 'src/hooks'),
    //   '@apolloSetup': path.resolve(__dirname, 'apolloSetup'),
    //   '@axios': path.resolve(__dirname, 'axios'),
    //   '@customIcons': path.resolve(__dirname, 'custom-icons'),
    //   '@graphql': path.resolve(__dirname, 'graphql'),
    //   '@services': path.resolve(__dirname, 'src/services'),
    //   '@guards': path.resolve(__dirname, 'src/guards'),
    //   '@auth': path.resolve(__dirname, 'src/auth')
    // };
    return config;
  }
};

module.exports = compose(
  withNextEnv,
  withTypescript,
  withCSS,
  withOffline
)(BASE_CONFIG);

function moduleExists(name) {
  try {
    return require.resolve(name);
  } catch (error) {
    return false;
  }
}
