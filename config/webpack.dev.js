const { HtmlRspackPlugin } = require("@rspack/core");
const { merge } = require("webpack-merge");

const paths = require("./paths");
const common = require("./webpack.common.js");

module.exports = merge(common, {
  mode: "development",
  entry: {
    index: paths.src + "/dev/index.tsx",
  },
  devtool: "inline-source-map",
  devServer: {
    historyApiFallback: true,
    compress: true,
    hot: true,
    port: 8080,
  },
  plugins: [
    new HtmlRspackPlugin({
      template: paths.src + "/dev/index.html",
    }),
  ],
});
