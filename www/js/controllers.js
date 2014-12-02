angular.module('weQuote.controllers', [])
.controller('Root', ['$scope',function($scope) {
	$scope.exit = function(){
		ionic.Platform.exitApp();
	}	
}])
.controller('About', ['$scope','$state',function($scope,$state) {
	$scope.openLink = function() {
    	window.open('http://www.wequote.it', '_system', 'location=yes');
  	};	
  	$scope.$on('back-button-action', function(event, args) {                
       $state.go('quotes');
	});
}])
.controller('Tags', ['$scope','$state',function($scope,$state) {
	$scope.$on('back-button-action', function(event, args) {                
        $state.go('quotes');
	});	
}])
.controller('Authors', ['$scope','$state',function($scope,$state) {
	$scope.$on('back-button-action', function(event, args) {                
       $state.go('quotes'); 
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

	$scope.$on('back-button-action', function(event, args) {
        if(true){
          swal({
            title: "Sei sicuro di voler abbandonare #weQuote?",
            showCancelButton: true,
            confirmButtonColor: "#5264AE",
            cancelButtonText:"No",
            confirmButtonText: "Sì",
            closeOnConfirm: true }, 
              function(){
                ionic.Platform.exitApp();
              });
        }
	});
}]);