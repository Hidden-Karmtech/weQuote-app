angular.module('weQuote.directives', [])
	.directive('quoteCard', ['$log','Screen',function($log,Screen) {

		var that = this;

		var IMG_SIZE = Screen.getSize();
		var START_FONT_SIZE = 36;
		var TEXT_HEIGHT_THRESHOLD = Screen.getSize() * (3/5);
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

		this.getWatermark = function(){
			var watermark = new Kinetic.Text(
				{
					text:'www.wequote.it',
					fontSize: 16,
					x:5,
					y:5,
					fontFamily: 'Lobster',
					fill: '#FFFFFF',
					width: IMG_SIZE,
					padding: 0,
					align: 'left'
				});

			return watermark;
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
			return new Kinetic.Rect(
				{
					x: 0,
					y: 0,
					fillPatternImage: imgElement,
					width: IMG_SIZE,
					height: IMG_SIZE,
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
						generateCanvas(visibleKinetic.stage,quote);	
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
					generateCanvas(invisibleKinetic.stage,quote,callback);
				});


				var generateCanvas = function(stage, quote, callback) {

					stage.clear();

					var imageObj = new Image();

					imageObj.onload = function() {
						var layer = new Kinetic.Layer();

						layer.add(that.getImageBackgroud(imageObj));
						layer.add(that.getAuthorText(quote));
						layer.add(that.getQuoteText(quote));
						layer.add(that.getWatermark());

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