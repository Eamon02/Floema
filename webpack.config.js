const path = require('path');
const webpack = require('webpack');

const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExstractPlugin = require('mini-css-extract-plugin');
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');

const IS_DEVELOPMENT = process.env.NODE_ENV === 'dev';

const dirApp = path.join(__dirname, 'app');
const dirImages = path.join(__dirname, 'images');
const dirShared = path.join(__dirname, 'shared');
const dirStyles = path.join(__dirname, 'styles');
const dirVideos = path.join(__dirname, 'videos');
const dirNode = 'node_modules';

module.exports = {
	entry: [path.join(dirApp, 'index.js'), path.join(dirStyles, 'index.scss')],

	resolve: {
		modules: [
			dirApp,
			dirImages,
			dirShared,
			dirStyles,
			dirVideos,
			dirNode,
		],
	},

	plugins: [
		new webpack.DefinePlugin({
			IS_DEVELOPMENT,
		}),

		new CopyWebpackPlugin({
			patterns: [
				{
					from: './shared',
					to: '',
				},
			],
		}),

		new MiniCssExstractPlugin({
			filename: '[name].css',
			chunkFilename: '[id].css',
		}),

		new ImageMinimizerPlugin({
			minimizer: {
				implementation: ImageMinimizerPlugin.imageminMinify,
				options: {
					// Lossless optimization with custom option
					// Feel free to experiment with options for better result for you
					plugins: [
						['gifsicle', { interlaced: true }],
						['jpegtran', { progressive: true }],
						['optipng', { optimizationLevel: 5 }],
					],
				},
			},
		}),
	],

	module: {
		rules: [
			{
				test: /\.js$/,
				use: {
					loader: 'babel-loader',
				},
			},
			{
				test: /\.scss$/,
				use: [
					{
						loader: MiniCssExstractPlugin.loader,
						options: {
							publicPath: '',
						},
					},
					{
						loader: 'css-loader',
					},
					{
						loader: 'postcss-loader',
					},
					{
						loader: 'sass-loader',
					},
				],
			},
			{
				test: /\.(jpe?g|png|gif|svg|woff2?|fnt|webp)$/,
				loader: 'file-loader',
				options: {
					name(file) {
						// returning Hash so images are not cached
						return '[hash].[ext]';
					},
				},
			},
			{
				test: /\.(jpe?g|png|gif|svg|webp)$/i,
				use: [
					{
						loader: ImageMinimizerPlugin.loader,
						options: {
							minimizer: {
								implementation:
									ImageMinimizerPlugin.imageminMinify,
								options: {
									plugins: [
										'imagemin-gifsicle',
										'imagemin-mozjpeg',
										'imagemin-pngquant',
										'imagemin-svgo',
									],
								},
							},
						},
					},
				],
			},
		],
	},
};
