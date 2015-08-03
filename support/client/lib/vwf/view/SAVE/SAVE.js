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
var SAVE_BACKEND_URL_QUERY = "http://localhost:3001/exercises/071-100-0032/step01/m4_flora_clear/query";
var SAVE_BACKEND_URL_OBJECT = "http://localhost:3001/exercises/071-100-0032/step01/m4_flora_clear/object";
define(["module", "vwf/view"], function(module, view)
{

    // vwf/view/test.js is a dummy driver used for tests.

    return view.load(module,
    {

        // == Module Definition ====================================================================

        // -- initialize ---------------------------------------------------------------------------

        initialize: function()
        {
            window._dSAVE = this;
            this.nodes = {};
        },
        //public facing function to  trigger load of an S3D file. Normally this probably would live in the _Editor
        // or in the _EntityLibrary
        createS3D: function(name, url)
        {
            //Get the VWF node definition
            var postData = {object:{}};
            postData.object.auto = false;
            postData.object.ID = name;
            postData.object.type = "create";
            postData.object = JSON.stringify(postData.object)
            $.post(SAVE_BACKEND_URL_OBJECT, postData, function(data)
            {
                var s3d = JSON.parse(data[0].grouping);
                var asset = data[0].assetURL;
                var mapping = null;
                var rootKbId = data[0].KbId;

                _assetLoader.s3dToVWF(name, rootKbId, asset, s3d, mapping, function(def)
                {
                    def.properties.DisplayName = name;
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
                                        url: SAVE_BACKEND_URL_QUERY,
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
                    walkDef(def, null, function()
                    {
                        _Editor.createChild(vwf.application(), name, def);
                    })

                });
            });

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
        initializedNode: function(nodeID)
        {
            //if the node already has a KBID, because it is replicated (we are a late joining client), then there is no need to associate with 
            //the ontology, because it already exists. Otherwise we are the first client to see this node, so we need to 
            //inform the backend

            //note this does note really handle cloning well, because the clone will be represented in the 
            //back end by the same entities. We would need some function to ask the backend if it knows of an object
            //by ID. This would need to be synchronous
            if (!this.nodes[nodeID]) return;

            if (this.nodes[nodeID].properties["flora_ref"] && !this.nodes[nodeID].properties["kb_ID"])
            {
                var kbid = GUID(); //inform backend of creation here, get ID
                vwf_view.kernel.setProperty(nodeID, 'kb_ID', kbid);
            }
        }

    });

});