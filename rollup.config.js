import commonjs from '@rollup/plugin-commonjs'
import peerDepsExternal from 'rollup-plugin-peer-deps-external'
import alias from '@rollup/plugin-alias'
import { babel, getBabelOutputPlugin } from '@rollup/plugin-babel'
import terser from '@rollup/plugin-terser'
import postcss from 'rollup-plugin-postcss'
// import autoprefixer from 'autoprefixer'
import cssnano from 'cssnano'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import html from '@rollup/plugin-html'
import beep from '@rollup/plugin-beep'
import serve from 'rollup-plugin-serve'
import livereload from 'rollup-plugin-livereload'
import inject from '@rollup/plugin-inject'
import strip from '@rollup/plugin-strip'
import url from '@rollup/plugin-url'
import typescript from '@rollup/plugin-typescript'
import json from '@rollup/plugin-json'
import path from 'path'
import clear from 'rollup-plugin-clear'
import lodash from 'lodash'
import postcssurl from 'postcss-url'
import fs from 'fs-extra'
import eslint from '@rollup/plugin-eslint'
import postcssPresetEnv from 'postcss-preset-env'
import replace from '@rollup/plugin-replace'

const isDevelopment = process.env.NODE_ENV !== 'production'
const htmlTemplate = `
    <!DOCTYPE html>
    <html>
        <head>
        <meta charset="utf-8">
        <title>demo</title>
        <link rel="stylesheet" href="./index.css">
        ${
          isDevelopment &&
          '<script async src="http://localhost:35729/livereload.js?snipver=1"></script>'
        }
        <script defer="defer" src="https://gw.alipayobjects.com/os/lib/react/18.2.0/umd/react.production.min.js"></script>
        <script defer="defer" src="https://gw.alipayobjects.com/os/lib/react-dom/18.2.0/umd/react-dom.production.min.js"></script>
        </head>
        <body>
            <div id='root'></div>
        </body>
        <script defer="defer" src='./index.js'></script>
    </html>`

const baseUrl = 'dist'
const globals = {
  react: 'react',
  'react-dom': 'react-dom'
}
const imgLimit = 50

const output = {
  umd: {
    file: `${baseUrl}/umd/index.js`,
    format: 'umd',
    // dir: `${baseUrl}/umd`,
    name: 'index'
    // globals
  },
  cjs: {
    // file: `${baseUrl}/cjs/index.js`,
    format: 'cjs',
    dir: `dist/cjs`,
    globals
    // sourcemap: true
  },
  es: {
    // file: `${baseUrl}/es/index.js`,
    dir: `dist/es`,
    format: 'es',
    // preserveModules: true,
    globals
    // sourcemap: true
  }
}

// type umd、cjs、es
const getPostcss = (type = 'umd') => {
  // 处理css
  return postcss({
    plugins: [
      postcssPresetEnv({
        autoprefixer: { grid: true }
      }),
      // autoprefixer(),
      cssnano(),
      // postcss 处理样式内图片
      postcssurl([
        {
          url: 'inline',
          maxSize: imgLimit, // 当小于10k的图片转base64
          useHash: true,
          fallback: (asset, dir, options, decl, warn, result) => {
            const p = path.join(
              path.resolve('dist'),
              path
                .relative(__dirname, asset.absolutePath)
                .replace('src/', `${type}/`)
            )
            fs.copy(asset.absolutePath, p, (err) => {
              if (err) return console.error(err)
              console.log('success!')
            })
            return `./${path.relative(`${__dirname}/dist/${type}/`, p)}`
          }
        }
      ])
    ],
    modules: true,
    minimize: true,
    extract: true, //'css/index.css',
    exec: true,
    to: 'copy'
  })
}

const getTs = (type = 'umd') => {
  if (type === 'umd') {
    // typescript
    return typescript({
      declaration: false, // 指定编译生成的类型声明文件输出的目录。不提供的话，默认和生成的 js 文件放在一起
      outDir: 'dist/es'
    })
  } else if (type === 'es') {
    // typescript
    return typescript({
      declaration: true, // 指定编译生成的类型声明文件输出的目录。不提供的话，默认和生成的 js 文件放在一起
      outDir: 'dist/es'
    })
  } else if (type === 'cjs') {
    // typescript
    return typescript({
      declaration: false, // 指定编译生成的类型声明文件输出的目录。不提供的话，默认和生成的 js 文件放在一起
      outDir: 'dist/cjs'
    })
  }
}
const plugins = [
  // 清除文件夹
  clear({
    targets: [baseUrl]
  }),
  // typescript
  // typescript(),
  // 获取babel的plugins
  getBabelOutputPlugin({
    allowAllFormats: true
  }),
  // 配置babel
  babel({
    babelHelpers: 'runtime',
    exclude: '**/node_modules/**'
  }),
  // 加载node
  nodeResolve({
    mainFields: ['module', 'main'],
    extensions: ['.jsx', '.js', '.mjs', '.less', '.ts', '.tsx']
  }),
  // cjs转es
  commonjs({
    ignoreGlobal: true,
    include: /\/node_modules\//,
    // exclude: /\/node_modules\//
    external: ['react', 'react-dom']
  }),
  // peerdepences 转 引用
  peerDepsExternal({
    packageJsonPath: './package.json',
    includeDependencies: true
  }),
  // alias 简写
  alias({
    entries: [{ find: '@', replacement: './src' }]
  }),
  // 读取json
  json(),
  // 代码压缩
  terser()
]

const plugins1 = [
  // 设置html
  html({ template: () => htmlTemplate }),
  // 编译错误时发出警告
  beep(),
  // 删除页面console debugger
  strip({
    debugger: true,
    functions: ['console.*', 'assert.*'],
    include: ['src/**'],
    exclude: ['node_modules/**']
  }),
  // 处理页面img
  url({
    // 当小于10k,转base64
    limit: 10 * 1024,
    // publicPath: '../img/',
    // destDir: path.join(__dirname, 'dist/umd'),
    fileName: '[dirname][hash][extname]'
  }),
  // eslint
  isDevelopment
    ? eslint({
        throwOnError: true,
        throwOnWarning: true,
        include: ['src/**'],
        exclude: ['node_modules/**']
      })
    : '',
  // 全局注入
  inject({
    _: [lodash]
  }),
  // 变量替换
  replace({
    'process.env.NODE_ENV': JSON.stringify(
      process.env.NODE_ENV || 'development'
    ),
    preventAssignment: true
  })
]

module.exports = isDevelopment
  ? [
      {
        input: './src/render.tsx',
        output: [output.umd],
        plugins: [
          getTs('umd'),
          ...plugins,
          getPostcss('umd'),
          ...plugins1,
          serve({
            open: true, // 是否打开浏览器
            contentBase: 'dist/umd/', // 入口html的文件位置
            historyApiFallback: true, // Set to true to return index.html instead of 404
            host: 'localhost',
            port: 10001
          }),
          livereload({
            watch: ['./dist', './src']
          })
        ],
        external: [(id) => id.includes('@babel/runtime')]
      }
    ]
  : [
      {
        input: './src/index.tsx',
        output: [output.cjs],
        plugins: [getTs('cjs'), ...plugins, getPostcss('cjs'), ...plugins1],
        external: ['react', 'react-dom', (id) => id.includes('@babel/runtime')]
      },
      {
        input: {
          main: './src/index.tsx',
          'components/Button/button': './src/components/Button/index.tsx',
          'components/Input/input': './src/components/Input/index.tsx'
        },
        output: [output.es],
        plugins: [getTs('es'), ...plugins, getPostcss('es'), ...plugins1],
        external: ['react', 'react-dom', (id) => id.includes('@babel/runtime')]
      },
      {
        input: './src/index.tsx',
        output: [output.umd],
        plugins: [getTs('umd'), ...plugins, getPostcss('umd'), ...plugins1],
        external: ['react', 'react-dom', (id) => id.includes('@babel/runtime')]
      }
    ]
