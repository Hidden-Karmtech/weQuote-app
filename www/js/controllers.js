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
		'ControllerState',
		function($scope, $state, QuotesState, $ionicScrollDelegate, $log, $filter, Repository, QueryType, ControllerState) {

			var that = this;

			$scope.state = ControllerState;

			$scope.$on('$stateChangeSuccess', function() {
				if (!$scope.state.data) {

					$scope.loaded = false;

					Repository.list().then(function(results) {
						results = _.map(results, function(object) {
							object.toPrint = object.name + '(' + object.count + ')';
							return object;
						});

						$scope.sort(results, "name");

						$scope.loaded = true;

					});

				} else {

					$scope.loaded = true;
				}
			});

			$scope.onSubmit = function() {
				var results = $filter('filter')($scope.state.data, $scope.query);
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
				QuotesState.currentIndex = null;
				QuotesState.currentQuote = null;

				$scope.goTo('quotes');
			}

			$scope.sort = function(results, sortProperty, descending) {

				//If the property has changed, Use the default property Ordering
				if (sortProperty !== $scope.state.sortType) {
					descending = sortProperty === 'name' ? false : true;
					$scope.state.sortType = sortProperty;
				}

				$scope.state.sortDescending = descending;

				results = results || $scope.state.data;

				$scope.state.data = _.sortBy(results, $scope.state.sortType);
				if ($scope.state.sortDescending) {
					$scope.state.data = $scope.state.data.reverse();
				}

				$ionicScrollDelegate.scrollTop(false);
			}

			$scope.getSortIcon = function(toCheck) {
				if ($scope.state.sortType !== toCheck) {
					return 'sort';
				} else {
					return $scope.state.sortDescending ? 'sort-desc' : 'sort-asc';
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
		'TagsState',
		function($scope, TagRepository, $controller, TagsState) {
			angular.extend(this, $controller('BaseListController', {
				'$scope': $scope,
				QueryType: 'tag',
				Repository: TagRepository,
				ControllerState: TagsState
			}));
		}
	])
	.controller('Authors', [
		'$scope',
		'AuthorRepository',
		'$controller',
		'AuthorsState',
		function($scope, AuthorRepository, $controller, AuthorsState) {
			angular.extend(this, $controller('BaseListController', {
				'$scope': $scope,
				QueryType: 'author',
				Repository: AuthorRepository,
				ControllerState: AuthorsState
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
		'Colors',
		'$ionicPopup',
		'CreateState',
		'ServerLogger',
		function($scope, $log, QuoteRepository, $ionicSideMenuDelegate, QuotesState, $cordovaCamera, $cordovaToast, BackgroundSelector, $timeout, $ionicActionSheet, Colors, $ionicPopup, CreateState,ServerLogger) {

			var MIN_SIZE = 15;
			var SECOND_FOR_EXIT = 5;
			var downloading = false;
			var lastBackClick = null;

			$scope.state = QuotesState;
			$scope.sharing = false;
			$scope.lastSearch = "";
			$scope.loadingQuote = false;

			if (_.isEmpty($scope.state)) {
				$scope.state.currentIndex = null;
				$scope.state.currentQuote = null;
				$scope.state.quotes = [];
				$scope.state.query = {
					type: 'search',
					value: ""
				};
			}

			$scope.$on('$stateChangeSuccess', function() {
				if ($scope.state.quotes.length === 0) {
					reloadQuotes();
				} else {
					if ($scope.state.currentQuote && $scope.state.currentQuote.custom) {
						$cordovaToast.show('Utilizza il menù per modificare il testo della tua citazione', 'short', 'top');
					}
					printQuote();
					if ($scope.state.quotes.length <= MIN_SIZE) {
						downloadQuotes();
					}
				}
			});

			var editCustomQuote = function() {
				if ($scope.state.currentQuote.custom) {
					CreateState.author = $scope.state.currentQuote.author;
					CreateState.text = $scope.state.currentQuote.text;
					$scope.goTo('create');
				}
			};

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
				reloadQuotes();
			}

			$scope.onChangeSearch = function() {
				$log.debug("onChangeSearch");
				$scope.state.query.type = "search";
				if ($scope.state.query.value !== $scope.lastSearch) {
					$scope.lastSearch = $scope.state.query.value;
					reloadQuotes();
				}
			}

			$scope.toggleLeft = function() {
				$ionicSideMenuDelegate.toggleLeft();
			};

			$scope.previous = function() {
				if (!$scope.loadingQuote && $scope.state.currentIndex) {
					ServerLogger.log("previous");
					$scope.state.currentIndex--;
					$scope.state.currentQuote = $scope.state.quotes[$scope.state.currentIndex];

					printQuote();
				}
			};

			$scope.next = function(swipe) {
				if (!$scope.loadingQuote) {
					ServerLogger.log(swipe ? 'swipeNext' : 'buttonNext');
					var quotesLeft = $scope.state.quotes.length - $scope.state.currentIndex;
					
					if(quotesLeft > 1){
						$scope.state.currentIndex++;
						$scope.state.currentQuote = $scope.state.quotes[$scope.state.currentIndex];

						printQuote();

						$log.debug(quotesLeft + " quotes left");

						if (quotesLeft <= MIN_SIZE && !downloading) {
							downloadQuotes();
						}	
					}else{
						$scope.loadingQuote = true;
						downloadQuotes(function(){
							$scope.loadingQuote = false;
							$scope.next();
						});
					}
				}
			};

			$scope.getShareIcon = function() {
				if (!$scope.sharing) {
					return $scope.isAndroid() ? 'ion-android-share-alt' : 'ion-share'
				} else {
					return 'ion-loading-a';
				}
			};

			var printQuote = function(quote) {

				quote = quote || $scope.state.currentQuote;

				if (quote) {

					if (!quote.url) {
						BackgroundSelector.applyNewBackground(quote);
					}

					$log.debug("Using quote: " + quote.text);

					$scope.loadingQuote = true;
					$timeout(function() {
						$scope.$broadcast('generate-quote', quote, function() {
							$scope.loadingQuote = false;
						});
					}, 300);

				}
			};

			$scope.share = function(quote) {
				if (!$scope.sharing) {
					$scope.sharing = true;
					$timeout(function() {
						$scope.$broadcast('generate-canvas', quote, function(imgData) {
							$scope.sharing = false;
							
							QuoteRepository.share(quote, imgData).then(function(result) {
								$log.debug("Sharing complete");
							});
						});
					}, 300);
				}
			}

			var reloadQuotes = function(skipPrint) {
				$scope.state.quotes = [];
				$scope.loadingQuote = true;
				downloadQuotes(function(quotes) {
					if (quotes.length > 0) {
						$scope.state.currentIndex = 0;
						$scope.state.currentQuote = quotes[0];
						$scope.loadingQuote = false;
						if (!skipPrint) {
							printQuote();
						}
					} else {
						$ionicPopup.alert({
							title: "Nessuna Citazione corrispondente ai parametri di ricerca",
							okType: 'button-royal'
						}).then(function(res) {
							$scope.clearText();
						});
					}
				});
			}

			var takePhoto = function(cameraMode) {

				ServerLogger.log('photo');

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
					printQuote();
				}, function(err) {
					$log.error(err);
				});
			};

			var showColorMenu = function() {

				var colorsArray = _.toArray(Colors);

				var buttons = _.map(colorsArray, function(color) {
					return {
						text: color.label
					};
				});

				$ionicActionSheet.show({
					buttons: buttons,
					cancelText: 'Annulla',
					buttonClicked: function(index) {
						$scope.state.currentQuote.fontColor = colorsArray[index].value;
						printQuote();
						return true;
					}
				});
			};

			$scope.showMenu = function() {

				var callbacks = [
					function() {
						takePhoto(true);
					},
					function() {
						takePhoto(false);
					},
					function() {
						BackgroundSelector.applyNewBackground($scope.state.quotes[$scope.state.currentIndex]);
						printQuote();
					},
					function() {
						showColorMenu();
					}
				];

				var buttons = [{
					text: 'Scatta Foto'
				}, {
					text: 'Foto Galleria'
				}, {
					text: 'Cambia Sfondo'
				}, {
					text: 'Cambia Colore Testo'
				}];

				if($scope.state.currentQuote.custom){
					callbacks.push(editCustomQuote);
					buttons.push({
						text: 'Modifica Citazione'
					});
				}else{
					callbacks.push(function(){
						CreateState.author = "";
						CreateState.text = "";
						$scope.goTo('create');
					});
					buttons.push({
						text: 'Nuova Citazione'
					});
				}

				$ionicActionSheet.show({
					buttons: buttons,
					cancelText: 'Annulla',
					buttonClicked: function(index) {
						callbacks[index]();
						return true;
					}
				});
			};

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
	])
	.controller('CreateQuote', [
		'$scope',
		'$state',
		'QuotesState',
		'CreateState',
		function($scope, $state, QuotesState, CreateState) {

			$scope.state = CreateState;

			$scope.isValidData = function() {
				return $scope.state.author.length && $scope.state.text.length;
			};

			$scope.reset = function() {
				$scope.state.author = "";
				$scope.state.text = "";
			};

			$scope.confirm = function() {
				if ($scope.isValidData()) {
					var quote = {
						text: $scope.state.text,
						author: $scope.state.author,
						tags: [],
						custom: true
					};

					QuotesState.query = {
						type: 'search',
						value: ""
					};

					QuotesState.quotes = [quote];
					QuotesState.currentIndex = 0;
					QuotesState.currentQuote = quote;

					$state.go('quotes');
				}
			};

			$scope.$on('back-button-action', function(event, args) {
				$scope.goTo('quotes');
			});
		}
	])