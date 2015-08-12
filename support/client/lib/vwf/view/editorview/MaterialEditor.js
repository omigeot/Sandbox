'use strict';

if( !Math.log10 ){
	Math.log10 = function(x){
		return Math.log(x)/Math.log(10);
	}
}

define(['./angular-app', './mapbrowser', './colorpicker', './EntityLibrary'], function(app, mapbrowser)
{
	window._MapBrowser = mapbrowser.getSingleton();

	app.controller('MaterialController', ['$scope','$timeout', function($scope, $timeout)
	{
		$scope.ambientLinked = true;
		$scope.materialDef = null;
		$scope.materialArray = null;
		$scope.activeMaterial = 0;

		var oldMaterialDef = null;
		$scope.videoTextureSource = '';
		$scope.suppressUndo = false;


		$scope.refresh = function()
		{
			var mat = $scope.fields.selectedNode && ($scope.fields.selectedNode.properties.materialDef || vwf_view.kernel.getProperty($scope.fields.selectedNode.id));
			if( mat )
			{
				// try to get a materialDef from driver
				if( angular.isArray(mat) ){
					$scope.materialArray = mat.map(function(val){ return materialWithDefaults(val); });
					$scope.activeMaterial = 0;
					$scope.materialDef = materialWithDefaults(mat[0]);
				}
				else {
					$scope.materialArray = null;
					$scope.activeMaterial = 0;
					$scope.materialDef = materialWithDefaults(mat);
				}

				var diffuse = $scope.materialDef.color, ambient = $scope.materialDef.ambient;
				$scope.ambientLinked = diffuse.r === ambient.r && diffuse.g === ambient.g && diffuse.b === ambient.b;
			}
			else {
				$scope.materialArray = null;
				$scope.activeMaterial = 0;
				$scope.materialDef = null;
				$scope.ambientLinked = true;
				//_SidePanel.hideTab('materialEditor');
			}
		}

		$scope.$watch('fields.selectedNode', $scope.refresh);

		$scope.$watch('activeMaterial', function(newval){
			if( $scope.materialArray && newval >= 0 && newval < $scope.materialArray.length )
			{
				$scope.materialDef = $scope.materialArray[newval];
			}
		});

		function materialWithDefaults(mat)
		{
			// set defaults
			if( mat.type === undefined )
				mat.type = 'phong';
			if( mat.side === undefined )
				mat.side = 0;
			if( mat.blendMode === undefined )
				mat.blendMode = 1;

			if( mat.fog === undefined )
				mat.fog = true;
			if( mat.shading === undefined )
				mat.shading = true;
			if( mat.metal === undefined )
				mat.metal = false;
			if( mat.wireframe === undefined )
				mat.wireframe = false;
			if( mat.depthtest === undefined )
				mat.depthtest = true;
			if( mat.depthwrite === undefined )
				mat.depthwrite = true;
			if( mat.vertexColors === undefined )
				mat.vertexColors = false;

			if( mat.layers === undefined )
				mat.layers = [];

			return mat;
		}

		function applyDef(def)
		{
			if( _UserManager.GetCurrentUserName() == null ){
				_Notifier.notify('You must log in to participate');
			}
			else
			{
				var undoEvent = new _UndoManager.CompoundEvent();
				for(var i=0; i<$scope.fields.selectedNodeIds.length; i++)
				{
					var id = $scope.fields.selectedNodeIds[i];

					if(_PermissionsManager.getPermission(_UserManager.GetCurrentUserName(), id) == 0){
						_Notifier.notify('You do not have permission to edit this material');
					}
					else {
						$scope.fields.materialUpdateFromModel = true;
						undoEvent.push( new _UndoManager.SetPropertyEvent(id, 'materialDef', def) );
						vwf_view.kernel.setProperty(id, 'materialDef', def);
					}
				}

				if( !$scope.suppressUndo ){
					console.log('registering undo');
					_UndoManager.pushEvent(undoEvent);
				}
			}
		}

		$scope.$watch('materialArray || materialDef', function(newval)
		{
			if(newval && newval === oldMaterialDef){
				console.log('material changed, applying');
				applyDef(newval);
			}
			else if(newval){
				console.log('whole material swap');
			}

			if( $scope.materialDef )
				$scope.videoTextureSource = $scope.materialDef.videosrc;

			oldMaterialDef = newval;
		}, true);

		$scope.$watch('suppressUndo', function(newval){
			if(!newval){
				applyDef($scope.materialArray || $scope.materialDef);
			}
		});

		$scope.$watch('ambientLinked && materialDef.color.r + materialDef.color.g + materialDef.color.b', function(newval){
			if(newval){
				$scope.materialDef.ambient.r = $scope.materialDef.color.r;
				$scope.materialDef.ambient.b = $scope.materialDef.color.b;
				$scope.materialDef.ambient.g = $scope.materialDef.color.g;
			}
		});

		$scope.addTexture = function()
		{
			if($scope.materialDef && $scope.materialDef.layers)
			{
				$scope.materialDef.layers.push({
					src: 'white.png',
					mapTo: 1,
					mapInput: 0,
					alpha: 1,
					scalex: 1,
					scaley: 1,
					offsetx: 0,
					offsety: 0,
					rot: 0
				});
				$timeout(function(){
					$('#materialaccordion').accordion('option','active',2+$scope.materialDef.layers.length-1);
				});
			}
		}

		$scope.removeTexture = function(index){
			if( $scope.materialDef && $scope.materialDef.layers ){
				$scope.materialDef.layers.splice(index,1);
			}
		}

		$scope.browseForTexture = function(index)
		{
			if( window._MapBrowser ){
				window._MapBrowser.setTexturePickedCallback(function(url){
					$scope.materialDef.layers[index].src = url;
					$scope.$apply();

					window._MapBrowser.hide();
				});

				window._MapBrowser.show();
			}
			else {
				console.log('Texture browser is unavailable');
			}
		}

		window._MaterialEditor = $scope;
	}]);

	app.directive('slider', function()
	{
		return {
			restrict: 'E',
			template: [
				'<div class="mantissa">',
					'<div class="slider"></div>',
					'<input type="number" min="{{min}}" max="{{max}}" step="{{step}}" ng-model="mantissa" ng-disabled="disabled"></input>',
				'</div>',
				'<div class="exponent" ng-show="useExponent">',
					'Exponent: ',
					'<input type="number" min="0" step="1" ng-model="exponent" ng-disabled="disabled"></input>',
				'</div>',
			].join(''),
			scope: {
				min: '=',
				max: '=',
				step: '=',

				useExponent: '=',

				value: '=',
				disabled: '=',
				sliding: '='
			},
			link: function($scope, elem, attrs)
			{
				var slider = $('.slider', elem);
				slider.slider({
					min: $scope.min,
					max: $scope.max,
					step: $scope.step,
					value: $scope.value
				});

				$scope.$on('$destroy', function(){
					if(slider.slider('instance'))
						slider.slider('destroy');
				});

				slider.on('slidestart', function(evt,ui){
					$scope.freezeExponent = true;
					$scope.sliding = true;
					$scope.$apply();
				});

				slider.on('slide', function(evt, ui){
					$scope.mantissa = ui.value;
					$scope.$apply();
				});

				slider.on('slidestop', function(evt,ui){
					$scope.freezeExponent = false;
					$scope.sliding = false;
					$scope.$apply();
				});


				$scope.$watch('freezeExponent || value', function(newval)
				{
					if($scope.value === undefined)
						$scope.value = $scope.min;

					if( $scope.useExponent )
					{
						if( !$scope.freezeExponent ){
							$scope.exponent = $scope.useExponent ? Math.max(Math.floor(Math.log10(Math.abs($scope.value))), 0) : 0;
						}

						$scope.mantissa = $scope.value / Math.pow(10,$scope.exponent);
					}
					else
						$scope.mantissa = $scope.value;
				});

				$scope.$watch('mantissa + exponent', function(newval){
					if( !$scope.disabled ){
						if( $scope.useExponent )
							$scope.value = $scope.mantissa * Math.pow(10, $scope.exponent);
						else
							$scope.value = $scope.mantissa;

						slider.slider('option', 'value', $scope.mantissa);
					}
				});

				$scope.$watch('disabled', function(newval){
					if( newval ){
						slider.slider('disable');
						slider.slider('option', 'value', $scope.min);
					}
					else
						slider.slider('enable');
				});
			}
		};
	});

	app.directive('colorPicker', ['$timeout', function($timeout)
	{
		return {
			restrict: 'E',
			template: '<div class="colorPickerIcon"></div>',
			scope: {
				colorObj: '=',
				disabled: '=',
				sliding: '='
			},
			link: function($scope, elem, attrs)
			{
				$scope.$watch('colorObj.r + colorObj.b + colorObj.g', function(newval){
					$('.colorPickerIcon', elem).css('background-color', '#'+color());
				});

				function color(hexval)
				{
					if(hexval && $scope.colorObj)
					{
						var parsed = parseInt(hexval, 16);
						$scope.colorObj.r = ((parsed & 0xff0000) >> 16)/255;
						$scope.colorObj.g = ((parsed & 0x00ff00) >>  8)/255;
						$scope.colorObj.b = ((parsed & 0x0000ff)      )/255;

						if(handle) $timeout.cancel(handle);
						var handle = $timeout($scope.$apply.bind($scope), 300);
						return hexval;
					}
					else if($scope.colorObj)
					{
						var parsed = (Math.floor($scope.colorObj.r * 255) << 16)
							| (Math.floor($scope.colorObj.g * 255) << 8)
							| Math.floor($scope.colorObj.b * 255);

						return ('000000'+parsed.toString(16)).slice(-6);
					}
					else
						return 'aaaaaa';
				}

				var handle = null;
				elem.ColorPicker({
					onShow: function(e){
						$(e).fadeIn();
					},
					onHide: function(e){
						$(e).fadeOut();
						return false;
					},
					onBeforeShow: function(){
						elem.ColorPickerSetColor(color());
					},
					onChange: function(hsb, hex, rgb, el){
						$scope.sliding = true;
						color(hex);

						if(handle) $timeout.cancel(handle);
						handle = $timeout(function(){ $scope.sliding = false; }, 500);
					}
				});

				$scope.$watch('disabled', function(newval){
					if(newval){
						elem.css('pointer-events', 'none');
					}
					else {
						elem.css('pointer-events', '');
					}
				});

				elem.bind('$destroy', function(){
					if( elem.data('colorpickerId') ){
						$('#'+elem.data('colorpickerId')).remove();
						elem.removeData('colorpickerId');
					}
				});
			}
		};
	}]);

	app.directive('convertToNumber', function()
	{
		return {
			require: 'ngModel',
			restrict: 'A',
			link: function($scope, elem, attrs, ngModel)
			{
				ngModel.$parsers.push(function(val){
					return parseInt(val, 10);
				});
				ngModel.$formatters.push(function(val){
					return '' + val;
				});
			}
		};
	});
});

var oldDefine = function(baseclass) {

    function initialize() {

    }
}
