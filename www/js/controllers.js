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
.controller('Home', ['$scope',function($scope) {
	$scope.quotes = [
		{text:'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent ac ipsum mollis, finibus nulla sit amet, vehicula mi. Curabitur aliquet accumsan porta. Nam at quam libero. Etiam lobortis massa vel ex accumsan fringilla. Curabitur accumsan et libero non tincidunt. Sed eu elit dictum nullam sodales.'},
		{text:'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent ac ipsum mollis, finibus nulla sit amet, vehicula mi. Curabitur aliquet accumsan porta. Nam at quam libero. Etiam lobortis massa vel ex accumsan fringilla. Curabitur accumsan et libero non tincidunt. Sed eu elit dictum nullam sodales.'},
		{text:'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent ac ipsum mollis, finibus nulla sit amet, vehicula mi. Curabitur aliquet accumsan porta. Nam at quam libero. Etiam lobortis massa vel ex accumsan fringilla. Curabitur accumsan et libero non tincidunt. Sed eu elit dictum nullam sodales.'},
		{text:'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent ac ipsum mollis, finibus nulla sit amet, vehicula mi. Curabitur aliquet accumsan porta. Nam at quam libero. Etiam lobortis massa vel ex accumsan fringilla. Curabitur accumsan et libero non tincidunt. Sed eu elit dictum nullam sodales.'},
		{text:'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent ac ipsum mollis, finibus nulla sit amet, vehicula mi. Curabitur aliquet accumsan porta. Nam at quam libero. Etiam lobortis massa vel ex accumsan fringilla. Curabitur accumsan et libero non tincidunt. Sed eu elit dictum nullam sodales.'}
	];
}]);