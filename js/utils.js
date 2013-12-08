
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