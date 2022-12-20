/*
 * @Author: 徐翔 xuxiang001@zhongan.com
 * @Date: 2022-12-20 00:05:03
 * @LastEditors: 徐翔 xuxiang001@zhongan.com
 * @LastEditTime: 2022-12-21 00:16:37
 * @FilePath: /rollup/rolldemo/rollup.config.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import commonjs from '@rollup/plugin-commonjs';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import alias from '@rollup/plugin-alias';
import {babel,getBabelOutputPlugin } from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
import postcss from 'rollup-plugin-postcss';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import html from '@rollup/plugin-html';
import beep from '@rollup/plugin-beep';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';
import inject from '@rollup/plugin-inject';
import strip from '@rollup/plugin-strip';
import url from '@rollup/plugin-url';
import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';
// import path from 'path'
import clear from 'rollup-plugin-clear'
import lodash from 'lodash'
import postcssurl from 'postcss-url';

const htmlTemplate = `
    <!DOCTYPE html>
    <html>
        <head>
        <meta charset="utf-8">
        <title>demo</title>
        <link rel="stylesheet" href="./css/index.css">
        </head>
        <body>
            <div id='root'></div>
        </body>
        <script src="https://gw.alipayobjects.com/os/lib/react/18.2.0/umd/react.production.min.js"></script>
        <script src="https://gw.alipayobjects.com/os/lib/react-dom/18.2.0/umd/react-dom.production.min.js"></script>
        <script src='./index.js'></script>
    </html>`;

const isDevelopment = process.env.NODE_ENV !== 'production';
const baseUrl = 'dist'
const globals = {
    react: 'react',
    'react-dom': 'react-dom'
}
module.exports = [
{
    input: './src/index.tsx',
    output: [
        {
            file: `${baseUrl}/cjs/index.js`,
            format: 'cjs',
            // dir: `${baseUrl}/cjs`,
            globals
            // sourcemap: true
        },
        {
            file: `${baseUrl}/umd/index.js`,
            format: 'umd',
            // dir: `${baseUrl}/umd`,
            name: 'index',
            globals
        },
        {
            file: `${baseUrl}/es/index.js`,
            format: 'es',
            // preserveModules: true,
            globals
            // sourcemap: true
        },
    ],
    plugins: [
        clear({
            targets: [baseUrl],
        }),
        typescript(),
        getBabelOutputPlugin({
            allowAllFormats: true
        }),
        babel({
            babelHelpers: 'runtime',
            exclude: '**/node_modules/**',
        }),
        nodeResolve(),
        commonjs(),
        peerDepsExternal({
            packageJsonPath: './package.json',
            includeDependencies: true,
        }),
        alias({
            entries: [{ find: '@', replacement: './src' }],
        }),
        json(),
        terser(),
        postcss({
            plugins: [autoprefixer(), cssnano(),postcssurl({
                url: 'inline',
                maxSize: 10 * 1024 * 1024,
                fallback: {url: 'copy', assetsPath: 'img', useHash: true}
            })],
            modules: true,
            minimize: true,
            extract: 'css/index.css',
            // assetFileNames: ({ name }) => {
            //     console.log(`==========================${name}============================================`)
            //     const { ext, dir, base } = path.parse(name);
            //     if (ext !== '.css') return '[name].[ext]';
            //     return path.join(dir, 'style', base);
            // }
        }),
        html({ template: () => htmlTemplate }),
        beep(),
        strip(),
        url({   
            // 当小于10k,转base64
            limit: 10 * 1024,
        }),
        inject({
            "_": [lodash]
        }),
        // isDevelopment && serve(),
        // isDevelopment && livereload(),
    ],
    external: ['react', 'react-dom']
}];
