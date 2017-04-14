#!/usr/bin/env node
var path = require('path');
var Enquirer = require('enquirer');
var enquirer = new Enquirer();

require('shelljs/global');

var version = require('./package.json').version;
var argvs = [].slice.call(process.argv.slice(2));

// utils
var _ = {
  kebabCase: function (name) {
    name = name.replace(/^[A-Z]/, function (match) {
      return match.toLowerCase();
    });
    name = name.replace(/([0-9a-zA-Z])[\b\s]*([0-9A-Z])/g, function (m, g1, g2) {
      return `${g1}-${g2.toLowerCase()}`
    });
    return name;
  },
  pascalCase: function (name) {
    name = this.kebabCase(name);
    name = name.replace(/-([0-9a-zA-Z])/g, function (m, g1) {
      return g1.toUpperCase();
    });
    name = name.replace(/^[a-z]/, function (match) {
      return match.toUpperCase()
    });
    return name;
  }
};

// check conditions
var cmd = function (argvs) {
  var name = argvs[0];

  switch(name) {
    case '--version':
    case '-version':
    case '-v':
      console.log(version);
      break;
    
    case '--help':
    case '-help':
    case 'help':
    case '--h':
    case '-h':
      console.log('\A vue@2 standalone component generator, with Rollup, PostCSS and CSS Modules.\n\
Usage: vgen <command>\n\
vgen <component name>\n\
vgen --version\n\
vgen --help\n\
');
      break;

    default:
      ask(argvs);
      break;
  }
};

var copy = function (config) {
  var cwd = process.cwd();

  var dirExists = ls(cwd).filter(function (d) {
    return d === config.name;
  }).length;
  
  var dirName = config.name + (dirExists ? '-1' : '');
  var dir = path.join(cwd, dirName);

  mkdir(dir);
  cp('-R', __dirname + '/template/*', dir);

  ls('-Rl', dir).filter(function (stats) {
    return stats.isFile();
  }).map(function (file) {
    return file.name;
  }).forEach(f => {
    var file = path.join(dir, f);
  
    sed('-i', /<%name%>/g,        config.name,        file);
    sed('-i', /<%moduleName%>/g,  config.moduleName,  file);
    sed('-i', /<%compile%>/g,     config.compile,     file);
    sed('-i', /<%version%>/g,     config.version,     file);
    sed('-i', /<%description%>/g, config.description, file);
    sed('-i', /<%author%>/g,      config.author,      file);

    var file2 = file.replace(/\{\{#(.+)\}\}/g, function (match, g1) {
      return config[g1] || match;
    });
    mv(file, file2);
  });

  console.log('\nDone. Please check ./' + dirName);
};

var ask = function (args) {
  enquirer.question('name', 'Please enter project name: ');
  enquirer.question('compile', 'Compile templates?(y/n) ');
  enquirer.question('version', 'Please enter version: ');
  enquirer.question('description', 'Please enter description: ');
  enquirer.question('author', 'Please enter author: ');

  var config = {};

  Promise.resolve().then(function () {
    return args[0] ? { name: args[0] } : enquirer.prompt('name');
  }).then(function (answer) {
    var projName = answer.name;
    config.name = _.kebabCase(projName.trim());
    config.moduleName = _.pascalCase(config.name);
    return enquirer.prompt('compile');
  }).then(function (answer) {
    if (answer.compile.toLowerCase() === 'n') {
      config.compile = 'false';
    } else {
      config.compile = 'true';
    }
    return enquirer.prompt('version');
  }).then(function (answer) {
    config.version = answer.version.trim() || '1.0.0';
    return enquirer.prompt('description');
  }).then(function (answer) {
    config.description = (answer.description || config.name).trim();
    return enquirer.prompt('author');
  }).then(function (answer) {
    config.author = answer.author.trim();
  }).then(function () {
    copy(config);
  });
};

cmd(argvs);

