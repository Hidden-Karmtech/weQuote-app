angular.module('weQuote.services', [])
.service('QuoteRepository', ['$http',function($http) {
	var that = this;

	return {
		list:function(query){
			return $http.get('http://api-wequote.rhcloud.com/list?search=' + query).then(function(response){
				return response.data;
			});
		}
	};
}]);