angular.module('weQuote.directives', [])
	.directive('quoteCanvas', ['$log',function($log) {

		var that = this;

		var IMG_SIZE = 500;

		this.getQuoteText = function(quote){
			var quoteText = new Kinetic.Text(
				{
					text: quote.text,
					fontSize: 52,
					fontFamily: 'Lobster',
					fill: '#FFFFFF',
					width: IMG_SIZE,
					padding: 0,
					align: 'center'
				});

			//Y center
			var textHeight = quoteText.getAttr('height');
			$log.debug(textHeight);
			quoteText.setAttr('y',(IMG_SIZE - textHeight)/2);

			return quoteText;
		};

		this.getAuthorText = function(quote){
			var autorText = new Kinetic.Text(
				{
					text: quote.author,
					fontSize: 24,
					fontFamily: 'Lobster',
					fill: '#FFFFFF',
					width: IMG_SIZE,
					padding: 0,
					align: 'center'
				});

			//Stick to bottom
			var textHeight = autorText.getAttr('height');
			autorText.setAttr('y',IMG_SIZE - textHeight -25);

			return autorText;
		};

		this.getImageBackgroud = function(imgElement){
			return new Kinetic.Image(
				{
					x: 0,
					y: 0,
					image: imgElement,
					width: IMG_SIZE,
					height: IMG_SIZE
				});
		}

		return {
			restrict: 'E',
			template: '<div style="display:none;"></div>',
			replace: true,
			link: function($scope, element, attrs) {
				var id = attrs["id"];

				if (!id) {
					id = Math.random().toString(36).substring(8);
					element.attr('id', id);
				}

				var kinetic = {
					stage: new Kinetic.Stage({
						container: id,
						width: 500,
						height: 500
					})
				};

				$scope.kinetic = kinetic;

				$scope.$on('generate-canvas', function(event, url, quote, callback) {

					$scope.kinetic.stage.clear();

					var imageObj = new Image();

					imageObj.onload = function() {
						var layer = new Kinetic.Layer();

						layer.add(that.getImageBackgroud(imageObj));
						layer.add(that.getAuthorText(quote));
						layer.add(that.getQuoteText(quote));

						$scope.kinetic.stage.add(layer);
						$scope.kinetic.stage.toDataURL({
							callback: callback
						});

					};
					
					imageObj.src = url;

				});
			}
		};
	}])