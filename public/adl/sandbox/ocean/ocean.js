"use strict";
(function()
{
    //enum to keep track of assets that fail to load
    function ocean(childID, childSource, childName, childType, assetSource, asyncCallback)
    {
        //asyncCallback(false);
        this.childID = childID;
        this.childSource = childSource;
        this.childName = childName;
        this.childType = childType;
        this.assetSource = assetSource;
        this.inheritFullBase = true; //actually construct the base classes
        this.inherits = ['vwf/model/threejs/visible.js', 'vwf/model/threejs/transformable.js']
        this.vertShaderURL = "./ocean/ocean.vert.glsl";
        this.fragShaderURL = "./ocean/ocean.frag.glsl";
        this.getSync = function(url)
        {
            return $.ajax(
            {
                async: false,
                url: url,
                method: "GET",
                contentType: "text",
                dataType: "text"
            }).responseText;
        }
        this.initialize = function()
        {
          
            this.uniforms = {
                t:
                {
                    type: "f",
                    value: 0.0
                },
                texture:
                {
                    type: "t",
                    value: _SceneManager.getTexture("./checker.jpg")
                },
                endColor:
                {
                    type: "v4",
                    value: new THREE.Vector4(0, 0, 0, 1)
                }
            };
            for (var i in THREE.UniformsLib.fog)
            {
                this.uniforms[i] = THREE.UniformsLib.fog[i];
            }
            for (var i in THREE.UniformsLib.lights)
            {
                this.uniforms[i] = THREE.UniformsLib.lights[i];
            }
            this.buildMat();
            this.geo = new THREE.PlaneGeometry(100, 100, 100, 100);
            this.mesh = new THREE.Mesh(this.geo, this.mat);
            this.mesh.InvisibleToCPUPick = true;
            this.getRoot().add(this.mesh);
            _dView.bind('prerender', this.prerender.bind(this));
            window._dOcean = this;
        }
        this.buildMat =function()
        {
            this.vertexShader = this.getSync(this.vertShaderURL)
            this.fragmentShader = this.getSync(this.fragShaderURL)
            this.mat = new THREE.ShaderMaterial(
            {
                uniforms: this.uniforms,
                attributes: this.attributes,
                vertexShader: this.vertexShader,
                fragmentShader: this.fragmentShader
            });
            if(this.mesh)
                this.mesh.material = this.mat;
        }
        this.prerender = function()
        {
            var vp = _dView.getCamera().matrixWorld.elements;
            var root = this.getRoot();
            root.position.set(vp[12], vp[13], 20);
            root.updateMatrix();
            root.updateMatrixWorld();
            var now = performance.now();
            var deltaT = now - this.lastFrame;
            this.uniforms.t.value += (deltaT / 1000.0) || 0;
            this.lastFrame = now;
        }
        this.settingProperty = function(propertyName, propertyValue) {}
        this.getRoot = function()
        {
            return this.rootNode;
        }
        this.rootNode = new THREE.Object3D();
    }
    //default factory code
    return function(childID, childSource, childName, childType, assetSource, asyncCallback)
    {
        //name of the node constructor
        var ocean1 = new ocean(childID, childSource, childName, childType, assetSource, asyncCallback);
        return ocean1;
    }
})();
//@ sourceURL=threejs.subdriver.ocean