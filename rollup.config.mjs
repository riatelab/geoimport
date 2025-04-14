import commonjs from '@rollup/plugin-commonjs';
import copy from 'rollup-plugin-copy';
import nodeResolve from '@rollup/plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import terser from '@rollup/plugin-terser';
import pkg from './package.json' with { type: 'json' };
import ts from 'typescript';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: pkg.module,
      format: 'esm',
      sourcemap: true,
    },
    {
      file: pkg.main,
      format: 'umd',
      sourcemap: true,
      name: 'geoimport',
    },
  ],
  plugins: [
    commonjs(),
    nodeResolve({
      browser: true,
      extensions: ['.js', '.ts', '.wasm', '.data'],
    }),
    typescript({ typescript: ts }),
    copy({
      targets: [
        { src: 'node_modules/gdal3.js/dist/package/gdal3WebAssembly.wasm', dest: 'dist/static' },
        { src: 'node_modules/gdal3.js/dist/package/gdal3WebAssembly.data', dest: 'dist/static' },
        { src: 'node_modules/gdal3.js/dist/package/gdal3.js', dest: 'dist/static' },
      ]
    }),
    terser(),
  ],
};
