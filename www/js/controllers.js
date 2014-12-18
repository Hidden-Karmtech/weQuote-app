angular.module('weQuote.controllers', [])
	.controller('Root', ['$scope', '$state', function($scope, $state) {
		$scope.exit = function() {
			ionic.Platform.exitApp();
		}

		$scope.goTo = function(url) {
			$state.go(url);
		}

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
	.controller('Tags', ['$scope', 'TagRepository', '$state', 'TagsState', 'QuotesState', function($scope, TagRepository, $state, TagsState, QuotesState) {
		$scope.state = TagsState;

		if (_.isEmpty($scope.state)) {
			$scope.state.tags = [];
			TagRepository.list().then(function(tags) {
				$scope.state.tags = tags;
			});
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

		$scope.$on('back-button-action', function(event, args) {
			$scope.goTo('quotes');	
		});
	}])
	.controller('Authors', ['$scope', 'AuthorRepository', '$state', 'AuthorsState', 'QuotesState', function($scope, AuthorRepository, $state, AuthorsState, QuotesState) {

		$scope.state = AuthorsState;

		if (_.isEmpty($scope.state)) {
			$scope.state.authors = [];
			AuthorRepository.list().then(function(authors) {
				$scope.state.authors = authors;
			});
		}

		$scope.toQuotes = function(author) {
			QuotesState.query = {
				type: 'author',
				value: author.name
			};

			QuotesState.quotes = [];
			QuotesState.currentQuote = null;

			$scope.goTo('quotes');
		}

		$scope.clearText = function() {
			$scope.query = "";
		}

		$scope.$on('back-button-action', function(event, args) {
			$scope.goTo('quotes');
		});
	}])
	.controller('Quotes', ['$scope',
		'$log',
		'QuoteRepository',
		'$ionicSideMenuDelegate',
		'QuotesState',
		'$cordovaCamera',
		function($scope, $log, QuoteRepository, $ionicSideMenuDelegate, QuotesState, $cordovaCamera) {

			var MIN_SIZE = 5;
			var IMAGES = 20;
			var downloading = false;

			$scope.state = QuotesState;
			$scope.sharing = false;

			if (_.isEmpty($scope.state)) {
				$scope.state.currentQuote = null;
				$scope.state.quotes = [];
				$scope.state.query = {
					type: 'search'
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
			}
			$scope.toggleLeft = function() {
				$ionicSideMenuDelegate.toggleLeft();
			};

			$scope.next = function() {
				var quote = $scope.state.quotes.pop();
				quote.url = 'img/backgrounds/Amore/' + _.str.pad(Date.now() % IMAGES, 3, '0') + '.png';
				$scope.state.currentQuote = quote;
				$log.debug($scope.state.quotes.length + " left");
				if ($scope.state.quotes.length <= MIN_SIZE && !downloading) {
					downloadQuotes();
				}
			};

			$scope.share = function(quote) {
				$scope.sharing = true;
				$scope.$broadcast('generate-canvas', quote, function(imgData) {
					window.plugins.socialsharing.share(null, 'weQuote', imgData, null);
					$scope.sharing = false;
					$scope.$apply();
				});
			}

			var reloadQuotes = function() {
				$scope.state.quotes = [];
				$scope.state.currentQuote = null;
				downloadQuotes(function(quotes) {
					var quote = quotes.pop();
					quote.url = 'img/backgrounds/Amore/' + _.str.pad(Date.now() % IMAGES, 3, '0') + '.png';
					$scope.state.currentQuote = quote;
				});
			}

			//On first run download the quotes
			if (!$scope.state.quotes.length) {
				reloadQuotes();
			}

			$scope.onChangeSearch = function() {
				$scope.state.query.type = "search";
				$scope.state.currentQuote = null;
				reloadQuotes();
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
					popoverOptions: CameraPopoverOptions,
					saveToPhotoAlbum: false
				};

				$cordovaCamera.getPicture(options).then(function(imageData) {
					$scope.state.currentQuote.url = "data:image/png;base64," + imageData;
				}, function(err) {
					// An error occurred. Show a message to the user
				});
			};

			$scope.$on('back-button-action', function(event, args) {
				if (true) {
					swal({
							title: "Sei sicuro di voler abbandonare #weQuote?",
							showCancelButton: true,
							confirmButtonColor: "#5264AE",
							cancelButtonText: "No",
							confirmButtonText: "Sì",
							closeOnConfirm: true
						},
						function() {
							ionic.Platform.exitApp();
						});
				}
			});
		}
	]);