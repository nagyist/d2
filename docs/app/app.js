'use strict';
import 'babel/browser';
import codeExampleRunner from 'd2-code-example-runner';

console.log(codeExampleRunner);

angular.module('d2Docs', ['ngMaterial', 'ngRoute']);

angular.module('d2Docs').controller('appController', appController);
angular.module('d2Docs').controller('sectionController', sectionController);
angular.module('d2Docs').controller('pageController', pageController);

angular.module('d2Docs').directive('menuSection', menuSectionDirective);
angular.module('d2Docs').directive('code', codeDirective);

angular.module('d2Docs').config(function($mdThemingProvider) {
    $mdThemingProvider.theme('default')
        .primaryPalette('blue')
        .accentPalette('deep-orange');
});

angular.module('d2Docs').factory('exampleRunner', function () {
   return codeExampleRunner;
});

angular.module('d2Docs').run(function (exampleRunner) {
    exampleRunner.init('../jspm_packages/npm/d2-code-example-runner@2.0.1/examplerunner.js', {
        url: 'https://apps.dhis2.org/dev/api'
    });
});

function appController($mdSidenav, $mdMedia, $location, $scope, exampleRunner) {
    //jshint validthis:true
    this.showMenuButton = function () {
        return !$mdMedia('gt-md');
    };
    this.showMenu = function () {
        $mdSidenav('leftBar').open();
    };

    this.isActiveRoute = function (routeToCheck) {
        return $location.$$url === routeToCheck;
    };

    $scope.$on('$viewContentLoaded', function (event) {
        console.log('View changed');
        exampleRunner.all();
    });
}

function sectionController() {

}

function pageController() {

}

function menuSectionDirective() {
    return {
        restrict: 'E',
        transclude: true,
        scope: {
            sectionName: '@'
        },
        controllerAs: 'menuSection',
        bindToController: true,
        template: '<md-button class="docs-button-toggle md-button md-default-theme" ng-click="menuSection.toggle()" ng-class="{\'docs-button-active\': !menuSection.closed}"><span ng-bind="menuSection.sectionName"></span><i class="fa fa-chevron-up" ng-class="{\'fa-rotate-180\': menuSection.closed}"></i></md-button><div class="menu-section-items" ng-class="{\'menu-section-items-hidden\': menuSection.closed}" ng-transclude></div>',
        controller: function () {
            var vm = this;
            vm.closed = false;

            this.toggle = function () {
                vm.closed = !vm.closed;
            };
        }
    };
}

function codeDirective() {
    return {
        restrict: 'E',
        link: function ($scope, element) {
            var classes = [];
            for (var i = 0; i < element[0].classList.length; i += 1) {
                classes.push(element[0].classList[i]);
            }
            var isCodeBlock = classes.reduce(function (isCodeBlock, className) {
                return isCodeBlock || /^lang-.+$/.test(className);
            }, false);

            if (isCodeBlock) {
                element.addClass('d2-code-example');
            }
        }
    };
}
