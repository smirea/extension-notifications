
(function () {
  var oldHref = (document.querySelector('link[rel="shortcut icon"]') || {}).href;
  var oldNumber = 0;
  var counters;
  var options;

  // Cleanup after previous injections.
  clearInterval(window.FIC_inteval);

  init();

  function init () {
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

      counters = document.querySelectorAll(options.page.selectors.join(', '));
      logger.info('[Notification-Counter] Initializing with options:', options);
      logger.log('[Notification-Counter] Counters:', counters);
      resetInterval();
      callback();
    });
  }

  function resetInterval () {
    clearInterval(window.FIC_inteval);
    window.FIC_inteval = setTimeout(function _updateIcon () {
      if (!counters) { return; }

      var sum = 0;

      for (var i=0; i<counters.length; ++i) {
        if (!counters[i]) {
          continue;
        }
        var val;
        switch (counters[i].nodeName.toLowerCase()) {
          case 'input':
          case 'select':
            val = counters[i].value;
            break;
          default: val = counters[i].textContent;
        }

        var number = parseInt(val);
        sum += isNaN(number) ? 0 : number;
      }

      if (sum != oldNumber) {
        if (sum == 0) {
          setFavIcon(oldHref);
        } else {
          updateIcon(sum);
        }
      };

      oldNumber = sum;
    }, 500);
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

  // function has_new (elem) {
  //   var p = elem;
  //   while (p) {
  //     if (p.className && p.className.indexOf('hasNew') > -1) {
  //       return true;
  //     }
  //     p = p.parentNode;
  //   }
  //   return false;
  // }

  function removeFavIcons () {
    var favIcons = document.querySelectorAll('link[rel]');
    var relTypes = ['shortcut', 'icon', 'shortcut icon'];
    for (var i=0; i<favIcons.length; ++i) {
      if (relTypes.indexOf(favIcons[i].rel) > -1) {
        favIcons[i].parentNode.removeChild(favIcons[i]);
      }
    }
  }

})();