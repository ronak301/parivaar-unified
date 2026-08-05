module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      "react-native-reanimated/plugin",
      "transform-inline-environment-variables",
      require.resolve("expo-router/babel"),
      [
        "module-resolver",
        {
          alias: {
            src: "./src",
            assets: "./assets",
          },
        },
      ],
    ],
  };
};
