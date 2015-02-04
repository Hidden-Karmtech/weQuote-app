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
		var count = 0;
		this.imageObj = new Image();


		var generateCard = function(kineticArea, quote, startFontSize, base64,callback) {

			var stage = kineticArea.stage;

			count++;
			$log.debug("Generating Canvas " + count);

			that.imageObj.src = "";

			that.imageObj.onload = function(x) {
				if (that.imageObj.naturalHeight !== that.imageObj.naturalWidth) {
					that.cropImage(that.imageObj);
				} else {

					CardGenerator.updateCard(kineticArea, that.imageObj, quote, startFontSize).then(function(){
						if (callback) {
							var toReturn = base64 ? stage.toDataURL() : null;
							callback(toReturn);
						}
					});

				}

			};

			that.imageObj.src = quote.url;

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
			template: '<div><canvas style="z-index:10000" id=' + visibleId + '></canvas><canvas style="display:none" id=' + hiddenId + '></canvas><canvas style="display:none"id=' + canvasId + '></div>',
			replace: true,
			scope: {
				quote: '='
			},
			link: function($scope, element, attrs) {

				$log.debug("Linking directive");

				that.invisibleKinetic = CardGenerator.generateEmptyCard(hiddenId,1000);
				that.visibleKinetic = CardGenerator.generateEmptyCard(visibleId);
				
				$scope.$on('generate-quote', function(event, quote, callback) {
					generateCard(
							that.visibleKinetic,
							quote,
							36,
							false,
							callback
						);
				});

				$scope.$on('generate-canvas', function(event, quote, callback) {
					generateCard(
						that.invisibleKinetic,
						quote,
						104,
						true,
						callback);
				});

			}
		};
	}])