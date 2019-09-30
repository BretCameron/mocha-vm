# mocha-vm

![npm](https://img.shields.io/npm/v/mocha-vm)
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/BretCameron/mocha-vm)
![NPM](https://img.shields.io/npm/l/mocha-vm)

#### Run [Mocha](https://www.npmjs.com/package/mocha) tests inside a [vm2](https://www.npmjs.com/package/vm2) sandbox environment and get the results as a JavaScript object.

This package makes it easy to use Mocha inside Node.js, allowing you to run untrusted Mocha code with [Chai](https://www.npmjs.com/package/chai) – securely!

## Installation

**IMPORTANT:** _Requires Node.js 6 or newer._

Using npm:

```bash
npm i mocha-vm
```

Using yarn:

```bash
yarn add mocha-vm
```

In Node.js:

```javascript
const run = require('mocha-vm').run;
const toHTML = require('mocha-vm').toHTML;

// Or using ES6+ destructuring assignment syntax
const { run, toHTML } = require('mocha-vm');
```

## Quick Example

```javascript
const { run } = require('mocha-vm');

const code = `
describe('addOne', function () {
  it('should return 3 when the value is 2', function () {
    assert.equal(addOne(2), 3);
  });
  it('should return 0 when the value is -1', function () {
    assert.equal(addOne(-1), 0);
  });
  it('return a number', function () {
    assert.isNumber(addOne(-1));
  });
});

function addOne(x) {
  return x + 1;
};`;

run(code).then(obj => console.log(obj));
```

## run(code[, options])

- `code` _String_ | _Array_
- `options` _String_ | _Object_
  - `library` _String_ | _Object_ (**Default**: `'chai'`)

The `code` argument can be a `String` (containing a code snippet or a file path) or an `Array`.

The `options` argument allows you to use Node.js's built-in [`'assert'` library](https://www.npmjs.com/package/assert), rather than `'chai'` (the default). To do this, use:

```javascript
run(code, { library: 'assert' });
```

Or simply:

```javascript
run(code, 'assert');
```

## toHTML(result)

- `result` _Object_

The `toHTML` function is a utility, allowing you to tranform the result of `run` into an HTML string, which can easily be displayed on the client-side. 

```javascript
run(code).then(result => {
    let html = toHTML(result);
    return html;
});
```

If using vanilla JavaScript, you can insert the HTML code like follows:

```javascript
let node = document.createElement("section");
node.className = "mocha-result";
node.innerHTML = html;

document.querySelector("body").appendChild(node);
```

If using React, you can safely pass it into the `dangerouslySetInnerHTML` property:

```jsx
<section className="mocha-result" dangerouslySetInnerHTML={{ __html: html }} />
```

## Available Mocha and Chai Methods

By default, the code inside the string(s) can make use of:

- Chai's `assert`, `expect` and/or `should` libraries.
- Mocha's BDD methods, including `describe`, `context`, `it`, `specify`, `before`, `after`, `beforeEach` and `afterEach`.

To find out more about using these methods, visit the [Mocha](https://mochajs.org/) and [Chai](https://www.chaijs.com/) websites.

**IMPORTANT:** _The methods and libraries above are imported in advance. Your code will not run if you try to re-import them._

## Passing a File Path

To pass a file path, it's recommended to use Node.js's built-in `'path'` module, as below:

```javascript
const { run } = require('mocha-vm');
const { join } = require('path');

run(join(__dirname, 'tests.js')).then(obj => console.log(obj));
```

## Passing an Array

You can pass an `Array` containing:

- only code snippets,
- only file paths,
- a mixture of the two.

For example:

```javascript
const { run } = require('mocha-vm');
const { join } = require('path');

const test = `
describe('addOne', function () {
  it('should return 3 when the value is 2', function () {
    assert.equal(addOne(2), 3);
  });
});`;

const functionToTest = `
function addOne(x) {
  return x + 1;
};`;

run([test, functionToTest, join(__dirname, 'tests.js')]).then(obj =>
  console.log(obj)
);
```

## Result

Aside from just running the tests, the `run` function returns a `Promise` containing the results of the tests. Using the tests from the **Quick Example** (above), we would get an object like this:

```json
{
  "summary": {
    "passed": 3,
    "failed": 0,
    "tests": 3,
    "suites": 1,
    "depth": 0,
    "duration": "32ms"
  },
  "data": [
    {
      "depth": 0,
      "suite": "addOne",
      "tests": [
        {
          "description": "should return 3 when the value is 2",
          "passed": true
        },
        {
          "description": "should return 0 when the value is -1",
          "passed": true
        },
        { "description": "should return a number", "passed": true }
      ],
      "duration": "18ms"
    }
  ]
}
```

If we were to use the `toHTML` function and pass the object above as an argument, we would get the following HTML string:

```html
<div class="mocha-item">
  <p class="mocha-suite">addOne</p>
  <p class="mocha-test passed">&nbsp;&nbsp;✓ should return 3 when the value is 2</p>
  <p class="mocha-test passed">&nbsp;&nbsp;✓ should return 0 when the value is -1</p>
  <p class="mocha-test passed">&nbsp;&nbsp;✓ should return a number</p>
</div>
<br>
<div class="mocha-summary">
  <p class="mocha-passing">3 passing <span class="mocha-duration">(32ms)</span></p>
  <p class="mocha-failing">0 failing</p>
</div>
```

## Dependencies

This package depends on [Mocha](https://www.npmjs.com/package/mocha) and [Chai](https://www.npmjs.com/package/chai) for testing, and [vm2](https://www.npmjs.com/package/vm2) for sandboxing.

## Author

- [Bret Cameron](mailto:bretcameron@gmail.com)

## License

This project is licensed under the MIT License.
