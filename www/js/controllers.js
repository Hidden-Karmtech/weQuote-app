angular.module('weQuote.controllers', [])
	.controller('Root', ['$scope', '$state', function($scope, $state) {
		$scope.exit = function() {
			ionic.Platform.exitApp();
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
			$state.go('quotes');
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

		$scope.toQuotes = function(tag) {
			QuotesState.query = {
				type:'tag',
				value:tag.name
			};

			QuotesState.visibleQuotes = [];

			$state.go('quotes');
		}

		$scope.$on('back-button-action', function(event, args) {
			$state.go('quotes');
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
				type:'author',
				value:author.name
			};

			QuotesState.visibleQuotes = [];

			$state.go('quotes');
		}

		$scope.$on('back-button-action', function(event, args) {
			$state.go('quotes');
		});
	}])
	.controller('Quotes', ['$scope', '$log', 'QuoteRepository', '$ionicSideMenuDelegate', 'QuotesState', function($scope, $log, QuoteRepository, $ionicSideMenuDelegate, QuotesState) {

		var MIN_SIZE = 5;
		var IMAGES = 20;
		var downloading = false;

		$scope.search = "";
		$scope.state = QuotesState;
		$scope.sharing = false;
		$scope.showTutorial = !localStorage.getItem('tutorial');

		if (_.isEmpty($scope.state)) {
			$scope.state.visibleQuotes = [];
			$scope.state.quotes = [];
			$scope.state.query = {
				type:'search'
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

		$scope.toggleLeft = function() {
			$ionicSideMenuDelegate.toggleLeft();
		};

		$scope.cardDestroyed = function(index) {
			$scope.state.visibleQuotes = [$scope.state.quotes.pop()];
			$log.debug($scope.state.quotes.length + " left");
			if ($scope.state.quotes.length <= MIN_SIZE && !downloading) {
				downloadQuotes();
			}
		};

		$scope.destroyTutorial = function() {
			$scope.showTutorial = false;
			localStorage.setItem('tutorial', 'done');
			downloadQuotes(function(quotes) {
				$scope.state.visibleQuotes = [quotes.pop()];
			});
		};

		$scope.share = function(quote) {
			$scope.sharing = true;
			var url = 'img/backgrounds/Amore/' + $scope.imageUrl + '.png';
			$scope.$broadcast('generate-canvas', url, quote, function(imgData) {
				window.plugins.socialsharing.share(null, 'weQuote', imgData, null);
				$scope.sharing = false;
				$scope.$apply();
			});
		}

		var reloadQuotes = function(){
			$scope.state.quotes = [];
			$scope.visibleQuotes = [];
			downloadQuotes(function(quotes) {
				if (!$scope.showTutorial) {
					$scope.state.visibleQuotes = [quotes.pop()];
				}
			});
		}

		//On first run download the quotes
		if (!$scope.state.quotes.length) {
			reloadQuotes();
		}

		$scope.onChangeSearch = function() {
			$scope.state.query.type = "search";
			reloadQuotes();
		}

		$scope.$watch('state.visibleQuotes', function(newValue) {
			if (newValue.length) {
				$scope.imageUrl = _.str.pad(Date.now() % IMAGES, 3, '0');
			}
		});

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
	}]);