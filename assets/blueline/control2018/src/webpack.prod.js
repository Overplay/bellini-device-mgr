/**
 * Created by mkahn on 10/14/17.
 */

const path = require( 'path' );
const webpack = require( 'webpack' );
const HtmlWebpackPlugin = require( 'html-webpack-plugin' );
const UglifyJSPlugin = require( 'uglifyjs-webpack-plugin' );


module.exports = {
    entry:     { app: [ './app/control2.module.js'] },
    output:    {
        path:     path.resolve( __dirname, '../../control' ),
        //path: path.resolve( __dirname, '../dist' ),
        filename: 'app.bundle.js'
    },
    //devtool:   'inline-source-map',
    module:    {
        rules: [
            // Javascript goes thru babel
            {
                test:    /\.js$/,
                loader:  "babel-loader",
                query:   {
                    presets: [ "babel-preset-es2015" ].map( require.resolve )
                },
                exclude: /node_modules/
            },
            // CSS
            {
                test:   /\.css$/,
                loader: "style-loader!css-loader"
            },
            // Not used, but here in case
            {
                test: /\.txt$/,
                use:  'raw-loader'
            },
            {
                test: /\.(png|jpg|gif|jpeg|xml)$/,
                use: [ 'file-loader?name=images/[name].[ext]' ]
            },
            {
                test: /\.scss$/,
                use:  [ "style-loader", "css-loader", "sass-loader" ]
            },
            {
                test:   /\.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
                loader: 'file-loader?name=fonts/[name].[ext]'
            },
            {
                test:   /\.(mp3|aif|caf|wav)?$/,
                loader: 'file-loader?name=sounds/[name].[ext]'
            },
            {
                test:   /\.(json)?$/,
                loader: 'file-loader?name=json/[name].[ext]'
            }
        ]

    },
    plugins:   [
        new HtmlWebpackPlugin( { title: 'OG Control 2',
                template: './index.ejs',
                chunks: [ 'app' ],
        } ),
        new UglifyJSPlugin( {
            sourceMap:     false,
            uglifyOptions: { mangle: false }
        } )
    ],
    // Left here as an example of how to alias imports
    // resolve: {
    //     alias: {
    //         //'@bab': path.resolve( __dirname, 'src/modules/babylon'),
    //         //'@test': path.resolve( __dirname, 'src/modules/testing' ),
    //         //'@barn': path.resolve( __dirname, 'src/modules/barn' ),
    //         //'@toyroom': path.resolve(__dirname, 'src/modules/toyroom'),
    //     }
    // }
}
