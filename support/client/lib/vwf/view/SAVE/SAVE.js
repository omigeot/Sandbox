// Copyright 2012 United States Government, as represented by the Secretary of Defense, Under
// Secretary of Defense (Personnel & Readiness).
// 
// Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
// in compliance with the License. You may obtain a copy of the License at
// 
//   http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software distributed under the License
// is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
// or implied. See the License for the specific language governing permissions and limitations under
// the License.
var SAVE_GROUP_DEF = "./vwf/model/SAVE/semantic_entity.vwf";
var SAVE_GROUP_DEF_Extends = "-vwf-model-SAVE-semantic_entity-vwf";
define(["module", "vwf/view"], function(module, view)
{
	// vwf/view/test.js is a dummy driver used for tests.
	return view.load(module,
	{
		// == Module Definition ====================================================================
		// -- initialize ---------------------------------------------------------------------------
		instance: function(data)
		{
			this.createS3D(GUID(), data.ID, data.name);
		},
		loadToolTray: function()
		{
			var self = this;
			var url = this.getBaseServerAddress() + '/inventory';
			$.ajax(
				{
					url: url,
					type: 'get',
					cache: false
				})
				.done(function(data)
				{
					self.setToolTray(data.tooltray);
					self.buildToolTrayGUI();
				})
				.fail(function(jqXHR, textStatus, errorThrown)
				{
					console.info('using inventoryServerAddress:' + url);
					console.warn('error:' + textStatus);
				});
		},
		toolTray: null,
		setToolTray: function(t)
		{
			this.toolTray = t;
		},
		buildToolTrayGUI: function()
		{
			if (window._EntityLibrary)
			{
				_EntityLibrary.removeLibrary("Semantic 3D")
				var lib = {};
				for (var i in this.toolTray)
				{
					lib[this.toolTray[i].name] = {};
					lib[this.toolTray[i].name].name = this.toolTray[i].name;
					lib[this.toolTray[i].name].ID = this.toolTray[i].ID;
					lib[this.toolTray[i].name].type = "semantic3D";
				}
				_EntityLibrary.addLibrary("Semantic 3D", lib);
			}else
			{

				$(document.body).append("<div class='SAVEMenu' id='EUIToolTray'></div");
				$("#EUIToolTray").append("<div class='tooltraytitle' >Tools</div");
				for(var i in this.toolTray)
				{
					var id = GUID();
					var self = this;
					$("#EUIToolTray").append("<div class='tooltrayItem' id='"+id+"'></div");
					$("#"+id).text(this.toolTray[i].name);
					(function(){
						var item = self.toolTray[i];
							$("#"+id).click(function()
							{
								self.createS3D(GUID(),item.ID,item.name,vwf.getProperty('http-vwf-example-com-node3-vwf-N63f37e3e','transform'));

							})
					})()
				}

			}

		},
		getBaseServerAddress: function()
		{
			return vwf.getProperty(vwf.application(), "baseServerAddress") || "http://localhost:3001/exercises/071-100-0032/step01/m4_flora_clear"
		},
		setupEUI: function() {},
		initialize: function()
		{
			window._dSAVE = this;
			this.nodes = {};
			var self = this;
			$(document).on('setstatecomplete', function()
			{
				if (!window._EntityLibrary)
					self.setupEUI();
				self.mouseDown = false;
				self.lastMouse = {
					x: 0,
					y: 0
				}
				$('#index-vwf').mousedown(function(e)
				{
					if (e.which !== 3) return;
					self.mouseDown = true;
				})
				$('#index-vwf').mousemove(function(e)
				{
					if (Math.pow(e.clientX - self.lastMouse.x, 2) + Math.pow(e.clientY - self.lastMouse.y, 2) > 7)
					{
						self.lastMouse.x = e.clientX;
						self.lastMouse.y = e.clientY;
						self.mouseDown = false;
					}
				})
				$('#index-vwf').mouseup(function(e)
				{
					if (e.which !== 3) return;
					if (!self.mouseDown) return;
					self.mouseDown = false;
					if (vwf.getProperty(vwf.application(), 'playMode') !== "play") return;
					var ray = _Editor.GetWorldPickRay(e);
					var campos = _Editor.getCameraPosition();
					var hit = _SceneManager.CPUPick(campos, ray);
					//walk up until we have the VWFID of the picked object
					if (hit && hit.object)
					{
						while (hit.object && !hit.object.vwfID)
							hit.object = hit.object.parent;
					}
					var vwfID = null;
					if (hit.object)
					{
						vwfID = hit.object.vwfID;
					}
					var child_name = vwf.getProperty(vwfID, "DisplayName");
					var childKBID = vwf.getProperty(vwfID, "KbId");
					var childID = vwfID;
					if (vwfID)
					{
						this.actionStack = [];
						var rootnode = self.getRootSemanticID(vwfID);
						var actions = vwf.callMethod(rootnode.id, "getContext", [
							[], child_name
						]);
						while (!actions && childID)
						{
							childID = vwf.parent(childID)
							child_name = vwf.getProperty(childID, "DisplayName");
							childKBID = vwf.getProperty(vwfID, "KbId");
							actions = vwf.callMethod(rootnode.id, "getContext", [
								[], child_name
							]);
						}
						console.log(actions);
						_RenderManager.flashHilight(findviewnode(childID));
						self.contextMenuClick(rootnode.id, vwfID, [], childKBID, child_name, e)
					}
				});
			})
		},
		actionStack: [],
		contextMenuClick: function(rootnodeID, vwfID, prev_actions, childKBID, child_name, e)
		{
			var actions = vwf.callMethod(rootnodeID, "getContext", [prev_actions, child_name])
			var self = this;
			$('#ContextMenu').show();
			$('#ContextMenu').css('left', e.clientX);
			$('#ContextMenu').css('top', e.clientY);
			$('#ContextMenu').css('z-index', '1000');
			$('#ContextMenuActions').empty();
			if (actions)
			{
				$('#ContextMenu').children().not("#ContextMenuActions").hide();
				for (var i in actions)
				{
					(function()
					{
						$('#ContextMenuActions').append('<div id="Action' + i + '" class="ContextMenuAction">' + actions[i] + '</div>');
						$('#Action' + i).attr('EventName', actions[i]);
						$('#Action' + i).click(function()
						{
							$('#ContextMenu').hide();
							$('#ContextMenu').css('z-index', '-1');
							$(".ddsmoothmenu").find('li').trigger('mouseleave');
							$('#index-vwf').focus();
							prev_actions.push($(this).attr('EventName'));
							self.contextMenuClick(rootnodeID, vwfID, prev_actions, childKBID, child_name, e);
						});
					})()
				}
			}
			else
			{
				$('#ContextMenu').children().not("#ContextMenuActions").show()
				$('#ContextMenu').hide();
				vwf_view.kernel.callMethod(rootnodeID, "action", [prev_actions, childKBID, child_name]);
			}
		},
		//public facing function to  trigger load of an S3D file. Normally this probably would live in the _Editor
		// or in the _EntityLibrary
		createS3D: function(name, ID, DisplayName,transform)
		{
			//Get the VWF node definition
			var postData = {
				object:
				{}
			};
			postData.object.auto = false;
			postData.object.ID = ID;
			postData.object.type = "create";
			postData.object = JSON.stringify(postData.object)
			var self = this;
			$.post(this.getBaseServerAddress() + "/object", postData, function(data)
			{
				var s3d = data[0].grouping;
				var asset = data[0].assetURL;
				var mapping = null;
				var rootKbId = data[0].KbId;
				_assetLoader.s3dToVWF(name, ID, rootKbId, asset, s3d, mapping, function(def)
				{
					def.properties.DisplayName = DisplayName;
					//hook up all the children with their KBID
					function walkDef(node, parent, cb)
						{
							//Only Groups get KBIDs
							if (node.extends == SAVE_GROUP_DEF)
							{
								async.series([
									//Get ID for self
									function getMyID(cb2)
									{
										var query = [node.properties.DisplayName + "_KbId"];
										console.log("getting KBID for " + node.properties.DisplayName)
										jQuery.ajax(
											{
												url: self.getBaseServerAddress() + "/query",
												type: 'post',
												cache: false,
												data:
												{
													type: "KbId",
													query: JSON.stringify(
													{
														type: 'KbId',
														parent: parent ? parent.properties.KbId : null,
														query: query
													})
												},
											})
											.done(function(data)
											{
												var _KbId = data.KbIds[0];
												node.properties["KbId"] = _KbId;
												console.log("got " + _KbId);
												cb2(); //goTo walkChildren
											})
											.fail(function()
											{
												node.properties["KbId"] = GUID();
												cb2(); //goTo walkChildren
											})
									},
									//Async walk of children
									function walkChildren(cb2)
									{
										var keys = Object.keys(node.children);
										async.eachSeries(keys, function walkOneChild(childNodeName, nextChildNode)
										{
											//Walk the child node
											walkDef(node.children[childNodeName], node, nextChildNode)
										}, function(err)
										{
											if (err) console.error(err);
											cb2(); //finished walking all children
										})
									}
								], function nodeWalkComplete(err)
								{
									if (err) console.error(err);
									cb(err, node) //finished walking this node
								})
							}
							else
							{
								cb(null, node); //this node does not need IDs
							}
						}
						//hookup the KB_IDS
						// walkDef(def, null, function()
						//moving this to observer for autoloads
						{
							var behavior = ("./vwf/view/SAVE/test/" + DisplayName.replace(/ /g, "_") + "_dae.eui");
							$.get(behavior, function(code)
							{
								$.extend(true, def, code);
								def.properties.transform = transform
								vwf_view.kernel.createChild(vwf.application(), name, def);
							})
						}
				});
			});
		},
		createdMethod: function(childID, methodName, body)
		{
			var node = this.nodes[childID]
			if (node)
			{
				node.methods[methodName] = body
			}
		},
		createdNode: function(nodeID, childID, childExtendsID, childImplementsIDs, childSource, childType, childURI, childName, callback /* ( ready ) */ )
		{
			var parent = this.nodes[nodeID];
			var newNode = {
				id: childID,
				extends: childExtendsID,
				source: childSource,
				type: childType,
				properties:
				{},
				children:
				{},
				methods:
				{}
			}
			if (parent)
				parent.children[childID] = newNode;
			this.nodes[childID] = newNode;
		},
		createdProperty: function(nodeID, propname, val)
		{
			this.satProperty(nodeID, propname, val);
		},
		initializedProperty: function(nodeID, propname, val)
		{
			this.satProperty(nodeID, propname, val);
		},
		satProperty: function(nodeID, propname, val)
		{
			if (!this.nodes[nodeID]) return;
			this.nodes[nodeID].properties[propname] = val;
		},
		initializedNode: function(nodeID, childID)
		{
			if (childID == vwf.application())
			{
				this.loadToolTray();
			}
			var node = this.nodes[childID]
			if (node)
			{
				if (node.extends == SAVE_GROUP_DEF_Extends && !node.properties.KbId)
				{
					var self = this;
					var query = [node.properties.DisplayName + "_KbId"];
					console.log("getting KBID for " + node.properties.DisplayName)
						//this really is not a great place to do this...
						//but it's all good because it's synchronous. 
					jQuery.ajax(
						{
							url: self.getBaseServerAddress() + "/query",
							type: 'post',
							cache: false,
							async: false,
							data:
							{
								type: "KbId",
								query: JSON.stringify(
								{
									type: 'KbId',
									parent: parent && parent.properties ? parent.properties.KbId : null,
									query: query
								})
							},
						})
						.done(function(data)
						{
							var _KbId = data.KbIds[0];
							vwf_view.kernel.setProperty(node.id, "KbId", _KbId)
							console.log("got " + _KbId);
						})
				}
			}
		},
		getRootSemanticID: function(nodeID)
		{
			var node = _Editor.getNode(nodeID);
			if (!node.methods) node.methods = {};
			while (node && node.id != vwf.application() && !node.methods.getContext)
			{
				node = _Editor.getNode(vwf.parent(node.id))
				if (!node.methods) node.methods = {};
			}
			return node;
		},
		calledMethod: function(nodeID, methodName, params)
		{
			//is there any way we can do this from here? rather than have the behaviors of the object do the post?
			//is the called method a semantic action?
			if (methodName == 'action')
			{
				//get the top level semantic node
				var node = this.getRootSemanticID(nodeID);
				var actions = vwf.getProperty(node.id, "actionNames");
				var json = {
					action: params[0],
					arguments: [params[1]],
					names: [params[2]]
				};
				$.post(this.getBaseServerAddress() + "/action", json);
			}
		}
	});
});