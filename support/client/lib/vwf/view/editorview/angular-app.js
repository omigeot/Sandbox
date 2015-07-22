define(['vwf/view/editorview/lib/angular'], function(angular)
{
	var app = angular.module('SandboxEditor', []);

	app.run(['$rootScope', function($rootScope)
	{
		app.root = $rootScope;
		$rootScope.fields = {
			selectedNode: null,
			worldIsReady: false,
			nodes: {}
		};

		$(document).on('selectionChanged', function(e,node){
			$rootScope.fields.selectedNode = node;

			if(node){
				node.methods = node.methods || {};
				node.events = node.events || {};
				node.properties = node.properties || {};
			}

			$rootScope.$apply();
		});

		$(document).on('setstatecomplete', function(){
			$rootScope.fields.worldIsReady = true;
			$rootScope.$apply();
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

	app.createdNode = function(parentId, newId, newExtends, newImplements, newSource)
	{
		var node = app.root.fields.nodes[newId] = app.root.fields.nodes[newId] || {};
		node.id = newId;
		node.prototype = newExtends;
		node.name = '';
		node.children = node.children || [];

		if( parentId )
		{
			if( !app.root.fields.nodes[parentId] )
				app.root.fields.nodes[parentId] = {id: parentId, children: []};

			node.parent = app.root.fields.nodes[parentId];
			node.parent.children.push(node);
		}

		app.root.$apply();
	}

	app.deletedNode = function(nodeId)
	{
		var node = app.root.fields.nodes[nodeId];

		for(var i=0; i<node.parent.children.length; i++){
			if( node.parent.children[i] === node ){
				node.parent.children.splice(i, 1);
				break;
			}
		}

		delete app.root.fields.nodes[nodeId];
	}

	return app;
});
