#!/usr/bin/env node
const path = require('path');
const chalk = require('chalk');
const readline = require('readline-sync');
require('shelljs/global');

const version = require('./package.json').version;
const argvs = Array.from(process.argv.slice(2));

// utils
const _ = {
  kebabCase(name) {
    name = name.replace(/^[A-Z]/, m => m.toLowerCase());
    name = name.replace(/([0-9a-zA-Z])[\b\s]*([0-9A-Z])/g, (m, g1, g2) => {
      return `${g1}-${g2.toLowerCase()}`
    });
    return name;
  },
  pascalCase(name) {
    name = this.kebabCase(name);
    name = name.replace(/-([0-9a-zA-Z])/g, (m, g1) => g1.toUpperCase());
    name = name.replace(/^[a-z]/, m => m.toUpperCase());
    return name;
  }
};

// check conditions
const cmd = argvs => {
  let [name, ...rest] = argvs;

  switch(name) {
    case 'init':
      init(rest);
      break;

    case '--version':
    case '-version':
    case '-v':
      console.log(chalk.green(version));
      break;
    
    default:
      console.log(`
A vue@2 standalone component generator, with Rollup, PostCSS and CSS Modules.

Usage: vgen <command>
vgen init <component name>
vgen --version
`);
  }
};

const init = (args) => {
  let projName = args[0] || readline.question(chalk.green('Please enter project name: \n'));
  
  while (!projName) {
    projName = readline.question(chalk.green('Please enter project name: \n'));
  }

  let name = _.kebabCase(projName);
  let moduleName = _.pascalCase(name);
  let version  = readline.question(chalk.green('Please enter version: (1.0.0)\n')) || '1.0.0';
  let description = readline.question(chalk.green('Please enter description: \n')) || projName;
  let author = readline.question(chalk.green('Please enter author: \n')) || '';

  let config = {
    name,
    moduleName,
    version,
    description,
    author
  };
  
  let cwd = process.cwd();
  let dirExists = ls(cwd).filter(d => d === name).length;
  let dir = path.join(cwd, dirExists ? `${name}-1` : name);

  mkdir(dir);
  cp('-R', `${__dirname}/template/*`, dir);

  ls('-Rl', dir)
    .filter(stats => stats.isFile())
    .map(f => f.name)
    .forEach(f => {
      let file = path.join(dir, f);
      sed('-i', /<%name%>/g, name, file);
      sed('-i', /<%moduleName%>/g, moduleName, file);
      sed('-i', /<%version%>/g, version, file);
      sed('-i', /<%description%>/g, description, file);
      sed('-i', /<%author%>/g, author, file);

      let file2 = file.replace(/\{\{#%(.+)\}\}/g, (m, g1) => config[g1] || m);
      mv(file, file2);
    });
};

cmd(argvs);
