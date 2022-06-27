const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  productionSourceMap: true,

  /*css: {
    loaderOptions: {
      scss: {
        additionalData: `@import 'dadsig-css/src/_variables.scss';`,
      },
    },
  },*/

  configureWebpack: {
    plugins: [
      new CopyPlugin([
          { from: "src/assets/data/", to: "data/" }
      ]),
    ],
  },
};