
/**
* OptionsModule Module
*
* Basic wrapper for handling options in chrome extensions.
*/
var app = angular.module('OptionsModule', []);

app.controller('OptionsController', ['$scope', function ($scope) {
  var master = {
    name: 'options',
    logLevel: logLevel,
    shrinkIcon: true,
    pages: [],
    font: {
      size : 10,
      style: '',
      family: '"lucida grande", tahoma, verdana, arial, sans-serif',
      color: '#FFFFFF',
      background: '#F03D25',
      gradient: [{
        color: '#FFFFFF',
        background: '#00FF00',
        startAt: 1,
      }],
    },
  };
  var firstInit = !ls.get(master.name);

  add_methods($scope);
  $scope.restore();
  migrateOptions($scope.form, master);
  addWatches();

  if (firstInit) {
    var predefined = {
      facebook: {
        urls: ["*://*.facebook.com/*"],
        selectors: [
          '.hasNew #requestsCountValue',
          '.hasNew #mercurymessagesCountValue',
          '.hasNew #notificationsCountValue',
        ],
      },
      twitter: {
        urls: ['*://twitter.com/*'],
        selectors: ['.new-tweets-bar'],
      },
      googlePlus: {
        urls: ['*://plus.google.com/*'],
        selectors: ['.gb_ua.gb_va'],
        font: {background:'#000000'},
      },
      stackOverflow: {
        urls: ['*://*.stackoverflow.com/*'],
        selectors: ['.icon-inbox .unread-count'],
      },
      localhost: {
        urls: ['http://localhost:8000/test.html'],
        selectors: ['input,textarea,select,.use-me'],
      }
    };

    // Copies the predefined objects onto a defaultPage() each up to a depth of 2.
    for (var name in predefined) {
      var obj = getDefaultPage();
      for (var key in predefined[name]) {
        // If object, we must go deeper.
        if (typeof obj[key] == 'object' && typeof predefined[name][key] == 'object') {
          for (var k in predefined[name][key]) {
            obj[key][k] = predefined[name][key][k];
          }
          continue;
        }

        obj[key] = predefined[name][key];
      }
      $scope.form.pages.push(obj);
    }
  }

  firstInit = false;

  function add_methods ($scope) {

    $scope.save = function () {
      ls.set(master.name, $scope.form);
    };

    $scope.restore = function () {
      $scope.form = angular.copy(ls.get(master.name, master));
      $scope.save();
    };

    $scope.reset = function() {
      $scope.form = angular.copy(master);
    };

    $scope.add = function (arr, index) { arr.push(''); };

    $scope.remove = function (arr, index) { arr.splice(index, 1); };

    $scope.addPage = function (index) {
      $scope.form.pages.splice(index, 0, getDefaultPage());
    };

    $scope.removePage = function (index) {
      $scope.form.pages.splice(index, 1);
    };

    $scope.isResetDisabled = function() {
      return angular.equals(master, $scope.form);
    };

    $scope.isSaveDisabled = function() {
      return $scope.myForm.$invalid || angular.equals(master, $scope.form);
    };
  }

  function addWatches () {
    var typingTimeout;

    $scope.$watch('form', function () {
      clearTimeout(typingTimeout);
      $scope.save();
      typingTimeout = setTimeout(reloadOptions, 50);
    }, true);

    function reloadOptions () {
      chrome.extension.sendMessage({action:'reloadOptions',});
    }
  }

  function getDefaultPage () {
    return {
      enabled: true,
      urls: [''],
      selectors: [''],
      font: angular.copy($scope.form.font),
    };
  }

  function migrateOptions (currentOpt, defaultOpt) {
    for (var key in defaultOpt) {
      if (!(key in currentOpt)) {
        currentOpt[key] = defaultOpt[key];
        console.warn('Migrating option: %s', key);
      }
    }
  }
}]);

app.directive('ngLabel', function () {
  return {
    restrict: 'A',
    replace: true,
    scope: {
      id: '@',
      label: '@ngLabel',
    },
    link: function (scope, element, attrs) {
      scope.id = scope.id || 'random-id-' + Math.floor(Math.random() * 90000000);
      var $container = angular.element(document.createElement('span'));
      element.replaceWith($container);
      $container.
        addClass('ng-label').
        append(
          angular.element(document.createElement('label')).
            attr({'for':scope.id}).
            addClass('ng-label-text').
            html(scope.label)
        ).append(
          angular.element(document.createElement('span')).
            addClass('ng-label-content').
            append(element)
        );
      element.attr({id:scope.id}).removeAttr('ng-label');
    },
  };
});

app.directive('ngLabel', function () {
  return {
    restrict: 'E',
    replace: true,
    transclude: true,
    scope: {
      label: '@',
    },
    template: '<span class="ng-label">' +
                '<label class="ng-label-text">{{label}}</label>' +
                '<span class="ng-label-content" ng-transclude></span>' +
              '</span>',
    link: function (scope, element, attrs) {
      scope.id = scope.id || 'random-id-' + Math.floor(Math.random() * 90000000);
      angular.element(element[0].querySelector('.ng-label-text')).
        attr({for:scope.id});

      var target = angular.element(element[0].querySelector('[ng-label-target]'));
      if (!target || target.length == 0) {
        target = angular.element(element[0].querySelectorAll('input,select,textarea')[0]);
      }
      target.attr({id:scope.id});
    },
  };
});

app.directive('ngOptionsHeader', function () {
  return {
    restrict: 'E',
    transclude: true,
    replace: true,
    scope: {
      header: '@',
    },
    template: '<h3>{{header}}<div ng-transclude class="description"></div></h3>',
  };
});

app.directive('ngGradientPoint', function () {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      model: '@',
    },
    template: '<span class="gradient-point">' +
                '<button title="Remove this point">-</button>' +
                '<input type="number" ng-model="" min="1" max="99" />' +
                '<button title="Add a new point after this">+</button>' +
                '<div>' +
                  '<input type="color">' +
                  '<input type="color">' +
                '</div>' +
              '</span>',
  };
});

// app.directive('ngColorinput', function () {
//   return {
//     restrict: 'E',
//     replace: true,
//     scope: {
//       label: '@',
//       model: '@',
//     },
//     template: '<ng-label label="{{label}}">' +
//                 '<input type="text" ng-model="{{model}}" size="5" maxlength="7" placeholder="e.g. #000" />' +
//                 '<input ng-label-target type="color" ng-model="{{model}}" />' +
//               '</ng-label>',
//   };
// });