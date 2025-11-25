const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
        clean: true,
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-react']
                    }
                }
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html',
        })
    ],
    devServer: {
        static: './dist',
        port: 3000,
        hot: true,
    },
    resolve: {
        extensions: ['.js', '.jsx'],
        fallback: {
            "stream": require.resolve("stream-browserify"),
            "util": require.resolve("util/"),
            "buffer": require.resolve("buffer/"),
            "process": require.resolve("process/browser")
        }
    }
};
