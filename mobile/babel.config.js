module.exports = function (api) {
  api.cache(true);
  const isProduction = process.env.NODE_ENV === "production";
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      ["@babel/plugin-proposal-decorators", { legacy: true }],
      isProduction && [
        "babel-plugin-transform-remove-console",
        {
          exclude: ["error", "warn"],
        },
      ],
      [
        "react-native-unistyles/plugin",
        {
          // pass root folder of your application
          // all files under this folder will be processed by the Babel plugin
          // if you need to include more folders, or customize discovery process
          // check available babel options
          root: "src",
        },
      ],
    ].filter(Boolean),
  };
};
