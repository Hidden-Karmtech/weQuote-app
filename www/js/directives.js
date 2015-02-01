angular.module('weQuote.directives', [])
	.directive('blurOnSubmit', ['$log', function($log) {
		return {
			restrict: 'A',
			require: '^form',
			link: function($scope, element, attrs, form) {
				element.parent().bind("submit", function() {
					element[0].blur();
				});
			}
		};
	}])
	.directive('quoteCard', ['$log', 'CardSize', function($log, CardSize) {

		var that = this;

		var TEXT_SCALE_FACTOR = 0.9;
		var TEXT_X_OFFSET = 3;
		var WATERMARK_OFFSET = 3;
		var AUTHOR_OFFSET = 7;
		var WATERMARK_FONT_SIZE = 4.5;
		var AUTHOR_FONT_SIZE = 7;
		var BORDER_WIDTH = 3.5;
		var HEIGHT_THRESHOLD = 60;
		var START_FONT_SIZE = 10;

		var visibleId = Math.random().toString(36).substring(8);
		var hiddenId = Math.random().toString(36).substring(8);
		var canvasId = Math.random().toString(36).substring(8);
		var visibleKinetic;
		var invisibleKinetic;
		var count = 0;

		this.getSize = CardSize.getSize;

		var EmptyCard = function(canvasId,size){

			var strokeWidth = size * (BORDER_WIDTH / 100);

			var stage = new Kinetic.Stage({
				container: canvasId,
				width: size,
				height: size
			});

			var	layer = new Kinetic.Layer();

			var textCanvas = new Kinetic.Text({
				fontFamily: 'Lobster',
				padding: 0,
				align: 'center'
			});

			var watermark = new Kinetic.Text({
				text: 'wequote.it',
				fontFamily: 'Lobster',
				padding: 0,
				align: 'left'
			});


			var	authorText = new Kinetic.Text({
				fontFamily: 'Lobster',
				padding: 0,
				align: 'center'
			});
			
			var rectBorder = new Kinetic.Image({
				x: 0,
				y: 0,
				width: size,
				height: size,
				fillAlpha: 0,
				stroke: '#98A4D7',
				strokeWidth: strokeWidth
			});

			var imageBackground = new Kinetic.Image({
				x: 0,
				y: 0,
				width: size,
				height: size
			});

			layer.add(imageBackground);
			layer.add(rectBorder);
			layer.add(authorText);
			layer.add(textCanvas);
			layer.add(watermark);

			stage.add(layer);

			return {
				stage:stage,
				mainLayer:layer,
				textCanvas:textCanvas,
				imageBackground:imageBackground,
				rectBorder:rectBorder,
				authorText:authorText,
				watermark:watermark,
				size:size
			};
		};

		this.printQuoteText = function(area, quote) {

			var startFontSize = area.size * (START_FONT_SIZE / 100);
			var xOffset = area.size * (TEXT_X_OFFSET / 100);
			var fontColor = quote.fontColor || '#FFFFFF';

			var printText = function(text, fontSize, size) {
				
				area.textCanvas.text(text);
				area.textCanvas.fontSize(fontSize);
				area.textCanvas.fill(fontColor);
				area.textCanvas.x(xOffset);
				area.textCanvas.width(size - (xOffset * 2));

			};

			var HeightThreshold = area.size * (HEIGHT_THRESHOLD / 100);
			var fontSize;
			var textHeight;

			do {
				$log.debug("Generating text with font " + fontSize);

				fontSize = fontSize ? (fontSize * TEXT_SCALE_FACTOR) : (startFontSize || 36);
				printText(quote.text, fontSize, area.size);
				textHeight = area.textCanvas.getAttr('height');

				$log.debug("text height " + textHeight);
			} while (textHeight > HeightThreshold)

			//Y center
			area.textCanvas.setAttr('y', (area.size - textHeight) / 2);
		};

		this.printWatermark = function(area, quote) {

			var watermark = area.watermark;
			var offset = area.size * (WATERMARK_OFFSET / 100);
			var fontSize = area.size * (WATERMARK_FONT_SIZE / 100);
			var fontColor = quote.fontColor || '#FFFFFF';

			watermark.fontSize(fontSize);
			watermark.x(offset);
			watermark.y(offset);
			watermark.fill(fontColor);
			watermark.width(area.size);
		};

		this.printAuthorText = function(area, quote) {

			var authorText = area.authorText;
			var fontSize = area.size * (AUTHOR_FONT_SIZE / 100);
			var fontColor = quote.fontColor || '#FFFFFF';

			authorText.text(quote.author);
			authorText.fontSize(fontSize);
			authorText.fill(fontColor);
			authorText.width(area.size);

			//Stick to bottom

			var yOffset = area.size * (AUTHOR_OFFSET / 100);

			var textHeight = authorText.getAttr('height');
			authorText.y(area.size - textHeight - yOffset);
		};

		var generateCard = function(kineticArea, quote, startFontSize, callback) {

			var stage = kineticArea.stage;

			count++;
			$log.debug("Generating Canvas " + count);

			var imageObj = new Image();

			imageObj.onload = function(x) {
				if (imageObj.naturalHeight !== imageObj.naturalWidth) {
					that.cropImage(imageObj);
				} else {

					that.paintCanvas(kineticArea, imageObj, quote, startFontSize);

					if (callback) {
						stage.toDataURL({
							callback: callback
						});
					}

				}

			};

			imageObj.src = quote.url;

		};

		this.cropImage = function(imageObj) {
			var photoSize;
			var portrait;
			if (imageObj.naturalWidth < imageObj.naturalHeight) {
				portrait = true;
				photoSize = imageObj.naturalWidth;
			} else {
				portrait = false;
				photoSize = imageObj.naturalHeight;
			}

			//Crop Image
			var canvas = document.getElementById(canvasId);
			canvas.width = photoSize;
			canvas.height = photoSize;

			var context = canvas.getContext('2d');

			if (portrait) {
				var yOffest = (imageObj.naturalHeight - photoSize) / 2;
				context.drawImage(
					imageObj,
					0,
					yOffest,
					photoSize,
					photoSize,
					0,
					0,
					photoSize,
					photoSize
				);
			} else {
				var xOffest = (imageObj.naturalWidth - photoSize) / 2;
				context.drawImage(
					imageObj,
					xOffest,
					0,
					photoSize,
					photoSize,
					0,
					0,
					photoSize,
					photoSize
				);
			}

			//Reload url
			imageObj.src = canvas.toDataURL();
		};

		//kineticArea, imageObj, quote, startFontSize
		this.paintCanvas = function(area,imageObj, quote, startFontSize) {

			area.imageBackground.image(imageObj);
			that.printAuthorText(area,quote);
			that.printQuoteText(area,quote);
			that.printWatermark(area,quote);

			area.stage.draw();

		};

		return {
			restrict: 'E',
			template: '<div><div style="z-index:10000" id=' + visibleId + '></div><div style="display:none" id=' + hiddenId + '></div><canvas style="display:none"id=' + canvasId + '></div>',
			replace: true,
			scope: {
				quote: '='
			},
			link: function($scope, element, attrs) {

				$log.debug("Linking directive");

				visibleKinetic = new EmptyCard(visibleId,that.getSize());
				invisibleKinetic = new EmptyCard(hiddenId,1000);
				
				$scope.$watch('quote', function(quote) {
					if (quote && quote.url) {
						generateCard(
							visibleKinetic,
							quote,
							36
						);
					}
				}, true);

				$scope.$on('generate-canvas', function(event, quote, callback) {
					generateCard(
						invisibleKinetic,
						quote,
						104,
						callback);
				});

			}
		};
	}])