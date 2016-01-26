'use strict';

define(['./angular-app', './manageAssets'], function(app)
{
	app.service('TextureDataManager', ['$http', function($http)
	{
		var data = [];

		function isObject(x){
			return x.name && x.contents;
		}

		function azFolderFile(a, b)
		{
			if( isObject(a) && isObject(b) ){
				return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1;
			}
			else if( isObject(a) && !isObject(b) ){
				return -1;
			}
			else if( !isObject(a) && isObject(b) ){
				return 1;
			}
			else {
				return a.toLowerCase() < b.toLowerCase() ? -1 : 1;
			}
		}

		$http.get('./vwfdatamanager.svc/textures', {}).then(
			function success(response){
				data.push.apply(data, response.data);
				data.sort(azFolderFile);
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
			minWidth: 283
		});

		$scope.home = [
			{name: 'My Assets', contents: []},
			{name: 'Scene', contents: []},
			{name: 'Server', contents: TexList}
		];

		//$scope.serverTex = TexList;
		//$scope.assets = UserAssets;

		$scope.breadcrumbs = ['Server'];
		$scope.view = 'thumbs'; // or 'list'

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
	}]);


	return function(cb){
		textureCallback = cb;
		$('#MapBrowser').dialog('open');
	};
});

