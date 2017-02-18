#!/usr/bin/env node
'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _toArray2 = require('babel-runtime/helpers/toArray');

var _toArray3 = _interopRequireDefault(_toArray2);

var _from = require('babel-runtime/core-js/array/from');

var _from2 = _interopRequireDefault(_from);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var path = require('path');
var chalk = require('chalk');
var Enquirer = require('enquirer');
var enquirer = new Enquirer();

require('shelljs/global');

var version = require('./package.json').version;
var argvs = (0, _from2.default)(process.argv.slice(2));

// utils
var _ = {
  kebabCase: function kebabCase(name) {
    name = name.replace(/^[A-Z]/, function (m) {
      return m.toLowerCase();
    });
    name = name.replace(/([0-9a-zA-Z])[\b\s]*([0-9A-Z])/g, function (m, g1, g2) {
      return g1 + '-' + g2.toLowerCase();
    });
    return name;
  },
  pascalCase: function pascalCase(name) {
    name = this.kebabCase(name);
    name = name.replace(/-([0-9a-zA-Z])/g, function (m, g1) {
      return g1.toUpperCase();
    });
    name = name.replace(/^[a-z]/, function (m) {
      return m.toUpperCase();
    });
    return name;
  }
};

// check conditions
var cmd = function cmd(argvs) {
  var _argvs = (0, _toArray3.default)(argvs),
      name = _argvs[0],
      rest = _argvs.slice(1);

  switch (name) {
    case 'init':
      init(rest);
      break;

    case '--version':
    case '-version':
    case '-v':
      console.log(chalk.green(version));
      break;

    default:
      console.log('\nA vue@2 standalone component generator, with Rollup, PostCSS and CSS Modules.\n\nUsage: vgen <command>\nvgen init <component name>\nvgen --version\n');
  }
};

var init = function () {
  var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(args) {
    var projName, answer, name, moduleName, _ref2, version, _ref3, description, _ref4, author, config, cwd, dirExists, dir;

    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            enquirer.question('name', 'Please enter project name: ');
            enquirer.question('version', 'Please enter version: ');
            enquirer.question('description', 'Please enter description: ');
            enquirer.question('author', 'Please enter author: ');

            projName = args[0];

            if (projName) {
              _context.next = 10;
              break;
            }

            _context.next = 8;
            return enquirer.prompt('name');

          case 8:
            answer = _context.sent;

            projName = answer.name;

          case 10:
            name = _.kebabCase(projName);
            moduleName = _.pascalCase(name);
            _context.next = 14;
            return enquirer.prompt('version');

          case 14:
            _ref2 = _context.sent;
            version = _ref2.version;
            _context.next = 18;
            return enquirer.prompt('description');

          case 18:
            _ref3 = _context.sent;
            description = _ref3.description;
            _context.next = 22;
            return enquirer.prompt('author');

          case 22:
            _ref4 = _context.sent;
            author = _ref4.author;

            version = version || '1.0.0';
            description = description || projName;
            author = author || '';

            config = {
              name: name,
              moduleName: moduleName,
              version: version,
              description: description,
              author: author
            };

            console.log(config);
            cwd = process.cwd();
            dirExists = ls(cwd).filter(function (d) {
              return d === name;
            }).length;
            dir = path.join(cwd, dirExists ? name + '-1' : name);


            mkdir(dir);
            cp('-R', __dirname + '/template/*', dir);

            ls('-Rl', dir).filter(function (stats) {
              return stats.isFile();
            }).map(function (f) {
              return f.name;
            }).forEach(function (f) {
              var file = path.join(dir, f);
              sed('-i', /<%name%>/g, name, file);
              sed('-i', /<%moduleName%>/g, moduleName, file);
              sed('-i', /<%version%>/g, version, file);
              sed('-i', /<%description%>/g, description, file);
              sed('-i', /<%author%>/g, author, file);

              var file2 = file.replace(/\{\{#(.+)\}\}/g, function (m, g1) {
                return config[g1] || m;
              });
              mv(file, file2);
            });

          case 35:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function init(_x) {
    return _ref.apply(this, arguments);
  };
}();

cmd(argvs);
