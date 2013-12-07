
var FIC = FavIconCounter;
var namespace = 'font';

var main = null;
var table = null;
var current_font = localStorage[namespace] ? JSON.parse(localStorage[namespace]) : null;
var demo = null;
var fb_icon = elem('img');

var fields = {

  // size: new FormElement('Font size:', {
  //   type: 'number',
  //   min: 5,
  //   max: 15,
  //   value: 10,
  //   size: 2,
  //   style: {width:'100px'}
  // }),
  /*
  fontFamily: new FormElement('Font family:', {
    type: 'text',
    value: '"lucida grande", tahoma, verdana, arial, sans-serif',
    placeholder: 'font family...'
  }),
  fontStyle: new FormElement('Font style:', {
    type: 'text',
    value: '',
    placeholder: 'bold OR italic or leave empty'


  }),
*/
  color: new FormElement('Font color:', {
    type: 'color',
    value: '#FFFFFF'
  }),
  background: new FormElement('Background color:', {
    type: 'color',
    value: '#F03D25'
  })
};

window.onload = function _onload () {
  main = document.getElementById('main');
  fb_icon.onload = function () { 
    FIC.setupCanvas(this);
    refresh_demo();
  };
  fb_icon.attr('src', 'images/facebook.ico');

  makeOptionsTable();
  main.appendChild(table);
  demo = document.getElementById('demo');
  restoreOptions();
}


function makeOptionsTable () {
  if (table) {
    table.parentNode.removeChild(table);
    delete table;
  }
  table = elem('table');
  for (var name in fields) {
    var input = fields[name].toElement();
    input.onchange = saveOptions;
    table.appendChild(tableRow(
      fields[name].title(), 
      input, 
      ' '
    ));
  }
  table.appendChild(tableRow(
    elem('span').html('Demo:'),
    elem('span').attr('id', 'demo'),
    ' '
  ));
}

function tableRow () {
  var tr = elem('tr');
  for (var i=0; i<arguments.length; ++i) {
    var td = elem('td');
    if (typeof arguments[i] === 'string') {
      td.innerHTML = arguments[i];
    } else {
      td.appendChild(arguments[i]);
    }
    tr.appendChild(td);
  }
  return tr;
}

function FormElement (title, options) {
  var inputType = ["text", "password", "color", "date", "datetime",
                    "datetime-local", "email", "month", "number", "range",
                    "search", "tel", "time", "url", "week"
  ];
  title = title || '';
  options = options || {};

  var input = elem('input');
  input.type = options.type || 'number';
  input.id = options.id || 'FormElement-' + Math.floor(Math.random() * 1000000);
  input.title = title;

  if (options.style) {
    for (var name in options.style) {
      input.style[name] = options.style[name];
    }
  }
  for (var name in options) {
    input[name] = options[name];
  }

  this.value = function _value (newValue) {
    if (newValue) {
      input.value = newValue;
    } else {
      return input.value;
    }
  }
  this.title = function _title (newTitle) {
    if (newTitle) {
      title = newTitle;
    } else {
      return title;
    }
  }
  this.toElement = function toElement () {
    return input;
  }
  this.toString = function toString () {
    return input;
  }
}

function refresh_demo () {
  var random_values = [10, 30, 60, 100];
  // update font
  if (current_font) {
    for (var key in current_font) {
      FIC.font[key] = current_font[key];
    }
  }
  // empty demo area
  while (demo.childNodes.length > 0) {
    demo.removeChild(demo.childNodes[0]);
  }
  // insert new icons
  for (var i=0; i<random_values.length; ++i) {
    FIC.setupCanvas();
    FIC.setText(Math.floor(Math.random() * random_values[i]));
    var img = elem('img').attr('src', FIC.canvas.toDataURL(FIC.exportFormat));
    demo.appendChild(img);
  }
}

function saveOptions() {
  console.log('some text');
  current_font = {};
  for (var name in fields) {
    current_font[name] = fields[name].value();
  }
  localStorage[namespace] = JSON.stringify(current_font);
  var saveStatus = this.parentNode.parentNode.childNodes[2];
  saveStatus.innerHTML = "Ok!";
  saveStatus.style.color = 'green';
  refresh_demo();
  setTimeout(function() {
    saveStatus.innerHTML = "";
  }, 2 * 1000);
  return true;
}

function restoreOptions() {
  var options = localStorage[namespace];
  if (options) {
    options = JSON.parse(options);
    for (var name in options) {
      if (fields[name]) {
        fields[name].value(options[name]);
      } else {
        console.warn('[restoreOptions] No input with the key', name);
      }
    }
    return true;
  }
  return false;
}

function elem (type) {
  var obj = document.createElement(type);
  obj.attr = function (name, value) {
    if (value === undefined) {
      return obj.getAttribute(name);
    }
    obj.setAttribute(name, value);
    return obj;
  }
  obj.html = function (value) {
    if (value === undefined) {
      return obj.innerHTML;
    }
    obj.innerHTML = value;
    return obj;
  }
  return obj;
}