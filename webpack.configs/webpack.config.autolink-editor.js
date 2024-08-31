const path = require('path');

module.exports = {
  entry: './AutoLinkEditor/src/index.js',
  output: {
    filename: 'autolink-editor.bundle.js',
    path: path.resolve(__dirname, '../dist/autolink-editor'),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  mode: 'production'
};