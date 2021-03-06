const path = require('path')
const address = require('address')
const chalk = require('chalk')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

function clearConsole() {
	process.stdout.write(process.platform === 'win32' ? '\x1B[2J\x1B[0f' : '\x1B[2J\x1B[3J\x1B[H')
}

module.exports = {
	mode: process.env.NODE_ENV,
	entry: './src/index.js',
	output: {
		publicPath: '/'
	},
	devtool: 'inline-source-map',
	devServer: {
		historyApiFallback: true,
		host: '0.0.0.0',
		port: 8088,
		compress: true,
		noInfo: true,
		useLocalIp: true,
		hot: true,
		open: false,
		proxy: {
			'/api/v3': {
				target: 'http://11.22.33.111:8891',
				changeOrigin: true,
				secure: false,
				pathRewrite: {
					'^/': ''
				}
			}
		}
	},
	resolve: {
		extensions: ['.js', '.jsx', '.json']
	},
	module: {
		rules: [
			{
				enforce: 'pre',
				test: /\.(js|jsx)$/,
				exclude: /node_modules/,
				loader: 'eslint-loader',
				options: {
					cache: true,
					fix: true
				}
			},
			{
				test: /\.(js|jsx)$/,
				exclude: /node_modules/,
				include: path.resolve(__dirname, 'src'),
				use: [
					{
						loader: 'cache-loader'
					},
					{
						loader: 'thread-loader',
						options: {
							workers: 2
						}
					},
					'babel-loader'
				]
			},
			{
				test: /\.css$/,
				use: [
					'style-loader',
					{
						loader: MiniCssExtractPlugin.loader,
						options: {
							esModule: true
						}
					},
					'css-loader',
					'postcss-loader'
				]
			},
			{
				test: /\.less$/,
				use: [
					'style-loader',
					{
						loader: MiniCssExtractPlugin.loader,
						options: {
							esModule: true
						}
					},
					'css-loader',
					'postcss-loader',
					'less-loader'
				]
			},
			{
				test: /\.(png|svg|jpg|gif)$/,
				use: ['file-loader']
			},
			{
				test: /\.(woff|woff2|eot|ttf|otf)$/,
				use: ['file-loader']
			},
			{
				test: /\.(csv|tsv)$/,
				use: ['csv-loader']
			},
			{
				test: /\.xml$/,
				use: ['xml-loader']
			}
		]
	},
	plugins: [
		new MiniCssExtractPlugin({
			filename: 'css/[name].[hash:7].css',
			chunkFilename: 'css/[name].[hash:7].css'
		}),
		new HtmlWebpackPlugin({
			minify: {
				inject: true,
				html5: true,
				collapseWhitespace: true,
				preserveLineBreaks: false,
				minifyCSS: true,
				minifyJS: true,
				removeComments: false
			},
			filename: 'index.html',
			template: './src/index.html'
		}),
		function() {
			const isInteractive = process.stdout.isTTY
			this.hooks.invalid.tap('invalid', () => {
				if (isInteractive) {
					clearConsole()
				}
				console.log('Compiling...')
			})
			this.hooks.done.tap('done', () => {
				if (isInteractive) {
					clearConsole()
				}
				console.log(`You can now view ${chalk.bold('App')} in the browser.`)
				console.log(`  ${chalk.bold('Local:')}            http://localhost:${8088}`)
				console.log(`  ${chalk.bold('On Your Network:')}  http://${address.ip()}:${8088}`)
			})
		}
	]
}
