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
	.directive('quoteCard', ['$log', 'CardGenerator', function($log,CardGenerator) {

		var that = this;

		var visibleId = Math.random().toString(36).substring(8);
		var hiddenId = Math.random().toString(36).substring(8);
		var canvasId = Math.random().toString(36).substring(8);
		var visibleKinetic;
		var invisibleKinetic;
		var count = 0;

		var generateCard = function(kineticArea, quote, startFontSize, callback) {

			var stage = kineticArea.stage;

			count++;
			$log.debug("Generating Canvas " + count);

			var imageObj = new Image();

			imageObj.onload = function(x) {
				if (imageObj.naturalHeight !== imageObj.naturalWidth) {
					that.cropImage(imageObj);
				} else {

					CardGenerator.updateCard(kineticArea, imageObj, quote, startFontSize);

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

		return {
			restrict: 'E',
			template: '<div><div style="z-index:10000" id=' + visibleId + '></div><div style="display:none" id=' + hiddenId + '></div><canvas style="display:none"id=' + canvasId + '></div>',
			replace: true,
			scope: {
				quote: '='
			},
			link: function($scope, element, attrs) {

				$log.debug("Linking directive");

				visibleKinetic = CardGenerator.generateEmptyCard(visibleId);
				invisibleKinetic = CardGenerator.generateEmptyCard(hiddenId,1000);
				
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