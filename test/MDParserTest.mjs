import * as MDParser from "../src/MDParser.mjs";

export {testEmptyDocument};
export {testInlineCode};
export {testCodeBlock};
export {testIndentCodeBlock};
export {testBlockquote};
export {testParagraph};
export {testLineTerminator};
export {testHeading};
export {testBulletList};
export {testOrderedList};
export {testStrongEm};
export {testStrike};
export {testThematicBreak};
export {testLink};
export {testImage};
export {testReferences};
export {testEntity};

function testEmptyDocument() {
    test("", {
        "type": "Document",
        "body": []
    });

    test("  \t    \t       \t       ", {
        "type": "Document",
        "body": []
    });
}

function testInlineCode() {
    test("`", {
        "type": "Document",
        "body": [
            {
                "type": "Paragraph",
                "body": [
                    {
                        "type": "Text",
                        "value": "`"
                    }
                ]
            }
        ]
    });

    test("`asd`", {
        "type": "Document",
        "body": [
            {
                "type": "Paragraph",
                "body": [
                    {
                        "type": "Code",
                        "value": "asd"
                    }
                ]
            }
        ]
    });

    test("`` as", {
        "type": "Document",
        "body": [
            {
                "type": "Paragraph",
                "body": [
                    {
                        "type": "Code",
                        "value": ""
                    },
                    {
                        "type": "Text",
                        "value": " as"
                    }
                ]
            }
        ]
    });

    test("``` a` b", {
        "type": "Document",
        "body": [
            {
                "type": "CodeBlock",
                "value": "",
                "lang": "a` b"
            }
        ]
    });

    test("`` a` b`", {
        "type": "Document",
        "body": [
            {
                "type": "Paragraph",
                "body": [
                    {
                        "type": "Code",
                        "value": ""
                    },
                    {
                        "type": "Text",
                        "value": " a` b`"
                    }
                ]
            }
        ]
    });
}

function testCodeBlock() {
    test("```", {
        "type": "Document",
        "body": [
            {
                "type": "CodeBlock",
                "value": "",
                "lang": null
            }
        ]
    });

    test("```````", {
        "type": "Document",
        "body": [
            {
                "type": "CodeBlock",
                "value": "",
                "lang": null
            }
        ]
    });

    test("```javascript", {
        "type": "Document",
        "body": [
            {
                "type": "CodeBlock",
                "value": "",
                "lang": "javascript"
            }
        ]
    });

    test("````javascript", {
        "type": "Document",
        "body": [
            {
                "type": "CodeBlock",
                "value": "",
                "lang": "javascript"
            }
        ]
    });

    test("```   javascript    ", {
        "type": "Document",
        "body": [
            {
                "type": "CodeBlock",
                "value": "",
                "lang": "javascript"
            }
        ]
    });

    test("```\ncall()", {
        "type": "Document",
        "body": [
            {
                "type": "CodeBlock",
                "value": "call()",
                "lang": null
            }
        ]
    });

    test("```\ncall()\n\nend()\n```", {
        "type": "Document",
        "body": [
            {
                "type": "CodeBlock",
                "value": "call()\n\nend()\n",
                "lang": null
            }
        ]
    });

    test("~~~", {
        "type": "Document",
        "body": [
            {
                "type": "CodeBlock",
                "value": "",
                "lang": null
            }
        ]
    });

    test("~~~\n```", {
        "type": "Document",
        "body": [
            {
                "type": "CodeBlock",
                "value": "```",
                "lang": null
            }
        ]
    });

    test("```\n~~~", {
        "type": "Document",
        "body": [
            {
                "type": "CodeBlock",
                "value": "~~~",
                "lang": null
            }
        ]
    });

    test("````\naaa\n```\n``````", {
        "type": "Document",
        "body": [
            {
                "type": "CodeBlock",
                "value": "aaa\n```\n",
                "lang": null
            }
        ]
    });
}

function testIndentCodeBlock() {
    test("                 ", {
        "type": "Document",
        "body": []
    });

    test("          \t\t    ", {
        "type": "Document",
        "body": []
    });

    test("    call()", {
        "type": "Document",
        "body": [
            {
                "type": "CodeBlock",
                "value": "call()",
                "lang": null
            }
        ]
    });

    test("     call()", {
        "type": "Document",
        "body": [
            {
                "type": "CodeBlock",
                "value": " call()",
                "lang": null
            }
        ]
    });

    test("    call()\n    call2()", {
        "type": "Document",
        "body": [
            {
                "type": "CodeBlock",
                "value": "call()\ncall2()",
                "lang": null
            }
        ]
    });

    test("    call()\n   \n    call2()", {
        "type": "Document",
        "body": [
            {
                "type": "CodeBlock",
                "value": "call()",
                "lang": null
            },
            {
                "type": "CodeBlock",
                "value": "call2()",
                "lang": null
            }
        ]
    });
}

function testBlockquote() {
    test("> hello", {
        "type": "Document",
        "body": [
            {
                "type": "Blockquote",
                "body": [{
                    "type": "Paragraph",
                    "body": [
                        {
                            "type": "Text",
                            "value": "hello"
                        }
                    ]
                }]
            }
        ]
    });

    test("> a\n> b", {
        "type": "Document",
        "body": [
            {
                "type": "Blockquote",
                "body": [
                    {
                        "type": "Paragraph",
                        "body": [
                            {
                                "type": "Text",
                                "value": "a"
                            },
                            {
                                "type": "Softbreak"
                            },
                            {
                                "type": "Text",
                                "value": "b"
                            }
                        ]
                    }
                ]
            }
        ]
    });

    test(">   hello", {
        "type": "Document",
        "body": [
            {
                "type": "Blockquote",
                "body": [{
                    "type": "Paragraph",
                    "body": [
                        {
                            "type": "Text",
                            "value": "hello"
                        }
                    ]
                }]
            }
        ]
    });

    test("   >   hello", {
        "type": "Document",
        "body": [
            {
                "type": "Blockquote",
                "body": [{
                    "type": "Paragraph",
                    "body": [
                        {
                            "type": "Text",
                            "value": "hello"
                        }
                    ]
                }]
            }
        ]
    });

    test(">    hello", {
        "type": "Document",
        "body": [
            {
                "type": "Blockquote",
                "body": [{
                    "type": "CodeBlock",
                    "value": "hello",
                    "lang": null
                }]
            }
        ]
    });

    test("># Heading", {
        "type": "Document",
        "body": [
            {
                "type": "Blockquote",
                "body": [{
                    "type": "Heading",
                    "depth": 1,
                    "body": [
                        {
                            "type": "Text",
                            "value": "Heading"
                        }
                    ]
                }]
            }
        ]
    });

    test(">> text", {
        "type": "Document",
        "body": [
            {
                "type": "Blockquote",
                "body": [
                    {
                        "type": "Blockquote",
                        "body": [
                            {
                                "type": "Paragraph",
                                "body": [
                                    {
                                        "type": "Text",
                                        "value": "text"
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    });

    test("> # heading\n> text", {
        "type": "Document",
        "body": [
            {
                "type": "Blockquote",
                "body": [
                    {
                        "type": "Heading",
                        "depth": 1,
                        "body": [
                            {
                                "type": "Text",
                                "value": "heading"
                            }
                        ]
                    },
                    {
                        "type": "Paragraph",
                        "body": [
                            {
                                "type": "Text",
                                "value": "text"
                            }
                        ]
                    }
                ],
            }
        ]
    });

    test("> hello\n> world", {
        "type": "Document",
        "body": [
            {
                "type": "Blockquote",
                "body": [
                    {
                        "type": "Paragraph",
                        "body": [
                            {
                                "type": "Text",
                                "value": "hello"
                            },
                            {
                                "type": "Softbreak"
                            },
                            {
                                "type": "Text",
                                "value": "world"
                            }
                        ]
                    }
                ]
            }
        ]
    });

    test(">> hello\n> world", {
        "type": "Document",
        "body": [
            {
                "type": "Blockquote",
                "body": [
                    {
                        "type": "Blockquote",
                        "body": [
                            {
                                "type": "Paragraph",
                                "body": [
                                    {
                                        "type": "Text",
                                        "value": "hello"
                                    },
                                    {
                                        "type": "Softbreak"
                                    },
                                    {
                                        "type": "Text",
                                        "value": "world"
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    });

    test("> hello\n>> world", {
        "type": "Document",
        "body": [
            {
                "type": "Blockquote",
                "body": [
                    {
                        "type": "Paragraph",
                        "body": [
                            {
                                "type": "Text",
                                "value": "hello"
                            }
                        ]
                    },
                    {
                        "type": "Blockquote",
                        "body": [
                            {
                                "type": "Paragraph",
                                "body": [
                                    {
                                        "type": "Text",
                                        "value": "world"
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    });

    test("> hello\n\n> world", {
        "type": "Document",
        "body": [
            {
                "type": "Blockquote",
                "body": [
                    {
                        "type": "Paragraph",
                        "body": [
                            {
                                "type": "Text",
                                "value": "hello"
                            }
                        ]
                    }
                ]
            },
            {
                "type": "Blockquote",
                "body": [
                    {
                        "type": "Paragraph",
                        "body": [
                            {
                                "type": "Text",
                                "value": "world"
                            }
                        ]
                    }
                ]
            }
        ]
    });
}

function testParagraph() {
    test("abc 123", {
        "type": "Document",
        "body": [
            {
                "type": "Paragraph",
                "body": [
                    {
                        "type": "Text",
                        "value": "abc 123"
                    }
                ]
            }
        ]
    });

    test("abc\n  123", {
        "type": "Document",
        "body": [
            {
                "type": "Paragraph",
                "body": [
                    {
                        "type": "Text",
                        "value": "abc"
                    },
                    {
                        "type": "Softbreak"
                    },
                    {
                        "type": "Text",
                        "value": "123"
                    }
                ]
            }
        ]
    });

    test("abc\n      123", {
        "type": "Document",
        "body": [
            {
                "type": "Paragraph",
                "body": [
                    {
                        "type": "Text",
                        "value": "abc"
                    },
                    {
                        "type": "Softbreak"
                    },
                    {
                        "type": "Text",
                        "value": "123"
                    }
                ]
            }
        ]
    });

    test("abc\n\nabc", {
        "type": "Document",
        "body": [
            {
                "type": "Paragraph",
                "body": [
                    {
                        "type": "Text",
                        "value": "abc"
                    },
                ]
            },
            {
                "type": "Paragraph",
                "body": [
                    {
                        "type": "Text",
                        "value": "abc"
                    },
                ]
            }
        ]
    });
}

function testLineTerminator() {
    test("abc\n123", {
        "type": "Document",
        "body": [
            {
                "type": "Paragraph",
                "body": [
                    {
                        "type": "Text",
                        "value": "abc"
                    },
                    {
                        "type": "Softbreak"
                    },
                    {
                        "type": "Text",
                        "value": "123"
                    }
                ]
            }
        ]
    });

    test("abc    \n123", {
        "type": "Document",
        "body": [
            {
                "type": "Paragraph",
                "body": [
                    {
                        "type": "Text",
                        "value": "abc"
                    },
                    {
                        "type": "Linebreak"
                    },
                    {
                        "type": "Text",
                        "value": "123"
                    }
                ]
            }
        ]
    });

    test("abc\\\n123", {
        "type": "Document",
        "body": [
            {
                "type": "Paragraph",
                "body": [
                    {
                        "type": "Text",
                        "value": "abc"
                    },
                    {
                        "type": "Linebreak"
                    },
                    {
                        "type": "Text",
                        "value": "123"
                    }
                ]
            }
        ]
    });
}

function testHeading() {
    test("#", {
        "type": "Document",
        "body": [
            {
                "type": "Heading",
                "depth": 1,
                "body": []
            }
        ]
    });

    test("    # a", {
        "type": "Document",
        "body": [
            {
                "type": "CodeBlock",
                "value": "# a",
                "lang": null
            }
        ]
    });

    test("# heading1", {
        "type": "Document",
        "body": [
            {
                "type": "Heading",
                "depth": 1,
                "body": [
                    {
                        "type": "Text",
                        "value": "heading1"
                    }
                ]
            }
        ]
    });

    test("## heading2", {
        "type": "Document",
        "body": [
            {
                "type": "Heading",
                "depth": 2,
                "body": [
                    {
                        "type": "Text",
                        "value": "heading2"
                    }
                ]
            }
        ]
    });

    test("### heading3", {
        "type": "Document",
        "body": [
            {
                "type": "Heading",
                "depth": 3,
                "body": [
                    {
                        "type": "Text",
                        "value": "heading3"
                    }
                ]
            }
        ]
    });

    test("#### heading4", {
        "type": "Document",
        "body": [
            {
                "type": "Heading",
                "depth": 4,
                "body": [
                    {
                        "type": "Text",
                        "value": "heading4"
                    }
                ]
            }
        ]
    });

    test("##### heading5", {
        "type": "Document",
        "body": [
            {
                "type": "Heading",
                "depth": 5,
                "body": [
                    {
                        "type": "Text",
                        "value": "heading5"
                    }
                ]
            }
        ]
    });

    test("###### heading6", {
        "type": "Document",
        "body": [
            {
                "type": "Heading",
                "depth": 6,
                "body": [
                    {
                        "type": "Text",
                        "value": "heading6"
                    }
                ]
            }
        ]
    });

    test("   ###### heading6", {
        "type": "Document",
        "body": [
            {
                "type": "Heading",
                "depth": 6,
                "body": [
                    {
                        "type": "Text",
                        "value": "heading6"
                    }
                ]
            }
        ]
    });

    test("####### heading7", {
        "type": "Document",
        "body": [
            {
                "type": "Paragraph",
                "body": [
                    {
                        "type": "Text",
                        "value": "####### heading7"
                    }
                ]
            }
        ]
    });

    test(" ####### heading7", {
        "type": "Document",
        "body": [
            {
                "type": "Paragraph",
                "body": [
                    {
                        "type": "Text",
                        "value": "####### heading7"
                    }
                ]
            }
        ]
    });
}

function testBulletList() {
    test("-", {
        "type": "Document",
        "body": [
            {
                "type": "List",
                "listType": "bullet",
                "tight": true,
                "items": [
                    {
                        "type": "ListItem",
                        "body": []
                    }
                ]
            }
        ]
    });

    test("-a", {
        "type": "Document",
        "body": [
            {
                "type": "Paragraph",
                "body": [
                    {
                        "type": "Text",
                        "value": "-a"
                    }
                ]
            }
        ]
    });

    test("- a\n- b", {
        "type": "Document",
        "body": [
            {
                "type": "List",
                "listType": "bullet",
                "tight": true,
                "items": [
                    {
                        "type": "ListItem",
                        "body": [{
                            "type": "Paragraph",
                            "body": [
                                {
                                    "type": "Text",
                                    "value": "a"
                                }
                            ]
                        }]
                    },
                    {
                        "type": "ListItem",
                        "body": [{
                            "type": "Paragraph",
                            "body": [
                                {
                                    "type": "Text",
                                    "value": "b"
                                }
                            ]
                        }]
                    }
                ]
            }
        ]
    });

    test("- a\n   - b", {
        "type": "Document",
        "body": [
            {
                "type": "List",
                "listType": "bullet",
                "tight": true,
                "items": [
                    {
                        "type": "ListItem",
                        "body": [
                            {
                                "type": "Paragraph",
                                "body": [
                                    {
                                        "type": "Text",
                                        "value": "a"
                                    }
                                ]
                            },
                            {
                                "type": "List",
                                "listType": "bullet",
                                "tight": true,
                                "items": [
                                    {
                                        "type": "ListItem",
                                        "body": [
                                            {
                                                "type": "Paragraph",
                                                "body": [
                                                    {
                                                        "type": "Text",
                                                        "value": "b"
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    });

    test("- a\n\n  - b", {
        "type": "Document",
        "body": [
            {
                "type": "List",
                "listType": "bullet",
                "tight": false,
                "items": [
                    {
                        "type": "ListItem",
                        "body": [{
                            "type": "Paragraph",
                            "body": [
                                {
                                    "type": "Text",
                                    "value": "a"
                                }
                            ]
                        }]
                    },
                    {
                        "type": "ListItem",
                        "body": [{
                            "type": "Paragraph",
                            "body": [
                                {
                                    "type": "Text",
                                    "value": "b"
                                }
                            ]
                        }]
                    }
                ]
            }
        ]
    });

    test("- a\n\n  - b\n\ntext", {
        "type": "Document",
        "body": [
            {
                "type": "List",
                "listType": "bullet",
                "tight": false,
                "items": [
                    {
                        "type": "ListItem",
                        "body": [{
                            "type": "Paragraph",
                            "body": [
                                {
                                    "type": "Text",
                                    "value": "a"
                                }
                            ]
                        }]
                    },
                    {
                        "type": "ListItem",
                        "body": [{
                            "type": "Paragraph",
                            "body": [
                                {
                                    "type": "Text",
                                    "value": "b"
                                }
                            ]
                        }]
                    }
                ],
            },
            {
                "type": "Paragraph",
                "body": [
                    {
                        "type": "Text",
                        "value": "text"
                    }
                ]
            }
        ]
    });

    test("- a\n\n\n  - b", {
        "type": "Document",
        "body": [
            {
                "type": "List",
                "listType": "bullet",
                "tight": false,
                "items": [
                    {
                        "type": "ListItem",
                        "body": [{
                            "type": "Paragraph",
                            "body": [
                                {
                                    "type": "Text",
                                    "value": "a"
                                }
                            ]
                        }]
                    },
                    {
                        "type": "ListItem",
                        "body": [{
                            "type": "Paragraph",
                            "body": [
                                {
                                    "type": "Text",
                                    "value": "b"
                                }
                            ]
                        }]
                    }
                ]
            }
        ]
    });

    test("* a\n* b", {
        "type": "Document",
        "body": [
            {
                "type": "List",
                "listType": "bullet",
                "tight": true,
                "items": [
                    {
                        "type": "ListItem",
                        "body": [{
                            "type": "Paragraph",
                            "body": [
                                {
                                    "type": "Text",
                                    "value": "a"
                                }
                            ]
                        }]
                    },
                    {
                        "type": "ListItem",
                        "body": [{
                            "type": "Paragraph",
                            "body": [
                                {
                                    "type": "Text",
                                    "value": "b"
                                }
                            ]
                        }]
                    }
                ]
            }
        ]
    });

    test("+ a\n+ b", {
        "type": "Document",
        "body": [
            {
                "type": "List",
                "listType": "bullet",
                "tight": true,
                "items": [
                    {
                        "type": "ListItem",
                        "body": [{
                            "type": "Paragraph",
                            "body": [
                                {
                                    "type": "Text",
                                    "value": "a"
                                }
                            ]
                        }]
                    },
                    {
                        "type": "ListItem",
                        "body": [{
                            "type": "Paragraph",
                            "body": [
                                {
                                    "type": "Text",
                                    "value": "b"
                                }
                            ]
                        }]
                    }
                ]
            }
        ]
    });

    test("+ a\n* b", {
        "type": "Document",
        "body": [
            {
                "type": "List",
                "listType": "bullet",
                "tight": true,
                "items": [
                    {
                        "type": "ListItem",
                        "body": [
                            {
                                "type": "Paragraph",
                                "body": [
                                    {
                                        "type": "Text",
                                        "value": "a"
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                "type": "List",
                "listType": "bullet",
                "tight": true,
                "items": [
                    {
                        "type": "ListItem",
                        "body": [
                            {
                                "type": "Paragraph",
                                "body": [
                                    {
                                        "type": "Text",
                                        "value": "b"
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    });
}

function testOrderedList() {
    test("1) list", {
        "type": "Document",
        "body": [
            {
                "type": "List",
                "listType": "ordered",
                "tight": true,
                "delimiter": "paren",
                "start": 1,
                "items": [
                    {
                        "type": "ListItem",
                        "body": [
                            {
                                "type": "Paragraph",
                                "body": [
                                    {
                                        "type": "Text",
                                        "value": "list"
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    });

    test("1)", {
        "type": "Document",
        "body": [
            {
                "type": "List",
                "listType": "ordered",
                "tight": true,
                "delimiter": "paren",
                "start": 1,
                "items": [
                    {
                        "type": "ListItem",
                        "body": []
                    }
                ]
            }
        ]
    });

    test("1).", {
        "type": "Document",
        "body": [
            {
                "type": "Paragraph",
                "body": [
                    {
                        "type": "Text",
                        "value": "1)."
                    }
                ]
            }
        ]
    });

    test("1) a\n 2) b", {
        "type": "Document",
        "body": [
            {
                "type": "List",
                "listType": "ordered",
                "tight": true,
                "delimiter": "paren",
                "start": 1,
                "items": [
                    {
                        "type": "ListItem",
                        "body": [
                            {
                                "type": "Paragraph",
                                "body": [
                                    {
                                        "type": "Text",
                                        "value": "a"
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "type": "ListItem",
                        "body": [
                            {
                                "type": "Paragraph",
                                "body": [
                                    {
                                        "type": "Text",
                                        "value": "b"
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    });

    test("1. a\n 2. b", {
        "type": "Document",
        "body": [
            {
                "type": "List",
                "listType": "ordered",
                "tight": true,
                "delimiter": "period",
                "start": 1,
                "items": [
                    {
                        "type": "ListItem",
                        "body": [
                            {
                                "type": "Paragraph",
                                "body": [
                                    {
                                        "type": "Text",
                                        "value": "a"
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "type": "ListItem",
                        "body": [
                            {
                                "type": "Paragraph",
                                "body": [
                                    {
                                        "type": "Text",
                                        "value": "b"
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    });

    test("1) a\n\n 2) b", {
        "type": "Document",
        "body": [
            {
                "type": "List",
                "listType": "ordered",
                "tight": false,
                "delimiter": "paren",
                "start": 1,
                "items": [
                    {
                        "type": "ListItem",
                        "body": [
                            {
                                "type": "Paragraph",
                                "body": [
                                    {
                                        "type": "Text",
                                        "value": "a"
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "type": "ListItem",
                        "body": [
                            {
                                "type": "Paragraph",
                                "body": [
                                    {
                                        "type": "Text",
                                        "value": "b"
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    });

    test("1. a\n 2) b", {
        "type": "Document",
        "body": [
            {
                "type": "List",
                "listType": "ordered",
                "tight": true,
                "delimiter": "period",
                "start": 1,
                "items": [
                    {
                        "type": "ListItem",
                        "body": [
                            {
                                "type": "Paragraph",
                                "body": [
                                    {
                                        "type": "Text",
                                        "value": "a"
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                "type": "List",
                "listType": "ordered",
                "tight": true,
                "delimiter": "paren",
                "start": 2,
                "items": [
                    {
                        "type": "ListItem",
                        "body": [
                            {
                                "type": "Paragraph",
                                "body": [
                                    {
                                        "type": "Text",
                                        "value": "b"
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    });
}

function testStrongEm() {
    test("*hello*", {
        "type": "Document",
        "body": [
            {
                "type": "Paragraph",
                "body": [
                    {
                        "type": "Emphasis",
                        "body": [
                            {
                                "type": "Text",
                                "value": "hello"
                            }
                        ]
                    }
                ]
            }
        ]
    });

    test("*hello", {
        "type": "Document",
        "body": [
            {
                "type": "Paragraph",
                "body": [
                    {
                        "type": "Text",
                        "value": "*hello"
                    }
                ]
            }
        ]
    });

    test("hello*", {
        "type": "Document",
        "body": [
            {
                "type": "Paragraph",
                "body": [
                    {
                        "type": "Text",
                        "value": "hello*"
                    }
                ]
            }
        ]
    });

    test("hello**", {
        "type": "Document",
        "body": [
            {
                "type": "Paragraph",
                "body": [
                    {
                        "type": "Text",
                        "value": "hello"
                    },
                    {
                        "type": "Text",
                        "value": "**"
                    }
                ]
            }
        ]
    });

    test("hello****", {
        "type": "Document",
        "body": [
            {
                "type": "Paragraph",
                "body": [
                    {
                        "type": "Text",
                        "value": "hello****"
                    }
                ]
            }
        ]
    });

    test(" as * hello*__ * asd", {
        "type": "Document",
        "body": [
            {
                "type": "Paragraph",
                "body": [
                    {
                        "type": "Text",
                        "value": "as"
                    },
                    {
                        "type": "Text",
                        "value": " "
                    },
                    {
                        "type": "Text",
                        "value": "* hello"
                    },
                    {
                        "type": "Text",
                        "value": "*"
                    },
                    {
                        "type": "Text",
                        "value": "__"
                    },
                    {
                        "type": "Text",
                        "value": " "
                    },
                    {
                        "type": "Text",
                        "value": "* asd"
                    }
                ]
            }
        ]
    });

    test("_hello_", {
        "type": "Document",
        "body": [
            {
                "type": "Paragraph",
                "body": [
                    {
                        "type": "Emphasis",
                        "body": [
                            {
                                "type": "Text",
                                "value": "hello"
                            }
                        ]
                    }
                ]
            }
        ]
    });

    test("_hello", {
        "type": "Document",
        "body": [
            {
                "type": "Paragraph",
                "body": [
                    {
                        "type": "Text",
                        "value": "_hello"
                    }
                ]
            }
        ]
    });

    test("hello_", {
        "type": "Document",
        "body": [
            {
                "type": "Paragraph",
                "body": [
                    {
                        "type": "Text",
                        "value": "hello_"
                    }
                ]
            }
        ]
    });

    test("hello__", {
        "type": "Document",
        "body": [
            {
                "type": "Paragraph",
                "body": [
                    {
                        "type": "Text",
                        "value": "hello"
                    },
                    {
                        "type": "Text",
                        "value": "__"
                    }
                ]
            }
        ]
    });

    test("hello____", {
        "type": "Document",
        "body": [
            {
                "type": "Paragraph",
                "body": [
                    {
                        "type": "Text",
                        "value": "hello____"
                    }
                ]
            }
        ]
    });

}

function testStrike() {
    test("~~hello~~", {
        "type": "Document",
        "body": [
            {
                "type": "Paragraph",
                "body": [
                    {
                        "type": "Delete",
                        "body": [
                            {
                                "type": "Text",
                                "value": "hello"
                            }
                        ]
                    }
                ]
            }
        ]
    });

    test("~~hello", {
        "type": "Document",
        "body": [
            {
                "type": "Paragraph",
                "body": [
                    {
                        "type": "Text",
                        "value": "~~hello"
                    }
                ]
            }
        ]
    });

    test("hello~~", {
        "type": "Document",
        "body": [
            {
                "type": "Paragraph",
                "body": [
                    {
                        "type": "Text",
                        "value": "hello"
                    },
                    {
                        "type": "Text",
                        "value": "~~"
                    }
                ]
            }
        ]
    });

    test("hello~~~", {
        "type": "Document",
        "body": [
            {
                "type": "Paragraph",
                "body": [
                    {
                        "type": "Text",
                        "value": "hello"
                    },
                    {
                        "type": "Text",
                        "value": "~~~"
                    }
                ]
            }
        ]
    });

    test("hello~~~~", {
        "type": "Document",
        "body": [
            {
                "type": "Paragraph",
                "body": [
                    {
                        "type": "Text",
                        "value": "hello"
                    },
                    {
                        "type": "Delete",
                        "body": []
                    }
                ]
            }
        ]
    });
}

function testThematicBreak() {
    test("***", {
        "type": "Document",
        "body": [
            {
                "type": "thematicBreak"
            }
        ]
    });

    test("  *  *     *   ", {
        "type": "Document",
        "body": [
            {
                "type": "thematicBreak"
            }
        ]
    });

    test("    ***", {
        "type": "Document",
        "body": [
            {
                "type": "CodeBlock",
                "value": "***",
                "lang": null
            }
        ]
    });

    test("  *  *    a", {
        "type": "Document",
        "body": [
            {
                "type": "List",
                "listType": "bullet",
                "tight": true,
                "items": [
                    {
                        "type": "ListItem",
                        "body": [
                            {
                                "type": "Paragraph",
                                "body": [
                                    {
                                        "type": "Text",
                                        "value": "* a"
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    });

    test("---", {
        "type": "Document",
        "body": [
            {
                "type": "thematicBreak"
            }
        ]
    });

    test("  -  -     -   ", {
        "type": "Document",
        "body": [
            {
                "type": "thematicBreak"
            }
        ]
    });

    test("    ---", {
        "type": "Document",
        "body": [
            {
                "type": "CodeBlock",
                "value": "---",
                "lang": null
            }
        ]
    });

    test("  -  -    a", {
        "type": "Document",
        "body": [
            {
                "type": "List",
                "listType": "bullet",
                "tight": true,
                "items": [
                    {
                        "type": "ListItem",
                        "body": [
                            {
                                "type": "Paragraph",
                                "body": [
                                    {
                                        "type": "Text",
                                        "value": "- a"
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    });

    test("___", {
        "type": "Document",
        "body": [
            {
                "type": "thematicBreak"
            }
        ]
    });

    test("  _  _     _   ", {
        "type": "Document",
        "body": [
            {
                "type": "thematicBreak"
            }
        ]
    });

    test("    ___", {
        "type": "Document",
        "body": [
            {
                "type": "CodeBlock",
                "value": "___",
                "lang": null
            }
        ]
    });

    test("  _  _    a", {
        "type": "Document",
        "body": [
            {
                "type": "List",
                "listType": "bullet",
                "tight": true,
                "items": [
                    {
                        "type": "ListItem",
                        "body": [
                            {
                                "type": "Paragraph",
                                "body": [
                                    {
                                        "type": "Text",
                                        "value": "_ a"
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    });
}

function testLink() {
    test("[](#link \"title\")", {
        "type": "Document",
        "body": [
            {
                "type": "Paragraph",
                "body": [
                    {
                        "type": "Link",
                        "destination": "#link",
                        "title": "title",
                        "body": []
                    }
                ]
            }
        ]
    });

    test("[](#link 'title')", {
        "type": "Document",
        "body": [
            {
                "type": "Paragraph",
                "body": [
                    {
                        "type": "Link",
                        "destination": "#link",
                        "title": "title",
                        "body": []
                    }
                ]
            }
        ]
    });

    test("[](#link (title))", {
        "type": "Document",
        "body": [
            {
                "type": "Paragraph",
                "body": [
                    {
                        "type": "Link",
                        "destination": "#link",
                        "title": "title",
                        "body": []
                    }
                ]
            }
        ]
    });

    test("[](#link       )", {
        "type": "Document",
        "body": [
            {
                "type": "Paragraph",
                "body": [
                    {
                        "type": "Link",
                        "destination": "#link",
                        "title": null,
                        "body": []
                    }
                ]
            }
        ]
    });

    test("[](#link)", {
        "type": "Document",
        "body": [
            {
                "type": "Paragraph",
                "body": [
                    {
                        "type": "Link",
                        "destination": "#link",
                        "title": null,
                        "body": []
                    }
                ]
            }
        ]
    });

    test("[a](#link)", {
        "type": "Document",
        "body": [
            {
                "type": "Paragraph",
                "body": [
                    {
                        "type": "Link",
                        "destination": "#link",
                        "title": null,
                        "body": [
                            {
                                "type": "Text",
                                "value": "a"
                            }
                        ]
                    }
                ]
            }
        ]
    });

    test("[]", {
        "type": "Document",
        "body": [
            {
                "type": "Paragraph",
                "body": [
                    {
                        "type": "Text",
                        "value": "[]"
                    }
                ]
            }
        ]
    });

    test("[", {
        "type": "Document",
        "body": [
            {
                "type": "Paragraph",
                "body": [
                    {
                        "type": "Text",
                        "value": "["
                    }
                ]
            }
        ]
    });

    test("[a](b", {
        "type": "Document",
        "body": [
            {
                "type": "Paragraph",
                "body": [
                    {
                        "type": "Text",
                        "value": "[a](b"
                    }
                ]
            }
        ]
    });
}

function testImage() {
    test("![](#link \"title\")", {
        "type": "Document",
        "body": [
            {
                "type": "Paragraph",
                "body": [
                    {
                        "type": "Image",
                        "destination": "#link",
                        "title": "title",
                        "body": []
                    }
                ]
            }
        ]
    });

    test("![](#link       )", {
        "type": "Document",
        "body": [
            {
                "type": "Paragraph",
                "body": [
                    {
                        "type": "Image",
                        "destination": "#link",
                        "title": null,
                        "body": []
                    }
                ]
            }
        ]
    });

    test("![](#link)", {
        "type": "Document",
        "body": [
            {
                "type": "Paragraph",
                "body": [
                    {
                        "type": "Image",
                        "destination": "#link",
                        "title": null,
                        "body": []
                    }
                ]
            }
        ]
    });

    test("![a](#link)", {
        "type": "Document",
        "body": [
            {
                "type": "Paragraph",
                "body": [
                    {
                        "type": "Image",
                        "destination": "#link",
                        "title": null,
                        "body": [
                            {
                                "type": "Text",
                                "value": "a"
                            }
                        ]
                    }
                ]
            }
        ]
    });

    test("![]", {
        "type": "Document",
        "body": [
            {
                "type": "Paragraph",
                "body": [
                    {
                        "type": "Text",
                        "value": "![]"
                    }
                ]
            }
        ]
    });

    test("![", {
        "type": "Document",
        "body": [
            {
                "type": "Paragraph",
                "body": [
                    {
                        "type": "Text",
                        "value": "!["
                    }
                ]
            }
        ]
    });

    test("![a](b", {
        "type": "Document",
        "body": [
            {
                "type": "Paragraph",
                "body": [
                    {
                        "type": "Text",
                        "value": "![a](b"
                    }
                ]
            }
        ]
    });
}

function testReferences() {
    test("[a]: /url \"title\"", {
        "type": "Document",
        "body": [
            {
                "type": "Paragraph",
                "body": []
            }
        ]
    });

    test("[a]: /url \"title\"\n[a]", {
        "type": "Document",
        "body": [
            {
                "type": "Paragraph",
                "body": [
                    {
                        "type": "Link",
                        "destination": "/url",
                        "title": "title",
                        "body": [
                            {
                                "type": "Text",
                                "value": "a"
                            }
                        ]
                    }
                ]
            }
        ]
    });

    test("[a]: /url \"title\"\n[b][a]", {
        "type": "Document",
        "body": [
            {
                "type": "Paragraph",
                "body": [
                    {
                        "type": "Link",
                        "destination": "/url",
                        "title": "title",
                        "body": [
                            {
                                "type": "Text",
                                "value": "b"
                            }
                        ]
                    }
                ]
            }
        ]
    });

    test("[a]: /url \"title\"\n[b][b]", {
        "type": "Document",
        "body": [
            {
                "type": "Paragraph",
                "body": [
                    {
                        "type": "Text",
                        "value": "[b][b]"
                    }
                ]
            }
        ]
    });

    test("[a]: /url \"title\"\n[a][b", {
        "type": "Document",
        "body": [
            {
                "type": "Paragraph",
                "body": [
                    {
                        "type": "Link",
                        "destination": "/url",
                        "title": "title",
                        "body": [
                            {
                                "type": "Text",
                                "value": "a"
                            }
                        ]
                    },
                    {
                        "type": "Text",
                        "value": "[b"
                    }
                ]
            }
        ]
    });

    test("[a]\n[a]: /url \"title\"", {
        "type": "Document",
        "body": [
            {
                "type": "Paragraph",
                "body": [
                    {
                        "type": "Link",
                        "destination": "/url",
                        "title": "title",
                        "body": [
                            {
                                "type": "Text",
                                "value": "a"
                            }
                        ]
                    }
                ]
            }
        ]
    });

    test("[a]\naaaa\n[a]: /url \"title\"", {
        "type": "Document",
        "body": [
            {
                "type": "Paragraph",
                "body": [
                    {
                        "type": "Link",
                        "destination": "/url",
                        "title": "title",
                        "body": [
                            {
                                "type": "Text",
                                "value": "a"
                            }
                        ]
                    },
                    {
                        "type": "Softbreak"
                    },
                    {
                        "type": "Text",
                        "value": "aaaa"
                    }
                ]
            }
        ]
    });
}

function testEntity() {
    test("&", {
        "type": "Document",
        "body": [
            {
                "type": "Paragraph",
                "body": [
                    {
                        "type": "Text",
                        "value": "&amp;"
                    }
                ]
            }
        ]
    });

    test("&nbsp;", {
        "type": "Document",
        "body": [
            {
                "type": "Paragraph",
                "body": [
                    {
                        "type": "Text",
                        "value": " "
                    }
                ]
            }
        ]
    });

    test("&copy;", {
        "type": "Document",
        "body": [
            {
                "type": "Paragraph",
                "body": [
                    {
                        "type": "Text",
                        "value": "©"
                    }
                ]
            }
        ]
    });

    test("&copy1;", {
        "type": "Document",
        "body": [
            {
                "type": "Paragraph",
                "body": [
                    {
                        "type": "Text",
                        "value": "&amp;"
                    },
                    {
                        "type": "Text",
                        "value": "copy1;"
                    }
                ]
            }
        ]
    });

    test("&;", {
        "type": "Document",
        "body": [
            {
                "type": "Paragraph",
                "body": [
                    {
                        "type": "Text",
                        "value": "&amp;"
                    },
                    {
                        "type": "Text",
                        "value": ";"
                    }
                ]
            }
        ]
    });
}

// Internals

function test(input, ast, options) {
    const tree = MDParser.parse(input, options || {});
    const result = JSON.stringify(ast, null, 4);
    const actual = JSON.stringify(tree, null, 4);

    if (actual !== result) {
        throw new Error(`Failed ${input} Expected ${result} got ${actual}`);
    }
}
