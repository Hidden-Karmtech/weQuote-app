angular.module('weQuote.controllers', [])
	.controller('Root', ['$scope', '$state','CardSize', function($scope, $state,CardSize) {

		$scope.exit = function() {
			ionic.Platform.exitApp();
		}

		$scope.goTo = function(url) {
			$state.go(url);
		}

		$scope.isAndroid = function() {
			return ionic.Platform.isAndroid();
		};

		CardSize.init();

		$scope.$on('$stateChangeSuccess', function(event, toState) {
			$scope.title = toState.title || '#weQuote';
			$scope.isQuote = toState.name === 'quotes';
		});

		$scope.isQuote = false;

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
	.controller('BaseListController', [
		'$scope',
		'$state',
		'QuotesState',
		'$ionicScrollDelegate',
		'$log',
		'$filter',
		'Repository',
		'QueryType',
		function($scope, $state, QuotesState, $ionicScrollDelegate, $log, $filter, Repository, QueryType) {

			var that = this;

			$scope.$on('$stateChangeSuccess', function() {
				$scope.loaded = false;
				Repository.list().then(function(results) {
					results = _.map(results, function(object) {
						object.toPrint = object.name + '(' + object.count + ')';
						return object;
					});

					$scope.sort(results,"name");

					$scope.loaded = true;

				});
			});

			$scope.onSubmit = function() {
				var results = $filter('filter')($scope.data, $scope.query);
				if (results.length === 1) {
					$scope.toQuotes(results[0]);
				}
			}

			$scope.clearText = function() {
				$scope.query = "";
			}

			$scope.toQuotes = function(tag) {
				QuotesState.query = {
					type: QueryType,
					value: tag.name
				};

				QuotesState.quotes = [];
				QuotesState.currentQuote = null;

				$scope.goTo('quotes');
			}

			$scope.sort = function(results,sortProperty,descending){

				$scope.sortType = sortProperty;
				$scope.sortDescending = descending;

				results = results || $scope.data;
				
				$scope.data = _.sortBy(results,$scope.sortType);
				if($scope.sortDescending){
					$scope.data = $scope.data.reverse();
				}

				$ionicScrollDelegate.scrollTop(false);
			}

			$scope.getSortIcon = function(toCheck){
				if($scope.sortType !== toCheck){
					return 'sort';
				}else{
					return $scope.sortDescending ? 'sort-desc' : 'sort-asc';
				}
			}

			$scope.$on('back-button-action', function(event, args) {
				$scope.goTo('quotes');
			});

		}
	])
	.controller('Tags', [
		'$scope',
		'TagRepository',
		'$controller',
		function($scope, TagRepository, $controller) {
			angular.extend(this, $controller('BaseListController', {
				'$scope': $scope,
				QueryType: 'tag',
				Repository: TagRepository
			}));
		}
	])
	.controller('Authors', [
		'$scope',
		'AuthorRepository',
		'$controller',

		function($scope, AuthorRepository, $controller) {
			angular.extend(this, $controller('BaseListController', {
				'$scope': $scope,
				QueryType: 'author',
				Repository: AuthorRepository
			}));
		}
	])
	.controller('Quotes', ['$scope',
		'$log',
		'QuoteRepository',
		'$ionicSideMenuDelegate',
		'QuotesState',
		'$cordovaCamera',
		'$cordovaToast',
		'BackgroundSelector',
		'$timeout',
		'$ionicActionSheet',
		function($scope, $log, QuoteRepository, $ionicSideMenuDelegate, QuotesState, $cordovaCamera, $cordovaToast, BackgroundSelector, $timeout, $ionicActionSheet) {

			var MIN_SIZE = 15;
			var SECOND_FOR_EXIT = 5;
			var downloading = false;
			var lastBackClick = null;

			$scope.state = QuotesState;
			$scope.sharing = false;
			$scope.lastSearch = "";
			$scope.loadingQuote = false;

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
					_.each(newQuotes, function(q) {
						$scope.state.quotes.push(q);
					});

					if (onComplete) {
						onComplete($scope.state.quotes);
					}
				});
			}

			$scope.clearText = function() {
				$scope.state.query.value = "";
				$scope.lastSearch = "";
				$scope.state.currentQuote = null;
				reloadQuotes();
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

			$scope.toggleLeft = function() {
				$ionicSideMenuDelegate.toggleLeft();
			};

			var executeGetNextQuote = function() {
				$scope.state.currentQuote = null;

				if ($scope.state.quotes.length > 0) {
					grabQuote($scope.state.quotes);
					$log.debug($scope.state.quotes.length + " left");
					if ($scope.state.quotes.length <= MIN_SIZE && !downloading) {
						downloadQuotes();
					}
				} else {
					downloadQuotes(function() {
						executeGetNextQuote();
					});
				}
			};

			$scope.next = function() {
				$scope.loadingQuote = true;

				executeGetNextQuote();

				$timeout(function() {
					$scope.loadingQuote = false;
				}, 300);
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
						
						$scope.sharing = false;
						$scope.$apply();
						
						QuoteRepository.share(quote, imgData).then(function(result) {
							$log.debug("Sharing complete");	
						});
					});
				}
			}

			var grabQuote = function(quotes) {
				var quote = quotes.shift();

				quote.url = BackgroundSelector.newBackground(quote);

				$log.debug("Using quote: " + quote.text);

				$scope.state.currentQuote = quote;
			};

			var reloadQuotes = function() {
				$scope.state.quotes = [];
				$scope.state.currentQuote = null;
				$scope.loadingQuote = true;
				downloadQuotes(function(quotes) {
					if (quotes.length > 0) {
						grabQuote(quotes);
						$scope.loadingQuote = false;
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

			var takePhoto = function(cameraMode){
				var options = {
					quality: 100,
					destinationType: Camera.DestinationType.DATA_URL,
					sourceType: cameraMode ? Camera.PictureSourceType.CAMERA : Camera.PictureSourceType.PHOTOLIBRARY,
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
					$log.error(err);
				});
			}

			$scope.showMenu = function() {

				var callbacks = [
					function(){
						takePhoto(true);
					},
					function(){
						takePhoto(false);
					},
					function(){
						$scope.state.currentQuote.url = BackgroundSelector.newBackground($scope.state.currentQuote);
					},
					function(){
						var color = $scope.state.currentQuote.fontColor || '#FFFFFF';
						$scope.state.currentQuote.fontColor = color === '#FFFFFF' ? '#000000' : '#FFFFFF';
					}
				];

				$ionicActionSheet.show({
					buttons: [
						{
							text: 'Scatta Foto'
						}, 
						{
							text: 'Foto Galleria'
						},
						{
							text: 'Cambia Sfondo'
						},
						{
							text: 'Cambia Colore Testo'
						}
					],
					cancelText: 'Annulla',
					buttonClicked: function(index) {
						callbacks[index]();
						return true;
					}
				});


			};


			$scope.$on('$stateChangeSuccess', function() {
				if (!$scope.state.quotes.length) {
					reloadQuotes();
				}
			});

			$scope.$on('back-button-action', function(event, args) {
				if (lastBackClick != null) {
					var currentDate = new Date();
					var difference = (currentDate - lastBackClick) / 1000;
					if (difference <= SECOND_FOR_EXIT) {
						ionic.Platform.exitApp();
					} else {
						$scope.showToast();
					}
				} else {
					$scope.showToast();
				}
			});

			$scope.showToast = function() {
				$cordovaToast.show('Clicca di nuovo per uscire', 'long', 'top')
					.then(function(success) {
						lastBackClick = new Date();
					}, function(error) {
						lastBackClick = null;
					});
			}
		}
	]);