/**
 * Converts a mocha-vm test result to an HTML string.
 *
 * @function toHTML
 * @param {{data: Object, summary: Object}} obj - The object returned when calling the run function.
 *  @return {string} An HTML string representing the results of the mocha-vm run function.
 */
function toHTML(obj) {
  if (typeof obj !== "object" || !obj.data || !obj.summary) {
    throw "The argument passed to toHTML() must be a valid result of mocha-vm's run() method.";
  }

  let html = obj.data.map(el => {
    const space = "&nbsp;";
    const itemStart = '<div class="mocha-item">',
      itemEnd = "</div>";
    const suiteStart = '<p class="mocha-suite">',
      suiteEnd = "</p>";
    const testPassed = '<p class="mocha-test passed">',
      testFailed = '<p class="mocha-test failed">',
      testEnd = "</p>";

    return (
      "\n" +
      itemStart +
      "\n\t" +
      suiteStart +
      space.repeat(el.depth * 2) +
      el.suite +
      suiteEnd +
      "\n" +
      el.tests.map(test => {
        return (
          "\t" +
          (test.passed ? testPassed : testFailed) +
          space.repeat((el.depth + 1) * 2) +
          (test.passed ? "✓ " : "✗ ") +
          test.description +
          testEnd +
          "\n"
        );
      }) +
      itemEnd
    );
  });

  html = html.join(",").replace(/,/g, "");

  html +=
    "\n" +
    "<br>\n" +
    '<div class="mocha-summary">\n' +
    '\t<p class="mocha-passing">' +
    obj.summary.passed +
    " passing " +
    '<span class="mocha-duration">(' +
    obj.summary.duration +
    ")</span></p>\n" +
    '\t<p class="mocha-failing">' +
    obj.summary.failed +
    " failing</p>\n" +
    "</div>";

  return html;
}

module.exports = toHTML;
