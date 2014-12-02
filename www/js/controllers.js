angular.module('weQuote.controllers', [])
.controller('Root', ['$scope','$state',function($scope,$state) {
	$scope.exit = function(){
		ionic.Platform.exitApp();
	}

	$scope.$on('$stateChangeSuccess',function(event,toState){
		$scope.title = toState.title || '#weQuote';
	});

	$scope.title = $state.title || '#weQuote';
}])
.controller('About', ['$scope',function($scope) {
	$scope.openLink = function() {
    	window.open('http://www.wequote.it', '_system', 'location=yes');
  	};	
}])
.controller('Tags', ['$scope','TagRepository',function($scope,TagRepository) {
	$scope.tags=[];
	TagRepository.list().then(function(tags){
			$scope.tags = _.map(tags,function(tag){
				tag.name = _.str.capitalize(_.str.trim(tag.name));
				return tag;
			});
	});	
}])
.controller('Authors', ['$scope','AuthorRepository',function($scope,AuthorRepository) {
	$scope.authors=[];
	AuthorRepository.list().then(function(authors){
			$scope.authors = _.map(authors,function(author){
				author.name = _.str.capitalize(_.str.trim(author.name));
				return author;
			});
	});	
}])
.controller('Quotes', ['$scope','$log','QuoteRepository','$ionicSideMenuDelegate',function($scope,$log,QuoteRepository,$ionicSideMenuDelegate) {

	var MIN_SIZE = 5;
	var IMAGES = 20;
	var quotes = [];
	var downloading = false;

	$scope.visibleQuotes = [];
	$scope.sharing = false;

	var downloadQuotes = function(onComplete){
		downloading = true;
		QuoteRepository.list().then(function(newQuotes){
			$log.debug(newQuotes.length + " downloaded");
			
			downloading = false;
			quotes = _.union(quotes,_.shuffle(newQuotes));
			
			if(onComplete){
				onComplete(quotes);
			}
		});
	}

	$scope.toggleLeft = function() {
    	$ionicSideMenuDelegate.toggleLeft();
  	};

	$scope.cardDestroyed = function(index){
		$scope.visibleQuotes = [quotes.pop()];
		$log.debug(quotes.length + " left");
		if(quotes.length <= MIN_SIZE && !downloading){
			downloadQuotes();
		}
	}

	$scope.share = function(quote){
		$scope.sharing = true;
		var url = 'img/backgrounds/Amore/' + $scope.imageUrl + '.png';
		$scope.$broadcast('generate-canvas',url,quote,function(imgData){
			window.plugins.socialsharing.share(null, 'weQuote', imgData, null);
			$scope.sharing = false;
			$scope.$apply();
		});
	}

	downloadQuotes(function(quotes){
		$scope.visibleQuotes = [quotes.pop()];
	});

	$scope.$watch('visibleQuotes',function(newValue){
		if(newValue.length){
			$scope.imageUrl = _.str.pad(Date.now() % IMAGES,3,'0');
		}
	});
}]);