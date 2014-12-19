angular.module('weQuote.directives', [])
	.directive('quoteCard', ['$log', 'Screen', function($log, Screen) {

		var that = this;

		var TEXT_SCALE_FACTOR = 0.9;
		var TEXT_X_OFFSET = 3;
		var WATERMARK_OFFSET = 3;
		var AUTHOR_OFFSET = 7;
		var WATERMARK_FONT_SIZE = 4.5;
		var AUTHOR_FONT_SIZE = 7;
		var BORDER_WIDTH = 3.5;
		var HEIGHT_THRESHOLD = 60;

		var visibleId = Math.random().toString(36).substring(8);
		var hiddenId = Math.random().toString(36).substring(8);
		var canvasId = Math.random().toString(36).substring(8);
		var visibleKinetic;
		var invisibleKinetic;
		var count = 0;

		this.getQuoteText = function(quote, size, startFontSize) {

			var xOffset = size * (TEXT_X_OFFSET / 100);

			var generateText = function(text, fontSize, size) {
				return new Kinetic.Text({
					text: text,
					fontSize: fontSize,
					fontFamily: 'Lobster',
					fill: '#FFFFFF',
					x: xOffset,
					width: size - (xOffset * 2),
					padding: 0,
					align: 'center'
				});
			};

			var HeightThreshold = size * (HEIGHT_THRESHOLD / 100);
			var quoteText;
			var fontSize;
			var textHeight;

			do {
				$log.debug("Generating text with font " + fontSize);

				fontSize = fontSize ? (fontSize * TEXT_SCALE_FACTOR) : (startFontSize || 36);
				quoteText = generateText(quote.text, fontSize, size);
				textHeight = quoteText.getAttr('height');

				$log.debug("text height " + textHeight);
			} while (textHeight > HeightThreshold)

			//Y center
			quoteText.setAttr('y', (size - textHeight) / 2);

			return quoteText;
		};

		this.getWatermark = function(size) {

			var offset = size * (WATERMARK_OFFSET / 100);
			var fontSize = size * (WATERMARK_FONT_SIZE / 100);

			var watermark = new Kinetic.Text({
				text: 'www.wequote.it',
				fontSize: fontSize,
				x: offset,
				y: offset,
				fontFamily: 'Lobster',
				fill: '#FFFFFF',
				width: size,
				padding: 0,
				align: 'left'
			});

			return watermark;
		};

		this.getAuthorText = function(quote, size) {

			var fontSize = size * (AUTHOR_FONT_SIZE / 100);

			var autorText = new Kinetic.Text({
				text: quote.author,
				fontSize: fontSize,
				fontFamily: 'Lobster',
				fill: '#FFFFFF',
				width: size,
				padding: 0,
				align: 'center'
			});

			//Stick to bottom

			var yOffset = size * (AUTHOR_OFFSET / 100);

			var textHeight = autorText.getAttr('height');
			autorText.setAttr('y', size - textHeight - yOffset);

			return autorText;
		};

		this.getRectBorder = function(size) {

			var strokeWidth = size * (BORDER_WIDTH / 100);

			return new Kinetic.Image({
				x: 0,
				y: 0,
				width: size,
				height: size,
				fillAlpha: 0,
				stroke: '#98A4D7',
				strokeWidth: strokeWidth
			});
		}

		this.getImageBackgroud = function(imgElement, size) {
			return new Kinetic.Image({
				x: 0,
				y: 0,
				image: imgElement,
				width: size,
				height: size
			});
		}

		var generateCard = function(kineticArea, quote, size, startFontSize, callback) {

			var stage = kineticArea.stage;

			count++;
			$log.debug("Generating Canvas " + count);

			stage.removeChildren();
			stage.clearCache();
			Kinetic.shapes = {};

			var imageObj = new Image();

			imageObj.onload = function(x) {
				if (imageObj.naturalHeight !== imageObj.naturalWidth) {
					that.cropImage(imageObj);
				} else {

					stage.add(that.paintCanvas(imageObj,quote,kineticArea.mainLayer,size,startFontSize));

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

		this.paintCanvas = function(imageObj,quote,layer,size,startFontSize) {

			layer.add(that.getImageBackgroud(imageObj, size));
			layer.add(that.getRectBorder(size));
			layer.add(that.getAuthorText(quote, size));
			layer.add(that.getQuoteText(quote, size, startFontSize));
			layer.add(that.getWatermark(size));

			return layer;
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

				visibleKinetic = {
					stage: new Kinetic.Stage({
						container: visibleId,
						width: Screen.getSize(),
						height: Screen.getSize()
					}),
					mainLayer: new Kinetic.Layer()
				};

				invisibleKinetic = {
					stage: new Kinetic.Stage({
						container: hiddenId,
						width: 1000,
						height: 1000
					}),
					mainLayer: new Kinetic.Layer()
				};

				$scope.$watch('quote', function(quote) {
					if (quote && quote.url) {
						generateCard(
							visibleKinetic,
							quote,
							Screen.getSize(),
							36);
					}
				}, true);

				$scope.$on('generate-canvas', function(event, quote, callback) {
					generateCard(
						invisibleKinetic,
						quote,
						1000,
						104,
						callback);
				});

			}
		};
	}])