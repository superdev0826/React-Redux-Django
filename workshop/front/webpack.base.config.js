const path = require('path')
const webpack = require('webpack')

module.exports = {
  context: __dirname,

  entry: {
    // Add as many entry points as you have container-react-components here
    LinksDetail: ['./src/views/LinksDetail'],
    vendors: ['react', 'babel-polyfill'],
  },

  output: {
      path: path.resolve('./workshop/static/bundles/local/'),
      filename: '[name]-[hash].js'
  },

  externals: [
  ], // add all vendor libs

  plugins: [
    new webpack.optimize.CommonsChunkPlugin('vendors', 'vendors.js'),
  ], // add all common plugins here

  module: {
    loaders: [] // add all common loaders here
  },

  resolve: {
    modulesDirectories: ['node_modules', 'bower_components'],
    extensions: ['', '.js', '.jsx']
  },
}
