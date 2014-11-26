angular.module('weQuote.directives', [])
	.directive('quoteCanvas', ['$log',function($log) {

		var that = this;

		var IMG_SIZE = 500;
		var START_FONT_SIZE = 52;
		var TEXT_HEIGHT_THRESHOLD = 300;
		var TEXT_SCALE_FACTOR = 0.9;

		this.getQuoteText = function(quote){
			var generateText = function(text,fontSize){
				return new Kinetic.Text(
				{
					text: text,
					fontSize: fontSize,
					fontFamily: 'Lobster',
					fill: '#FFFFFF',
					width: IMG_SIZE,
					padding: 0,
					align: 'center'
				});
			};

			var quoteText;
			var fontSize = START_FONT_SIZE;
			var textHeight;

			do{	
				$log.debug("Generating text with font " + fontSize);
				
				fontSize = fontSize ? (fontSize * TEXT_SCALE_FACTOR) : START_FONT_SIZE;
				quoteText = generateText(quote.text,fontSize);
				textHeight = quoteText.getAttr('height');

				$log.debug("text height " + textHeight);
			}while(textHeight > TEXT_HEIGHT_THRESHOLD)

			//Y center
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