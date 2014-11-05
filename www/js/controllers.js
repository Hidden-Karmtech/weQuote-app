angular.module('weQuote.controllers', [])
.controller('Root', function($scope) {
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
});