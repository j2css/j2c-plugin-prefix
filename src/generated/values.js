import {fixers as self} from '../fixers.js';
// Values that might need prefixing
var functions = {
	'linear-gradient': {
		property: 'backgroundImage',
		params: 'red, teal'
	},
	'calc': {
		property: 'width',
		params: '1px + 5%'
	},
	'element': {
		property: 'backgroundImage',
		params: '#foo'
	},
	'cross-fade': {
		property: 'backgroundImage',
		params: 'url(a.png), url(b.png), 50%'
	}
};
functions['repeating-linear-gradient'] =
functions['repeating-radial-gradient'] =
functions['radial-gradient'] =
functions['linear-gradient'];
// Note: The properties assigned are just to *test* support. 
// The keywords will be prefixed everywhere.
var keywords = {
	'initial': 'color',
	'zoom-in': 'cursor',
	'zoom-out': 'cursor',
	'box': 'display',
	'flexbox': 'display',
	'inline-flexbox': 'display',
	'flex': 'display',
	'inline-flex': 'display',
	'grid': 'display',
	'inline-grid': 'display',
	'max-content': 'width',
	'min-content': 'width',
	'fit-content': 'width',
	'fill-available': 'width'
};
self.functions = [];
self.keywords = [];
var style = document.createElement('div').style;
function supported(value, property) {
	style[property] = '';
	style[property] = value;

	return !!style[property];
}
for (var func in functions) {
	var test = functions[func],
		property = test.property,
		value = func + '(' + test.params + ')';
	
	if (!supported(value, property)
	  && supported(self.prefix + value, property)) {
		// It's supported, but with a prefix
		self.functions.push(func);
	}
}
for (var keyword in keywords) {
	var property = keywords[keyword];

	if (!supported(keyword, property)
	  && supported(self.prefix + keyword, property)) {
		// It's supported, but with a prefix
		self.keywords.push(keyword);
	}
}