
// Which of the log functions to use. Default = ALL
// 1 - error, 2 - warn, 3 - info, 4 - log
var logLevel = 4;

/**
 * Wrapper for console.* logging functions which either print or not depending
 * on logLevel above.
 */
var logger = (function () {
  var order = ['error', 'warn', 'info', 'log'];
  var obj = {};

  for (var i=0; i<order.length; ++i) {
    (function (index, name) {
      obj[name] = function () {
        if (logLevel < index) { return; }
        return console[name].apply(console, arguments);
      };
    })(i, order[i]);
  }

  return obj;
})();

/**
 * localStorage enhancer. Auto JSON.stringify and JSON.encodes all the elements.
 * @type {Object}
 */
var ls = {
  /**
   * Set a key. Auto JSON.stringify
   * @param {String|Object} key  Set multiple keys at once by passing an object as a key and no value.
   * @param {Mixed} value Optional if the first argument is an Object.
   * @return {Object} chainable
   */
  set: function (key, value) {
    if (arguments.length === 1 && typeof key == 'object' && key !== null) {
      for (var name in key) { ls.set(name, key[name]); }
    } else {
      localStorage[key] = JSON.stringify(value);
    }
    return this;
  },

  /**
   * Get a key from localStorage. Auto JSON.parse
   * @param  {String} key
   * @param  {Mixed} defaultValue Optional. A default value to return if the key does not exist.
   * @return {Mixed}
   */
  get: function (key, defaultValue) {
    if (!(key in localStorage)) {
      return defaultValue;
    }
    try {
      return JSON.parse(localStorage[key]);
    } catch (ex) {
      console.warn('Never use plain localStorage to set shit!\nOtherwise this happens: ' + ex, ex.stack);
      return defaultValue;
    }
  },

  /**
   * Deletes a key from localStorage
   * @param  {String} key
   * @return {Boolean}
   */
  remove: function (key) {
    return (delete localStorage[key]);
  },

  /**
   * Prints out an indented stringified JSON of the value.
   * Takes the same arguments as ls.get();
   * @see get
   * @return {Object} chainable
   */
  debug: function () {
    console.log(JSON.stringify(ls.get.apply(ls, arguments), null, 2));
    return this;
  },
};

/**
 * Gets a match pattern (http://developer.chrome.com/extensions/match_patterns.html)
 *  and return a RegExp String to match against.
 *
 * @param {String} input  A match pattern.
 * @returns  null if input is invalid.
 * @returns  {String} to be passed to the RegExp constructor
 */
function parse_match_pattern (str) {
  if (typeof str !== 'string') return null;

  // Don't consider the # part.
  str = str.split('#')[0];

  var match_pattern = '(?:^';
  var regEscape = function(s) {return s.replace(/[[^$.|?*+(){}\\]/g, '\\$&');};
  var result = /^(\*|https?|file|ftp|chrome-extension):\/\//.exec(str);

  // Parse scheme
  if (!result) return null;
  str = str.substr(result[0].length);
  match_pattern += result[1] === '*' ? 'https?://' : result[1] + '://';

  // Parse host if scheme is not `file`
  if (result[1] !== 'file') {
      if (!(result = /^(?:\*|(\*\.)?([^\/*]+))(?=\/)/.exec(str))) return null;
      str = str.substr(result[0].length);
      if (result[0] === '*') {    // host is '*'
          match_pattern += '[^/]+';
      } else {
          if (result[1]) {         // Subdomain wildcard exists
              match_pattern += '(?:[^/]+\\.)?';
          }
          // Append host (escape special regex characters)
          match_pattern += regEscape(result[2]);
      }
  }

  // Add remainder (path)
  match_pattern += str.split('*').map(regEscape).join('.*');
  match_pattern += '$)';

  return match_pattern;
}

/**
 * Performs a deep copy of the object (in a not very efficient nor save manner).
 * @param  {Object} obj
 * @return {Object}
 */
function cloneObject (obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Downloads any content to a file of any size
 * @param  {String} name
 * @param  {String} text
 * @param  {String} mimeType Optional.
 */
function downloadFile (name, text, mimeType) {
  var blob = new Blob([text], {type: mimeType || 'text/plain'});
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.setAttribute('download', name);
  a.setAttribute('href', url);
  a.innerHTML = 'download me';
  document.documentElement.appendChild(a);
  a.click();
  a.parentNode.removeChild(a);
}