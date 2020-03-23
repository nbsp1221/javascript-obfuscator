let inputCode;
let outputCode;
let optionVariableCandidates;
let optionIterationCount;

window.onload = () => {
	inputCode = document.getElementById('input-code');
	outputCode = document.getElementById('output-code');
	optionVariableCandidates = document.getElementById('option-variable-candidates');
	optionIterationCount = document.getElementById('option-iteration-count');

	initCodeArea();
	initOptionArea();
	initBlacklistArea();
};

const initCodeArea = () => {
	const inputCodeLength = document.getElementById('input-code-length');
	const outputCodeLength = document.getElementById('output-code-length');

	inputCode.oninput = () => {
		inputCodeLength.innerText = inputCode.value.length;
	};

	outputCode.oninput = () => {
		outputCodeLength.innerText = outputCode.value.length;
	};

	document.getElementById('obfuscate-button').onclick = () => {
		const iterationCount = parseInt(optionIterationCount.value);

		if (inputCode.value === '') {
			return;
		}

		if (iterationCount < 1) {
			alert('The iteration count of the random function must be a natural number.');
			return;
		}

		outputCode.value = obfuscate(inputCode.value, optionVariableCandidates.value.split(''), iterationCount);
		outputCode.oninput();
	};

	document.getElementById('run-button').onclick = () => {
		eval(outputCode.value);
	};

	inputCode.oninput();
	outputCode.oninput();
};

const initOptionArea = () => {
	const optionUseVariable = document.getElementById('option-use-variable');
	const blacklistEquals = document.getElementById('blacklist-equals');

	optionUseVariable.onchange = () => {
		optionVariableCandidates.disabled = !optionUseVariable.checked;
		optionIterationCount.disabled = !optionUseVariable.checked;
		blacklistEquals.checked = false;
		blacklistEquals.disabled = optionUseVariable.checked;
		option.useVariable = !option.useVariable;
	};
};

const initBlacklistArea = () => {
	document.getElementById('blacklist-upper-case').onchange = () => {
		blacklist.upperCase = !blacklist.upperCase;
		resetResults();
	};

	document.getElementById('blacklist-lower-case').onchange = () => {
		blacklist.lowerCase = !blacklist.lowerCase;
		resetResults();
	};

	document.getElementById('blacklist-number').onchange = () => {
		blacklist.number = !blacklist.number;
		resetResults();
	};

	document.getElementById('blacklist-space').onchange = () => {
		blacklist.space = !blacklist.space;
		resetResults();
	};

	document.getElementById('blacklist-dollar').onchange = () => {
		blacklist.dollar = !blacklist.dollar;
		resetResults();
	};

	document.getElementById('blacklist-percent').onchange = () => {
		blacklist.percent = !blacklist.percent;
		resetResults();
	};

	document.getElementById('blacklist-asterisk').onchange = () => {
		blacklist.asterisk = !blacklist.asterisk;
		resetResults();
	};

	document.getElementById('blacklist-underscore').onchange = () => {
		blacklist.underscore = !blacklist.underscore;
		resetResults();
	};

	document.getElementById('blacklist-equals').onchange = () => {
		blacklist.equals = !blacklist.equals;
		resetResults();
	};

	document.getElementById('blacklist-single-quotes').onchange = () => {
		blacklist.singleQuotes = !blacklist.singleQuotes;
		resetResults();
	};

	document.getElementById('blacklist-double-quotes').onchange = () => {
		blacklist.doubleQuotes = !blacklist.doubleQuotes;
		resetResults();
	};

	document.getElementById('blacklist-backtick').onchange = () => {
		blacklist.backtick = !blacklist.backtick;
		resetResults();
	};

	document.getElementById('blacklist-dot').onchange = () => {
		blacklist.dot = !blacklist.dot;
		resetResults();
	};

	document.getElementById('blacklist-slash').onchange = () => {
		blacklist.slash = !blacklist.slash;
		resetResults();
	};

	document.getElementById('blacklist-backslash').onchange = () => {
		blacklist.backslash = !blacklist.backslash;
		resetResults();
	};

	document.getElementById('blacklist-curly-brackets').onchange = () => {
		blacklist.curlyBrackets = !blacklist.curlyBrackets;
		resetResults();
	};

	document.getElementById('blacklist-angle-brackets').onchange = () => {
		blacklist.angleBrackets = !blacklist.angleBrackets;
		resetResults();
	};
};