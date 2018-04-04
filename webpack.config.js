
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: {
		'index': './src/home/index.js',
		'options': './src/options/options.js',
		'concerts': './src/concerts/concerts.js'
    },
    devtool: 'inline-source-map',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name]-bundle.js',
        chunkFilename: '[name]-bundle.js',
        publicPath: '/'
    },
    plugins: [
        new CleanWebpackPlugin(['dist']),
        new HtmlWebpackPlugin({
			title: 'home page',
			template: './src/home/index.html',
			filename: 'index.html',
			inject: 'body',
			chunks: ['index']
		}),
		new HtmlWebpackPlugin({
			title: 'options page',
			template: './src/options/options.html',
			filename: 'options.html',
			inject: 'body',
			chunks: ['options']
		}),
		new HtmlWebpackPlugin({
			title: 'concerts page',
			template: './src/concerts/concerts.html',
			filename: 'concerts.html',
			inject: 'body',
			chunks: ['concerts']
		})
    ],
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader'
                ]
            },
            {
                test: /\.scss$/,
                use: [
                    'style-loader',
                    'css-loader',
                    'sass-loader'
                ]
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: [
                    'file-loader'
                ]
            },
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['env', 'react'],
                        plugins: ['babel-plugin-dynamic-import-webpack']
                    }
                }
			},
			{
				test: /\.csv$/,
				loader: 'csv-loader',
				options: {
				  dynamicTyping: true,
				  header: true,
				  skipEmptyLines: true
				}
			}
        ]
    },
};
