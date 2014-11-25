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
	var IMAGES = 20;
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

	$scope.share = function(quote){
	//	window.plugins.socialsharing.share('', '', 'www/img/backgrounds/Amore/00'+($scope.visibleQuotes[0].text.length % 4)+ '.jpg')
		/*
		var c = document.getElementById("canvas");
		var ctx = c.getContext("2d");
		
		var image = new Image();
		image.src = 'img/backgrounds/Amore/' + $scope.imageUrl + '.png'
		image.onload = function() {
			console.log("Here");
    		ctx.drawImage(image, 0, 0);
    		window.plugins.socialsharing.share(null, 'weQuote', c.toDataURL(), null);
		};*/
		var url = 'img/backgrounds/Amore/' + $scope.imageUrl + '.png';
		$scope.$broadcast('generate-canvas',url,quote,function(imgData){
			window.plugins.socialsharing.share(null, 'weQuote', imgData, null);
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