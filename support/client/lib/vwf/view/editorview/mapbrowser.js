'use strict';

define(['./angular-app', './manageAssets'], function(app)
{
	app.service('TextureDataManager', ['$http', function($http)
	{
		var data = [];

		$http.get('./vwfdatamanager.svc/textures', {}).then(
			function success(response){
				data.push.apply(data, response.data);
			},
			function error(response){}
		);

		return data;
	}]);

	var textureCallback = null;

	app.controller('MapBrowserController', ['$scope','AssetDataManager','TextureDataManager', function($scope, UserAssets, TexList)
	{
		$('#MapBrowser').dialog({
			title: 'Map Browser',
			show: {
				effect: "fade",
				duration: 300
			},
			hide: {
				effect: "fade",
				duration: 300
			},
			close: function(evt,ui){
				textureCallback = null;
			},
			open: function(evt,ui){
				getSceneTextures();
			},
			autoOpen: false,
			modal: false,
			height: 400,
			width: 600,
			minWidth: 315
		});

		function getSceneTextures()
		{
			$scope.home[1].contents = [];

			function getTexWithUrl(url, arr)
			{
				if(!arr) arr = $scope.home;

				var deepsearch = null;
				for(var i=arr.length-1; i >= 0; i--){
					if(arr[i].url === url)
						return arr[i];
					else if(arr[i].contents && (deepsearch = getTexWithUrl(url, arr[i].contents)))
						return deepsearch;
				}
				return null;
			}

			$scope.home[1].contents = _SceneManager.GetLoadedTextures().map(
				function(url){
					return getTexWithUrl(url) || {url: url, name: /[^\/]+$/.exec(url)[0]};
				}
			);
		}

		$scope.home = [
			{name: 'My Assets', contents: []},
			{name: 'Scene', contents: []},
			{name: 'Server', contents: TexList}
		];

		$scope.breadcrumbs = ['Server'];
		$scope.view = 'thumbnails'; // or 'list'

		$scope.followPath = function(crumbs, folder)
		{
			var base = folder || $scope.home;
			if(crumbs.length === 0){
				return base;
			}
			else
			{
				for(var i=0; i<base.length; i++){
					if(base[i].name === crumbs[0])
						return $scope.followPath(crumbs.slice(1), base[i].contents);
				}
				return [];
			}
		};

		$scope.getUID = function(item, crumbs)
		{
			return crumbs.slice(1).join('/') + '/' + item;
		}

		$scope.itemClicked = function(item, crumbs)
		{
			if(item.contents){
				crumbs.push(item.name);
				$('#MapBrowser .folderview')[0].scrollTop = 0;
			}
			else if(textureCallback){
				textureCallback(item.url);
				$('#MapBrowser').dialog('close');
			}
		}

		$scope.loadByURL = function()
		{
			alertify.prompt('Enter the URL to a texture. The texture must be WebGL compatable and served from a domain that supports CORS', function(ok, url) {
				if(ok && textureCallback){
					textureCallback(url);
					$scope.$apply();
					$('#MapBrowser').dialog('close');
				}
			});
		}
	}]);


	return function(cb){
		textureCallback = cb;
		$('#MapBrowser').dialog('open');
	};
});

