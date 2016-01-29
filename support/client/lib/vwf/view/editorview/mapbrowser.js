'use strict';

define(['./angular-app', './manageAssets'], function(app)
{
	function SortedList(sampler){
		this._sampler = sampler || function(x){ return x; };
		this.length = 0;
	}

	SortedList.prototype.insert = function(x)
	{
		var s = this._sampler;
		if(this.length === 0){
			Array.prototype.push.call(this, x);
		}
		else
		{
			var fIndex = this.length/2;
			var pow = 1;
			do
			{
				pow++;
				var mid = Math.floor(fIndex);

				if( s(x) < s(this[mid]) )
				{
					if( !this[mid-1] || s(x) >= s(this[mid-1]) ){
						Array.prototype.splice.call(this, mid, 0, x);
						return this;
					}
					else {
						fIndex -= this.length / Math.pow(2, pow);
					}
				}
				else
				{
					if( !this[mid+1] || s(x) <= s(this[mid+1]) ){
						Array.prototype.splice.call(this, mid+1, 0, x);
						return this;
					}
					else {
						fIndex += this.length / Math.pow(2, pow);
					}
				}
			}
			while(pow <= Math.ceil( Math.log2(this.length) )+1);

			throw 'Binary search exhausted!';
		}
	}

	app.service('TextureDataManager', ['$http', function($http)
	{
		var data = {server: [], assets: []};

		Object.defineProperty(data, 'refresh', {
			enumerable: false,
			writable: false,
			value: function(cb)
			{
				$http.get('/sas/assets/by-meta/all-of'+
					'?user_name=' + encodeURIComponent(_UserManager.GetCurrentUserName())+
					//'&isTexture=true'+
					'&returns=id,name,width,height,thumbnail',
					{}
				).then(
					function success(res)
					{
						data.assets = new SortedList(function(x){
							return x.name.toLowerCase();
						});

						var list = res.data.matches
						for(var i in list){
							list[i].url = '/sas/assets/'+i;
							if(list[i].thumbnail)
								list[i].thumbnail = '/sas/assets/'+ list[i].thumbnail.slice(6);
							data.assets.insert(list[i]);
						}

						cb();
					},
					function error(res){
						cb();
					}
				);
			}
		});

		$http.get('./vwfdatamanager.svc/textures', {}).then(
			function success(response){
				data.server.push.apply(data.server, response.data);
			},
			function error(response){}
		);

		return data;
	}]);

	var textureCallback = null;

	app.controller('MapBrowserController', ['$scope','TextureDataManager', function($scope, TexList)
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
				TexList.refresh(function(){
					$scope.home[0].contents = TexList.assets;
					getSceneTextures();
				});
			},
			autoOpen: true,
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
			{name: 'Server', contents: TexList.server}
		];

		$scope.breadcrumbs = ['Server'];
		$scope.view = 'list'; // or 'list'

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

		/*$scope.getUID = function(item, crumbs)
		{
			return crumbs.slice(1).join('/') + '/' + item;
		}*/

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

		$scope.folderViewScroll = function(evt)
		{
			
		}
	}]);


	return function(cb){
		textureCallback = cb;
		$('#MapBrowser').dialog('open');
	};
});

