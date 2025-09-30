module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          alias: {
            '@': './src',
            '@components': './src/components',
            '@screens': './src/screens',
            '@services': './src/services',
            '@store': './src/store',
            '@utils': './src/utils',
            '@types': './src/types',
            '@navigation': './src/navigation',
            '@theme': './src/theme',
            '@assets': './assets',
          },
        },
      ],
      'react-native-paper/babel',
      'react-native-reanimated/plugin',
    ],
  };
};