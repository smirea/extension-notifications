
var FIC = FavIconCounter;

var options;
var icons = {};

reloadOptions();

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
  reloadOptions();
  switch (request.action) {
    case 'setBaseIcon':
      var url = request.favIconUrl || sender.tab.favIconUrl;
      var img = document.createElement('img');
      img.src = url;
      icons[sender.tab.id] = img;
      sendResponse({favIconUrl:url});
      break;

    case 'getOptions':
      var page = getOptions(sender.url, ls.get('options'));

      if (!page) {
        sendResponse({error:'No pages found matching the URL: ' + sender.url});
        break;
      }

      var opt = cloneObject(options);
      delete opt.pages;
      opt.page = page;

      sendResponse({options:opt,});
      break;

    case 'getIcon':
      var opt = getOptions(sender.tab.url, options);
      var number = parseInt(request.number, 10);
      number = isNaN(number) ? -1 : Math.min(99, number);
      FIC.backgroundImage = icons[sender.tab.id];
      FIC.font = opt.font || options.font || FIC.font;
      FIC.setupCanvas();
      FIC.setText(number);
      sendResponse({
        number: number,
        imageData: FIC.canvas.toDataURL(FIC.exportFormat)
      });
      break;

    case 'reloadOptions':
      reloadOptions();
      break;

    default:
      console.warn('[onMessage] Unknown protocol `' + request.action + '`', request);
  }
});

// Setup existing tabs.
chrome.tabs.query({}, function (tabs) {
  for (var i=0; i<tabs.length; ++i) {
    initTab(tabs[i]);
  }
});

// Listen for future tab updates.
chrome.tabs.onUpdated.addListener(function (tabId, info) {
  if (info.status != "complete") { return; }
  chrome.tabs.get(tabId, initTab);
});

/**
 * Check if a tab matches a rule and if so insert the content-scripts.
 * @param  {Object} tab
 */
function initTab (tab) {
  var opt = getOptions(tab.url, options);
  if (!opt) { return; }
  console.info('Initializing tab %d: %s', tab.id, tab.url);
  syncLoading(['js/utils.js', 'js/contentscript.js'], tab.id);
}

function reloadOptions () {
  options = ls.get('options', {});
}

/**
 * Returns the options for a specific url.
 * @param  {String} url
 * @param  {Object} opt Full Options object (with a .pages array)
 * @param  {Boolean} ignoreEnabled Optional. Whether to ignore the enabled flag or not.
 * @return {Object}
 */
function getOptions (url, opt, ignoreEnabled) {
  for (var i=0; i<opt.pages.length; ++i) {
    for (var j=0; j<opt.pages[i].urls.length; ++j) {
      var pattern = parse_match_pattern(opt.pages[i].urls[j]);

      if (!pattern) {
        console.warn('Invalid URL: %s', opt.pages[i].urls[j]);
        continue;
      }

      var regexp = new RegExp(pattern, 'i');

      if (regexp.test(url) && (opt.pages[i].enabled || ignoreEnabled)) {
        return opt.pages[i];
      }
    }
  }
  return null;
}

/**
 * Sequencially load the files.
 * @param  {Object}   files
 * @param  {Number}   tab
 * @param  {Number}   index = 0
 * @param  {Function} callback
 */
function syncLoading (files, tab, index, callback) {
  tab = tab || null;
  index = index || 0;
  callback = callback || function _emptyCallback () {};

  var fileObject = typeof files[index] === 'object' ? files[index]
                                                      : { file: files[index] };
  var extension = fileObject.file.slice(fileObject.file.lastIndexOf('.')+1);
  var loadFunction = extension === 'js' ? 'executeScript' : 'insertCSS';

  chrome.tabs[loadFunction](
    tab,
    fileObject,
    (function _setupNextCallback (newFile, newIndex) {
      return function _callNextSyncLoading () {
        if (index + 1 < files.length) {
          syncLoading(files, tab, newIndex, callback);
        } else {
          callback(files);
        }
      };
    }(fileObject, index+1))
  );
}