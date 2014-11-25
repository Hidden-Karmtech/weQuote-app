angular.module('weQuote.directives', [])
.directive('quoteCanvas', [function() {
	return {
		restrict: 'E',
   	 	template: '<div style="display:none;"><canvas width="500" height="500"></canvas></div>',
    	replace: true,
    	link: function ($scope, element, attrs) {
    		var canvas = element[0].children[0];
    		var ctx = canvas.getContext("2d");

    		$scope.$on('generate-canvas',function(event,url,quote,callback){
    			
    			var image = new Image();
				image.onload = function() {
					ctx.drawImage(image, 0, 0);
		    		callback(canvas.toDataURL());
				};

				image.src = url;
				
    		});
    	}
	};
}])