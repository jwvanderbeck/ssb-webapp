(function(){
	var app = angular.module('application', [
	    'ui.router',
	    'ngAnimate',
	    'foundation.init',
	    'foundation.common.services',
	    'foundation.common.directives',
	    'foundation.common.animations',
	    'foundation.panel',
		])
	.run(['FoundationInit', '$rootScope', '$state', '$stateParams', 
		function(foundationInit, $rootScope, $state, $stateParams){
			foundationInit.init();
	}]);


	app.controller('ViewController', function($scope){
		console.log("In View Controller");
		console.log(this);
		console.log($scope);
	});

})();







// var app = angular.module('application', [
//     'ui.router',
//     'ngAnimate',
//     'foundation.init',
//     'foundation.common.services',
//     'foundation.common.directives',
//     'foundation.common.animations',
//     'foundation.accordion',
//     'foundation.actionsheet',
//     'foundation.interchange',
//     'foundation.modal',
//     'foundation.notification',
//     'foundation.offcanvas',
//     'foundation.panel',
//     'foundation.popup',
//     'foundation.tabs'
//   ])
//     .config(['$FoundationStateProvider', '$urlRouterProvider', '$locationProvider', function(FoundationStateProvider, $urlProvider, $locationProvider) {

//     $urlProvider.otherwise('/');

//     $locationProvider.html5Mode({
//       enabled: true,
//       requireBase: false
//     });
// }])
//   .run(['FoundationInit', '$rootScope', '$state', '$stateParams', function(foundationInit, $rootScope, $state, $stateParams) {
//     foundationInit.init();

//     $rootScope.$state = $state;
//     $rootScope.$stateParams = $stateParams;
// }]);
