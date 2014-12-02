angular.module('weQuote.controllers', [])
.controller('Root', ['$scope',function($scope) {
		
}])
.controller('About', ['$scope',function($scope) {
	$scope.openLink = function() {
    	window.open('http://www.wequote.it', '_system', 'location=yes');
  	};	
}])
.controller('Tags', ['$scope',function($scope) {
		
}])
.controller('Authors', ['$scope',function($scope) {
		
}])
.controller('Home', ['$scope','$log','QuoteRepository','$ionicSideMenuDelegate',function($scope,$log,QuoteRepository,$ionicSideMenuDelegate) {

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

	$scope.exit = function(){
		ionic.Platform.exitApp();
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