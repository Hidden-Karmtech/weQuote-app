angular.module('weQuote.controllers', [])
.controller('Root', ['$scope',function($scope) {
	
}])
.controller('Login', ['$scope','$state',function($scope,$state) {
	$scope.busy = false;

	$scope.login = function(){
		$scope.busy = true;
		setTimeout(function(){$state.go('home');}, 500);
	}
}])
.controller('Home', ['$scope','$log','QuoteRepository',function($scope,$log,QuoteRepository) {

	var MIN_SIZE = 5;
	var quotes = [];
	$scope.visibleQuotes = [];
	var downloading = false;

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

	$scope.cardDestroyed = function(index){
		$scope.visibleQuotes = [quotes.pop()];
		$log.debug(quotes.length + " left");
		if(quotes.length <= MIN_SIZE && !downloading){
			downloadQuotes();
		}
	}

	downloadQuotes(function(quotes){
		$scope.visibleQuotes = [quotes.pop()];
	});
}]);