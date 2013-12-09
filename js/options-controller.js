
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
      color: '#ffffff',
      background: '#F03D25'
    },
  };
  var firstInit = !ls.get(master.name);
  var reloadOptionsInterval;
  var optionsDirty = false;

  add_methods($scope);
  $scope.restore();
  migrateOptions($scope.form, master);
  addWatches();

  if (firstInit) {
    var facebook = getDefaultPage();
    facebook.urls = ["*://*.facebook.com/*"];
    facebook.selectors = [
      '.hasNew #requestsCountValue',
      '.hasNew #mercurymessagesCountValue',
      '.hasNew #notificationsCountValue',
    ];

    $scope.form.pages = [facebook];
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
    $scope.$watch('form', function () {
      $scope.save();
      optionsDirty = true;
    }, true);

    clearInterval(reloadOptionsInterval);
    reloadOptionsInterval = setInterval(function () {
      if (!optionsDirty) {
        return;
      }

      chrome.extension.sendMessage({action:'reloadOptions',});
      optionsDirty = false;
    }, 200);
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