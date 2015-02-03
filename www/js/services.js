angular.module('weQuote.services', [])
	.value('QuotesState', {})
	.value('TagsState', {})
	.value('AuthorsState', {})
	.service('CardSize', ['$window', '$log', function($window, $log) {
		var that = this;
		return {
			init: function() {
				var width = Math.floor($window.innerWidth * 95 / 100);
				var visibleHeight = $window.innerHeight - 44 //Header Bar
					- 44 //Footer Bar
					- 44 //Search Bar
					- 50; //Padding

				var height = Math.floor(visibleHeight * 90 / 100);

				$log.debug("calculated width: " + width);
				$log.debug("calculated height: " + height);

				that.size = width < height ? width : height;
			},
			getSize: function() {
				return that.size;
			}
		}
	}])
	.service('CardGenerator', ['$log','CardSize', function($log,CardSize) {
		
		var TEXT_SCALE_FACTOR = 0.9;
		var TEXT_X_OFFSET = 3;
		var WATERMARK_OFFSET = 3;
		var AUTHOR_OFFSET = 7;
		var WATERMARK_FONT_SIZE = 4.5;
		var AUTHOR_FONT_SIZE = 7;
		var BORDER_WIDTH = 3.5;
		var HEIGHT_THRESHOLD = 60;
		var START_FONT_SIZE = 10;

		var printQuoteText = function(area, quote) {

			var startFontSize = area.size * (START_FONT_SIZE / 100);
			var xOffset = area.size * (TEXT_X_OFFSET / 100);
			var fontColor = quote.fontColor || '#FFFFFF';

			var printText = function(text, fontSize, size) {
				
				area.textCanvas.text(text);
				area.textCanvas.fontSize(fontSize);
				area.textCanvas.fill(fontColor);
				area.textCanvas.x(xOffset);
				area.textCanvas.width(size - (xOffset * 2));

			};

			var HeightThreshold = area.size * (HEIGHT_THRESHOLD / 100);
			var fontSize;
			var textHeight;

			do {
				fontSize = fontSize ? (fontSize * TEXT_SCALE_FACTOR) : (startFontSize || 36);
				printText(quote.text, fontSize, area.size);
				textHeight = area.textCanvas.getAttr('height');

				$log.debug("Font Ratio: " + (quote.text.length / fontSize));
			} while (textHeight > HeightThreshold)

			//Y center
			area.textCanvas.setAttr('y', (area.size - textHeight) / 2);
		};

		var printWatermark = function(area, quote) {

			var watermark = area.watermark;
			var offset = area.size * (WATERMARK_OFFSET / 100);
			var fontSize = area.size * (WATERMARK_FONT_SIZE / 100);
			var fontColor = quote.fontColor || '#FFFFFF';

			watermark.fontSize(fontSize);
			watermark.x(offset);
			watermark.y(offset);
			watermark.fill(fontColor);
			watermark.width(area.size);
		};

		var printAuthorText = function(area, quote) {

			var authorText = area.authorText;
			var fontSize = area.size * (AUTHOR_FONT_SIZE / 100);
			var fontColor = quote.fontColor || '#FFFFFF';

			authorText.text(quote.author);
			authorText.fontSize(fontSize);
			authorText.fill(fontColor);
			authorText.width(area.size);

			//Stick to bottom

			var yOffset = area.size * (AUTHOR_OFFSET / 100);

			var textHeight = authorText.getAttr('height');
			authorText.y(area.size - textHeight - yOffset);
		};

		return {
			generateEmptyCard: function(containerId, size) {

				var size = size || CardSize.getSize();

				var strokeWidth = size * (BORDER_WIDTH / 100);

				var stage = new Kinetic.Stage({
					container: containerId,
					width: size,
					height: size
				});

				var layer = new Kinetic.Layer();

				var textCanvas = new Kinetic.Text({
					fontFamily: 'Lobster',
					padding: 0,
					align: 'center'
				});

				var watermark = new Kinetic.Text({
					text: 'wequote.it',
					fontFamily: 'Lobster',
					padding: 0,
					align: 'left'
				});


				var authorText = new Kinetic.Text({
					fontFamily: 'Lobster',
					padding: 0,
					align: 'center'
				});

				var rectBorder = new Kinetic.Image({
					x: 0,
					y: 0,
					width: size,
					height: size,
					fillAlpha: 0,
					stroke: '#98A4D7',
					strokeWidth: strokeWidth
				});

				var imageBackground = new Kinetic.Image({
					x: 0,
					y: 0,
					width: size,
					height: size
				});

				layer.add(imageBackground);
				layer.add(rectBorder);
				layer.add(authorText);
				layer.add(textCanvas);
				layer.add(watermark);

				stage.add(layer);

				return {
					stage: stage,
					mainLayer: layer,
					textCanvas: textCanvas,
					imageBackground: imageBackground,
					rectBorder: rectBorder,
					authorText: authorText,
					watermark: watermark,
					size: size
				};
			},
			updateCard: function(area,imageObj, quote, startFontSize) {
				area.imageBackground.image(imageObj);
				
				printAuthorText(area,quote);
				printQuoteText(area,quote);
				printWatermark(area,quote);

				area.stage.draw();
			}
		}
	}])
	.service('OfflineData', ['$http', '$log', function($http, $log) {
		return {
			get: function() {
				return $http.get("data.json").then(function(response) {
					return response.data;
				});
			}
		}
	}])
	.constant('Backgrounds', {
		amore: 4,
		fede: 3,
		misc: 21,
		musica: 3,
		passione: 5,
		calcio: 3,
		vita: 2
	})
	.service('BackgroundSelector', ['$log', 'Backgrounds', function($log, Backgrounds) {
		var that = this;

		this.lastUrl = null;

		var calculateBackground = function(quote) {
			var validFiles = [];
			var i = 0;

			var validTags = _.filter(quote.tags, function(tag) {
				return Backgrounds[tag.name];
			});

			if (validTags.length) {
				validTags = _.map(validTags, function(tag) {
					return tag.name;
				});
			} else {
				validTags = ['misc'];
			}

			_.each(validTags, function(tag) {
				var count = Backgrounds[tag];

				if (count) {
					for (i = 0; i < count; i++) {
						validFiles.push(tag + '/' + _.str.pad(i, 3, '0') + '.jpg');
					}
				}
			});

			var toReturn = 'img/backgrounds/' + validFiles[_.random(0, validFiles.length - 1)];

			$log.debug("Using Background " + toReturn);

			return toReturn;

		};

		return {
			newBackground: function(quote) {
				var url;
				do {
					url = calculateBackground(quote);
				} while (url === that.lastUrl);

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
		'$log',
		function($http, SERVER_BASE_URL, WeQuote, OfflineData, $cordovaSocialSharing, MAX_LEN, $log) {
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
								quoteId: quote['_id'],
								deviceUUID: WeQuote.getUUID()
							};

							return $http({
								method: 'POST',
								url: SERVER_BASE_URL + 'share',
								data: params
							}).then(function(result) {
								return result;
							}, function() {
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
		function($http, SERVER_BASE_URL, $log, WeQuote, OfflineData, MAX_LEN) {
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
					params: {
						maxlen: MAX_LEN
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
		function($http, SERVER_BASE_URL, $log, WeQuote, OfflineData, MAX_LEN) {
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
					params: {
						maxlen: MAX_LEN
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