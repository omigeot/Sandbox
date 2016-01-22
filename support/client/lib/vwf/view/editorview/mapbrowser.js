'use strict';

define(['./angular-app', './manageAssets'], function(app)
{
	var textureCallback = null;

	app.controller('MapBrowserController', ['$scope', function($scope)
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
			autoOpen: false,
			modal: true,
			maxHeight: 600,
			height: 600
		});
	}]);


	return function(cb){
		textureCallback = cb;
		$('#MapBrowser').dialog('open');
	};
});

