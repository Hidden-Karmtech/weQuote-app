angular.module('weQuote.directives', [])
	.directive('quoteCanvas', [function() {
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

						var image = new Kinetic.Image({
							x: 0,
							y: 0,
							image: imageObj,
							width: 500,
							height: 500
						});

						var quoteText = new Kinetic.Text({
					        x: 0,
					        y: 0,
					        text: quote.text,
					        fontSize: 52,
					        fontFamily: 'Lobster',
					        fill: '#FFFFFF',
					        width: 480,
					        padding: 20,
					        align: 'center'
					      });

						layer.add(image);
						layer.add(quoteText);

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