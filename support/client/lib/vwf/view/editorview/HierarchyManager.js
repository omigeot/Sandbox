'use strict';

define(['vwf/view/editorview/angular-app', 'vwf/view/editorview/SidePanel'], function(app, SidePanel)
{
	app.directive('treeNode', ['$compile','$timeout', function($compile, $timeout)
	{
		var template = $('#hierarchyManager #hierarchyNodeTemplate').html();

		return {
			restrict: 'E',
			scope: true,
			link: function($scope, elem, attrs)
			{
				$scope.label = attrs.label;
				$scope.node = {};

				if( attrs.nodeId )
				{
					$scope.$watch('fields.nodes["'+attrs.nodeId+'"]', function(newval){
						if(newval){
							$scope.node = $scope.vwfNode = newval;
							var threeMap = $scope.getThreeDescendants($scope.node);
							if( threeMap )
								$scope.threeMap = threeMap;
						}
					});
				}
				else if( attrs.threeId )
				{
					$scope.node = $scope.threeMap[attrs.threeId];
				}

				$scope.isSearchResult = function(nodeId)
				{
					var node = $scope.fields.nodes[nodeId];
					if( $scope.searchTerms )
						return node && node.name && node.name.toLowerCase().indexOf($scope.searchTerms.toLowerCase()) > -1;
					else
						return true;
				}

				$scope.isSearchResultAncestor = function(nodeId)
				{
					if( $scope.searchTerms )
						return $scope.fields.nodes[nodeId] && $scope.fields.nodes[nodeId].children.reduce(
							function(oldResult, childId){
								return oldResult || $scope.isSearchResult(childId) || $scope.isSearchResultAncestor(childId);
							},
							false
						);
					else
						return $scope.open();
				}

				var cancel = null;
				$scope.$watch('searchTerms', function(newval)
				{
					if(cancel) $timeout.cancel(cancel);

					cancel = $timeout(function()
					{
						var isAncestor = $scope.isSearchResultAncestor($scope.node.id);
						var isResult = $scope.isSearchResult($scope.node.id);

						elem.toggleClass('hidden', !isAncestor && !isResult);
						if( $scope.searchTerms && isAncestor )
							elem.removeClass('collapsed');
					}, 200);
				});

				$scope.open = function(){
					return !elem.hasClass('collapsed');
				}

				$scope.getIcon = function(){
					var classes = ['hierarchyicon', 'glyphicon'];
					if( $('ul li', elem).length === 0 )
						classes.push('glyphicon-ban-circle');
					else if($scope.open())
						classes.push('glyphicon-triangle-bottom');
					else
						classes.push('glyphicon-triangle-right');

					return classes;
				}

				$scope.toggleCollapse = function(){
					if( elem.hasClass('collapsed') )
						elem.removeClass('collapsed');
					else
						elem.addClass('collapsed');
				}

				$scope.isBound = function(id)
				{
					if( $scope.fields.nodes[id] ){
						return false;
					}
					else
					{
						for(var i=0; i<$scope.vwfNode.children.length; i++)
						{
							var vwfChild = $scope.fields.nodes[$scope.vwfNode.children[i]];
							if( vwfChild.threeId && id && vwfChild.threeId === id )
								return true;
						}
						return false;
					}
				}

				$compile(template)($scope, function(e){
					elem.html(e);
				});
			}
		};
	}]);

	app.directive('scrollFixed', function()
	{
		return {
			restrict: 'A',
			scope: {
				fixedProps: '@scrollFixed'
			},
			link: function($scope, elem, attrs)
			{
				$scope.fixedProps = $scope.fixedProps.split(' ');

				var initialVals = {};
				for(var i=0; i<$scope.fixedProps.length; i++){
					var propName = $scope.fixedProps[i];
					initialVals[propName] = parseInt(elem[0].style[propName]) || 0;
				}

				var parent = elem.parent()[0];
				elem.parent().scroll(function(evt)
				{
					if( initialVals.top !== undefined ){
						elem[0].style.top = (parent.scrollTop + initialVals.top) + 'px';
					}
					if( initialVals.bottom !== undefined ){
						elem[0].style.bottom = (-parent.scrollTop + initialVals.bottom) + 'px';
					}
					if( initialVals.left !== undefined ){
						elem[0].style.left = (parent.scrollLeft + initialVals.left) + 'px';
					}
					if( initialVals.right !== undefined ){
						elem[0].style.right = (-parent.scrollLeft + initialVals.right) + 'px';
					}
				});
			}
		};
	});

	app.controller('HierarchyController', ['$scope', function($scope)
	{
		window._HierarchyManager = $scope;

		$scope.selectedThreeNode = null;
		var selectionBounds = null;

		$scope.searchTerms = '';

		$scope.select = function(node, evt)
		{
			// vwf nodes
			if( $scope.fields.nodes[node.id] )
			{
				$scope.selectedThreeNode = null;
				$scope.makeBounds();

				// new selection = 0, add = 2, subtract = 3
				if( !evt.ctrlKey )
				{
					_Editor.SelectObject(node.id, 0);
				}
				else if( $scope.fields.selectedNodeIds.indexOf(node.id) === -1 )
					_Editor.SelectObject(node.id, 2);
				else
					_Editor.SelectObject(node.id, 3);
			}

			// three.js nodes
			else
			{
				_Editor.SelectObject();

				if( $scope.selectedThreeNode !== node ){
					$scope.selectedThreeNode = node;
					$scope.makeBounds(node.node);
				}
				else {
					$scope.selectedThreeNode = null;
					$scope.makeBounds();
				}
			}
		}

		$scope.focusNode = function(threeNode)
		{
			if(!threeNode){
				_Editor.focusSelected();
			}
		}

		$scope.handleKeyPress = function(evt)
		{
			evt.preventDefault();

			// delete selection on del key
			if( /^Del/.test(evt.key) || evt.which === 127 ){
				_Editor.DeleteSelection();
			}
			else if( /^Esc/.test(evt.key) || evt.which === 27 ){
				_Editor.SelectObject();
			}

			// select previous sibling
			else if( 'ArrowUp' === evt.key || evt.which === 38 )
			{
				if( $scope.fields.selectedNode )
				{
					var curNode = $scope.fields.nodes[$scope.fields.selectedNode.id];
					var parent = $scope.fields.nodes[curNode.parent];
					var previousSiblingId = parent ? parent.children[ parent.children.indexOf(curNode.id)-1 ] : null;

					if(previousSiblingId)
						_Editor.SelectObject(previousSiblingId);
				}
			}

			// select next sibling
			else if( 'ArrowDown' === evt.key || evt.which === 40 )
			{
				if( $scope.fields.selectedNode )
				{
					var curNode = $scope.fields.nodes[$scope.fields.selectedNode.id];
					var parent = $scope.fields.nodes[curNode.parent];
					var nextSiblingId = parent.children[ parent.children.indexOf(curNode.id)+1 ];

					if(nextSiblingId)
						_Editor.SelectObject(nextSiblingId);
				}
			}

			// select parent
			else if( 'ArrowLeft' === evt.key || evt.which === 37 )
			{
				if( $scope.fields.selectedNode ){
					var curNode = $scope.fields.nodes[$scope.fields.selectedNode.id];
					if( curNode.parent )
						_Editor.SelectObject(curNode.parent);
				}
			}

			// select first child
			else if( 'ArrowRight' === evt.key || evt.which === 39 )
			{
				if( $scope.fields.selectedNode )
				{
					var curNode = $scope.fields.nodes[$scope.fields.selectedNode.id];
					var domNode = $('#hierarchyDisplay .selected:not(.three *)').closest('tree-node').removeClass('collapsed');

					if( curNode.children[0] ){
						_Editor.SelectObject(curNode.children[0]);
					}
				}
			}
		}

		$scope.getThreeDescendants = function(node)
		{
			var threenode = _Editor.findviewnode(node.id);
			node.threeId = threenode.uuid;

			if( node.prototype === 'asset-vwf' && threenode )
			{
				var threeMap = {};
				buildTree(threenode);
				return threeMap;
			}

			function buildTree(threenode, idOverride, nameOverride)
			{
				var id = idOverride || threenode.uuid;
				threeMap[id] = {children: []};
				threeMap[id].prototype = 'threejs_node';
				threeMap[id].id = id;
				threeMap[id].node = threenode;
				threeMap[id].name = nameOverride || threenode.name || id || threenode.vwfID || 'No Name';
				
				for(var i=0; i<threenode.children.length; i++)
				{
					var childnode = threenode.children[i];
					threeMap[id].children.push( childnode.uuid );
					buildTree(childnode);

					threeMap[id].children.sort(function(a,b)
					{
						a = threeMap[a];
						b = threeMap[b];

						if( !b || !b.name && a.name || a.name.toLowerCase() < b.name.toLowerCase() )
							return -1;
						else if( !a || !a.name && b.name || b.name.toLowerCase() < a.name.toLowerCase() )
							return 1;
						else
							return 0;
					});
				}
			}
		}

		$scope.makeBounds = function(node)
		{
			if(node)
			{
				if (selectionBounds != null) {
					selectionBounds.parent.remove(selectionBounds);
					selectionBounds = null;
				}

				var box = node.GetBoundingBox(true);
				box.max[0] += .05;
				box.max[1] += .05;
				box.max[2] += .05;
				box.min[0] -= .05;
				box.min[1] -= .05;
				box.min[2] -= .05;
				var mat = new THREE.Matrix4();
				mat.copy(node.matrixWorld);

				selectionBounds = _Editor.BuildWireBox(
					[
						box.max[0] - box.min[0],
						box.max[1] - box.min[1],
						box.max[2] - box.min[2]
					],
					[
						box.min[0] + (box.max[0] - box.min[0]) / 2,
						box.min[1] + (box.max[1] - box.min[1]) / 2,
						box.min[2] + (box.max[2] - box.min[2]) / 2
					],
					[0, 1, 0.5, 1]
				);
				selectionBounds.matrixAutoUpdate = false;
				selectionBounds.matrix = mat;
				selectionBounds.updateMatrixWorld(true);
				selectionBounds.material = new THREE.LineBasicMaterial();
				selectionBounds.material.color.r = 0;
				selectionBounds.material.color.g = 1;
				selectionBounds.material.color.b = .5;
				selectionBounds.material.wireframe = true;
				selectionBounds.renderDepth = 10000 - 3;
				selectionBounds.material.depthTest = true;
				selectionBounds.material.depthWrite = false;
				selectionBounds.PickPriority = -1;
				_Editor.findscene().add(selectionBounds);
			}
			else if( selectionBounds != null )
			{
				selectionBounds.parent.remove(selectionBounds);
				selectionBounds = null;
			}
		}

		$scope.makeVWFNode = function()
		{
			function getDescendantVWFNodes(threeNode)
			{
				if( threeNode.vwfID ){
					return [threeNode.vwfID];
				}
				else {
					return threeNode.children.reduce(
						function(prevResults, child){
							return prevResults.concat( getDescendantVWFNodes(child) );
						},
						[]
					);
				}
			}

			function reparentTo(nodeId, parentId)
			{
				var val = vwf.getNode(nodeId);

				_UndoManager.startCompoundEvent();

				_UndoManager.recordDelete(nodeId);
				vwf_view.kernel.deleteNode(nodeId);

				var deregister = $scope.$watch('fields.nodes["'+nodeId+'"]', function(newval){
					if( !newval ){
						deregister();
						_UndoManager.recordCreate(parentId, nodeId, val);
						vwf_view.kernel.createChild(parentId, nodeId, val);
						_UndoManager.stopCompoundEvent();
					}
				});
			}

			if($scope.selectedThreeNode)
			{
				var node = $scope.selectedThreeNode.node;
				var childname = node.name || node.uuid;
				var mat = new THREE.Matrix4();
				mat.copy( node.matrix );

				var parent = node;
				while( !parent.vwfID && parent.id !== 'index-vwf' ){
					parent = parent.parent;
				}
				var parentId = parent.vwfID;

				var proto = {
					extends: 'asset.vwf',
					type: "link_existing/threejs",
					source: childname,
					properties: {
						owner: document.PlayerNumber,
						type: '3DR Object',
						DisplayName: childname,
						transform: mat
					}
				};
				var newname = GUID();

				_UndoManager.startCompoundEvent();

				_UndoManager.recordCreate(parentId, newname, proto);
				vwf_view.kernel.createChild(parentId, newname, proto, null);

				var deregister = null;
				deregister = $scope.$watch('fields.nodes["'+newname+'"]', function(newval)
				{
					if(newval)
					{
						deregister();

						// check for siblings that should be children
						var toBeMoved = getDescendantVWFNodes(node);
						for(var i=0; i<toBeMoved.length; i++){
							reparentTo(toBeMoved[i], newname);
						}

						_UndoManager.stopCompoundEvent();
					}
				});


				$scope.makeBounds();
				_Editor.SelectOnNextCreate([newname]);
			}
		}

	}]);

	return window._HierarchyManager;
});

var oldDefine = function() {

	function initialize() {
		var self = this;
		this.ready = false;
		

		this.BuildGUI = function() {

			//move the selection up or down with a keypress
			$('#VWFChildren, #THREEChildren').keyup(function(evt,ui)
			{
				console.log(evt.keyCode);
				if(evt.keyCode == 27)
				{
					$('#heirarchyParent').dblclick();
					$($($('#VWFChildren').children()[1]).children()[1]).click();
					$('#VWFChildren').focus();
				}
				if(evt.keyCode == 32)
				{
					$(this).find('[name="' + HierarchyManager.selectedName +'"]').dblclick()
					$($($('#VWFChildren').children()[1]).children()[1]).click();
					$('#VWFChildren').focus();
				}
				//find and click the next node and click it; The click handlers should deal the bounds checking the list;
				if(evt.keyCode == 40)
				{
					if($(this).find('[name="' + HierarchyManager.selectedName +'"]').parent().children()[3] && $($(this).find('[name="' + HierarchyManager.selectedName +'"]').parent().children()[0]).text() == '-')
						$($($(this).find('[name="' + HierarchyManager.selectedName +'"]').parent().children()[3]).children()[1]).click()
					else
						$($(this).find('[name="' + HierarchyManager.selectedName +'"]').parent().next().children()[1]).click();
				}
				if(evt.keyCode == 38)
				{
					if($(this).find('[name="' + HierarchyManager.selectedName +'"]').parent().prev().children()[1])
						$($(this).find('[name="' + HierarchyManager.selectedName +'"]').parent().prev().children()[1]).click();
					else
						$($(this).find('[name="' + HierarchyManager.selectedName +'"]').parent().parent().children()[1]).click()
				}
				if(evt.keyCode == 39 || evt.keyCode == 37)
				{
					$(this).find('[name="' + HierarchyManager.selectedName +'"]').prev().click();
				}
				
			})
		}
		
	}
};
