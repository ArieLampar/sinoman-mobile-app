// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Enable minification for production builds
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    mangle: {
      keep_classnames: false,
      keep_fnames: false,
    },
    compress: {
      // Preserve function names for better debugging
      reduce_funcs: false,
    },
  },
};

module.exports = config;