import {fixers} from './generated/fixers.js'
import './generated/fixers' // decorate the fixers object.
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
var gradientDetector = /\blinear-gradient\(/
var gradientMatcher = /(\s|:|,)(repeating-)?linear-gradient\(\s*(-?\d*\.?\d*)deg/ig
var gradientReplacer = function ($0, delim, repeating, deg) {
    return delim + (repeating || '') + 'linear-gradient(' + (90-deg) + 'deg'
}

function fixValue (value, property) {
    if (convertFunctions && functionsDetector.test(value)) value = value.replace(functionsMatcher, replacer)
    if (convertKeywords && keywordsDetector.test(value)) value = value.replace(keywordsMatcher, replacer)

    if (convertProperties && own.call(valueProperties, property) && valuePropertiesDetector.test(value)) {
        value = value.replace(valuePropertiesMatcher, valuePropertiesReplacer)
    }
    return value;
}

export default function prefixPlugin(j2c) {
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
