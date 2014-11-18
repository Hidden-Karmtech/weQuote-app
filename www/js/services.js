angular.module('weQuote.services', [])
.constant('SERVER_BASE_URL','https://api-wequote.rhcloud.com/')
.service('QuoteRepository',['$http','SERVER_BASE_URL',function($http,SERVER_BASE_URL) {
	var that = this;

	return {
		list:function(query){

			var params = {};
			if(query){
				params.search = query;
			}

			return $http({
				method:'GET',
				url:SERVER_BASE_URL + 'list',
				params:params
			}).then(function(response){
				return response.data;
			});
		}
	};
}]);