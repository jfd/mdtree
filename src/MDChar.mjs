export {isLineBreak};
export {isWhitespace};

export const TAB = 0x09;
export const EXCLAMATION_MARK = 0x21;
export const QUOTATION_MARK = 0x22;
export const NUMBER_SIGN = 0x23;
export const AMPERSAND = 0x26;
export const APOSTROPHE = 0x27;
export const LEFT_PARENTHESIS = 0x28;
export const RIGHT_PARENTHESIS = 0x29;
export const ASTERISK = 0x2a;
export const PLUS_SIGN = 0x2b;
export const HYPHEN_MINUS = 0x2d;
export const FULL_STOP = 0x2e;
export const DIGIT_0 = 0x30;
export const DIGIT_1 = 0x31;
export const DIGIT_2 = 0x32;
export const DIGIT_3 = 0x33;
export const DIGIT_4 = 0x34;
export const DIGIT_5 = 0x35;
export const DIGIT_6 = 0x36;
export const DIGIT_7 = 0x37;
export const DIGIT_8 = 0x38;
export const DIGIT_9 = 0x39;
export const COLON = 0x3a;
export const SEMICOLON = 0x3b;
export const EQUALS_SIGN = 0x3d;
export const GREATER_THEN = 0x3E;
export const LEFT_SQUARE_BRACKET = 0x5b;
export const REVERSE_SOLIDUS = 0x5c;
export const RIGHT_SQUARE_BRACKET = 0x5d;
export const LOW_LINE = 0x5f;
export const GRAVE_ACCENT = 0x60;
export const LEFT_CURLY_BRACKET = 0x7b;
export const RIGHT_CURLY_BRACKET = 0x7d;
export const TILDE = 0x7e;

const whitespaceCodes = [
    9,0,1,
    11,1,1,
    32,0,1,
    160,0,1,
    5760,0,1,
    8192,10,1,
    8239,0,1,
    8287,0,1,
    12288,0,1,
    65279,0,1
];

function isLineBreak(code) {
    return code === 10 || code === 13 || code === 0x2028 || code === 0x2029;
}

function isWhitespace(code) {
    return search(whitespaceCodes, code) === 1;
}

// Internals

function search(table, val) {
    let right = (table.length / 3) - 1;
    let left = 0;
    let mid = 0;
    let test = 0;
    let offset = 0;

    while (left <= right) {
        mid = (left + right) >> 1;
        offset = mid * 3;
        test = table[offset];
        if (val < test) {
            right = mid - 1;
        } else if (val === test || val <= test + table[offset + 1]) {
            return table[offset + 2];
        } else {
            left = mid + 1;
        }
    }

    return 0;
}
