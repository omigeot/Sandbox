define(['vwf/view/editorview/lib/angular'], function(angular)
{
	var app = angular.module('SandboxEditor', []);

	app.run(['$timeout', '$rootScope', function($timeout, $rootScope)
	{
		app.root = $rootScope;
		$rootScope.fields = {
			selectedNode: null,
			selectedNodeIds: [],
			worldIsReady: false,
			nodes: {},
			cameras: []
		};

		$(document).on('selectionChanged', function(e,node)
		{
			$rootScope.fields.selectedNode = node;
			$rootScope.fields.selectedNodeIds = [];
			for(var i=0; i<_Editor.getSelectionCount(); i++)
				$rootScope.fields.selectedNodeIds.push(_Editor.GetSelectedVWFID(i));

			if(node){
				node.methods = node.methods || {};
				node.events = node.events || {};
				node.properties = node.properties || {};
			}

			$timeout($rootScope.$apply.bind($rootScope));
		});

		$(document).on('setstatecomplete', function(){
			$rootScope.fields.worldIsReady = true;
			$timeout($rootScope.$apply.bind($rootScope));
		});
	}]);

	app.initialize = function(){
		angular.bootstrap( document.body, ['SandboxEditor'] );
	}

	function sortChildren(nodeId)
	{
		var parent = app.root.fields.nodes[nodeId];

		if(parent)
		{
			parent.children.sort(function(a,b)
			{
				a = app.root.fields.nodes[a];
				b = app.root.fields.nodes[b];

				if( !b || !b.name && a.name || a.name.toLowerCase() < b.name.toLowerCase() )
					return -1;
				else if( !a || !a.name && b.name || b.name.toLowerCase() < a.name.toLowerCase() )
					return 1;
				else
					return 0;
			});
		}
	}

	app.createdMethod = function(id, name, params, body)
	{
		if( app.root.fields.selectedNode && id === app.root.fields.selectedNode.id ){
			app.root.fields.selectedNode.methods[name] = {
				parameters: params,
				body: body
			};
			app.root.$apply();
		}
	}

	app.deletedMethod = function(id, name)
	{
		if( app.root.fields.selectedNode && id === app.root.fields.selectedNode.id ){
			delete app.root.fields.selectedNode.methods[name];
			app.root.$apply();
		}
	}

	app.createdEvent = function(id, name, params, body)
	{
		if( app.root.fields.selectedNode && id === app.root.fields.selectedNode.id ){
			app.root.fields.selectedNode.events[name] = {
				parameters: params,
				body: body
			};
			app.root.$apply();
		}
	}

	app.deletedEvent = function(id, name){
		if( app.root.fields.selectedNode && id === app.root.fields.selectedNode.id ){
			delete app.root.fields.selectedNode.events[name];
			app.root.$apply();
		}
	}

	app.initializedProperty = app.createdProperty = app.satProperty = function(id, prop, val)
	{
		if( app.root.fields.selectedNode && id === app.root.fields.selectedNode.id )
			app.root.fields.selectedNode.properties[prop] = val;

		if(prop === 'DisplayName')
		{
			app.root.fields.nodes[id].name = val;

			// name has just been set, so update position in parent's children array
			sortChildren( app.root.fields.nodes[id].parent );
		}
		else if( prop === 'type' ){
			app.root.fields.nodes[id].typeProp = val;
		}

		if( app.root.fields.selectedNode && id===app.root.fields.selectedNode.id || prop === 'DisplayName' || prop === 'type' )
			app.root.$apply();
	}

	app.createdNode = function(parentId, newId, newExtends, newImplements, newSource, newType)
	{
		if( newId === 'http-vwf-example-com-camera-vwf-camera' ) return;

		var node = app.root.fields.nodes[newId] = {};
		node.id = newId;
		node.prototype = newExtends;
		node.subtype = newType;
		node.name = newId;
		node.children = [];

		if( parentId ){
			node.parent = parentId;
			app.root.fields.nodes[parentId].children.push(newId);
			sortChildren( parentId );
		}

		if(newExtends === 'SandboxCamera-vwf')
			app.root.fields.cameras.push(newId);

		app.root.$apply();
	}

	/*app.initializedNode = function(nodeId)
	{
		if(app.root.fields.nodes[nodeId]){
			console.log('Initialized', nodeId);
			app.root.fields.nodes[nodeId].childrenBound = true;
			app.root.$apply();
		}
	}*/

	app.deletedNode = function(nodeId)
	{
		var node = app.root.fields.nodes[nodeId];
		var parent = app.root.fields.nodes[node.parent];

		for(var i=0; i<parent.children.length; i++){
			if( parent && parent.children[i] === node.id ){
				parent.children.splice(i, 1);
				break;
			}
		}

		delete app.root.fields.nodes[nodeId];

		if( app.root.fields.cameras.indexOf(nodeId) > -1 )
			app.root.fields.cameras.splice( app.root.fields.cameras.indexOf(nodeId), 1 );

		app.root.$apply();
	}

	return app;
});
