'use strict';

define(['vwf/view/editorview/angular-app'], function(app)
{
	app.controller('SidePanelController', ['$scope', function($scope)
	{
		window._SidePanel = $scope;

		$scope.isOpen = function(){
			return $('#sidepanel').width() > 0;
		}

		$scope.show = function(){
			$('#sidepanel').animate({
				width: '250px'
			});
		}

		$scope.hide = function(){
			$('#sidepanel').animate({
				width: 0
			});
		}
	}]);

	return window._SidePanel;
});

