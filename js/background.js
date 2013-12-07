
var options = {};

(function (FIC) {
  var backgroundImage = document.createElement('img');
  backgroundImage.onload = function () {
    FIC.setupCanvas(this);
    document.head.appendChild(FIC.makeFavIcon());
  };
  backgroundImage.src = 'images/facebook.ico';

  chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    reloadOptions();
    switch (request.action) {
      case 'setup':
        sendResponse(options);
        console.log("[New Connection]", sender.tab.url, options);
        break;
      case 'getIcon':
        var number = parseInt(request.number, 10);
        number = isNaN(number) ? -1 : (number > 99 ? 99 : number);
        FIC.setupCanvas();
        FIC.setText(number);
        sendResponse({
          number:request,
          imageData: FIC.canvas.toDataURL(FIC.exportFormat)
        });
        break;
      case 'reloadOptions':
        reloadOptions();
        break;
      default:
        console.warn('[onMessage] Unknown protocol `' + request + '`');
    }
  });

  function reloadOptions () {
    if (!localStorage['font']) {
      localStorage['font'] = JSON.stringify(FIC.font);
    } else {
      var font = JSON.parse(localStorage['font']);
      for (var property in font) {
        FIC.font[property] = font[property];
      }
    }
  }

})(FavIconCounter);
