/*
 * JavaScript Obfuscator (https://js.retn0.kr)
 * 
 * Copyright nbsp1221. All rights reserved.
 * License: MIT
 * GitHub Repository: https://github.com/nbsp1221/javascript-obfuscator
 */

const option = {
	useVariable: true
};

const blacklist = {
	// Basic
	upperCase: true,
	lowerCase: true,
	number: false,

	// Special
	space: false,
	dollar: false,          // $
	percent: false,         // %
	asterisk: false,        // *
	underscore: false,      // _
	equals: false,          // =
	singleQuotes: false,    // '
	doubleQuotes: false,    // "
	backtick: false,        // `
	dot: false,             // .
	slash: false,           // /
	backslash: false,       // \
	curlyBrackets: false,   // { or }
	angleBrackets: false    // < or >
};

// Memoization
let internalResults = {};
let digitResults = {};
let characterResults = {};

const resetResults = () => {
	internalResults = {};
	digitResults = {};
	characterResults = {};
};

const INTERNAL = {
	false: {
		isWrap: () => {
			return false;
		},
		result: () => {
			return `![]`;
		}
	},
	true: {
		isWrap: () => {
			return false;
		},
		result: () => {
			return `!![]`;
		}
	},
	undefined: {
		isWrap: () => {
			return true;
		},
		result: () => {
			return `[][[]]`;
		}
	},
	NaN: {
		isWrap: () => {
			return false;
		},
		result: () => {
			return `+[![]]`;
		}
	},
	Infinity: {
		isWrap: () => {
			return false;
		},
		result: () => {
			if (!blacklist.slash) return `${makeDigit(1)}/${makeDigit(0)}`;
			if (!blacklist.number) return `+(1+${makeCharacter('e')}+1000)`;
			return `+(${makeDigit(1)}+${makeCharacter('e')}+[${makeDigit(1)}]+[${makeDigit(0)}]+[${makeDigit(0)}]+[${makeDigit(0)}])`;
		}
	},
	1.1e+101: {
		isWrap: () => {
			return false;
		},
		result: () => {
			if (!blacklist.number) return `+(11+${makeCharacter('e')}+100)`;
			return `+(${makeDigit(1)}+[${makeDigit(1)}]+${makeCharacter('e')}+[${makeDigit(1)}]+[${makeDigit(0)}]+[${makeDigit(0)}])`;
		}
	},
	'function flat() { [native code] }': {
		isWrap: () => {
			return false;
		},
		result: () => {
			return `[][${makeString('flat')}]+[]`;
		}
	},
	'function String() { [native code] }': {
		isWrap: () => {
			return false;
		},
		result: () => {
			return `([]+[])[${makeString('constructor')}]+[]`;
		}
	},
	'[object Object]': {
		isWrap: () => {
			return false;
		},
		result: () => {
			return `[]+{}`;
		}
	},
	'[object Array Iterator]': {
		isWrap: () => {
			return false;
		},
		result: () => {
			return `[][${makeString('entries')}]()+[]`;
		}
	},
	'<sub></sub>': {
		isWrap: () => {
			return true;
		},
		result: () => {
			return `([]+[])[${makeString('sub')}]()`;
		}
	},
	'<font color="undefined"></font>': {
		isWrap: () => {
			return true;
		},
		result: () => {
			return `([]+[])[${makeString('fontcolor')}]()`;
		}
	},
	'function%20flat%28%29%20%7B%20%5Bnative%20code%5D%20%7D': {
		isWrap: () => {
			return true;
		},
		result: () => {
			return makeEval(makeString('return escape([]["flat"])'));
		}
	},
	'%3Csub%3E%3C/sub%3E': {
		isWrap: () => {
			return true;
		},
		result: () => {
			return makeEval(makeString('return escape(([]+[])["sub"]())'));
		}
	}
};

const DIGIT = {
	0: {
		isWrap: () => {
			if (!blacklist.number) return true;
			return false;
		},
		result: () => {
			if (!blacklist.number) return 0;
			return `+[]`;
		}
	},
	1: {
		isWrap: () => {
			if (!blacklist.number) return true;
			return false;
		},
		result: () => {
			if (!blacklist.number) return 1;
			return `+${makeInternal(true)}`;
		}
	},
	2: {
		isWrap: () => {
			if (!blacklist.number) return true;
			return false;
		},
		result: () => {
			if (!blacklist.number) return 2;
			return `${makeInternal(true)}+${makeInternal(true)}`;
		}
	},
	3: {
		isWrap: () => {
			if (!blacklist.number) return true;
			return false;
		},
		result: () => {
			if (!blacklist.number) return 3;
			return `${makeDigit(2)}+${makeInternal(true)}`;
		}
	},
	4: {
		isWrap: () => {
			if (!blacklist.number) return true;
			return false;
		},
		result: () => {
			if (!blacklist.number) return 4;
			if (!blacklist.angleBrackets) return `${makeDigit(2)}<<${makeInternal(true)}`;
			return `${makeDigit(3)}+${makeInternal(true)}`;
		}
	},
	5: {
		isWrap: () => {
			if (!blacklist.number) return true;
			return false;
		},
		result: () => {
			if (!blacklist.number) return 5;
			if (!blacklist.angleBrackets) return `${makeDigit(4, true)}+${makeInternal(true)}`;
			return `${makeDigit(4)}+${makeInternal(true)}`;
		}
	},
	6: {
		isWrap: () => {
			if (!blacklist.number) return true;
			return false;
		},
		result: () => {
			if (!blacklist.number) return 6;
			if (!blacklist.angleBrackets) return `${makeDigit(3)}<<${makeInternal(true)}`;
			if (!blacklist.asterisk) return `${makeDigit(3, true)}*${makeDigit(2, true)}`;
			return `${makeDigit(5)}+${makeInternal(true)}`;
		}
	},
	7: {
		isWrap: () => {
			if (!blacklist.number) return true;
			return false;
		},
		result: () => {
			if (!blacklist.number) return 7;
			if (!blacklist.angleBrackets) return `${makeDigit(6, true)}+${makeInternal(true)}`;
			return `${makeDigit(6)}+${makeInternal(true)}`;
		}
	},
	8: {
		isWrap: () => {
			if (!blacklist.number) return true;
			return false;
		},
		result: () => {
			if (!blacklist.number) return 8;
			if (!blacklist.angleBrackets) return `${makeDigit(2)}<<${makeDigit(2)}`;
			if (!blacklist.asterisk) return `${makeDigit(2, true)}**${makeDigit(3, true)}`;
			return `${makeDigit(7)}+${makeInternal(true)}`;
		}
	},
	9: {
		isWrap: () => {
			if (!blacklist.number) return true;
			return false;
		},
		result: () => {
			if (!blacklist.number) return 9;
			if (!blacklist.angleBrackets) return `${makeDigit(8, true)}+${makeInternal(true)}`;
			if (!blacklist.asterisk) return `${makeDigit(3, true)}**${makeDigit(2, true)}`;
			return `${makeDigit(8)}+${makeInternal(true)}`;
		}
	}
};

const CHARACTER = {
	'a': {
		isWrap: () => {
			return true;
		},
		result: () => {
			if (!blacklist.lowerCase && !isNoWrapString()) return wrapString('a');
			return `(${makeInternal(false)}+[])[${makeDigit(1)}]`;
		}
	},
	'b': {
		isWrap: () => {
			return true;
		},
		result: () => {
			if (!blacklist.lowerCase && !isNoWrapString()) return wrapString('b');
			if (!blacklist.curlyBrackets) return `${makeInternal('[object Object]', true)}[${makeDigit(2)}]`;
			return `${makeInternal('[object Array Iterator]', true)}[${makeDigit(2)}]`;
		}
	},
	'c': {
		isWrap: () => {
			return true;
		},
		result: () => {
			if (!blacklist.lowerCase && !isNoWrapString()) return wrapString('c');
			if (!blacklist.curlyBrackets) return `${makeInternal('[object Object]', true)}[${makeDigit(5)}]`;
			return `${makeInternal('function flat() { [native code] }', true)}[${makeDigit(3)}]`;
		}
	},
	'd': {
		isWrap: () => {
			return true;
		},
		result: () => {
			if (!blacklist.lowerCase && !isNoWrapString()) return wrapString('d');
			return `(${makeInternal(undefined)}+[])[${makeDigit(2)}]`;
		}
	},
	'e': {
		isWrap: () => {
			return true;
		},
		result: () => {
			if (!blacklist.lowerCase && !isNoWrapString()) return wrapString('e');
			return `(${makeInternal(true)}+[])[${makeDigit(3)}]`;
		}
	},
	'f': {
		isWrap: () => {
			return true;
		},
		result: () => {
			if (!blacklist.lowerCase && !isNoWrapString()) return wrapString('f');
			return `(${makeInternal(false)}+[])[${makeDigit(0)}]`;
		}
	},
	'g': {
		isWrap: () => {
			return true;
		},
		result: () => {
			if (!blacklist.lowerCase && !isNoWrapString()) return wrapString('g');
			if (!blacklist.number) return `${makeInternal('function String() { [native code] }', true)}[14]`;
			return `${makeInternal('function String() { [native code] }', true)}[${makeDigit(1)}+[${makeDigit(4)}]]`;
		}
	},
	'h': {
		isWrap: () => {
			return true;
		},
		result: () => {
			if (!blacklist.lowerCase && !isNoWrapString()) return wrapString('h');
			if (!blacklist.number) return `(17)[${makeString('toString')}](20)`;
			return `(+(${makeDigit(1)}+[${makeDigit(7)}]))[${makeString('toString')}](${makeDigit(2)}+[${makeDigit(0)}])`;
		}
	},
	'i': {
		isWrap: () => {
			return true;
		},
		result: () => {
			if (!blacklist.lowerCase && !isNoWrapString()) return wrapString('i');
			if (!blacklist.number) return `(${makeInternal(undefined)}+[])[5]`;
			return `([${makeInternal(false)}]+${makeInternal(undefined)})[${makeDigit(1)}+[${makeDigit(0)}]]`;
		}
	},
	'j': {
		isWrap: () => {
			return true;
		},
		result: () => {
			if (!blacklist.lowerCase && !isNoWrapString()) return wrapString('j');
			if (!blacklist.curlyBrackets) return `${makeInternal('[object Object]', true)}[${makeDigit(3)}]`;
			return `${makeInternal('[object Array Iterator]', true)}[${makeDigit(3)}]`;
		}
	},
	'k': {
		isWrap: () => {
			return true;
		},
		result: () => {
			if (!blacklist.lowerCase && !isNoWrapString()) return wrapString('k');
			if (!blacklist.number) return `(20)[${makeString('toString')}](21)`;
			return `(+(${makeDigit(2)}+[${makeDigit(0)}]))[${makeString('toString')}](${makeDigit(2)}+[${makeDigit(1)}])`;
		}
	},
	'l': {
		isWrap: () => {
			return true;
		},
		result: () => {
			if (!blacklist.lowerCase && !isNoWrapString()) return wrapString('l');
			return `(${makeInternal(false)}+[])[${makeDigit(2)}]`;
		}
	},
	'm': {
		isWrap: () => {
			return true;
		},
		result: () => {
			if (!blacklist.lowerCase && !isNoWrapString()) return wrapString('m');
			if (!blacklist.number) return `((${makeDigit(0)})[${makeString('constructor')}]+[])[11]`;
			return `((${makeDigit(0)})[${makeString('constructor')}]+[])[${makeDigit(1)}+[${makeDigit(1)}]]`;
		}
	},
	'n': {
		isWrap: () => {
			return true;
		},
		result: () => {
			if (!blacklist.lowerCase && !isNoWrapString()) return wrapString('n');
			return `(${makeInternal(undefined)}+[])[${makeDigit(1)}]`;
		}
	},
	'o': {
		isWrap: () => {
			return true;
		},
		result: () => {
			if (!blacklist.lowerCase && !isNoWrapString()) return wrapString('o');
			if (!blacklist.curlyBrackets) return `${makeInternal('[object Object]', true)}[${makeDigit(1)}]`;
			if (!blacklist.number) return `${makeInternal('function flat() { [native code] }', true)}[6]`;
			return `(${makeInternal(true)}+${makeInternal('function flat() { [native code] }')})[${makeDigit(1)}+[${makeDigit(0)}]]`;
		}
	},
	'p': {
		isWrap: () => {
			return true;
		},
		result: () => {
			if (!blacklist.lowerCase && !isNoWrapString()) return wrapString('p');
			if (!blacklist.number) return `(25)[${makeString('toString')}](30)`;
			return `(+(${makeDigit(2)}+[${makeDigit(5)}]))[${makeString('toString')}](${makeDigit(3)}+[${makeDigit(0)}])`;
		}
	},
	'q': {
		isWrap: () => {
			return true;
		},
		result: () => {
			if (!blacklist.lowerCase && !isNoWrapString()) return wrapString('q');
			if (!blacklist.number) return `(26)[${makeString('toString')}](30)`;
			return `(+(${makeDigit(2)}+[${makeDigit(6)}]))[${makeString('toString')}](${makeDigit(3)}+[${makeDigit(0)}])`;
		}
	},
	'r': {
		isWrap: () => {
			return true;
		},
		result: () => {
			if (!blacklist.lowerCase && !isNoWrapString()) return wrapString('r');
			return `(${makeInternal(true)}+[])[${makeDigit(1)}]`;
		}
	},
	's': {
		isWrap: () => {
			return true;
		},
		result: () => {
			if (!blacklist.lowerCase && !isNoWrapString()) return wrapString('s');
			return `(${makeInternal(false)}+[])[${makeDigit(3)}]`;
		}
	},
	't': {
		isWrap: () => {
			return true;
		},
		result: () => {
			if (!blacklist.lowerCase && !isNoWrapString()) return wrapString('t');
			return `(${makeInternal(true)}+[])[${makeDigit(0)}]`;
		}
	},
	'u': {
		isWrap: () => {
			return true;
		},
		result: () => {
			if (!blacklist.lowerCase && !isNoWrapString()) return wrapString('u');
			return `(${makeInternal(undefined)}+[])[${makeDigit(0)}]`;
		}
	},
	'v': {
		isWrap: () => {
			return true;
		},
		result: () => {
			if (!blacklist.lowerCase && !isNoWrapString()) return wrapString('v');
			if (!blacklist.number) return `${makeInternal('function flat() { [native code] }', true)}[23]`;
			return `${makeInternal('function flat() { [native code] }', true)}[${makeDigit(2)}+[${makeDigit(3)}]]`;
		}
	},
	'w': {
		isWrap: () => {
			return true;
		},
		result: () => {
			if (!blacklist.lowerCase && !isNoWrapString()) return wrapString('w');
			if (!blacklist.number) return `(32)[${makeString('toString')}](33)`;
			return `(+(${makeDigit(3)}+[${makeDigit(2)}]))[${makeString('toString')}](${makeDigit(3)}+[${makeDigit(3)}])`;
		}
	},
	'x': {
		isWrap: () => {
			return true;
		},
		result: () => {
			if (!blacklist.lowerCase && !isNoWrapString()) return wrapString('x');
			if (!blacklist.number) return `(33)[${makeString('toString')}](34)`;
			return `(+(${makeDigit(1)}+[${makeDigit(0)}]+[${makeDigit(1)}]))[${makeString('toString')}](${makeDigit(3)}+[${makeDigit(4)}])[${makeDigit(1)}]`;
		}
	},
	'y': {
		isWrap: () => {
			return true;
		},
		result: () => {
			if (!blacklist.lowerCase && !isNoWrapString()) return wrapString('y');
			if (!blacklist.number) return `(${makeInternal(Infinity)}+[])[${makeDigit(7)}]`;
			return `(${makeInternal(NaN)}+[${makeInternal(Infinity)}])[${makeDigit(1)}+[${makeDigit(0)}]]`;
		}
	},
	'z': {
		isWrap: () => {
			return true;
		},
		result: () => {
			if (!blacklist.lowerCase && !isNoWrapString()) return wrapString('z');
			if (!blacklist.number) return `(35)[${makeString('toString')}](36)`;
			return `(+(${makeDigit(3)}+[${makeDigit(5)}]))[${makeString('toString')}](${makeDigit(3)}+[${makeDigit(6)}])`;
		}
	},

	'A': {
		isWrap: () => {
			return true;
		},
		result: () => {
			if (!blacklist.upperCase && !isNoWrapString()) return wrapString('A');
			return `${makeInternal('[object Array Iterator]', true)}[${makeDigit(8)}]`;
		}
	},
	'B': {
		isWrap: () => {
			return true;
		},
		result: () => {
			if (!blacklist.upperCase && !isNoWrapString()) return wrapString('B');
			if (!blacklist.number) return `((${makeInternal(false)})[${makeString('constructor')}]+[])[9]`;
			return `([${makeDigit(0)}]+(${makeInternal(false)})[${makeString('constructor')}])[${makeDigit(1)}+[${makeDigit(0)}]]`;
		}
	},
	'C': {
		isWrap: () => {
			return true;
		},
		result: () => {
			if (!blacklist.upperCase && !isNoWrapString()) return wrapString('C');
			return `${makeInternal('%3Csub%3E%3C/sub%3E', true)}[${makeDigit(2)}]`;
		}
	},
	'D': {
		isWrap: () => {
			return true;
		},
		result: () => {
			if (!blacklist.upperCase && !isNoWrapString()) return wrapString('D');
			if (!blacklist.number) return `${makeInternal('function%20flat%28%29%20%7B%20%5Bnative%20code%5D%20%7D', true)}[48]`;
			return `${makeInternal('function%20flat%28%29%20%7B%20%5Bnative%20code%5D%20%7D', true)}[[${makeDigit(4)}]+[${makeDigit(8)}]]`;
		}
	},
	'E': {
		isWrap: () => {
			return true;
		},
		result: () => {
			if (!blacklist.upperCase && !isNoWrapString()) return wrapString('E');
			return `${makeInternal('%3Csub%3E%3C/sub%3E', true)}[${makeDigit(8)}]`;
		}
	},
	'I': {
		isWrap: () => {
			return true;
		},
		result: () => {
			if (!blacklist.upperCase && !isNoWrapString()) return wrapString('I');
			return `(${makeInternal(Infinity)}+[])[${makeDigit(0)}]`;
		}
	},
	'N': {
		isWrap: () => {
			return true;
		},
		result: () => {
			if (!blacklist.upperCase && !isNoWrapString()) return wrapString('N');
			return `(${makeInternal(NaN)}+[])[${makeDigit(0)}]`;
		}
	},
	'O': {
		isWrap: () => {
			return true;
		},
		result: () => {
			if (!blacklist.upperCase && !isNoWrapString()) return wrapString('O');
			if (!blacklist.curlyBrackets) return `${makeInternal('[object Object]', true)}[${makeDigit(8)}]`;
			return makeEval(makeString('return unescape("%4f")'));
		}
	},
	'S': {
		isWrap: () => {
			return true;
		},
		result: () => {
			if (!blacklist.upperCase && !isNoWrapString()) return wrapString('S');
			if (!blacklist.number) return `${makeInternal('function String() { [native code] }', true)}[9]`;
			return `(${makeDigit(0)}+${makeInternal('function String() { [native code] }')})[${makeDigit(1)}+[${makeDigit(0)}]]`;
		}
	},

	'0': {
		isWrap: () => {
			if (!blacklist.number) return true;
			return false;
		},
		result: () => {
			if (!blacklist.number && !isNoWrapString()) return wrapString('0');
			return `${makeDigit(0, true)}+[]`;
		}
	},
	'1': {
		isWrap: () => {
			if (!blacklist.number) return true;
			return false;
		},
		result: () => {
			if (!blacklist.number && !isNoWrapString()) return wrapString('1');
			return `${makeDigit(1, true)}+[]`;
		}
	},
	'2': {
		isWrap: () => {
			if (!blacklist.number) return true;
			return false;
		},
		result: () => {
			if (!blacklist.number && !isNoWrapString()) return wrapString('2');
			return `${makeDigit(2, true)}+[]`;
		}
	},
	'3': {
		isWrap: () => {
			if (!blacklist.number) return true;
			return false;
		},
		result: () => {
			if (!blacklist.number && !isNoWrapString()) return wrapString('3');
			return `${makeDigit(3, true)}+[]`;
		}
	},
	'4': {
		isWrap: () => {
			if (!blacklist.number) return true;
			return false;
		},
		result: () => {
			if (!blacklist.number && !isNoWrapString()) return wrapString('4');
			return `${makeDigit(4, true)}+[]`;
		}
	},
	'5': {
		isWrap: () => {
			if (!blacklist.number) return true;
			return false;
		},
		result: () => {
			if (!blacklist.number && !isNoWrapString()) return wrapString('5');
			return `${makeDigit(5, true)}+[]`;
		}
	},
	'6': {
		isWrap: () => {
			if (!blacklist.number) return true;
			return false;
		},
		result: () => {
			if (!blacklist.number && !isNoWrapString()) return wrapString('6');
			return `${makeDigit(6, true)}+[]`;
		}
	},
	'7': {
		isWrap: () => {
			if (!blacklist.number) return true;
			return false;
		},
		result: () => {
			if (!blacklist.number && !isNoWrapString()) return wrapString('7');
			return `${makeDigit(7, true)}+[]`;
		}
	},
	'8': {
		isWrap: () => {
			if (!blacklist.number) return true;
			return false;
		},
		result: () => {
			if (!blacklist.number && !isNoWrapString()) return wrapString('8');
			return `${makeDigit(8, true)}+[]`;
		}
	},
	'9': {
		isWrap: () => {
			if (!blacklist.number) return true;
			return false;
		},
		result: () => {
			if (!blacklist.number && !isNoWrapString()) return wrapString('9');
			return `${makeDigit(9, true)}+[]`;
		}
	},

	' ': {
		isWrap: () => {
			return true;
		},
		result: () => {
			if (!blacklist.space && !isNoWrapString()) return wrapString(' ');
			if (!blacklist.curlyBrackets) return `${makeInternal('[object Object]', true)}[${makeDigit(7)}]`;
			if (!blacklist.number) return `${makeInternal('function flat() { [native code] }', true)}[8]`;
			return `(${makeInternal(false)}+${makeInternal('function flat() { [native code] }')})[${makeDigit(2)}+[${makeDigit(0)}]]`;
		}
	},
	'$': {
		isWrap: () => {
			return true;
		},
		result: () => {
			if (!blacklist.dollar && !isNoWrapString()) return wrapString('$');
			return makeEval(makeString('return unescape("%24")'));
		}
	},
	'\n': {
		isWrap: () => {
			return true;
		},
		result: () => {
			if (!blacklist.lowerCase && !blacklist.backslash && !isNoWrapString()) return wrapString('\\n');
			return makeEval(makeString('return unescape("%0a")'));
		}
	},
	'%': {
		isWrap: () => {
			return true;
		},
		result: () => {
			if (!blacklist.percent && !isNoWrapString()) return wrapString('%');
			if (!blacklist.number) return `${makeInternal('function%20flat%28%29%20%7B%20%5Bnative%20code%5D%20%7D', true)}[8]`;
			return `${makeInternal('function%20flat%28%29%20%7B%20%5Bnative%20code%5D%20%7D', true)}[${makeDigit(3)}+[${makeDigit(0)}]]`;
		}
	},
	'*': {
		isWrap: () => {
			return true;
		},
		result: () => {
			if (!blacklist.asterisk && !isNoWrapString()) return wrapString('*');
			return makeEval(makeString('return unescape("%38")'));
		}
	},
	'_': {
		isWrap: () => {
			return true;
		},
		result: () => {
			if (!blacklist.underscore && !isNoWrapString()) return wrapString('_');
			return makeEval(makeString('return unescape("%5f")'));
		}
	},
	'=': {
		isWrap: () => {
			return true;
		},
		result: () => {
			if (!blacklist.equals && !isNoWrapString()) return wrapString('=');
			if (!blacklist.number) return `${makeInternal('<font color="undefined"></font>', true)}[11]`;
			return `${makeInternal('<font color="undefined"></font>', true)}[${makeDigit(1)}+[${makeDigit(1)}]]`;
		}
	},
	'+': {
		isWrap: () => {
			return true;
		},
		result: () => {
			if (!isNoWrapString()) return wrapString('+');
			return `(${makeInternal(1.1e+101)}+[])[${makeDigit(4)}]`;
		}
	},
	"'": {
		isWrap: () => {
			return true;
		},
		result: () => {
			if (!blacklist.singleQuotes) {
				if (!blacklist.doubleQuotes) return `"'"`;
				if (!blacklist.backtick) return "`'`";
				if (!blacklist.backslash) return `'\\''`;
			}

			return makeEval(makeString('return unescape("%27")'));
		}
	},
	'"': {
		isWrap: () => {
			return true;
		},
		result: () => {
			if (!blacklist.doubleQuotes) {
				if (!blacklist.singleQuotes) return `'"'`;
				if (!blacklist.backtick) return '`"`';
				if (!blacklist.backslash) return `"\\""`;
			}

			if (!blacklist.number) return `${makeInternal('<font color="undefined"></font>', true)}[12]`;
			return `${makeInternal('<font color="undefined"></font>', true)}[${makeDigit(1)}+[${makeDigit(2)}]]`;
		}
	},
	'.': {
		isWrap: () => {
			return true;
		},
		result: () => {
			if (!blacklist.dot && !isNoWrapString()) return wrapString('.');
			if (!blacklist.slash) return `((${makeDigit(1, true)}/${makeDigit(2, true)})+[])[${makeDigit(1)}]`;
			return `(${makeInternal(1.1e+101)}+[])[${makeDigit(1)}]`;
		}
	},
	'/': {
		isWrap: () => {
			return true;
		},
		result: () => {
			if (!blacklist.slash && !isNoWrapString()) return wrapString('/');
			if (!blacklist.number) return `${makeInternal('<sub></sub>', true)}[6]`;
			return `(${makeInternal(true)}+${makeInternal('<sub></sub>')})[${makeDigit(1)}+[${makeDigit(0)}]]`;
		}
	},
	'\\': {
		isWrap: () => {
			return true;
		},
		result: () => {
			if (!blacklist.backslash && !isNoWrapString()) return wrapString('\\\\');
			return makeEval(makeString('return unescape("%5c")'));
		}
	},
	'(': {
		isWrap: () => {
			return true;
		},
		result: () => {
			if (!isNoWrapString()) return wrapString('(');
			if (!blacklist.number) return `${makeInternal('function flat() { [native code] }', true)}[13]`;
			return `${makeInternal('function flat() { [native code] }', true)}[${makeDigit(1)}+[${makeDigit(3)}]]`;
		}
	},
	')': {
		isWrap: () => {
			return true;
		},
		result: () => {
			if (!isNoWrapString()) return wrapString(')');
			if (!blacklist.number) return `${makeInternal('function flat() { [native code] }', true)}[14]`;
			return `${makeInternal('function flat() { [native code] }', true)}[${makeDigit(1)}+[${makeDigit(4)}]]`;
		}
	},
	'{': {
		isWrap: () => {
			return true;
		},
		result: () => {
			if (!blacklist.curlyBrackets && !isNoWrapString()) return wrapString('{');
			if (!blacklist.number) return `${makeInternal('function flat() { [native code] }', true)}[16]`;
			return `(${makeInternal(true)}+${makeInternal('function flat() { [native code] }')})[${makeDigit(2)}+[${makeDigit(0)}]]`;
		}
	},
	'}': {
		isWrap: () => {
			return true;
		},
		result: () => {
			if (!blacklist.curlyBrackets && !isNoWrapString()) return wrapString('}');
			if (!blacklist.number) return `${makeInternal('function flat() { [native code] }', true)}[32]`;
			return `${makeInternal('function flat() { [native code] }', true)}[${makeDigit(3)}+[${makeDigit(2)}]]`;
		}
	},
	'[': {
		isWrap: () => {
			return true;
		},
		result: () => {
			if (!isNoWrapString()) return wrapString('[');
			if (!blacklist.curlyBrackets) return `${makeInternal('[object Object]', true)}[${makeDigit(0)}]`;
			if (!blacklist.number) return `${makeInternal('function flat() { [native code] }', true)}[18]`;
			return `${makeInternal('function flat() { [native code] }', true)}[${makeDigit(1)}+[${makeDigit(8)}]]`;
		}
	},
	']': {
		isWrap: () => {
			return true;
		},
		result: () => {
			if (!isNoWrapString()) return wrapString(']');

			if (!blacklist.curlyBrackets) {
				if (!blacklist.number) return `${makeInternal('[object Object]', true)}[14]`;
				return `${makeInternal('[object Object]', true)}[${makeDigit(1)}+[${makeDigit(4)}]]`;
			}

			if (!blacklist.number) return `${makeInternal('function flat() { [native code] }', true)}[30]`;
			return `${makeInternal('function flat() { [native code] }', true)}[${makeDigit(3)}+[${makeDigit(0)}]]`;
		}
	},
	'<': {
		isWrap: () => {
			return true;
		},
		result: () => {
			if (!blacklist.angleBrackets && !isNoWrapString()) return wrapString('<');
			return `${makeInternal('<sub></sub>', true)}[${makeDigit(0)}]`;
		}
	},
	'>': {
		isWrap: () => {
			return true;
		},
		result: () => {
			if (!blacklist.angleBrackets && !isNoWrapString()) return wrapString('>');
			return `${makeInternal('<sub></sub>', true)}[${makeDigit(4)}]`;
		}
	}
};

const wrapString = (value) => {
	if (!blacklist.singleQuotes) return `'${value}'`;
	if (!blacklist.doubleQuotes) return `"${value}"`;
	if (!blacklist.backtick) return '`' + value + '`';

	console.error('wrapString() Error!');
};

const isNoWrapString = () => {
	return blacklist.singleQuotes && blacklist.doubleQuotes && blacklist.backtick;
};

const makeInternal = (value, wrap = false) => {
	if (!internalResults.hasOwnProperty(value)) {
		internalResults[value] = INTERNAL[value].result();
	}

	if (wrap && !INTERNAL[value].isWrap()) {
		return '(' + internalResults[value] + ')';
	}
	else {
		return internalResults[value];
	}
};

const makeDigit = (value, wrap = false) => {
	if (!digitResults.hasOwnProperty(value)) {
		digitResults[value] = DIGIT[value].result();
	}

	if (wrap && !DIGIT[value].isWrap()) {
		return '(' + digitResults[value] + ')';
	}
	else {
		return digitResults[value];
	}
};

const makeCharacter = (value, wrap = false) => {
	if (!characterResults.hasOwnProperty(value)) {
		characterResults[value] = CHARACTER[value].result();
	}

	if (wrap && !CHARACTER[value].isWrap()) {
		return '(' + characterResults[value] + ')';
	}
	else {
		return characterResults[value];
	}
};

const makeString = (value, wrap = false) => {
	const results = [];

	for (const char of value) {
		results.push(makeCharacter(char, true));
	}

	if (wrap) {
		return '(' + results.join('+') + ')';
	}
	else {
		return results.join('+');
	}
};

const makeEval = (value) => {
	return `[][${makeString('flat')}][${makeString('constructor')}](${value})()`;
};

const createVariableNames = (candidates, variableCount) => {
	const results = [];
	let length = 1;

	const createPermutation = (goalLength, variableName = '') => {
		if (results.length === variableCount) {
			return;
		}

		if (variableName.length === goalLength) {
			results.push(variableName);
			return;
		}

		candidates.forEach((v) => {
			createPermutation(goalLength, variableName + v);
		});
	};

	if (candidates.length > 0) {
		while (results.length < variableCount) {
			createPermutation(length);
			length++;
		}
	}

	return results;
};

const obfuscate = (jsCode, variableCandidates = [], iterationCount = 50) => {
	const results = [];

	for (const char of jsCode) {
		let makedCode;

		if (CHARACTER.hasOwnProperty(char)) {
			makedCode = makeCharacter(char, true);
		}
		else {
			if (blacklist.upperCase && char >= 'A' && char <= 'Z' || isNoWrapString()) {
				const hexCode = char.charCodeAt().toString(16);
				makedCode = makeEval(makeString(`return unescape("${hexCode.length === 4 ? `\\u${hexCode}` : `%${hexCode}`}")`));
			}
			else {
				makedCode = wrapString(char);
			}
		}

		results.push(makedCode);
	}

	let presetCode = '';
	let resultCode = makeEval(results.join('+'));

	if (!option.useVariable) {
		return resultCode;
	}

	if (!blacklist.dollar) variableCandidates.push('$');
	if (!blacklist.underscore) variableCandidates.push('_');

	variableCandidates = [... new Set(variableCandidates)];
	let variableNames = createVariableNames(variableCandidates, 50);

	const makeShorter = (targetCode) => {
		if (variableNames.length === 0) {
			return;
		}

		let variableCode = `${variableNames[0]}=${targetCode};`;
		let replaceCode = replaceAll(resultCode, targetCode, variableNames[0]);

		if (replaceCode.length + variableCode.length < resultCode.length) {
			presetCode += variableCode;
			resultCode = replaceCode;
			variableNames = variableNames.slice(1);
		}
	};

	makeShorter(makeString('toString'));
	makeShorter(makeString('constructor'));
	makeShorter(makeString('flat'));

	const copyPresetCode = presetCode;
	const copyResultCode = resultCode;
	const copyvariableNames = [...variableNames];

	let minPresetCode = presetCode;
	let minResultCode = resultCode;

	// Find min code at random
	for (let i = 0; i < iterationCount; i++) {
		const candidates = [];
		const shuffle = [];

		for (const key in characterResults) {
			if (characterResults[key].indexOf(`'`) !== -1) continue;
			if (characterResults[key].indexOf(`"`) !== -1) continue;
			if (characterResults[key].indexOf('`') !== -1) continue;

			candidates.push(characterResults[key]);
		}

		while (candidates.length > 0) {
			const chosen = candidates.splice(Math.floor(Math.random() * candidates.length), 1)[0];
			shuffle.push(chosen);
		}

		shuffle.forEach((v) => {
			makeShorter(v);
		});

		if (minResultCode.length > resultCode.length) {
			minPresetCode = presetCode;
			minResultCode = resultCode;
		}

		presetCode = copyPresetCode;
		resultCode = copyResultCode;
		variableNames = [...copyvariableNames];
	}

	return minPresetCode + minResultCode;
};

const replaceAll = (targetString, searchString, replaceString) => {
	return targetString.split(searchString).join(replaceString);
};