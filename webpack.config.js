const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
	mode: 'development',
	entry: {
		index: './src/index.ts',
	},
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: '[name].[hash].js',
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
			{
        		test: /\.(png|jpe?g|gif)$/i,
        		use: {
        			loader: 'file-loader',
        			options: {
        				esModule: false,
        			}
        		}
      	  	},
		]
	},
	devtool: false,
	resolve: {
		modules: [
			path.resolve(__dirname, 'src'),
			'node_modules'
		],
		extensions: ['.ts', '.js']
	},
	devServer: {
		contentBase: './dist',
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: path.resolve(__dirname, 'dist/index.html'),
		}),
	]
}
