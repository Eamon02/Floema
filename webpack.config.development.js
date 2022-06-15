const { merge } = require('webpack-merge');
const path = require('path');

const config = require('./webpack.config');

module.exports = merge(config, {
	mode: 'development',

	devtool: 'inline-source-map',

	devServer: {
		host: '0.0.0.0'
	},
	output: {
		path: path.resolve(__dirname, 'public'),
	},
});
