import {Assert} from "//es.parts/ess/0.0.1/";

import * as MDParser from "../src/MDParser.mjs";
import * as MDHtmlRenderer from "../src/MDHtmlRenderer.mjs";

export {testBlockqoute}
export {testCode}
export {testCodeBlock}
export {testDelete};
export {testEmphasis};
export {testHeading};
export {testImage};
export {testLink};
export {testList};
export {testParagraph};
export {testStrong};
export {testThematicBreak};

function testBlockqoute() {
    test("> a\n> b", "<blockquote><p>a\nb</p></blockquote>")
}

function testCode() {
    test("`a`", "<p><code>a</code></p>")
}

function testCodeBlock() {
    test("```javascript\na\n```", "<pre><code class=\"langauge-javascript\">a\n</code></pre>")
}

function testDelete() {
    test("~~a~~", "<p><del>a</del></p>");
}

function testEmphasis() {
    test("*a*", "<p><em>a</em></p>");
}

function testHeading() {
    test("# 1", "<h1>1</h1>");
    test("## 2", "<h2>2</h2>");
    test("### 3", "<h3>3</h3>");
    test("#### 4", "<h4>4</h4>");
    test("##### 5", "<h5>5</h5>");
    test("###### 6", "<h6>6</h6>");
    test("####### 7", "<p>####### 7</p>");
}

function testImage() {
    test("![img](/favicon.ico \"title\")", "<p><img href=\"/favicon.ico\" alt=\"img\" title=\"title\" /></p>");
}

function testLink() {
    test("[text](/dest.html \"title\")", "<p><a href=\"/dest.html\" title=\"title\">text</a></p>");
}

function testList() {
    test("- a", "<ul><li>a</li></ul>");
    test("- a\n\n- b", "<ul><li><p>a</p></li><li><p>b</p></li></ul>");
}

function testParagraph() {
    test("a", "<p>a</p>");
    test(" a", "<p>a</p>");
    test("a ", "<p>a </p>");
    test("a b", "<p>a b</p>");
    test("a\nb", "<p>a\nb</p>");
}

function testStrong() {
    test("**a**", "<p><strong>a</strong></p>");
}

function testThematicBreak() {
    test("---", "<hr />");
    test("___", "<hr />");
    test("***", "<hr />");
}

// Internals

function test(input, output) {
    const ast = MDParser.parse(input);
    Assert.equal(output, MDHtmlRenderer.render(ast));
}
