
(function () {
  var oldNumber = 0;
  var selector;
  var options;

  function init () {
    // Cleanup after previous injections.
    clearInterval(window.FIC_inteval);

    chrome.extension.sendMessage({
      action: 'setBaseIcon',
      favIconUrl: window.FIC_favIconUrl,
    }, function (data) {
      window.FIC_favIconUrl = window.FIC_favIconUrl || data.favIconUrl;
    });

    updateOptions();
  }

  function updateOptions (callback) {
    callback = callback || function _no_callback () {};
    chrome.extension.sendMessage({
      action: 'getOptions',
    }, function (data) {
      if (data.error) {
        logger.warn(data.error);
      }

      if (!data.options) { return; }

      options = data.options;
      logLevel = options.logLevel;

      selector = options.page.selectors.join(', ');
      logger.info('[Notification-Counter] Initializing with options:', options);
      logger.log('[Notification-Counter] selector:', selector);
      resetInterval();
      callback();
    });
  }

  function resetInterval () {
    clearInterval(window.FIC_inteval);
    window.FIC_inteval = setInterval(function _updateIcon () {
      var counters = document.querySelectorAll(selector);
      var sum = 0;

      var finish = function () {
        if (sum != oldNumber) {
          if (sum == 0) {
            setFavIcon(window.FIC_favIconUrl);
          } else {
            updateIcon(sum);
          }
        };
        oldNumber = sum;
      }

      if (!counters || counters.length <= 0) {
        sum = 0;
        finish();
        return;
      }

      for (var i=0; i<counters.length; ++i) {
        if (!counters[i] || isHidden(counters[i])) { continue; }
        sum += Math.max(0, getElementValue(counters[i]));
      }

      finish();
    }, 500);
  }

  /**
   * Gets the numeric value of a DOM Element.
   * This can either be the .value for a input/select or the first number in
   *  the textContent of the element.
   * @param  {Node} elem
   * @return {Number}
   */
  function getElementValue (elem) {
    var val;

    switch (elem.nodeName.toLowerCase()) {
      case 'input':
      case 'select':
        val = elem.value;
        break;
      default: val = elem.textContent;
    }

    val = val.match(/-?[0-9]+/);
    if (!val || val.length <= 0) { return -1; }
    val = val[0];
    var number = parseInt(val, 10);

    return isNaN(number) ? 0 : number;
  }

  function updateIcon (number, callback) {
    callback = callback || function _noCallback () {};
    chrome.extension.sendMessage({
      action: 'getIcon',
      number: number
    }, function (data) {
      var link = setFavIcon(data.imageData);
      callback(data, link);
    });
  }

  function setFavIcon (href) {
    removeFavIcons();
    var link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/png';
    link.href = href;
    document.head.appendChild(link);
    return link;
  }

  function removeFavIcons () {
    var favIcons = document.querySelectorAll('link[rel]');
    var relTypes = ['shortcut', 'icon', 'shortcut icon'];
    for (var i=0; i<favIcons.length; ++i) {
      if (relTypes.indexOf(favIcons[i].rel) > -1) {
        favIcons[i].parentNode.removeChild(favIcons[i]);
      }
    }
  }

  /**
   * Taken from the jQuery source code.
   * Checks to see if an element is visible.
   *
   * @param  {Node}  elem
   * @return {Boolean}
   */
  var isHidden = (function () {
    var container = document.createElement("div");
    container.style.cssText = "border:0;width:0;height:0;position:absolute;top:0;left:-9999px;margin-top:1px";

    var div = document.createElement('div');
    div.innerHTML = "<table><tr><td></td><td>t</td></tr></table>";

    var body = document.getElementsByTagName("body")[0];
    body.appendChild( container ).appendChild( div );

    var tds = div.getElementsByTagName("td");
    tds[ 0 ].style.cssText = "padding:0;margin:0;border:0;display:none";
    var isSupported = ( tds[ 0 ].offsetHeight === 0 );

    tds[ 0 ].style.display = "";
    tds[ 1 ].style.display = "none";

    // Support: IE8
    // Check if empty table cells still have offsetWidth/Height
    var reliableHiddenOffsets = isSupported && ( tds[ 0 ].offsetHeight === 0 );

    div.parentNode.removeChild(div);
    container.parentNode.removeChild(container);

    return function (elem) {
      return elem.offsetWidth <= 0 && elem.offsetHeight <= 0 ||
        (!reliableHiddenOffsets && ((elem.style && elem.style.display) || elem.style.display) === "none" );
    };

  })();

  init();
})();