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
			autoOpen: true,
			modal: false,
			height: 400,
			width: 600,
			minWidth: 315
		});

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
			}
		}
	}]);


	return function(cb){
		textureCallback = cb;
		$('#MapBrowser').dialog('open');
	};
});

