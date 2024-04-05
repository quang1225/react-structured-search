const { merge } = require("webpack-merge");
const paths = require("./paths");
const common = require("./webpack.common.js");

module.exports = merge(common, {
  mode: "production",
  entry: {
    index: "./src/index.ts",
  },
  output: {
    path: paths.build,
    publicPath: "/",
    filename: "[name].js",
    library: "[name]",
    libraryTarget: "umd",
  },
  optimization: {
    minimize: true,
  },
  externals: {
    react: "react",
    "react-dom": "react-dom",
    "react-router-dom": "react-router-dom",
  },
});
