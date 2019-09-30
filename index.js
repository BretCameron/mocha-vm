const fs = require('fs');
const path = require('path');
const vm = require('./mocha/vm');
const toHTML = require('./mocha/toHTML');

/**
 * Run Mocha tests in a sandboxed environment.
 *
 * @async
 * @function run
 * @param {string|string[]} code - The a string or array of strings containing code snippets or a file path.
 * @param {string|{library: string}} [options="chai"] - The testing library to use.
 * @return {Promise<object>} An object containing the results of the test.
 */
async function run(code, options) {
  if (Array.isArray(code)) {
    code = code.map(file => {
      try {
        return fs.readFileSync(file, 'utf8')
      } catch {
        return file;
      }
    })
      .join('; ');
  } else {
    try {
      code = fs.readFileSync(code, 'utf8');
    } catch {
      if (Array.isArray(code)) {
        code = code.join('; ');
      }
    }
  };

  const runner = fs.readFileSync(path.join(__dirname, 'mocha', 'runner.js'), 'utf8');
  const runMocha = vm(options).run(runner, 'vm.js');
  return new Promise((resolve, reject) => {
    runMocha(code, options).then(data => resolve(data));
  });
};

module.exports = { run, toHTML };
