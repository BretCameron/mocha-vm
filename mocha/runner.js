/** This file runs the tests in 'mocha-tests.js' */
const Mocha = require('mocha');
const test = new Mocha({ ui: 'bdd' });
const path = require('path');
const util = require('util');
const fs = require('fs');

const ensureFinalSemicolon = (str) => {
  return /;(\s*)?$/.test(str.trim()) ? str + ' ' : str + '; ';
};

const randomString = (length = 32, chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ') => {
  let result = '';
  for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
};

async function runTests(string, options) {

  let imports = `const { describe, context, it, specify, before, after, beforeEach, afterEach } = require('mocha'); `;

  if (options) {
    const library = options.library ? options.library : options;
    switch (library) {
      case 'chai':
        imports = imports + `const { should, expect, assert } = require('chai'); `;
        break;
      case 'assert':
        imports = imports + `const assert = require('assert'); `; break;
      default:
        throw `The library '${library}' is not available. Please use 'chai' or 'assert'.`
        break;
    }
  } else {
    imports = imports + `const { should, expect, assert } = require('chai'); `;
  }

  if (Array.isArray(string)) string = string.join('; \n');

  string = imports + ensureFinalSemicolon(string);

  // Check whether string is a file name
  const directoryExists = fs.existsSync('temp');
  const fileExists = fs.existsSync(string);
  let fileName;

  // If not, create a file from the string
  if (fileExists) {
    // fileName = string;
    console.err('Please provide a string containing your test code.')
  } else {
    fileName = randomString() + '.js';
    if (!directoryExists) fs.mkdirSync(path.join(__dirname, 'temp'));
    fs.writeFileSync(path.join(__dirname, 'temp', fileName), string);
  };

  test.addFile(path.join(__dirname, 'temp', fileName));

  const runner = test.run();

  let suiteStart, suiteEnd, runnerStart, runnerEnd;
  let data = [], summary = {};
  const set = new Set();
  let obj = {}, currentSuite = '';
  let passCount = 0, failCount = 0, nestedLevels = 0, suiteCount = 0, testCount = 0;


  return new Promise((resolve, reject) => {

    runner.on('suite', (e) => {
      if (!runnerStart) runnerStart = Date.now();
      suiteCount += 1;
      suiteStart = Date.now();

      if (obj.suite) {
        data.push(obj);
        obj = {};
      };

      const { title, parent } = e;
      if (parent.title !== '') obj.parent_suite = parent.title;

      let parentName = parent.title;
      let nextParent = e.parent, nextTitle, count = 0;

      // Set count based on number of parents
      while (nextTitle !== '') {
        try {
          nextParent = nextParent.parent;
          nextTitle = nextParent.title;
          count++;
        } catch {
          break;
        }
      }

      // Set current suite based on title
      currentSuite = title;

      // Styling aid, suggesting how much to indent by
      obj.depth = count;
      if (count > nestedLevels) nestedLevels = count;
      if (title) obj.suite = title;
      // if (parent.title) obj.parent = parent.title;

    });

    runner.on('test end', (e) => {
      // console.clear();
      const { title, state } = e;

      // If there are any tests, push their title and state ('passed' or 'failed')
      if (title && state) {
        if (!obj.tests) obj.tests = [];
        obj.tests.push({
          description: title,
          passed: state === 'passed',
        });
        state === 'passed' ? passCount += 1 : failCount += 1;
      };
    });

    runner.on('suite end', (e) => {
      suiteEnd = Date.now();
      obj.duration = suiteEnd - suiteStart + 'ms';
    });

    runner.on('end', (e) => {
      if (obj.suite) {
        data.push(obj);
        obj = {};
      };

      summary.passed = passCount;
      summary.failed = failCount;
      summary.tests = passCount + failCount;
      summary.suites = suiteCount;
      summary.depth = nestedLevels;
      runnerEnd = Date.now();
      summary.duration = runnerEnd - runnerStart + 'ms';

      if (!fileExists) {
        fs.unlinkSync(path.join(__dirname, 'temp', fileName), string);
      };

      resolve({ summary, data });
    });
  });
};

module.exports = runTests;
