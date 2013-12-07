(function(FIC){
  var jewel_selectors = [
    '#requestsCountValue',
    '#mercurymessagesCountValue',
    '#notificationsCountValue'
  ]

  var oldHref = document.querySelector('link[rel="shortcut icon"]').href;
  var oldNumber = 0;
  var jewels = document.querySelectorAll(jewel_selectors.join(', '));

  var checkInterval = setInterval(function _updateIcon () {
    var sum = 0;
    for (var i=0; i<jewels.length; ++i) {
      if (jewels[i] && has_new(jewels[i])) {
        var number = parseInt(jewels[i].innerHTML);
        sum += isNaN(number) ? 0 : number;
      }
    }
    if (sum != oldNumber) {
      if (sum == 0) {
        setFavIcon(oldHref);
      } else {
        updateIcon(sum);
      }
    }
    oldNumber = sum;
  }, 500);

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
    FIC.removeFavIcons();
    var link = document.createElement('link');
    link.rel = 'icon';
    link.type = FIC.exportFormat;
    link.href = href;
    document.head.appendChild(link);
    return link;
  }

  function has_new (elem) {
    var p = elem;
    while (p) {
      if (p.className && p.className.indexOf('hasNew') > -1) {
        return true;
      }
      p = p.parentNode;
    }
    return false;
  }

})(FavIconCounter);