define(['vwf/view/editorview/lib/angular'], function(angular)
{
	var app = angular.module('SandboxEditor', []);

	app.run(['$timeout', '$rootScope', function($timeout, $rootScope)
	{
		app.root = $rootScope;
		$rootScope.fields = {
			selectedNode: null,
			worldIsReady: false,
			nodes: {}
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
			app.root.fields.nodes[id].name = val;

		app.root.$apply();
	}

	app.createdNode = function(parentId, newId, newExtends, newImplements, newSource, newType)
	{
		var node = app.root.fields.nodes[newId] = {};
		node.id = newId;
		node.prototype = newExtends;
		node.subtype = newType;
		node.name = '';
		node.children = [];

		if( parentId ){
			node.parent = parentId;
			app.root.fields.nodes[parentId].children.push(newId);
		}

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
			if( parent.children[i] === node.id ){
				parent.children.splice(i, 1);
				break;
			}
		}

		delete app.root.fields.nodes[nodeId];
	}

	return app;
});
