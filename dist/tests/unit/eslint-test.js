'use strict';

var eslint = require('mocha-eslint');
eslint = 'default' in eslint ? eslint['default'] : eslint;

eslint(['lib', 'tests']);