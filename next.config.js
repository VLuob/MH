const withLess = require('@zeit/next-less')
const withCss = require('@zeit/next-css')
const lessToJS = require('less-vars-to-js')
const withImages = require('next-images')
const TerserPlugin = require('terser-webpack-plugin')
const withTypescript = require('@zeit/next-typescript')
const withBabelMinify = require('next-babel-minify')()
const webpack = require('webpack')
const path = require('path')
const fs = require('fs')
const withSourceMaps = require('@zeit/next-source-maps')({
    devtool: 'hidden-source-map'
})
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
// const CleanWebpackPlugin = require("clean-webpack-plugin")

// fix: prevents error when .less files are required by node
if(typeof require !== 'undefined') {
    require.extensions['.less'] = file => { }
}

const exportPathMap = function () {
    return {
        '/': { page: '/' }
    }
}

const assetPrefix = function () {
    return {
        assetPrefix: '/'
    }
}

const resolve = (dir) => {
    return path.resolve(process.cwd(), dir)
}

// module.exports = withImages(exportPathMap(withLess({
//     lessLoaderOptions: {
//         javascriptEnabled: true,
//         modifyVars: lessToJS(
//             fs.readFileSync(path.resolve(__dirname, './less/public/antd.less'), 'utf8')
//         )
//     }
// })))

module.exports = withTypescript(withImages(withLess(withCss({
    distDir: `dist`,
    // distDir: process.env.NODE_ENV === 'production' ? `../build` : 'dist',
    // pageExtensions: [`jsx`, `js`],
    // publicRuntimeConfig: { // Will be available on both server and client
    //     staticFolder: '/static'
    // },
    // generateBuildId: async () => {
    //     return 'v0.0.1'
    // },
    // onDemandEntries: {
    //     // period (in ms) where the server will keep pages in the buffer
    //     maxInactiveAge: 25 * 1000,
    //     // number of pages that should be kept simultaneously without being disposed
    //     pagesBufferLength: 2,
    // },
    // generateEtags: false,
    lessLoaderOptions: {
        javascriptEnabled: true,
        modifyVars: lessToJS(
            fs.readFileSync(path.resolve(__dirname, './less/public/antd.less'), 'utf8')
        )
    },
    // exportPathMap: async function (defaultPathMap) {
    //     return {
    //         '/': { page: '/' }
    //     }
    // },
    webpack: (config, options) => {
        const alias = config.resolve.alias || {}

        config.resolve.alias = {
            ...alias,
            '@components': resolve('components'),
            '@containers': resolve('containers'),
            '@constants': resolve('constants'),
            '@static': resolve('static'),
            '@routes': resolve('routes'),
            '@stores': resolve('stores'),
            '@pages': resolve('pages'),
            '@utils': resolve('utils'),
            '@base': resolve('base'),
            '@api': resolve('api'),
        }

        const originalEntry = config.entry

        // config.optimization = {
        //     minimizer: [
        //         new TerserPlugin({
        //             cache: true
        //         }),
        //     ],
        // }

        // config.module.rules.push({
        //     test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        //         use: [
        //             options.defaultLoaders.babel,
        //             // {
        //             //     loader: 'babel-loader',
        //             // },
        //             {
        //                 loader: '@svgr/webpack',
        //                 options: {
        //                     babel: false,
        //                     icon: true,
        //                 },
        //             }
        //         ],
        // })

        // config.module.rules.push({
        //     test: /\.svg$/,
        //     use: [
        //         {
        //             loader: "react-svg-loader",
        //             options: {
        //                 jsx: true // true outputs JSX tags
        //             }
        //         }
        //     ]
        // })

        config.plugins.push(
            new webpack.DefinePlugin({
                'process.env.NODE_SERVER_ENV': JSON.stringify(process.env.NODE_SERVER_ENV)
            })
        )

        return config
    }
}))))