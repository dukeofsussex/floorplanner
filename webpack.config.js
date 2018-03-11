const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    entry: {
        floorplanner: path.resolve(__dirname, 'src/app/floorplanner.js'),
        style: path.resolve(__dirname, 'src/style/style.scss')
    },
    output: {
        filename: '[name].bundle.min.js',
        path: path.resolve(__dirname, 'dist'),
        libraryTarget: 'var',
        library: 'FloorPlanner'
    },
    module: {
        rules: [
            {
                test: /\.(png|woff|woff2|eot|ttf|svg)(\?.*)?$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 10000
                        }
                    }
                ]
            },
            //{
            //    test: /\.js$/,
            //    exclude: path.resolve(__dirname, 'node_modules'),
            //    enforce: 'pre',
            //    use: ['eslint-loader']
            //},
            {
                test: /\.js$/,
                exclude: path.resolve(__dirname, 'node_modules'),
                use: ['babel-loader']
            },
            {
                test: /\.(scss)$/,
                use: ExtractTextPlugin.extract({
                    use: [
                        {
                            loader: 'css-loader',
                            options: {
                                minimize: true,
                                sourceMap: true
                            }
                        },
                        {
                            loader: 'postcss-loader',
                            options: {
                                plugins: () => [
                                    require('precss'),
                                    require('autoprefixer')
                                ]
                            }
                        },
                        {
                            loader: 'resolve-url-loader'
                        },
                        {
                            loader: 'sass-loader',
                            options: {
                                sourceMap: true
                            }
                        }
                    ],
                    fallback: 'style-loader'
                })
            }
        ]
    },
    plugins: [
        new CopyWebpackPlugin([
            {
                from: path.join(__dirname, 'src', 'index.html'),
                to: path.join(__dirname, 'dist', 'index.html'),
                copyUnmodified: true,
                force: true
            }
        ]),
        new ExtractTextPlugin({
            filename: "floorplanner.min.css"
        }),
        new webpack.optimize.UglifyJsPlugin()
    ],
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        compress: true,
        port: 8080
    }
};
