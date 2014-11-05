angular.module('weQuote.controllers', [])
.controller('Root', ['$scope',function($scope) {
	$scope.fbLogin = function() {
	    openFB.login(
	        function(response) {
	            if (response.status === 'connected') {
	                console.log('Facebook login succeeded');
	                $scope.closeLogin();
	            } else {
	                alert('Facebook login failed');
	            }
	        },
	        {scope: 'email,publish_actions'});
	}
}])
.controller('Login', ['$scope','$state',function($scope,$state) {
	$scope.busy = false;

	$scope.login = function(){
		$scope.busy = true;
		setTimeout(function(){$state.go('home');}, 500);
	}
}])
.controller('Home', ['$scope',function($scope) {
	
}]);