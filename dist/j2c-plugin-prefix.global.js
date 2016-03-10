var j2cPrefixPlugin = (function () {
  'use strict';

  var self$1 = {}
  var root = document.documentElement

  var prefixes = {};
  var properties$1 = [];
  var style = getComputedStyle(document.documentElement, null);
  var dummy = document.createElement('div').style;
  var iterate = function(property) {
      if(property.charAt(0) === '-') {
          properties$1.push(property);
          
          var parts = property.split('-'),
              prefix = parts[1];
              
          // Count prefix uses
          prefixes[prefix] = ++prefixes[prefix] || 1;
          
          // This helps determining shorthands
          while(parts.length > 3) {
              parts.pop();
              
              var shorthand = parts.join('-');

              if(supported(shorthand) && properties$1.indexOf(shorthand) === -1) {
                  properties$1.push(shorthand);
              }
          }
      }
  };
  var supported = function(property) {
      return StyleFix.camelCase(property) in dummy;
  };
  // Some browsers have numerical indices for the properties, some don't
  if(style && style.length > 0) {
      for(var i=0; i<style.length; i++) {
          iterate(style[i])
      }
  }
  else {
      for(var property in style) {
          iterate(StyleFix.deCamelCase(property));
      }
  }
  // Find most frequently used prefix
  var highest = {uses:0};
  for(var prefix$1 in prefixes) {
      var uses = prefixes[prefix$1];

      if(highest.uses < uses) {
          highest = {prefix: prefix$1, uses: uses};
      }
  }
  self$1.prefix = '-' + highest.prefix + '-';
  self$1.Prefix = StyleFix.camelCase(self$1.prefix);
  self$1.properties = [];
  // Get properties ONLY supported with a prefix
  for(var i=0; i<properties$1.length; i++) {
      var property = properties$1[i];
      
      if(property.indexOf(self$1.prefix) === 0) { // we might have multiple prefixes, like Opera
          var unprefixed = property.slice(self$1.prefix.length);
          
          if(!supported(unprefixed)) {
              self$1.properties.push(unprefixed);
          }
      }
  }
  // IE fix
  if(self$1.Prefix == 'Ms' 
    && !('transform' in dummy) 
    && !('MsTransform' in dummy) 
    && ('msTransform' in dummy)) {
      self$1.properties.push('transform', 'transform-origin');	
  }
  self$1.properties.sort();

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
  self$1.functions = [];
  self$1.keywords = [];
  var style$1 = document.createElement('div').style;
  function supported$1(value, property) {
  	style$1[property] = '';
  	style$1[property] = value;

  	return !!style$1[property];
  }
  for (var func in functions) {
  	var test = functions[func],
  		property = test.property,
  		value = func + '(' + test.params + ')';
  	
  	if (!supported$1(value, property)
  	  && supported$1(self$1.prefix + value, property)) {
  		// It's supported, but with a prefix
  		self$1.functions.push(func);
  	}
  }
  for (var keyword in keywords) {
  	var property$1 = keywords[keyword];

  	if (!supported$1(keyword, property$1)
  	  && supported$1(self$1.prefix + keyword, property$1)) {
  		// It's supported, but with a prefix
  		self$1.keywords.push(keyword);
  	}
  }

  var selectors = {
  	':read-only': null,
  	':read-write': null,
  	':any-link': null,
  	'::selection': null
  };
  var atrules = {
  	'keyframes': 'name',
  	'viewport': null,
  	'document': 'regexp(".")'
  };
  self$1.selectors = [];
  self$1.atrules = [];
  var style$2 = root.appendChild(document.createElement('style'));
  function supported$2(selector) {
  	style$2.textContent = selector + '{}';  // Safari 4 has issues with style.innerHTML
  	
  	return !!style$2.sheet.cssRules.length;
  }
  for(var selector in selectors) {
  	var test = selector + (selectors[selector]? '(' + selectors[selector] + ')' : '');
  		
  	if(!supported$2(test) && supported$2(self$1.prefixSelector(test))) {
  		self$1.selectors.push(selector);
  	}
  }
  for(var atrule in atrules) {
  	var test$1 = atrule + ' ' + (atrules[atrule] || '');
  	
  	if(!supported$2('@' + test$1) && supported$2('@' + self$1.prefix + test$1)) {
  		self$1.atrules.push(atrule);
  	}
  }
  root.removeChild(style$2);

  // Properties that accept properties as their value
  self$1.valueProperties = [
  	'transition',
  	'transition-property',
  	'will-change'
  ]
  // Add class for current prefix
  root.className += ' ' + self$1.prefix;

  // decorate the fixers object.
  var own = {}.hasOwnProperty

  function setify(ary){
      var res = {}
      ary.forEach(function(p) {res[p] = true})
      return res
  }

  var prefix = target.prefix

  var replacerString = '$&'+prefix

  atRulesSet = setify(target.atrules.map(function(r){return '@'+r}))

  var atRulesMatcher = new RegExp('^@('+target.atrules.join('|')+')\\b')
  var atRulesReplacer = '@' + prefix + '$1'

  function makeDetector (before, targets, after) {
      return new Regexp(before + '(?:' + targets.join('|') + ')' + after)
  }

  function makeLexer (before, targets, after) {
      new RegExp(
          "\"(?:\\\\[\\S\\s]|[^\"])*\"|'(?:\\\\[\\S\\s]|[^'])*'|\\/\\*[\\S\\s]*?\\*\\/|" +
              before + '((?:' +
              targets.join('|') +
              ')' + after + ')',
          'gi'
      )
  }

  function replacer (match, $1, $2) {
      if (!$1) return match
      return $1 + prefix + $2
  }

  var selectorMatcher = makeLexer("\\b(", target.selectors, ")\\b")
  var selectorReplacer = makeReplacer(/^::?/, replacerString)

  var propertiesSet = setify(target.properties)
  target.properties.forEach(function(p) {properties[p] = true})


  // If this were ever updated, verify that the next comment is still valid.
  var valueProperties = {
      'transition': 1,
      'transition-property': 1
  }

  // value = fix('functions', '(^|\\s|,)', '\\s*\\(', '$1' + self.prefix + '$2(', value);
  var convertFunctions = !!target.functions.length
  var functionsDetector = makeDetector("(?:^|\\s|,)", target.fuctions, '\\s*\\(')
  var functionsMatcher = makeLexer("(^|\\s|,)", target.fuctions, '\\s*\\(')

  // value = fix('keywords', '(^|\\s)', '(\\s|$)', '$1' + self.prefix + '$2$3', value);
  var convertKeywords = !!target.keywords.length
  var keywordsDetector = makeDetector("(?:^|\\s)", target.keywords, '(?:\\s|$)')
  var keywordsMatcher  = makeLexer("(^|\\s)", target.keywords, '(?:\\s|$)')

  // No need to look for strings in these properties. We may insert prefixes in comments. Oh the humanity.
  // value = fix('properties', '(^|\\s|,)', '($|\\s|,)', '$1'+self.prefix+'$2$3', value);
  var convertProperties = !!target.properties.length
  var valuePropertiesDetector = makeDetector('(?:^|\\s|,)', target.properties, '(?:$|\\s|,)')
  var valuePropertiesMatcher = new RegExp('(^|\\s|,)((?:' + target.properties.join('|') + ')(?:$|\\s|,))','gi')
  var valuePropertiesReplacer = '$1' + target.prefix + '$2'

  // Gradients are supported with a prefix, convert angles to legacy
  var convertGradients = self.functions.indexOf('linear-gradient') > -1
  function fixValue (value, property) {
      if (convertFunctions && functionsDetector.test(value)) value = value.replace(functionsMatcher, replacer)
      if (convertKeywords && keywordsDetector.test(value)) value = value.replace(keywordsMatcher, replacer)

      if (convertProperties && own.call(valueProperties, property) && valuePropertiesDetector.test(value)) {
          value = value.replace(valuePropertiesMatcher, valuePropertiesReplacer)
      }
      return value;
  }

  function prefixPlugin(j2c) {
      if(window.addEventListener) {
          return {
              $filter: function(next) {
                  var atStack = []
                  return {
                      i: function() {
                          next.i()
                          atStack.length = 0
                      },
                      a: function(rule, params, hasBlock) {
                          rule = own.call(atRulesSet, rule) ? rule.replace(atRulesMatcher, atRulesReplacer) : rule
                          if (hasBlock) atStack.push(rule)
                          next.a(
                              rule,
                              params,
                              hasBlock
                          )
                      },
                      A: function() {
                          next.A(atStack.pop())
                      },
                      d: function(property, value){
                          next.d(
                              own.call(propertiesSet, property) ? prefix + property : property,
                              colon,
                              fixValue(value, property),
                              semi
                          )
                      },
                      s: function(selector, brace) {
                          if (selectorMatcher.test(selector)) selector = selector.replace(selectorMatcher, selectorReplacer)
                          next.s(selector, brace)
                      }
                  }
              }
          }
      }
  }

  return prefixPlugin;

}());