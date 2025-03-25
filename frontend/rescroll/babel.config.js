module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
      '@babel/plugin-transform-react-jsx-source',
      process.env.NODE_ENV === 'development' && ['@babel/plugin-transform-strict-mode', { strict: false }],
    ].filter(Boolean),
  };
}; 