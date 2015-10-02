"use strict";
(function() {
    //enum to keep track of assets that fail to load
    function ocean(childID, childSource, childName, childType, assetSource, asyncCallback) {
        //asyncCallback(false);
        this.childID = childID;
        this.childSource = childSource;
        this.childName = childName;
        this.childType = childType;
        this.assetSource = assetSource;
        this.inheritFullBase = true; //actually construct the base classes
        this.inherits = ['vwf/model/threejs/asset.js']

        this.initialize = function() {
            this.geo = new THREE.PlaneGeometry(100,100,100,100);
            thi.mat = new THREE.MeshPhongMaterial();
            this.mesh - new THREE.Mesh(this.geo,this.mat);
            this.getRoot().add(this.mesh);
        }
        this.settingProperty = function(propertyName,propertyValue)
        {
            
         
        }
        this.getRoot = function()
        {
           return this.rootNode;
        }
        this.rootNode = new THREE.Object3D();
        debugger;
    }
    //default factory code
    return function(childID, childSource, childName, childType, assetSource, asyncCallback) {
        //name of the node constructor
        var ocean = new ocean(childID, childSource, childName, childType, assetSource, asyncCallback);
        
        return ocean;
    }
})();
//@ sourceURL=threejs.subdriver.avatar