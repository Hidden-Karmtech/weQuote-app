angular.module('weQuote.controllers', [])
	.controller('Root', ['$scope', '$state', function($scope, $state) {
		
		$scope.exit = function() {
			ionic.Platform.exitApp();
		}

		$scope.goTo = function(url) {
			$state.go(url);
		}

		$scope.isAndroid = function() {
			return ionic.Platform.isAndroid();
		};

		$scope.$on('$stateChangeSuccess', function(event, toState) {
			$scope.title = toState.title || '#weQuote';
		});

		$scope.title = $state.title || '#weQuote';
	}])
	.controller('About', ['$scope', '$state', function($scope, $state) {
		$scope.openLink = function() {
			window.open('http://www.wequote.it', '_system', 'location=yes');
		};

		$scope.$on('back-button-action', function(event, args) {
			$scope.goTo('quotes');
		});
	}])
	.controller('Tags', [
		'$scope',
		'TagRepository',
		'$state',
		'QuotesState',
		'$ionicScrollDelegate',
		'$log',
		'$filter',
		function($scope, TagRepository, $state, QuotesState, $ionicScrollDelegate, $log,$filter) {

			$scope.$on('$stateChangeSuccess', function() {
				$scope.loaded = false;
				TagRepository.list().then(function(tags) {
					tags = _.map(tags, function(tag) {
						tag.toPrint = tag.name + '(' + tag.count + ')';
						return tag;
					});

					$scope.sortAlphabetically(tags);

					$scope.loaded = true;

					$ionicScrollDelegate.scrollTop(false);
				});
			});

			$scope.onSubmit = function(){
				var results = $filter('filter')($scope.visibleTags,$scope.query);
				if(results.length === 1){
					$scope.toQuotes(results[0]);
				}
			}

			$scope.clearText = function() {
				$scope.query = "";
			}

			$scope.toQuotes = function(tag) {
				QuotesState.query = {
					type: 'tag',
					value: tag.name
				};

				QuotesState.quotes = [];
				QuotesState.currentQuote = null;

				$scope.goTo('quotes');
			}

			$scope.sortAlphabetically = function(tags){
				tags = tags || $scope.visibleTags;
				$scope.visibleTags = _.sortBy(tags,"name");
				$scope.sortType = "name";
			};

			$scope.sortCount = function(tags){
				tags = tags || $scope.visibleTags;
				$scope.visibleTags = _.sortBy(tags,"count").reverse();
				$scope.sortType = "count";
			};

			$scope.$on('back-button-action', function(event, args) {
				$scope.goTo('quotes');
			});
		}
	])
	.controller('Authors', [
		'$scope',
		'AuthorRepository',
		'$state',
		'QuotesState',
		'$ionicScrollDelegate',
		'$log',
		'$filter',
		function($scope, AuthorRepository, $state, QuotesState, $ionicScrollDelegate, $log,$filter) {

			$scope.toQuotes = function(author) {
				QuotesState.query = {
					type: 'author',
					value: author.name
				};

				QuotesState.quotes = [];
				QuotesState.currentQuote = null;

				$scope.goTo('quotes');
			}

			$scope.onSubmit = function(){
				var results = $filter('filter')($scope.visibleAuthors,$scope.query);
				if(results.length === 1){
					$scope.toQuotes(results[0]);
				}
			}

			$scope.clearText = function() {
				$scope.query = "";
			}

			$scope.$on('$stateChangeSuccess', function() {
				$scope.loaded = false;
				AuthorRepository.list().then(function(authors) {
					authors = _.map(authors, function(author) {
						author.toPrint = author.name + '(' + author.count + ')';
						return author;
					});

					$scope.sortAlphabetically(authors);
					
					$scope.loaded = true;
				
					$ionicScrollDelegate.scrollTop(false);
				});
			});

			$scope.sortAlphabetically = function(authors){
				authors = authors || $scope.visibleAuthors;
				$scope.visibleAuthors = _.sortBy(authors,"name");
				$scope.sortType = "name";
			};

			$scope.sortCount = function(authors){
				authors = authors || $scope.visibleAuthors;
				$scope.visibleAuthors = _.sortBy(authors,"count").reverse();
				$scope.sortType = "count";
			};

			$scope.$on('back-button-action', function(event, args) {
				$scope.goTo('quotes');
			});
		}
	])
	.constant('Backgrounds',{
		amore:2,
		fede:2,
		misc:5,
		musica:2,
		passione:1,
		universo:2,
		vita:1
	})
	.controller('Quotes', ['$scope',
		'$log',
		'QuoteRepository',
		'$ionicSideMenuDelegate',
		'QuotesState',
		'$cordovaCamera',
		'$cordovaToast',
		'Backgrounds',
		function($scope, $log, QuoteRepository, $ionicSideMenuDelegate, QuotesState, $cordovaCamera, $cordovaToast,Backgrounds) {

			var MIN_SIZE = 15;
			var SECOND_FOR_EXIT = 5;
			var downloading = false;
			var lastBackClick = null;

			$scope.state = QuotesState;
			$scope.sharing = false;
			$scope.lastSearch = "";

			if (_.isEmpty($scope.state)) {
				$scope.state.currentQuote = null;
				$scope.state.quotes = [];
				$scope.state.query = {
					type: 'search',
					value: ""
				};
			}

			var downloadQuotes = function(onComplete) {
				downloading = true;
				QuoteRepository.list($scope.state.query).then(function(newQuotes) {
					$log.debug(newQuotes.length + " downloaded");

					downloading = false;
					$scope.state.quotes = _.union($scope.state.quotes, _.shuffle(newQuotes));

					if (onComplete) {
						onComplete($scope.state.quotes);
					}
				});
			}
			$scope.clearText = function() {
				$scope.state.query.value = "";
				$scope.state.currentQuote = null;
				reloadQuotes();
			}
			$scope.toggleLeft = function() {
				$ionicSideMenuDelegate.toggleLeft();
			};

			$scope.next = function() {
				if ($scope.state.quotes.length > 0) {
					grabQuote($scope.state.quotes);
					$log.debug($scope.state.quotes.length + " left");
					if ($scope.state.quotes.length <= MIN_SIZE && !downloading) {
						downloadQuotes();
					}
				} else {
					downloadQuotes(function() {
						$scope.next();
					});
				}
			};

			$scope.getShareIcon = function() {
				if (!$scope.sharing) {
					return $scope.isAndroid() ? 'ion-android-share-alt' : 'ion-share'
				} else {
					return 'ion-loading-a';
				}
			};

			$scope.share = function(quote) {
				if (!$scope.sharing) {
					$scope.sharing = true;
					$scope.$broadcast('generate-canvas', quote, function(imgData) {
						QuoteRepository.share(quote, imgData).then(function(result) {
							$scope.sharing = false;
							$scope.$apply();
						});
					});
				}
			}

			var grabQuote = function(quotes) {
				var quote = quotes.pop();
				var tagName = quote.tags[_.random(0,quote.tags.length-1)].name;

				$log.debug("using tag " + tagName);

				var count = Backgrounds[tagName];
				if(!count){
					$log.debug("tag " + tagName + " not valid using misc");
					tagName = 'misc';
					count = Backgrounds.misc;
				}

				quote.url = 'img/backgrounds/' + tagName + '/' + _.str.pad(_.random(0,count-1), 3, '0') + '.jpg';
				$scope.state.currentQuote = quote;
			};

			var reloadQuotes = function() {
				$scope.state.quotes = [];
				$scope.state.currentQuote = null;
				downloadQuotes(function(quotes) {
					if (quotes.length > 0) {
						grabQuote(quotes);
					} else {
						swal({
								title: "Nessuna Citazione corrispondente ai parametri di ricerca",
								confirmButtonColor: "#5264AE",
								closeOnConfirm: true
							},
							function() {
								$scope.clearText();
							});
					}
				});
			}

			$scope.onChangeSearch = function() {
				$log.debug("onChangeSearch");
				$scope.state.query.type = "search";
				if ($scope.state.query.value !== $scope.lastSearch) {
					$scope.lastSearch = $scope.state.query.value;
					$scope.state.currentQuote = null;
					reloadQuotes();
				}
			}

			$scope.startCamera = function() {
				var options = {
					quality: 100,
					destinationType: Camera.DestinationType.DATA_URL,
					sourceType: Camera.PictureSourceType.CAMERA,
					allowEdit: true,
					encodingType: Camera.EncodingType.PNG,
					targetWidth: 1000,
					targetHeight: 1000,
					correctOrientation: true,
					popoverOptions: CameraPopoverOptions,
					saveToPhotoAlbum: false
				};

				$cordovaCamera.getPicture(options).then(function(imageData) {
					$scope.state.currentQuote.url = "data:image/png;base64," + imageData;
				}, function(err) {
					// An error occurred. Show a message to the user
				});
			};


			$scope.$on('$stateChangeSuccess', function() {
				if (!$scope.state.quotes.length) {
					reloadQuotes();
				}
			});

			$scope.$on('back-button-action', function(event, args) {
				if(lastBackClick!=null){
					var currentDate = new Date();
					var difference = (currentDate - lastBackClick) / 1000;
					if(difference <= SECOND_FOR_EXIT){
						ionic.Platform.exitApp();
					}else{
						$scope.showToast();
					}
				}else{
					$scope.showToast();
				}				
			});

			$scope.showToast = function() {
				$cordovaToast.show('Clicca di nuovo per uscire', 'long', 'top')
				.then(function(success) {
				    lastBackClick = new Date();				   
				}, function (error) {
				    lastBackClick = null;
				});
			}
		}
	]);