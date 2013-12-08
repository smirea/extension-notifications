
/**
* OptionsModule Module
*
* Basic wrapper for handling options in chrome extensions.
*/
var app = angular.module('OptionsModule', []);

app.controller('OptionsController', ['$scope', function ($scope) {
  var defaultPage = {
    enabled: true,
    urls: [''],
    selectors: [''],
    backgroundColor: '#FF0000',
    textColor: '#FFFFFF',
  };

  var facebook = angular.copy(defaultPage);
  facebook.urls = ["http://*.facebook.com/*", "https://*.facebook.com/*"];
  facebook.selectors = [
    '#requestsCountValue',
    '#mercurymessagesCountValue',
    '#notificationsCountValue',
  ];

  var master = {
    name: 'options',
    pages: [facebook]
  };

  add_methods($scope);
  $scope.restore();

  $scope.$watch('form', $scope.save.bind($scope), true);

  function add_methods ($scope) {

    $scope.save = function () {
      ls.set(master.name, $scope.form);
    };

    $scope.restore = function () {
      $scope.form = angular.copy(ls.get(master.name, master));
    };

    $scope.reset = function() {
      $scope.form = angular.copy(master);
    };

    $scope.add = function (arr, index) { arr.push(''); };

    $scope.remove = function (arr, index) { arr.splice(index, 1); };

    $scope.addPage = function (index) {
      $scope.form.pages.splice(index, 0, angular.copy(defaultPage));
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