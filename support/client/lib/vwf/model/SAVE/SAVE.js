"use strict";

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

define(["module", "vwf/model"], function(module, model)
{
    return model.load(module,
    {
        initialize: function()
        {
            this.nodes = {};
        },
        callingMethod: function(nodeID, methodName, args) {
            
     
         
            //is there any way we can do this from here? rather than have the behaviors of the object do the post?
            //is the called method a semantic action?
            if (methodName == 'action')
            {
                var parent = vwf.parent(nodeID);
                var behaviors = vwf.getProperty(parent,"behaviors");
                if(!behaviors) return;
                for(var i in behaviors[0])
                {
                    if(i == args[0])
                    {
                            var behavior = behaviors[0][i];
                            for(var j in behavior)
                            {
                                    var trans = vwf.getProperty(behavior[0].target,'transform')
                                    trans[12] = behavior[0].position[0];
                                    trans[13] = behavior[0].position[1];
                                    trans[14] = behavior[0].position[2];
                                    var trans = vwf.setProperty(behavior[0].target,'transform',trans);
                            }
                    }    

                }
            }

        

        },
        creatingNode: function(nodeID, childID, childExtendsID, childImplementsIDs, childSource, childType, childURI, childName, callback /* ( ready ) */ )
        {
            this.nodes[childID] = {
                name: childName,
                id: childID,
                extends: childExtendsID,
                implements: childImplementsIDs,
                source: childSource,
                type: childType,
                uri: childURI,
                properties:
                {},
            };
        },
        initializingNode: function(nodeID, childID) {
            var node = this.nodes[childID]
            if(node)
            {
                if(!node.properties.name_KbID)
                {

                }
            }
        },
        deletingNode: function(nodeID)
        {
            delete this.nodes[nodeID];
        },
        settingProperties: function(nodeID, properties)
        {
            if (!this.nodes[nodeID]) return; // TODO: patch until full-graph sync is working; drivers should be able to assume that nodeIDs refer to valid objects

            var node_properties = this.nodes[nodeID].properties;

            for (var propertyName in properties)
            { // TODO: since undefined values don't serialize to json, interate over node_properties (has-own only) instead and set to undefined if missing from properties?
                node_properties[propertyName] = properties[propertyName];
            }
        },
        gettingProperties: function(nodeID, properties)
        {
            if(!this.nodes[nodeID]) return;
            return this.nodes[nodeID].properties;
        },

        creatingProperty: function(nodeID, propertyName, propertyValue)
        {
            return this.initializingProperty(nodeID, propertyName, propertyValue);
        },
        initializingProperty: function(nodeID, propertyName, propertyValue)
        {
            return this.settingProperty(nodeID, propertyName, propertyValue);
        },
        settingProperty: function(nodeID, propertyName, propertyValue) {


        },
        gettingProperty: function(nodeID, propertyName, propertyValue) {

        },
    });
});