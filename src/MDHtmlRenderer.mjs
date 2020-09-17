import {Str} from "//es.parts/ess/0.0.1/";
import {List} from "//es.parts/ess/0.0.1/";

import * as MDNode from "./MDNode.mjs";
import * as MDParser from "./MDParser.mjs";

export {render};
export {parseAndRender};

class Buffer {
    constructor() {
        this.indent = "";
        this.indentLevel = 0;
        this.data = [];
        this.newline = "";
    }
}

function render(node, options={}) {
    const buffer = new Buffer;

    if (options.pretty) {
        buffer.indentLevel = options.indentLevel || 4;
        buffer.newline = "\n";
    }

    renderNode(buffer, node);

    return buffer.data.join("");
}

function parseAndRender(input, options) {
    return render(MDParser.parse(input, options), options);
}


// Internals

function renderNode(buffer, node) {
    switch (node.type) {

    case MDNode.BLOCKQUOTE:
        return renderBlockquote(buffer, node);

    case MDNode.CODE:
        return renderCode(buffer, node);

    case MDNode.CODE_BLOCK:
        return renderCodeBlock(buffer, node);

    case MDNode.DOCUMENT:
        return renderDocument(buffer, node);

    case MDNode.IMAGE:
        return renderImage(buffer, node);

    case MDNode.HEADING:
        return renderHeading(buffer, node);

    case MDNode.PARAGRAPH:
        return renderParagraph(buffer, node);

    case MDNode.DELETE:
        return renderDelete(buffer, node);

    case MDNode.EMPHASIS:
        return renderEmphasis(buffer, node);

    case MDNode.LINEBREAK:
        return renderLinebreak(buffer, node);

    case MDNode.LINK:
        return renderLink(buffer, node);

    case MDNode.LIST:
        return renderList(buffer, node);

    case MDNode.STRONG:
        return renderStrong(buffer, node);

    case MDNode.SOFTBREAK:
        return renderSoftbreak(buffer, node);

    case MDNode.TEXT:
        return renderText(buffer, node);

    case MDNode.THEMATIC_BREAK:
        return renderThematicBreak(buffer, node);

    }
}

function renderBlockquote(buffer, node) {
    write(buffer, `<blockquote>`);
    pushIndent(buffer);
    renderBody(buffer, node.body);
    popIndent(buffer);
    writeln(buffer, `</blockquote>`);
}

function renderCode(buffer, node) {
    write(buffer, "<code>");
    write(buffer, node.value);
    write(buffer, "</code>");
}

function renderCodeBlock(buffer, node) {
    if (node.lang) {
        write(buffer, `<pre><code class="langauge-${node.lang}">`);
    } else {
        write(buffer, `<pre><code>`);
    }
    write(buffer, node.value);
    write(buffer, `</code></pre>`);
}

function renderDocument(buffer, node) {
    renderBody(buffer, node.body);
}

function renderImage(buffer, node) {
    const alt = node.body.length ? ` alt="${normalize(node.body)}"` : "";
    const title = node.title ? ` title="${node.title}"` : "";
    write(buffer, `<img href="${node.destination}"${alt}${title} />`);
}

function renderParagraph(buffer, node) {
    write(buffer, `<p>`);
    pushIndent(buffer);
    renderBody(buffer, node.body);
    popIndent(buffer);
    writeln(buffer, `</p>`);
}

function renderDelete(buffer, node) {
    write(buffer, "<del>");
    renderBody(buffer, node.body);
    write(buffer, "</del>");
}

function renderEmphasis(buffer, node) {
    write(buffer, "<em>");
    renderBody(buffer, node.body);
    write(buffer, "</em>");
}

function renderHeading(buffer, node) {
    write(buffer, `<h${node.depth}>`);
    renderBody(buffer, node.body);
    writeln(buffer, `</h${node.depth}>`);
}

function renderStrong(buffer, node) {
    write(buffer, "<strong>");
    renderBody(buffer, node.body);
    write(buffer, "</strong>");
}

function renderSoftbreak(buffer, _node) {
    write(buffer, `\n`);
}

function renderList(buffer, node) {
    if (node.type === "ordered") {
        renderOrderedList(buffer, node);
    } else {
        renderUnorderedList(buffer, node);
    }
}

function renderOrderedList(buffer, node) {
    writeln(buffer, `<ol start="${node.start}">`);
    if (node.tight) {
        renderThightListItems(buffer, node.items);
    } else {
        renderListItems(buffer, node.items);
    }
    writeln(buffer, `</ol>`);
}

function renderUnorderedList(buffer, node) {
    writeln(buffer, `<ul>`);
    if (node.tight) {
        renderThightListItems(buffer, node.items);
    } else {
        renderListItems(buffer, node.items);
    }
    writeln(buffer, `</ul>`);
}

function renderListItems(buffer, items) {
    for (let i = 0; i < items.length; i++) {
        writeln(buffer, `<li>`);
        renderBody(buffer, items[i].body);
        writeln(buffer, `</li>`);
    }
}

function renderThightListItems(buffer, items) {
    for (let i = 0; i < items.length; i++) {
        write(buffer, `<li>`);
        renderBody(buffer, items[i].body[0].body);
        write(buffer, `</li>`);
    }
}

function renderLinebreak(buffer, _node) {
    write(buffer, `<br />`);
}

function renderLink(buffer, node) {
    const title = node.title ? ` title="${node.title}"` : "";
    write(buffer, `<a href="${node.destination}"${title}>`);
    renderBody(buffer, node.body);
    write(buffer, `</a>`);
}

function renderText(buffer, node) {
    write(buffer, node.value);
}

function renderThematicBreak(buffer, _node) {
    writeln(buffer, `<hr />`);
}

function renderBody(buffer, body) {
    for (let i = 0; i < body.length; i++) {
        renderNode(buffer, body[i]);
    }
}

function pushIndent(buffer) {
    buffer.indent += Str.repeat(" ", buffer.indentLevel);
}

function popIndent(buffer) {
    buffer.indent = buffer.indent.substr(0, buffer.indent.length - buffer.indentLevel);
}

function write(buffer, text) {
    buffer.data.push(buffer.indent + text);
}

function writeln(buffer, text) {
    buffer.data.push(buffer.indent + text + buffer.newline);
}

function normalize(body) {
    return Str.join(List.map(body, node => {
        switch (node.type) {

        default:
            return "";

        case MDNode.CODE:
        case MDNode.TEXT:
            return Str.lower(node.value);

        case MDNode.HEADING:
        case MDNode.PARAGRAPH:
        case MDNode.EMPHASIS:
        case MDNode.STRONG:
        case MDNode.DELETE:
            return normalize(node.body);

        }
    }, " "));
}
