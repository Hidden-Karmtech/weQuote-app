angular.module('weQuote.services', [])
.constant('SERVER_BASE_URL','https://api-wequote.rhcloud.com/')
.value('QuotesState',{})
.value('TagsState',{})
.value('AuthorsState',{})
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
}])
.service('AuthorRepository',['$http','SERVER_BASE_URL',function($http,SERVER_BASE_URL) {
	var that = this;

	return {
		list:function(){

			return $http({
				method:'GET',
				url:SERVER_BASE_URL + 'authors'
			}).then(function(response){
				return _.map(response.data,function(author){
					author.name = _.str.capitalize(_.str.trim(author.name));
					return author;
				});
			});
		}
	};
}])
.service('TagRepository',['$http','SERVER_BASE_URL',function($http,SERVER_BASE_URL) {
	var that = this;

	return {
		list:function(){

			return $http({
				method:'GET',
				url:SERVER_BASE_URL + 'tags'
			}).then(function(response){
				return _.map(response.data,function(tag){
      				tag.name = _.str.capitalize(_.str.trim(tag.name));
      				return tag;
    			});
			});
		}
	};
}]);