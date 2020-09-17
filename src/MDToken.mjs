import * as MDChar from "./MDChar.mjs";

export {toChar};

export const EOF = 0x00;

export const INDENT = MDChar.TAB;
export const EXCLAMATION = MDChar.EXCLAMATION_MARK;
export const QUOTATION = MDChar.QUOTATION_MARK;
export const APOSTROPHE = MDChar.APOSTROPHE;
export const ASSIGN = MDChar.EQUALS_SIGN;
export const HEADING = MDChar.NUMBER_SIGN;
export const PARENL = MDChar.LEFT_PARENTHESIS;
export const PARENR = MDChar.RIGHT_PARENTHESIS;
export const DASH = MDChar.HYPHEN_MINUS;
export const COLON = MDChar.COLON;
export const SEMICOLON = MDChar.SEMICOLON;
export const BLOCKQUOTE = MDChar.GREATER_THEN;
export const BRACKETL = MDChar.LEFT_SQUARE_BRACKET;
export const BACKSLASH = MDChar.REVERSE_SOLIDUS;
export const BRACKETR = MDChar.RIGHT_SQUARE_BRACKET;
export const BACKQUOTE = MDChar.GRAVE_ACCENT;
export const BRACEL = MDChar.LEFT_CURLY_BRACKET;
export const BRACER = MDChar.RIGHT_CURLY_BRACKET;
export const PREFIX = MDChar.TILDE;
export const ENTITY = MDChar.AMPERSAND;

export const WORD = 0xf001;
export const DOUBLE_PREFIX = 0xf002;
export const WHITESPACE = 0xf003;
export const LINEBREAK = 0xf004;
export const CODEBLOCK = 0xf005;
export const BULLET = 0xf006;
export const EM = 0xf007;
export const STRONG = 0xf008;
export const DELETE = 0xf009;
export const CODE = 0xf00a;
export const THEMATIC = 0xf00b;

function toChar(type, value) {
    switch(type) {

    default:
        if (value) {
            return value;
        }
        return String.fromCharCode(type);

    case HEADING:
        return value || "#";
    case LINEBREAK:
        return "\n";

    case WHITESPACE:
        return " ";
    }
}
