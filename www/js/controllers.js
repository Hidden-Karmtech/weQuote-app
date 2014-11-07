angular.module('weQuote.controllers', [])
.controller('Root', ['$scope',function($scope) {
	
}])
.controller('Login', ['$scope','$state',function($scope,$state) {
	$scope.busy = false;

	$scope.login = function(){
		$scope.busy = true;
		setTimeout(function(){$state.go('home');}, 500);
	}
}])
.controller('Home', ['$scope','QuoteRepository',function($scope,QuoteRepository) {

	$scope.quotes = [];

	QuoteRepository.list().then(function(quotes){
		$scope.quotes = quotes;
	});
}]);