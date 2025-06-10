module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Fix for webpack-dev-server deprecation warnings
      if (webpackConfig.devServer) {
        // Replace deprecated onBeforeSetupMiddleware and onAfterSetupMiddleware
        // with the new setupMiddlewares option
        delete webpackConfig.devServer.onBeforeSetupMiddleware;
        delete webpackConfig.devServer.onAfterSetupMiddleware;
        
        webpackConfig.devServer.setupMiddlewares = (middlewares, devServer) => {
          if (!devServer) {
            throw new Error('webpack-dev-server is not defined');
          }
          return middlewares;
        };
      }      // Development optimizations to reduce memory usage
      if (process.env.NODE_ENV === 'development') {
        // Simplify development build to use fewer resources
        webpackConfig.optimization = {
          ...webpackConfig.optimization,
          removeAvailableModules: false,
          removeEmptyChunks: false,
          splitChunks: false,
          minimize: false,
          runtimeChunk: false
        };
        
        // Disable source maps for development to save memory
        webpackConfig.devtool = false;
        
        // Additional optimizations for memory usage
        webpackConfig.cache = {
          type: 'memory', // Use memory cache instead of filesystem
          maxGenerations: 1 // Only keep one generation in memory
        };
        
        // Disable persistent caching
        webpackConfig.snapshot = {
          ...webpackConfig.snapshot,
          managedPaths: [],
          immutablePaths: []
        };
        
        // Reduce parallelism to minimize memory usage
        webpackConfig.parallelism = 1;
      }
      
      // Production optimizations
      if (process.env.NODE_ENV === 'production') {
        // Enable tree shaking for better optimization
        webpackConfig.optimization = {
          ...webpackConfig.optimization,
          usedExports: true,
          sideEffects: true,
          minimize: true,
          splitChunks: {
            chunks: 'all',
            minSize: 20000,
            minChunks: 1,
            maxAsyncRequests: 30,
            maxInitialRequests: 30,
            cacheGroups: {
              defaultVendors: {
                test: /[\\/]node_modules[\\/]/,
                priority: -10,
                reuseExistingChunk: true,
              },
              default: {
                minChunks: 2,
                priority: -20,
                reuseExistingChunk: true,
              },
            },
          },
        };
      }
      
      return webpackConfig;
    },
  },
};
