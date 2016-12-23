'use strict';

var babel = require('rollup-plugin-babel');
var typescript = require('rollup-plugin-typescript');
var rollup = require( 'rollup' );
var glob = require('glob');
function rethrow(reason) {
  setTimeout(function() {
    throw reason;
  }, 0);
}
rollup.rollup({
  entry: 'lib/index',
  format: 'umd',
  moduleName: 'ara',
  plugins: [
    babel(),
    typescript()
  ],
}).then(function(bundle) {
  return bundle.write({
    format: 'cjs',
    dest: 'dist/ara.js',
  });
}).catch(rethrow);

rollup.rollup({
  entry: 'lib/runner/index',
  format: 'umd',
  plugins: [
    babel(),
    typescript()
  ],
}).then(function(bundle) {
  return bundle.write({
    format: 'cjs',
    dest: 'dist/runner.js',
  });
}).catch(rethrow);

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
  }).catch(rethrow);
});
