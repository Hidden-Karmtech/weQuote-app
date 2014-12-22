angular.module('weQuote.services', [])
	.constant('SERVER_BASE_URL', 'https://api-wequote.rhcloud.com/')
	.value('QuotesState', {})
	.value('TagsState', {})
	.value('AuthorsState', {})
	.service('OfflineData', ['$http', '$log', function($http, $log) {
		return {
			get: function() {
				return $http.get("data.json").then(function(response) {
					return response.data;
				});
			}
		}
	}])
	.service('WeQuote', [
		'$q',
		'$http',
		'$cordovaDevice',
		'$cordovaNetwork',
		'SERVER_BASE_URL',
		'$timeout',
		'$log',
		function($q, $http, $cordovaDevice, $cordovaNetwork, SERVER_BASE_URL, $timeout, $log) {
			var that = this;

			var handshake = $http({
				method: 'GET',
				url: SERVER_BASE_URL + 'handshake',
				timeout: 5000
			}).then(function(response) {
					return true;
				},
				function(response) {
					return false;
				}
			);

			return {
				init: function() {
					that.UUID = $cordovaDevice.getUUID();
					that.online = $cordovaNetwork.isOnline();

					if (that.online) {
						return handshake.then(function(result) {
							$log.debug("Working in " + (result ? 'Online Mode' : 'Offline Mode'));
							that.initilized = true;
							that.online = result;
						});
					} else {
						$log.debug("Working in Offline Mode");

						var deferred = $q.defer();

						$timeout(function() {
							that.initilized = true;
							deferred.resolve(false);
						}, 100);

						return deferred.promise;
					}
				},
				getUUID: function() {
					return that.UUID;
				},
				isOnline: function() {
					return that.online;
				},
				isInitialized: function() {
					return that.initilized;
				}
			};

		}
	])
	.service('Screen', ['$window', function($window) {
		var size = Math.floor($window.innerWidth * 95 / 100);

		var left = Math.floor(($window.innerWidth - size) / 2);
		var top = Math.floor(($window.innerHeight - size) / 2);

		return {
			getSize: function() {
				return size;
			},
			getLeft: function() {
				return left;
			},
			getTop: function() {
				return top;
			}
		};
	}])
	.service('QuoteRepository', [
		'$http',
		'SERVER_BASE_URL',
		'WeQuote',
		'OfflineData',
		function($http, SERVER_BASE_URL, WeQuote, OfflineData) {
			var that = this;
			var MAX_LEN = 200;

			var filterOfflineQuotes = function(quotes, type, text) {
				var filterFunctions = {
					search: function(quote) {
						return _.str.include(quote.text.toLowerCase(), text.toLowerCase());
					},
					tag: function(quote) {
						return _.find(quote.tags, function(tag) {
							tag.toLowerCase() === text.toLowerCase();
						});
					},
					author: function(quote) {
						return quote.author.toLowerCase() === text.toLowerCase();
					}
				}

				var filterFunction = filterFunctions[type] || filterFunctions.search;

				return _.filter(quotes, filterFunction);
			};

			var getOfflineListPromise = function(params) {
				return OfflineData.get().then(function(quotes) {

					var type = "search";
					if (params.tag) {
						type = 'tag';
					} else if (params.author) {
						type = 'author';
					}

					if (params[type] && params[type].length > 0) {
						quotes = filterOfflineQuotes(quotes, type, params[type]);
					}

					return _.first(_.shuffle(quotes), params.limit);
				});
			};

			var getOnlineListPromise = function(params) {
				return $http({
					method: 'GET',
					url: SERVER_BASE_URL + 'list',
					params: params
				}).then(function(response) {
					return response.data;
				});
			};

			return {
				list: function(queryParam) {

					var params = {
						maxlen: MAX_LEN,
						deviceUUID: WeQuote.getUUID()
					};

					if (queryParam && queryParam.value) {
						params[queryParam.type] = queryParam.value.toLowerCase();
					}

					params.limit = queryParam.limit || 20;

					return (WeQuote.isOnline() ? getOnlineListPromise(params) : getOfflineListPromise(params));
				}
			};
		}
	])
	.service('AuthorRepository', [
		'$http',
		'SERVER_BASE_URL',
		'$log',
		'WeQuote',
		'OfflineData',
		function($http, SERVER_BASE_URL, $log, WeQuote, OfflineData) {
			var that = this;

			var getOfflineListPromise = function(params) {

				return OfflineData.get().then(function(quotes) {
					var authors = {};

					_.each(quotes,function(quote){
						var authorCount = authors[_.str.trim(quote.author.toLowerCase())] || 0;
						authors[_.str.trim(quote.author.toLowerCase())]=authorCount+1;
					});

					authors = _.map(_.pairs(authors),function(authorRow){
						return {
							name:authorRow[0],
							count:authorRow[1]
						};
					});

					authors = _.sortBy(authors,'name');

					return authors;
				});
			};

			var getOnlineListPromise = function(params) {
				return $http({
					method: 'GET',
					url: SERVER_BASE_URL + 'authors'
				}).then(function(response){
					return response.data;
				});
			};

			return {
				list: function() {
					$log.debug('downloading authors');

					var promise = (WeQuote.isOnline() ? getOnlineListPromise() : getOfflineListPromise());

					promise.then(function(authors) {
						return _.map(authors, function(author) {
							author.name = _.str.capitalize(_.str.trim(author.name));
							return author;
						});
					});

					return promise;
				}
			};
		}
	])
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