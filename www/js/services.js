angular.module('weQuote.services', [])
	.constant('SERVER_BASE_URL', 'https://api-wequote.rhcloud.com/')
	.value('QuotesState', {})
	.value('TagsState', {})
	.value('AuthorsState', {})
	.value('UUID', {})
	.service('Screen', ['$window',function($window){
		//Adding fake class at runtime
    	var size = Math.floor($window.innerWidth * 95 / 100);
		var left = Math.floor(($window.innerWidth - size) / 2);
    	var top = Math.floor(($window.innerHeight - size) / 2);

    	return {
    		getSize:function(){
    			return size;
    		},
    		getLeft:function(){
    			return left;
    		},
    		getTop:function(){
    			return top;
    		}
    	};
	}])
	.service('QuoteRepository', [
		'$http',
		'SERVER_BASE_URL',
		'UUID',
		function($http, SERVER_BASE_URL,UUID) {
			var that = this;
			var MAX_LEN = 200;
			return {
				list: function(queryParam) {

					var params = {
						maxlen: MAX_LEN,
						deviceUUID: UUID.value
					};

					if (queryParam && queryParam.value) {
						params[queryParam.type] = queryParam.value;
					}

					return $http({
						method: 'GET',
						url: SERVER_BASE_URL + 'list',
						params: params
					}).then(function(response) {
						return response.data;
					});
				}
			};
		}
	])
	.service('AuthorRepository', ['$http', 'SERVER_BASE_URL', '$log', function($http, SERVER_BASE_URL, $log) {
		var that = this;

		return {
			list: function() {
				$log.debug('downloading authors');
				return $http({
					method: 'GET',
					url: SERVER_BASE_URL + 'authors'
				}).then(function(response) {
					return _.map(response.data, function(author) {
						author.name = _.str.capitalize(_.str.trim(author.name));
						return author;
					});
				});
			}
		};
	}])
	.service('TagRepository', ['$http', 'SERVER_BASE_URL', '$log', function($http, SERVER_BASE_URL, $log) {
		var that = this;

		return {
			list: function() {
				$log.debug('downloading tags');
				return $http({
					method: 'GET',
					url: SERVER_BASE_URL + 'tags'
				}).then(function(response) {
					return _.map(response.data, function(tag) {
						tag.name = _.str.capitalize(_.str.trim(tag.name));
						return tag;
					});
				});
			}
		};
	}]);