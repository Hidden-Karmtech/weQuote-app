angular.module('weQuote.directives', [])
	.directive('quoteCard', ['$log','Screen',function($log,Screen) {

		var that = this;

		var TEXT_SCALE_FACTOR = 0.9;

		this.getQuoteText = function(quote,size,startFontSize){
			var generateText = function(text,fontSize,size){
				return new Kinetic.Text(
				{
					text: text,
					fontSize: fontSize,
					fontFamily: 'Lobster',
					fill: '#FFFFFF',
					width: size,
					padding: 0,
					align: 'center'
				});
			};

			var HeightThreshold = size * (3/5);
			var quoteText;
			var fontSize;
			var textHeight;

			do{	
				$log.debug("Generating text with font " + fontSize);
				
				fontSize = fontSize ? (fontSize * TEXT_SCALE_FACTOR) : (startFontSize || 36);
				quoteText = generateText(quote.text,fontSize,size);
				textHeight = quoteText.getAttr('height');

				$log.debug("text height " + textHeight);
			}while(textHeight > HeightThreshold)

			//Y center
			quoteText.setAttr('y',(size - textHeight)/2);

			return quoteText;
		};

		this.getWatermark = function(size){
			var watermark = new Kinetic.Text(
				{
					text:'www.wequote.it',
					fontSize: 16,
					x:5,
					y:5,
					fontFamily: 'Lobster',
					fill: '#FFFFFF',
					width: size,
					padding: 0,
					align: 'left'
				});

			return watermark;
		};

		this.getAuthorText = function(quote,size){
			var autorText = new Kinetic.Text(
				{
					text: quote.author,
					fontSize: 24,
					fontFamily: 'Lobster',
					fill: '#FFFFFF',
					width: size,
					padding: 0,
					align: 'center'
				});

			//Stick to bottom
			var textHeight = autorText.getAttr('height');
			autorText.setAttr('y',size - textHeight -25);

			return autorText;
		};

		this.getImageBackgroud = function(imgElement,size){
			return new Kinetic.Rect(
				{
					x: 0,
					y: 0,
					fillPatternImage: imgElement,
					width: size,
					height: size,
					cornerRadius: 12,
					stroke: '#98A4D7',
        			strokeWidth: 6
				});
		}

		var visibleId = Math.random().toString(36).substring(8);
		var hiddenId = Math.random().toString(36).substring(8);

		return {
			restrict: 'E',
			template: '<div><div style="z-index:10000" id=' + visibleId + '></div><div style="display:none" id=' + hiddenId + '></div></div>',
			replace: true,
			scope:{
				quote:'='
			},
			link: function($scope, element, attrs) {

				$scope.$watch('quote',function(quote){
					if(quote && quote.url){
						generateCanvas(visibleKinetic.stage,quote,Screen.getSize(),36);	
					}
				},true);

				var visibleKinetic = {
					stage: new Kinetic.Stage({
						container: visibleId,
						width: Screen.getSize(),
						height: Screen.getSize()
					})
				};

				var invisibleKinetic = {
					stage: new Kinetic.Stage({
						container: hiddenId,
						width: 1000,
						height: 1000
					})
				};

				$scope.$on('generate-canvas', function(event, quote, callback) {
					generateCanvas(
							invisibleKinetic.stage,
							quote,
							1000,
							104,
							callback);
				});

				var generateCanvas = function(stage, quote, size,startFontSize,callback) {

					stage.clear();

					var imageObj = new Image();

					imageObj.onload = function() {
						var layer = new Kinetic.Layer();

						layer.add(that.getImageBackgroud(imageObj,size));
						layer.add(that.getAuthorText(quote,size));
						layer.add(that.getQuoteText(quote,size,startFontSize));
						layer.add(that.getWatermark(size));

						stage.add(layer);

						if(callback){
							stage.toDataURL({
								callback: callback
							});
						}
					};
					
					imageObj.src = quote.url;

				};
			}
		};
	}])