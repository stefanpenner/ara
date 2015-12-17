'use strict';

var babel = require('rollup-plugin-babel');
var rollup = require( 'rollup' );
var glob = require('glob');

rollup.rollup({
  entry: 'lib/index',
  format: 'umd',
  moduleName: 'para',
  plugins: [ babel() ],
  sourcemap: true
}).then(function(bundle) {
  return bundle.write({
    format: 'cjs',
    dest: 'dist/para.js',
  });
}).catch(console.error.bind(console));

rollup.rollup({
  entry: 'lib/runner/index',
  format: 'umd',
  plugins: [ babel() ],
  sourcemap: true
}).then(function(bundle) {
  return bundle.write({
    format: 'cjs',
    dest: 'dist/runner.js',
  });
}).catch(console.error.bind(console));

glob.sync('tests/**/*.js').forEach(function(testFile) {
  rollup.rollup({
    entry: testFile,
    format: 'cjs',
  plugins: [ babel() ],
  }).then(function( bundle ) {
    return bundle.write({
      format: 'cjs',
      dest: 'dist/' + testFile
    });
  }).catch(console.error.bind(console));
});
