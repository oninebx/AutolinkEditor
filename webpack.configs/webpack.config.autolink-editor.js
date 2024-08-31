const path = require('path');

module.exports = {
  entry: './autoLinkEditor/src/index.js',
  output: {
    filename: 'autoLinkEditor.bundle.js',
    path: path.resolve(__dirname, '../dist/autoLinkEditor'),
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