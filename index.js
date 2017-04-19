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
    var dotfiles = ['editorconfig', 'gitignore', 'npmignore', 'eslintrc', 'eslintignore'];
    if (dotfiles.indexOf(f) > -1) {
      return mv(file, path.join(dir, '.' + f));
    }

    sed('-i', /<%name%>/g,        config.name,        file);
    sed('-i', /<%moduleName%>/g,  config.moduleName,  file);
    sed('-i', /<%compile%>/g,     config.compile,     file);
    sed('-i', /<%version%>/g,     config.version,     file);
    sed('-i', /<%description%>/g, config.description, file);
    sed('-i', /<%author%>/g,      config.author,      file);
    sed('-i', /<%githubUser%>/g,  config.githubUser,  file);
    sed('-i', /<%keywords%>/g,    config.keywords,    file);

    var file2 = file.replace(/\{\{#(.+)\}\}/g, function (match, g1) {
      return config[g1] || match;
    });
    mv(file, file2);
  });

  return dirName;
};

var installAndCommit = function (config) {
  cd(config.dirName);

  // because we used husky
  // we've to initialize repo before
  // running `npm install`
  console.log('Initializing git repo...');
  exec('git init');

  console.log('Start installing dependencies...');
  if (which('yarn')) {
    exec('yarn install');
  } else {
    exec('npm install');
  }

  console.log('Npm run build...');
  exec('npm run build:dev');
  exec('npm run build');

  console.log('Commit files...');
  exec('git add -A');
  exec('git commit -m "initializing repo"');
  exec('git add -A');
  exec(`git remote add origin git@github.com:${config.githubUser}/${config.name}.git`);
  exec(`git push -u origin master`);
};

var ask = function (args) {
  enquirer.question('name', 'Please enter project name: ');
  enquirer.question('compile', 'Compile templates?(y/n) ');
  enquirer.question('version', 'Please enter version: ');
  enquirer.question('description', 'Please enter description: ');
  enquirer.question('keywords', 'Please enter keywords: ');
  enquirer.question('author', 'Please enter author: ');
  enquirer.question('githubUser', 'Your github account name: ');
  enquirer.question('init', 'Install and init git?(y/n) ');

  var config = {};

  Promise.resolve().then(function () {
    return args[0] ? { name: args[0] } : enquirer.prompt('name');
  })
  .then(function (answer) {
    var projName = answer.name;
    config.name = _.kebabCase(projName.trim());
    config.moduleName = _.pascalCase(config.name);
    return enquirer.prompt('compile');
  })
  .then(function (answer) {
    if (answer.compile.toLowerCase() === 'n') {
      config.compile = 'false';
    } else {
      config.compile = 'true';
    }
    return enquirer.prompt('version');
  })
  .then(function (answer) {
    config.version = answer.version.trim() || '1.0.0';
    return enquirer.prompt('keywords');
  })
  .then(function (answer) {
    var keywords = answer.keywords
      .replace(/\s+/g, ',')
      .split(',')
      .map(i => JSON.stringify(i))
      .join(', ');
    config.keywords = keywords;
    return enquirer.prompt('description');
  })
  .then(function (answer) {
    config.description = (answer.description || config.name).trim();
    return enquirer.prompt('author');
  })
  .then(function (answer) {
    config.author = answer.author.trim();
    return enquirer.prompt('githubUser');
  })
  .then(function (answer) {
    config.githubUser = answer.githubUser.trim() || 'unknown';
    config.dirName = copy(config);
    return enquirer.prompt('init');
  })
  .then(function (answer) {
    if (answer.init !== 'n') {
      installAndCommit(config);
    }
    console.log('\nDone. Please check ./' + config.dirName);
  });
};

cmd(argvs);
