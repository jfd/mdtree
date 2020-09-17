import {Dict} from "//es.parts/ess/0.0.1/";
import {List} from "//es.parts/ess/0.0.1/";
import {Str} from "//es.parts/ess/0.0.1/";

import * as MDChar from "./MDChar.mjs";
import * as MDNode from "./MDNode.mjs";
import * as MDToken from "./MDToken.mjs";

export {parse};

const OPTION_LOC                = 1 << 0;

const FLAG_LOOKAHEAD            = 1 << 0;
const FLAG_PRESERVEWS           = 1 << 1;
const FLAG_DISABLESOFTBREAKS    = 1 << 2;
const FLAG_DISABLEHARDBREAKS    = 1 << 3;
const FLAG_INSIDELIST           = 1 << 4;
const FLAG_BEGINOFLINE          = 1 << 5;

const INDENT_LEN                = 4;

const HARDBREAK                 = 0x66;

class Parser {
    constructor() {
        this.options = 0;
        this.state = null;
        this.stateStack = [];
        this.input = null;
        this.source = void(0);
        this.locationStack = [];
        this.linkReferences = null;
    }
}

class State {
    constructor() {
        this.flags = FLAG_BEGINOFLINE;
        this.pos = 0;
        this.lineStart = 0;
        this.curLine = 1;
        this.type = MDToken.EOF;
        this.value = null;
        this.start = 0;
        this.end = 0;
        this.lastTokStart = 0;
        this.lastTokEnd = 0;
        this.blockquoteLevel = 0;
        this.codeBlockType = null;
        this.indentLevel = 0;
        this.blankLines = 0;
    }
}

class Position {
    constructor() {
        this.line = 0;
        this.column = 0;
    }
}

class LinkReference {
    constructor() {
        this.label = null;
        this.destination = null;
        this.title = null;
        this.linkBody = null;
    }
}

function parse(input, options) {
    const opts = options || {};

    const parser = new Parser;
    parser.input = input;
    parser.source = opts.source;
    parser.state = new State;

    setOption(parser, OPTION_LOC, opts.loc === true);

    parser.linkReferences = scanLinkReferences(parser);

    return parseDocument(parser);
}

// Internals

function option(parser, options) {
    return (parser.options & options) === options;
}

function setOption(parser, options, value) {
    if (value) {
        parser.options |= options;
    } else {
        parser.options &= ~options;
    }
}

function setFlag(parser, flag) {
    parser.state.flags |= flag;
}

function hasFlag(parser, flag) {
    return (parser.state.flags & flag) === flag;
}

function unsetFlag(parser, flag) {
    parser.state.flags &= ~flag;
}

function pushLoc(parser) {
    if (option(parser, OPTION_LOC)) {
        parser.locationStack.push(parser.state.startLoc);
    }
}

function popLoc(parser) {
    if (option(parser, OPTION_LOC)) {
        if (parser.locationStack.length === 0) {
            throw new Error("location-stack missmatch");
        }

        const start = parser.locationStack.pop();
        const end = parser.state.lastTokEndLoc;
        const source = parser.source;

        return { start, end, source };
    }

    return void(0);
}

function posFromState(state) {
    const pos = new Position;
    pos.line = state.curLine;
    pos.column = state.pos - state.lineStart;
    return pos;
}

function next(parser) {
    const state = parser.state;
    state.lastTokEnd = state.end;
    state.lastTokStart = state.start;
    state.lastTokEndLoc = state.endLoc;
    state.lastTokStartLoc = state.startLoc;
    nextToken(parser);
}

function lookahead(parser) {
    pushState(parser);
    setFlag(parser, FLAG_LOOKAHEAD);
    next(parser);
    unsetFlag(parser, FLAG_LOOKAHEAD);
    return popState(parser).type;
}

function pushState(parser) {
    const current = parser.state;
    parser.stateStack.push(parser.state);
    parser.state = new State;
    parser.state.flags = current.flags;
    parser.state.pos = current.pos;
    parser.state.lineStart = current.lineStart;
    parser.state.curLine = current.curLine;
    parser.state.type = current.type;
    parser.state.value = current.value;
    parser.state.start = current.start;
    parser.state.end = current.end;
    parser.state.lastTokStart = current.lastTokStart;
    parser.state.lastTokEnd = current.lastTokEnd;
    parser.state.blockquoteLevel = current.blockquoteLevel;
    parser.state.indentLevel = current.indentLevel;
    parser.state.blankLines = current.blankLines;
    return parser.state;
}

function popState(parser) {
    const state = parser.state;
    parser.state = parser.stateStack.pop();
    return state;
}

function pushLocAndState(parser) {
    pushLoc(parser);
    pushState(parser);
}

function popLocAndState(parser) {
    popState(parser);
    popLoc(parser);
}

function replaceState(parser) {
    parser.stateStack.pop();
}

function nextToken(parser) {
    const state = parser.state;

    state.start = state.pos;

    if (option(parser, OPTION_LOC)) {
        state.startLoc = posFromState(state);
    }

    if (state.pos >= parser.input.length) {
        return finishToken(parser, MDToken.EOF, null);
    }

    return readToken(parser, fullCharCodeAtPos(parser));
}

function readToken(parser, code) {
    if (MDChar.isLineBreak(code)) {
        return readLineBreak(parser);
    }
    if (MDChar.isWhitespace(code)) {
        return readWhitespace(parser);
    }

    switch (code) {

    default:
        return readWord(parser);

    case MDChar.ASTERISK:
    case MDChar.HYPHEN_MINUS:
    case MDChar.LOW_LINE:
        return readThematic(parser, code);

    case MDChar.ASTERISK:
    case MDChar.PLUS_SIGN:
        return readBullet(parser, code);

    case MDChar.DIGIT_0:
    case MDChar.DIGIT_1:
    case MDChar.DIGIT_2:
    case MDChar.DIGIT_3:
    case MDChar.DIGIT_4:
    case MDChar.DIGIT_5:
    case MDChar.DIGIT_6:
    case MDChar.DIGIT_7:
    case MDChar.DIGIT_8:
    case MDChar.DIGIT_9:
        return readOrderedListItem(parser);

    case MDChar.TAB:
        parser.state.pos++;
        return finishToken(parser, MDToken.INDENT);

    case MDChar.NUMBER_SIGN:
        return readHeading(parser);

    case MDChar.TILDE:
        return readDelete(parser);

    case MDChar.GRAVE_ACCENT:
        return readCode(parser, code);

    case MDChar.EXCLAMATION_MARK:
    case MDChar.QUOTATION_MARK:
    case MDChar.APOSTROPHE:
    case MDChar.LEFT_PARENTHESIS:
    case MDChar.RIGHT_PARENTHESIS:
    case MDChar.LEFT_SQUARE_BRACKET:
    case MDChar.RIGHT_SQUARE_BRACKET:
    case MDChar.COLON:
    case MDChar.SEMICOLON:
    case MDChar.GREATER_THEN:
    case MDChar.REVERSE_SOLIDUS:
    case MDChar.AMPERSAND:
        parser.state.pos++;
        return finishToken(parser, code, String.fromCharCode(code));
    }
}

function istype(parser, type) {
    return parser.state.type === type;
}

function stateType(parser) {
    return parser.state.type;
}

function stateValue(parser) {
    return parser.state.value;
}

function readWord(parser) {
    const input = parser.input;
    const state = parser.state;

    let start = state.pos;

    const initial = fullCharCodeAtPos(parser);

    let foundNonInitial = false;

    while (state.pos < input.length) {
        const ch = fullCharCodeAtPos(parser);

        if (MDChar.isLineBreak(ch) ||
            MDChar.isWhitespace(ch) ||
            ch === MDChar.REVERSE_SOLIDUS) {
            break;
        }
        if (ch === initial) {
            if (foundNonInitial) {
                break;
            }
        } else if (ch === MDChar.ASTERISK ||
                   ch === MDChar.QUOTATION_MARK ||
                   ch === MDChar.APOSTROPHE ||
                   ch === MDChar.LOW_LINE ||
                   ch === MDChar.TILDE ||
                   ch === MDChar.RIGHT_SQUARE_BRACKET ||
                   ch === MDChar.RIGHT_PARENTHESIS ||
                   ch === MDChar.GRAVE_ACCENT ||
                   ch === MDChar.AMPERSAND ||
                   ch === MDChar.SEMICOLON) {
            break;
        } else {
            foundNonInitial = true;
        }

        state.pos += ch <= 0xffff ? 1 : 2;
    }

    return finishToken(parser, MDToken.WORD, input.slice(start, state.pos));
}

function readWhitespace(parser) {
    const input = parser.input;
    const state = parser.state;

    if (hasFlag(parser, FLAG_PRESERVEWS)) {
        const ch = fullCharCodeAtPos(parser);
        state.pos += ch <= 0xffff ? 1 : 2;
        return finishToken(parser, MDToken.WHITESPACE);
    }

    let type = MDToken.WHITESPACE;
    let count = 0;

    while (state.pos < input.length) {
        const ch = fullCharCodeAtPos(parser);

        if (MDChar.isWhitespace(ch) === false) {
            break;
        }

        state.indentLevel++;
        state.pos += ch <= 0xffff ? 1 : 2;

        if (++count === INDENT_LEN) {
            type = MDToken.INDENT;
            break;
        }
    }

    if (hasFlag(parser, FLAG_DISABLEHARDBREAKS) === false) {
        const ch = fullCharCodeAtPos(parser);

        if (MDChar.isLineBreak(ch)) {
            state.pos += ch <= 0xffff ? 1 : 2;
            state.indentLevel = 0;
            return finishToken(parser, MDToken.LINEBREAK, HARDBREAK);
        }
    }

    return finishToken(parser, type);
}

function readLineBreak(parser) {
    const state = parser.state;

    state.indentLevel = 0;

    if (hasFlag(parser, FLAG_PRESERVEWS)) {
        state.pos++;
        state.curLine++;
        state.lineStart = state.pos;
        return finishToken(parser, MDToken.LINEBREAK);
    }

    const start = state.curLine;

    while (MDChar.isLineBreak(fullCharCodeAtPos(parser))) {
        state.pos++;
        state.curLine++;
        state.lineStart = state.pos;
    }

    state.blankLines = (state.curLine - start) - 1;

    return finishToken(parser, MDToken.LINEBREAK);
}

function readDelete(parser) {
    const input = parser.input;
    const state = parser.state;

    if (state.codeBlockType === null &&
        input.charCodeAt(state.pos + 1) === MDChar.TILDE &&
        (input.charCodeAt(state.pos + 2) !== MDChar.TILDE ||
         (state.type !== MDToken.WHITESPACE && state.type !== 0 &&
          state.type !== MDToken.INDENT &&
          state.type !== MDToken.LINEBREAK))) {
        state.pos += 2;
        return finishToken(parser, MDToken.DELETE, "~~");
    }

    return readCode(parser, MDChar.TILDE);
}

function readCode(parser, type) {
    const input = parser.input;
    const state = parser.state;

    const bol = hasFlag(parser, FLAG_BEGINOFLINE);

    if (bol &&
        state.codeBlockType === null &&
        input.charCodeAt(state.pos + 1) === type &&
        input.charCodeAt(state.pos + 2) === type) {
        const start = state.pos;

        while (input.charCodeAt(state.pos) === type) {
            state.pos++;
        }

        return finishToken(parser, MDToken.CODEBLOCK, input.slice(start, state.pos));
    } else if (state.codeBlockType && state.codeBlockType.charCodeAt(0) === type) {
        const start = state.pos;
        let pos = state.pos;

        while (input.charCodeAt(pos) === type) {
            pos++;
        }

        if (pos - start >= state.codeBlockType.length) {
            state.pos = pos;
            return finishToken(parser, MDToken.CODEBLOCK, input.slice(start, pos));
        }
    } else if (state.codeBlockType === null && type === MDChar.GRAVE_ACCENT) {
        state.pos++;
        return finishToken(parser, MDToken.CODE, "`");
    }

    return readWord(parser);
}

function readRawText(parser, delimiter) {
    const state = parser.state;

    setFlag(parser, FLAG_PRESERVEWS);

    let result = "";

    while (state.type !== delimiter && state.type !== MDToken.EOF) {
        result += MDToken.toChar(state.type, state.value);
        next(parser);
    }

    unsetFlag(parser, FLAG_PRESERVEWS);

    if (state.type === delimiter) {
        next(parser);
    }

    return result;
}

function readHeading(parser) {
    const input = parser.input;
    const state = parser.state;

    let start = state.pos;
    let pos = start;

    if (state.blockquoteLevel === 0  &&
        (hasFlag(parser, FLAG_BEGINOFLINE) === false || state.indentLevel > 3)) {
        return readWord(parser);
    }

    while (pos++ < input.length && fullCharCodeAt(parser, pos) === MDChar.NUMBER_SIGN);

    if (pos - start > 6) {
        return readWord(parser);
    }

    const nextch = fullCharCodeAt(parser, pos);

    if (isNaN(nextch) === false && MDChar.isWhitespace(nextch) === false) {
        return readWord(parser);
    }

    state.pos = pos + 1;

    return finishToken(parser, MDToken.HEADING, input.slice(start, pos));
}

function readThematic(parser, code) {
    if (hasFlag(parser, FLAG_BEGINOFLINE)) {
        const state = parser.state;

        let ch;
        let pos = state.pos;
        let count = 0;

        do {
            ch = fullCharCodeAt(parser, pos++);
            if (ch === code) {
                count++;
            }
        } while (ch === code || MDChar.isWhitespace(ch))

        if (count > 2 && (MDChar.isLineBreak(ch) || isNaN(ch))) {
            const input = parser.input.slice(state.pos, pos);
            state.pos = pos;
            return finishToken(parser, MDToken.THEMATIC, input);
        }
    }

    return readBullet(parser, code);
}

function readBullet(parser, code) {
    const ch = fullCharCodeAt(parser, parser.state.pos + 1);

    if (hasFlag(parser, FLAG_BEGINOFLINE) &&
        (MDChar.isWhitespace(ch) || isNaN(ch))) {
        parser.state.pos += 2;
        return finishToken(parser, MDToken.BULLET, String.fromCharCode(code));
    }

    if (code === MDChar.ASTERISK || code === MDChar.LOW_LINE) {
        return readEm(parser, code);
    }

    return readWord(parser);
}

function readEm(parser, code) {
    if (fullCharCodeAt(parser, parser.state.pos + 1) === code) {
        const str = String.fromCharCode(code);
        parser.state.pos += 2;
        return finishToken(parser, MDToken.STRONG, str + str);
    }

    parser.state.pos++;
    return finishToken(parser, MDToken.EM, String.fromCharCode(code));
}

function readOrderedListItem(parser) {
    const input = parser.input;
    const state = parser.state;

    const ch = fullCharCodeAt(parser, state.pos + 1);
    const ch2 = fullCharCodeAt(parser, state.pos + 2);

    if ((ch === MDChar.RIGHT_PARENTHESIS || ch === MDChar.FULL_STOP) &&
        (MDChar.isWhitespace(ch2) || isNaN(ch2))) {
        const value = input.slice(state.pos, state.pos + 2);
        state.pos += 3;
        return finishToken(parser, MDToken.BULLET, value);
    }

    return readWord(parser);
}

function match(parser, type) {
    return parser.state.type === type;
}

function eat(parser, type) {
    if (match(parser, type)) {
        next(parser);
        return true;
    }
    return false;
}

function eatWhitespaces(parser) {
    let count = 0;

    while (match(parser, MDToken.WHITESPACE) ||
           match(parser, MDToken.INDENT)) {
        next(parser);
        count++;
    }

    return count;
}


function finishToken(parser, type, value) {
    const state = parser.state;

    if (hasFlag(parser, FLAG_BEGINOFLINE)) {
        if (state.type !== 0 &&
            state.type !== MDToken.WHITESPACE &&
            state.type !== MDToken.INDENT &&
            state.type !== MDToken.LINEBREAK) {
            unsetFlag(parser, FLAG_BEGINOFLINE);
        }
    }

    state.end = parser.state.pos;
    state.endLoc = posFromState(state);
    state.type = type;
    state.value = value;

    if (type === MDToken.LINEBREAK) {
        setFlag(parser, FLAG_BEGINOFLINE);
    }
}

function fullCharCodeAt(parser, pos) {
    const input = parser.input;

    const code = input.charCodeAt(pos);
    if (code <= 0xd7ff || code >= 0xe000)  {
        return code;
    }

    const next = input.charCodeAt(pos + 1);
    return (code << 10) + next - 0x35fdc00;
}

function fullCharCodeAtPos(parser) {
    return fullCharCodeAt(parser, parser.state.pos);
}

function scanLinkReferences(parser) {
    const references = Dict.create();
    pushState(parser);
    next(parser);

    while (eat(parser, MDToken.EOF) === false) {
        eatWhitespaces(parser);

        if (match(parser, MDToken.BRACKETL)) {
            const ref = parseLinkOrImage(parser, MDToken.BRACKETL, true);

            if (ref instanceof LinkReference) {
                references[ref.label] = ref;
            }

            next(parser);
        } else {
            while (match(parser, MDToken.LINEBREAK) === false &&
                   match(parser, MDToken.EOF) === false) {
                next(parser);
            }

            eat(parser, MDToken.LINEBREAK);
        }
    }

    popState(parser);

    return references;
}

function parseDocument(parser) {
    const body = [];

    next(parser);
    pushLoc(parser);

    while (eat(parser, MDToken.EOF) === false) {
        const node = parseBlock(parser);

        if (node) {
            body.push(node);
        }
    }

    const n = MDNode.document(body, popLoc(parser));

    if (parser.locationStack.length !== 0) {
        throw new Error("Location stack should be zero");
    }

    return n;
}

function parseBlock(parser) {
    const type = stateType(parser);

    if (type === MDToken.WHITESPACE ||
        type === MDToken.LINEBREAK) {
        next(parser);
        return parseBlock(parser);
    }

    switch (type) {

    default:
        return parseParagraph(parser);

    case MDToken.INDENT:
        return parseIndentCodeBlock(parser);

    case MDToken.CODEBLOCK:
        return parseCodeBlock(parser);

    case MDToken.BLOCKQUOTE:
        return parseBlockquote(parser);

    case MDToken.HEADING:
        return parseHeading(parser);

    case MDToken.BULLET:
        return parseList(parser);

    case MDToken.THEMATIC:
        return parseThematic(parser);
    }
}

function parseParagraph(parser) {
    pushLoc(parser);

    const body = parseBodyBlock(parser);

    if (MDNode.isLineTerminator(List.last(body))) {
        body.pop();
    }

    if (stateType(parser) === MDToken.ASSIGN) {
        return MDNode.heading(1, body, popLoc(parser));
    } else if (stateType(parser) === MDToken.DASH) {
        return MDNode.heading(2, body, popLoc(parser));
    }

    return MDNode.paragraph(body, popLoc(parser));
}

function parseCodeBlock(parser) {
    pushLoc(parser);

    parser.state.codeBlockType = parser.state.value;

    setFlag(parser, FLAG_PRESERVEWS);
    next(parser);
    unsetFlag(parser, FLAG_PRESERVEWS);

    const lang = readRawText(parser, MDToken.LINEBREAK).trim();
    const value = readRawText(parser, MDToken.CODEBLOCK);

    parser.state.codeBlockType = null;

    return MDNode.codeBlock(value, lang || null, popLoc(parser));
}

function parseIndentCodeBlock(parser) {
    pushLoc(parser);

    const row = readRawText(parser, MDToken.LINEBREAK);

    if (row.trim() === "") {
        return null;
    }

    let value = row.substr(1);

    while (stateType(parser) === MDToken.INDENT) {
        const row = readRawText(parser, MDToken.LINEBREAK);

        if (row.trim() === "") {
            break;
        }

        value += `\n${row.substr(1)}`;
    }

    return MDNode.codeBlock(value, null, popLoc(parser));
}

function parseBlockquote(parser) {
    pushLoc(parser);

    const body = [];

    parser.state.blockquoteLevel++;

    while (stateType(parser) === MDToken.BLOCKQUOTE ||
           (stateType(parser) === MDToken.WHITESPACE &&
            lookahead(parser, MDToken.BLOCKQUOTE))) {
        next(parser);
        body.push(parseBlock(parser));
    }

    parser.state.blockquoteLevel--;

    return MDNode.blockquote(body, popLoc(parser));
}

function parseHeading(parser) {
    pushLoc(parser);

    const len = parser.state.value.length;

    next(parser);

    setFlag(parser, FLAG_DISABLESOFTBREAKS | FLAG_DISABLEHARDBREAKS);
    const head = MDNode.heading(len, parseBodyBlock(parser), popLoc(parser));
    unsetFlag(parser, FLAG_DISABLESOFTBREAKS | FLAG_DISABLEHARDBREAKS);

    return head;
}

function parseList(parser) {
    pushLoc(parser);

    const oldInsideList = hasFlag(parser, FLAG_INSIDELIST);
    setFlag(parser, FLAG_INSIDELIST);

    const items = [];
    const bullet = stateValue(parser);
    const listtype = bullet.length === 2 ? "ordered" : "bullet";
    const compidx = bullet.length - 1;

    let hasblanks = false;

    while (istype(parser, MDToken.BULLET) &&
           stateValue(parser)[compidx] === bullet[compidx]) {

        hasblanks = !!(parser.state.blankLines) || hasblanks;

        items.push(parseListItem(parser));

        while (istype(parser, MDToken.WHITESPACE) ||
               istype(parser, MDToken.LINEBREAK)) {
            next(parser);
        }
    }

    if (oldInsideList === false) {
        unsetFlag(parser, FLAG_INSIDELIST);
    }

    let start, delimiter;

    if (listtype === "ordered") {
        start = parseInt(bullet[0], 10);
        delimiter = bullet[1] === ")" ? "paren" : "period";
    }

    return MDNode.list(listtype, items, start, delimiter, !hasblanks, popLoc(parser));
}

function parseThematic(parser) {
    pushLoc(parser);
    next(parser);
    return MDNode.thematicBreak(popLoc(parser));
}

function parseListItem(parser) {
    pushLoc(parser);

    const indentlevel = parser.state.indentLevel;

    next(parser);

    const body = [];

    while (eat(parser, MDToken.EOF) === false) {
        const node = parseBlock(parser);

        if (node) {
            body.push(node);
        }

        if (parser.state.blankLines ||
            istype(parser, MDToken.BULLET) &&
            (parser.state.indentLevel - indentlevel < 3)) {
            break;
        }
    }

    return MDNode.listItem(body, popLoc(parser));
}

function parseBodyBlock(parser) {
    const nodes = [];

    let node;

    while (stateType(parser) !== MDToken.EOF) {
        switch (stateType(parser)) {

        case MDToken.BULLET:
            if (hasFlag(parser, FLAG_INSIDELIST)) {
                return nodes;
            }

        default:
            node = parseInlineNode(parser);
            if (node) {
                nodes.push(node);
            }
            break;

        case MDToken.BLOCKQUOTE:
            if (parser.state.blockquoteLevel) {
                let level = 0
                let pos = parser.state.pos - 1;

                while (parser.input.charCodeAt(pos++) === MDChar.GREATER_THEN) {
                    level++;
                }

                if (level > parser.state.blockquoteLevel) {
                    return nodes;
                }

                while (stateType(parser) === MDToken.BLOCKQUOTE ||
                       stateType(parser) === MDToken.INDENT ||
                       stateType(parser) === MDToken.WHITESPACE) {
                    next(parser);
                }
            } else {
                return nodes;
            }
            break;

        case MDToken.BACKSLASH:
            if (hasFlag(parser, FLAG_DISABLEHARDBREAKS) === false &&
                lookahead(parser) === MDToken.LINEBREAK) {
                next(parser);
                parser.state.value = HARDBREAK;
                nodes.push(parseLinebreak(parser));
            } else {
                nodes.push(parseText(parser));
            }
            break;

        case MDToken.LINEBREAK:
            if (parser.state.blankLines) {
                return nodes;
            }
            if (hasFlag(parser, FLAG_DISABLESOFTBREAKS) ||
                hasFlag(parser, FLAG_DISABLEHARDBREAKS)) {
                next(parser);
                return nodes;
            }
            nodes.push(parseLinebreak(parser));

            while (stateType(parser) === MDToken.INDENT ||
                   stateType(parser) === MDToken.WHITESPACE) {
                next(parser);
            }

            break;
        }
    }

    return nodes;
}

function parseLinebreak(parser) {
    pushLoc(parser);

    const hardbreak = parser.state.value === HARDBREAK;

    next(parser);

    return hardbreak ? MDNode.linebreak(popLoc(parser))
                     : MDNode.softbreak(popLoc(parser));
}

function parseText(parser, breakType=-1) {
    const state = parser.state;

    pushLoc(parser);

    let value = "";
    let lh;

    while (true) {
        switch (stateType(parser)) {

        default:
            value += MDToken.toChar(state.type, state.value);
            next(parser);
            break;

        case MDToken.INDENT:
        case MDToken.WHITESPACE:
            lh = lookahead(parser);
            if (value !== "" && (lh === MDToken.EM ||
                                 lh === MDToken.STRONG ||
                                 lh === MDToken.DELETE ||
                                 lh === MDToken.CODE)) {
                return MDNode.text(value, popLoc(parser));
            } else if (lh === MDToken.LINEBREAK) {
                next(parser);
            } else {
                value += " ";
                next(parser);
            }
            break;

        case MDToken.BACKSLASH:
            if (hasFlag(parser, FLAG_DISABLEHARDBREAKS) ||
                lookahead(parser) !== MDToken.LINEBREAK) {
                break;
            }

        case MDToken.EM:
        case MDToken.STRONG:
        case MDToken.DELETE:
            if (value === "") {
                value += MDToken.toChar(state.type, state.value);
                next(parser);
                break;
            }

        case breakType:
        case MDToken.LINEBREAK:

        case MDToken.EOF:
            return MDNode.text(value, popLoc(parser));
        }
    }
}

function parseCode(parser) {
    pushLoc(parser);
    pushState(parser);

    let value = "";

    next(parser);

    while (true) {
        switch (stateType(parser)) {

        default:
            value += MDToken.toChar(stateType(parser), stateValue(parser));
            next(parser);
            break;

        case MDToken.LINEBREAK:
            if (lookahead(parser) === MDToken.LINEBREAK) {
                popState(parser);
                popLoc(parser);
                return parseText(parser);
            }
            value += MDToken.toChar(stateType(parser), stateType(value));
            next(parser);
            break;

        case MDToken.CODE:
            replaceState(parser);
            next(parser);
            return MDNode.code(value, popLoc(parser));

        case MDToken.EOF:
            popState(parser);
            popLoc(parser);
            return parseText(parser);

        }
    }
}

function parseInlineNode(parser, breakType=-1) {
    const type = stateType(parser);
    switch (type) {

    default:
        if (type < 0xff) {
            return parseText(parser, breakType);
        }

        throw new SyntaxError("Unexpected 0x" + stateType(parser).toString(16));

    case breakType:
        return null;

    case MDToken.ENTITY:
        return parseEntity(parser);

    case MDToken.EXCLAMATION:
    case MDToken.BRACKETL:
        return parseLinkOrImage(parser, type, false);

    case MDToken.WHITESPACE:
    case MDToken.INDENT:
    case MDToken.WORD:
        return parseText(parser, breakType);

    case MDToken.EM:
    case MDToken.STRONG:
    case MDToken.DELETE:
        return parseSpan(parser);

    case MDToken.CODE:
        return parseCode(parser);
    }
}

function parseEntity(parser) {
    pushLoc(parser);
    next(parser);
    if (match(parser, MDToken.WORD) && lookahead(parser) === MDToken.SEMICOLON) {
        const code = entityToUnicode(stateValue(parser));
        if (code) {
            next(parser);
            next(parser);
            return MDNode.text(String.fromCharCode(code), popLoc(parser));
        }
    }
    return MDNode.text("&amp;", popLoc(parser));
}

function parseSpan(parser) {
    const breaktype = stateType(parser);
    const breakvalue = stateValue(parser);

    if (lookahead(parser) === MDToken.WHITESPACE) {
        return parseText(parser);
    }

    pushLoc(parser);
    pushState(parser);

    const body = [];

    next(parser);

    while (true) {
        const type = stateType(parser);

        if ((type === breaktype && stateValue(parser) === breakvalue) ||
            type === MDToken.LINEBREAK ||
            type === MDToken.WHITESPACE ||
            type === MDToken.EOF) {
            break;
        }

        const node = parseInlineNode(parser);

        if (node) {
            body.push(node);
        }
    }

    if (stateType(parser) !== breaktype) {
        popState(parser);
        popLoc(parser);
        return parseText(parser);
    }

    next(parser);

    replaceState(parser);

    switch (breaktype) {

    case MDToken.EM:
        return MDNode.emphasis(body, popLoc(parser));

    case MDToken.STRONG:
        return MDNode.strong(body, popLoc(parser));

    case MDToken.DELETE:
        return MDNode.del(body, popLoc(parser));
    }
}

function parseLinkOrImage(parser, code, referenceMode) {
    pushLocAndState(parser);

    const bol = hasFlag(parser, FLAG_BEGINOFLINE);
    const image = code === MDToken.EXCLAMATION;

    if (image) {
        if (lookahead(parser) !== MDToken.BRACKETL) {
            popLocAndState(parser);
            return parseText(parser);
        }
        next(parser);
    }

    next(parser);

    const body = parseLinkBody(parser);

    if (body === null || eat(parser, MDToken.BRACKETR) === false) {
        popLocAndState(parser);
        return parseText(parser);
    }

    if (referenceMode && match(parser, MDToken.COLON) === false) {
        popLocAndState(parser);
        return parseText(parser);
    }

    if (eat(parser, MDToken.PARENL)) {
        const {destination, title} = parseDestinationAndTitle(parser);

        if (destination === null ||
            title === void(0) ||
            eat(parser, MDToken.PARENR) === false) {
            popLocAndState(parser);
            return parseText(parser);
        }

        replaceState(parser);

        if (image) {
            return MDNode.image(destination, title, body, popLoc(parser));
        }

        return MDNode.link(destination, title, body, popLoc(parser));
    } else if (eat(parser, MDToken.COLON)) {
        if (image || bol === false) {
            popLocAndState(parser);
            return parseText(parser);
        }

        const {destination, title} = parseDestinationAndTitle(parser);

        if (destination === null ||
            title === void(0) ||
            (eat(parser, MDToken.LINEBREAK) === false &&
             eat(parser, MDToken.EOF) === false)) {
            popLocAndState(parser);
            return parseText(parser);
        }

        replaceState(parser);
        popLoc(parser);

        if (referenceMode) {
            const label = normalizeLabel(body);
            const reference = new LinkReference;
            reference.label = label;
            reference.destination = destination;
            reference.title = title;
            reference.linkBody = body;
            return reference;
        }

        return null;
    } else {
        let linkBody = null;
        let labelbody = body;

        if (match(parser, MDToken.BRACKETL)) {
            pushState(parser);
            next(parser);

            const body2 = parseLinkBody(parser);
            if (body2 === null || eat(parser, MDToken.BRACKETR) === false) {
                popState(parser);
            } else {
                linkBody = body;
                labelbody = body2;
            }
        }

        const label = normalizeLabel(labelbody);
        const reference = findReference(parser, label);

        if (reference === null) {
            if (linkBody) {
                popState(parser);
            }
            popLocAndState(parser);
            return parseText(parser);
        }

        replaceState(parser);

        const {destination, title} = reference;
        linkBody = linkBody || reference.linkBody;

        if (image) {
            return MDNode.image(destination, title, linkBody, popLoc(parser));
        }

        return MDNode.link(destination, title, linkBody, popLoc(parser));
    }

    popLocAndState(parser);
    return parseText(parser);
}

function parseLinkBody(parser) {
    const body = [];

    while (stateType(parser) !== MDToken.EOF) {
        try {
            const node = parseInlineNode(parser, MDToken.BRACKETR);

            if (node === null) {
                break;
            }

            body.push(node);
        } catch (error) {
            return null;
        }
    }

    return body;
}

function parseDestinationAndTitle(parser) {
    eatWhitespaces(parser);

    const destination = parseDestination(parser);
    let title = null;

    if (destination === null) {
        return { destination, title };
    }

    const wscount = eatWhitespaces(parser);

    if (match(parser, MDToken.PARENR)) {
        return { destination, title };
    }

    if (wscount > 0 &&
        (match(parser, MDToken.QUOTATION) ||
        match(parser, MDToken.APOSTROPHE) ||
        match(parser, MDToken.PARENL))) {
        title = parseTitle(parser);
    }

    if (title === null) {
        title = void(0);
        return { destination, title };
    }

    eatWhitespaces(parser);

    return { destination, title };
}

function parseDestination(parser) {
    pushState(parser);

    const state = parser.state;

    let parentlevel = 0;
    let result = "";

    while (state.type !== MDToken.EOF &&
           state.type !== MDToken.WHITESPACE &&
           state.type !== MDToken.INDENT &&
           state.type !== MDToken.LINEBREAK) {
        if (state.type === MDToken.PARENL) {
            parentlevel++;
            result += state.value;
        } else if (state.type === MDToken.PARENR) {
            if (parentlevel === 0) {
                break;
            }
            parentlevel--;
            result += state.value;
        } else {
            result += state.value;
        }

        next(parser);
    }

    if (parentlevel !== 0) {
        popState(parser);
        return null;
    }

    replaceState(parser);

    return result;
}

function parseTitle(parser) {
    pushState(parser);

    const state = parser.state;
    const initial = state.type;
    const term = initial === MDToken.PARENL ? MDToken.PARENR : initial;

    next(parser);

    let insidelinebreak = false;
    let result = "";

    while (state.type !== MDToken.EOF &&
           state.type !== term) {
        if (state.type === MDToken.LINEBREAK) {
            if (insidelinebreak) {
                break;
            }
            insidelinebreak = true;
        } else {
            insidelinebreak = false;
        }

        result += state.value;
        next(parser);
    }

    if (eat(parser, term) === false) {
        popState(parser);
        return null;
    }

    replaceState(parser);

    return result;
}

function findReference(parser, label) {
    if (label in parser.linkReferences) {
        return parser.linkReferences[label];
    }

    return null;
}

function normalizeLabel(body) {
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
            return normalizeLabel(node.body);

        }
    }, " "));
}

// Credits to https://github.com/sunaku/md2man/blob/master/lib/md2man/roff.rb#L272
function entityToUnicode(entity) {
    switch (entity) {
    default:         return 0x0000;
    case "quot":     return 0x0022;
    case "amp":      return 0x0026;
    case "apos":     return 0x0027;
    case "lt":       return 0x003c;
    case "gt":       return 0x003e;
    case "nbsp":     return 0x00a0;
    case "iexcl":    return 0x00a1;
    case "cent":     return 0x00a2;
    case "pound":    return 0x00a3;
    case "curren":   return 0x00a4;
    case "yen":      return 0x00a5;
    case "brvbar":   return 0x00a6;
    case "sect":     return 0x00a7;
    case "uml":      return 0x00a8;
    case "copy":     return 0x00a9;
    case "ordf":     return 0x00aa;
    case "laquo":    return 0x00ab;
    case "not":      return 0x00ac;
    case "shy":      return 0x00ad;
    case "reg":      return 0x00ae;
    case "macr":     return 0x00af;
    case "deg":      return 0x00b0;
    case "plusmn":   return 0x00b1;
    case "sup2":     return 0x00b2;
    case "sup3":     return 0x00b3;
    case "acute":    return 0x00b4;
    case "micro":    return 0x00b5;
    case "para":     return 0x00b6;
    case "middot":   return 0x00b7;
    case "cedil":    return 0x00b8;
    case "sup1":     return 0x00b9;
    case "ordm":     return 0x00ba;
    case "raquo":    return 0x00bb;
    case "frac14":   return 0x00bc;
    case "frac12":   return 0x00bd;
    case "frac34":   return 0x00be;
    case "iquest":   return 0x00bf;
    case "Agrave":   return 0x00c0;
    case "Aacute":   return 0x00c1;
    case "Acirc":    return 0x00c2;
    case "Atilde":   return 0x00c3;
    case "Auml":     return 0x00c4;
    case "Aring":    return 0x00c5;
    case "AElig":    return 0x00c6;
    case "Ccedil":   return 0x00c7;
    case "Egrave":   return 0x00c8;
    case "Eacute":   return 0x00c9;
    case "Ecirc":    return 0x00ca;
    case "Euml":     return 0x00cb;
    case "Igrave":   return 0x00cc;
    case "Iacute":   return 0x00cd;
    case "Icirc":    return 0x00ce;
    case "Iuml":     return 0x00cf;
    case "ETH":      return 0x00d0;
    case "Ntilde":   return 0x00d1;
    case "Ograve":   return 0x00d2;
    case "Oacute":   return 0x00d3;
    case "Ocirc":    return 0x00d4;
    case "Otilde":   return 0x00d5;
    case "Ouml":     return 0x00d6;
    case "times":    return 0x00d7;
    case "Oslash":   return 0x00d8;
    case "Ugrave":   return 0x00d9;
    case "Uacute":   return 0x00da;
    case "Ucirc":    return 0x00db;
    case "Uuml":     return 0x00dc;
    case "Yacute":   return 0x00dd;
    case "THORN":    return 0x00de;
    case "szlig":    return 0x00df;
    case "agrave":   return 0x00e0;
    case "aacute":   return 0x00e1;
    case "acirc":    return 0x00e2;
    case "atilde":   return 0x00e3;
    case "auml":     return 0x00e4;
    case "aring":    return 0x00e5;
    case "aelig":    return 0x00e6;
    case "ccedil":   return 0x00e7;
    case "egrave":   return 0x00e8;
    case "eacute":   return 0x00e9;
    case "ecirc":    return 0x00ea;
    case "euml":     return 0x00eb;
    case "igrave":   return 0x00ec;
    case "iacute":   return 0x00ed;
    case "icirc":    return 0x00ee;
    case "iuml":     return 0x00ef;
    case "eth":      return 0x00f0;
    case "ntilde":   return 0x00f1;
    case "ograve":   return 0x00f2;
    case "oacute":   return 0x00f3;
    case "ocirc":    return 0x00f4;
    case "otilde":   return 0x00f5;
    case "ouml":     return 0x00f6;
    case "divide":   return 0x00f7;
    case "oslash":   return 0x00f8;
    case "ugrave":   return 0x00f9;
    case "uacute":   return 0x00fa;
    case "ucirc":    return 0x00fb;
    case "uuml":     return 0x00fc;
    case "yacute":   return 0x00fd;
    case "thorn":    return 0x00fe;
    case "yuml":     return 0x00ff;
    case "OElig":    return 0x0152;
    case "oelig":    return 0x0153;
    case "Scaron":   return 0x0160;
    case "scaron":   return 0x0161;
    case "Yuml":     return 0x0178;
    case "fnof":     return 0x0192;
    case "circ":     return 0x02c6;
    case "tilde":    return 0x02dc;
    case "Alpha":    return 0x0391;
    case "Beta":     return 0x0392;
    case "Gamma":    return 0x0393;
    case "Delta":    return 0x0394;
    case "Epsilon":  return 0x0395;
    case "Zeta":     return 0x0396;
    case "Eta":      return 0x0397;
    case "Theta":    return 0x0398;
    case "Iota":     return 0x0399;
    case "Kappa":    return 0x039a;
    case "Lambda":   return 0x039b;
    case "Mu":       return 0x039c;
    case "Nu":       return 0x039d;
    case "Xi":       return 0x039e;
    case "Omicron":  return 0x039f;
    case "Pi":       return 0x03a0;
    case "Rho":      return 0x03a1;
    case "Sigma":    return 0x03a3;
    case "Tau":      return 0x03a4;
    case "Upsilon":  return 0x03a5;
    case "Phi":      return 0x03a6;
    case "Chi":      return 0x03a7;
    case "Psi":      return 0x03a8;
    case "Omega":    return 0x03a9;
    case "alpha":    return 0x03b1;
    case "beta":     return 0x03b2;
    case "gamma":    return 0x03b3;
    case "delta":    return 0x03b4;
    case "epsilon":  return 0x03b5;
    case "zeta":     return 0x03b6;
    case "eta":      return 0x03b7;
    case "theta":    return 0x03b8;
    case "iota":     return 0x03b9;
    case "kappa":    return 0x03ba;
    case "lambda":   return 0x03bb;
    case "mu":       return 0x03bc;
    case "nu":       return 0x03bd;
    case "xi":       return 0x03be;
    case "omicron":  return 0x03bf;
    case "pi":       return 0x03c0;
    case "rho":      return 0x03c1;
    case "sigmaf":   return 0x03c2;
    case "sigma":    return 0x03c3;
    case "tau":      return 0x03c4;
    case "upsilon":  return 0x03c5;
    case "phi":      return 0x03c6;
    case "chi":      return 0x03c7;
    case "psi":      return 0x03c8;
    case "omega":    return 0x03c9;
    case "thetasym": return 0x03d1;
    case "upsih":    return 0x03d2;
    case "piv":      return 0x03d6;
    case "ensp":     return 0x2002;
    case "emsp":     return 0x2003;
    case "thinsp":   return 0x2009;
    case "zwnj":     return 0x200c;
    case "zwj":      return 0x200d;
    case "lrm":      return 0x200e;
    case "rlm":      return 0x200f;
    case "ndash":    return 0x2013;
    case "mdash":    return 0x2014;
    case "lsquo":    return 0x2018;
    case "rsquo":    return 0x2019;
    case "sbquo":    return 0x201a;
    case "ldquo":    return 0x201c;
    case "rdquo":    return 0x201d;
    case "bdquo":    return 0x201e;
    case "dagger":   return 0x2020;
    case "Dagger":   return 0x2021;
    case "bull":     return 0x2022;
    case "hellip":   return 0x2026;
    case "permil":   return 0x2030;
    case "prime":    return 0x2032;
    case "Prime":    return 0x2033;
    case "lsaquo":   return 0x2039;
    case "rsaquo":   return 0x203a;
    case "oline":    return 0x203e;
    case "frasl":    return 0x2044;
    case "euro":     return 0x20ac;
    case "image":    return 0x2111;
    case "weierp":   return 0x2118;
    case "real":     return 0x211c;
    case "trade":    return 0x2122;
    case "alefsym":  return 0x2135;
    case "larr":     return 0x2190;
    case "uarr":     return 0x2191;
    case "rarr":     return 0x2192;
    case "darr":     return 0x2193;
    case "harr":     return 0x2194;
    case "crarr":    return 0x21b5;
    case "lArr":     return 0x21d0;
    case "uArr":     return 0x21d1;
    case "rArr":     return 0x21d2;
    case "dArr":     return 0x21d3;
    case "hArr":     return 0x21d4;
    case "forall":   return 0x2200;
    case "part":     return 0x2202;
    case "exist":    return 0x2203;
    case "empty":    return 0x2205;
    case "nabla":    return 0x2207;
    case "isin":     return 0x2208;
    case "notin":    return 0x2209;
    case "ni":       return 0x220b;
    case "prod":     return 0x220f;
    case "sum":      return 0x2211;
    case "minus":    return 0x2212;
    case "lowast":   return 0x2217;
    case "radic":    return 0x221a;
    case "prop":     return 0x221d;
    case "infin":    return 0x221e;
    case "ang":      return 0x2220;
    case "and":      return 0x2227;
    case "or":       return 0x2228;
    case "cap":      return 0x2229;
    case "cup":      return 0x222a;
    case "int":      return 0x222b;
    case "there4":   return 0x2234;
    case "sim":      return 0x223c;
    case "cong":     return 0x2245;
    case "asymp":    return 0x2248;
    case "ne":       return 0x2260;
    case "equiv":    return 0x2261;
    case "le":       return 0x2264;
    case "ge":       return 0x2265;
    case "sub":      return 0x2282;
    case "sup":      return 0x2283;
    case "nsub":     return 0x2284;
    case "sube":     return 0x2286;
    case "supe":     return 0x2287;
    case "oplus":    return 0x2295;
    case "otimes":   return 0x2297;
    case "perp":     return 0x22a5;
    case "sdot":     return 0x22c5;
    case "lceil":    return 0x2308;
    case "rceil":    return 0x2309;
    case "lfloor":   return 0x230a;
    case "rfloor":   return 0x230b;
    case "lang":     return 0x2329;
    case "rang":     return 0x232a;
    case "loz":      return 0x25ca;
    case "spades":   return 0x2660;
    case "clubs":    return 0x2663;
    case "hearts":   return 0x2665;
    case "diams":    return 0x2666;
    }
}
