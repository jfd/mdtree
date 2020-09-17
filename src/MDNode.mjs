export {create};

export {document};
export {paragraph};
export {blockquote};
export {heading};
export {codeBlock};
export {code};
export {yaml};
export {html};
export {list};
export {listItem};
export {table};
export {tableCell};
export {tableRow};
export {thematicBreak};
export {softbreak};
export {linebreak};
export {emphasis};
export {strong};
export {del};
export {link};
export {image};
export {text};

export {isLineTerminator};

export const DOCUMENT = "Document";
export const PARAGRAPH = "Paragraph";
export const BLOCKQUOTE = "Blockquote";
export const HEADING = "Heading";
export const CODE_BLOCK = "CodeBlock";
export const CODE = "Code";
export const YAML = "yaml";
export const HTML = "html";
export const LIST = "List";
export const LIST_ITEM = "ListItem";
export const TABLE = "table";
export const TABLE_CELL = "tableCell";
export const TABLE_ROW = "tableRow";
export const THEMATIC_BREAK = "thematicBreak";
export const LINEBREAK = "Linebreak";
export const SOFTBREAK = "Softbreak";
export const EMPHASIS = "Emphasis";
export const STRONG = "Strong";
export const DELETE = "Delete";
export const LINK = "Link";
export const IMAGE = "Image";
export const TEXT = "Text";

function create(type) {
    return {type};
}

function document(body, pos=void(0)) {
    return { type: DOCUMENT, body, pos};
}

function paragraph(body, pos=void(0)) {
    return { type: PARAGRAPH, body, pos };
}

function blockquote(body, pos=void(0)) {
    return { type: BLOCKQUOTE, body, pos };
}

function heading(depth, body, pos=void(0)) {
    return { type: HEADING, depth, body, pos };
}

function codeBlock(value, lang=null, pos=void(0)) {
    return { type: CODE_BLOCK, value, lang, pos };
}

function code(value, pos=void(0)) {
    return { type: CODE, value, pos };
}

function yaml(value, pos=void(0)) {
    return { type: YAML, value, pos };
}

function html(value, pos=void(0)) {
    return { type: HTML, value, pos };
}

function list(listType, items, start, delimiter, tight, pos=void(0)) {
    return { type: LIST, listType, tight, delimiter, start, items, pos };
}

function listItem(body, pos=void(0)) {
    return { type: LIST_ITEM, body, pos };
}

function table(children, align=null, pos=void(0)) {
    return { type: TABLE, children, align, pos };
}

function tableRow(children, pos=void(0)) {
    return { type: TABLE_ROW, children, pos };
}

function tableCell(children, pos=void(0)) {
    return { type: TABLE_CELL, children, pos };
}

function thematicBreak(pos=void(0)) {
    return { type: THEMATIC_BREAK, pos };
}

function softbreak(pos=void(0)) {
    return { type: SOFTBREAK, pos };
}

function linebreak(pos=void(0)) {
    return { type: LINEBREAK, pos };
}

function emphasis(body, pos=void(0)) {
    return { type: EMPHASIS, body, pos };
}

function strong(body, pos=void(0)) {
    return { type: STRONG, body, pos };
}

function del(body, pos=void(0)) {
    return { type: DELETE, body, pos };
}

function link(destination, title, body, pos=void(0)) {
    return { type: LINK, destination, title, body, pos };
}

function image(destination, title, body, pos=void(0)) {
    return { type: IMAGE, destination, title, body, pos };
}

function text(value, pos=void(0)) {
    return { type: TEXT, value, pos };
}

function isLineTerminator(node) {
    return node && (node.type === LINEBREAK || node.type === SOFTBREAK) || false;
}
