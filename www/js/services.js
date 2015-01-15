angular.module('weQuote.services', [])
	.constant('SERVER_BASE_URL', 'https://api-wequote.rhcloud.com/')
	.constant('MAX_LEN', 200)
	.value('QuotesState', {})
	.service('OfflineData', ['$http', '$log', function($http, $log) {
		return {
			get: function() {
				return $http.get("data.json").then(function(response) {
					return response.data;
				});
			}
		}
	}])
	.constant('Backgrounds',{
		amore:4,
		fede:2,
		misc:14,
		musica:2,
		passione:5,
		sport:3,
		universo:2,
		vita:2
	})
	.service('BackgroundSelector', ['$log','Backgrounds', function($log,Backgrounds) {
		var that = this;

		this.lastUrl = null;

		var calculateBackground = function(quote){
			var tagName = quote.tags[_.random(0,quote.tags.length-1)].name;

			$log.debug("using tag " + tagName);

			var count = Backgrounds[tagName];
			if(!count){
				$log.debug("tag " + tagName + " not valid using misc");
				tagName = 'misc';
				count = Backgrounds.misc;
			}

			var toReturn = 'img/backgrounds/' + tagName + '/' + _.str.pad(_.random(0,count-1), 3, '0') + '.jpg';

			$log.debug(toReturn);

			return toReturn;
				
		};

		return {
			newBackground:function(quote){
				var url;
				do{
					url = calculateBackground(quote);
				}while(url === that.lastUrl);

				that.lastUrl = url;

				return url;
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
				timeout: 10000
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

							return result;
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
	.service('QuoteRepository', [
		'$http',
		'SERVER_BASE_URL',
		'WeQuote',
		'OfflineData',
		'$cordovaSocialSharing',
		'MAX_LEN',
		function($http, SERVER_BASE_URL, WeQuote, OfflineData, $cordovaSocialSharing,MAX_LEN) {
			var that = this;

			var filterOfflineQuotes = function(quotes, type, text) {
				var filterFunctions = {
					search: function(quote) {
						return _.str.include(quote.text.toLowerCase(), text.toLowerCase());
					},
					tag: function(quote) {
						var result = _.find(quote.tags, function(tag) {
							return _.str.trim(tag.name.toLowerCase()) === text.toLowerCase();
						});

						return !!result;
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
				},
				share: function(quote, image) {
					var text = image ? "" : quote.text;
					return $cordovaSocialSharing.share(text, 'weQuote', image, null).then(function(result) {
						if (result) {
							var params = {
								quoteId: quote.id,
								deviceUUID: that.UUID
							};

							return $http({
								method: 'POST',
								url: SERVER_BASE_URL + 'share',
								params: params
							}).then(function(result){
								return result;
							},function(){
								return false;
							})
						}

						return result;
					});

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
		'MAX_LEN',
		function($http, SERVER_BASE_URL, $log, WeQuote, OfflineData,MAX_LEN) {
			var that = this;

			var getOfflineListPromise = function(params) {

				return OfflineData.get().then(function(quotes) {
					var authors = {};

					_.each(quotes, function(quote) {
						var authorCount = authors[_.str.trim(quote.author.toLowerCase())] || 0;
						authors[_.str.trim(quote.author.toLowerCase())] = authorCount + 1;
					});

					authors = _.map(_.pairs(authors), function(authorRow) {
						return {
							name: authorRow[0],
							count: authorRow[1]
						};
					});

					authors = _.sortBy(authors, 'name');

					return authors;
				});
			};

			var getOnlineListPromise = function(params) {
				return $http({
					method: 'GET',
					url: SERVER_BASE_URL + 'authors',
					params:{
						maxlen:MAX_LEN
					}
				}).then(function(response) {
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
	.service('TagRepository', [
		'$http',
		'SERVER_BASE_URL',
		'$log',
		'WeQuote',
		'OfflineData',
		'MAX_LEN',
		function($http, SERVER_BASE_URL, $log, WeQuote, OfflineData,MAX_LEN) {
			var that = this;

			var getOfflineListPromise = function(params) {

				return OfflineData.get().then(function(quotes) {
					var tags = {};

					_.each(quotes, function(quote) {
						_.each(quote.tags, function(tag) {
							var tagCount = tags[_.str.trim(tag.name.toLowerCase())] || 0;
							tags[_.str.trim(tag.name.toLowerCase())] = tagCount + 1;
						});

					});

					tags = _.map(_.pairs(tags), function(tagRow) {
						return {
							name: tagRow[0],
							count: tagRow[1]
						};
					});

					tags = _.sortBy(tags, 'name');

					return tags;
				});
			};

			var getOnlineListPromise = function(params) {
				return $http({
					method: 'GET',
					url: SERVER_BASE_URL + 'tags',
					params:{
						maxlen:MAX_LEN
					}
				}).then(function(response) {
					return response.data;
				});
			};

			return {
				list: function() {
					$log.debug('downloading tags');

					var promise = (WeQuote.isOnline() ? getOnlineListPromise() : getOfflineListPromise());

					promise.then(function(tags) {
						return _.map(tags, function(tag) {
							tag.name = _.str.capitalize(_.str.trim(tag.name));
							return tag;
						});
					});

					return promise;
				}
			};
		}
	]);