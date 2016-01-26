'use strict';

define(['./angular-app', './manageAssets'], function(app)
{
	var textureCallback = null;

	app.controller('MapBrowserController', ['$scope','AssetDataManager', function($scope, UserAssets)
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
			width: 600
		});


		$scope.breadcrumbs = ['jungle_1','jungle'];
		$scope.view = 'thumbs'; // or 'list'
	}]);


	return function(cb){
		textureCallback = cb;
		$('#MapBrowser').dialog('open');
	};
});

