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
        this.direction = 90;
        this.directionVariation = 180;
        this.amplitude = 10;
        this.amplitudeVariation = 15;
        this.waveNum = 9;
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
        this.generateWaves = function()
        {
            var min = this.amplitude - this.amplitudeVariation;
            var max = this.amplitude + this.amplitudeVariation;
            var mean = this.amplitude;
            var a = ((mean-min)/(max-mean))/5.0;

            for(var i = 0; i < this.waveNum; i++)
            {
                var b = Math.random();
                var amp = min + (a/(a+b))*(max-min);
                if(amp<1)amp=1;
                this.uniforms.waves.value[i].x = amp;
            }

            var min = this.direction - this.directionVariation;
            var max = this.direction + this.directionVariation;
            var mean = this.direction;
            var a = ((mean-min)/(max-mean))/5.0;

            for(var i = 0; i < this.waveNum; i++)
            {
                var b = Math.random();
                var amp = min + (a/(a+b))*(max-min);
                var dir = [1,0];

                amp/= 57;
                
                var x1 = 1 * Math.cos(amp) - 0 * Math.sin(amp);
                var y1 = 1 * Math.sin(amp) + 0 * Math.cos(amp);
                this.uniforms.waves.value[i].y = x1;
                this.uniforms.waves.value[i].z = y1;

            }
        }
        this.initialize = function()
        {
            this.uniforms = {
                t:
                {
                    type: "f",
                    value: 0.0
                },
                uChop:
                {
                    type: "f",
                    value: 1.4
                },
                uReflectPow:
                {
                    type: "f",
                    value: 3.5
                },
                waves:{
                    type: "v3v",
                    value:[
                    (new THREE.Vector3(10,1.0, 1.0)),
                    (new THREE.Vector3(3.5,-1.0, 1.0)),
                    (new THREE.Vector3(6,1.0, -1.0)),
                    (new THREE.Vector3(5,1.6, 1.4)),
                    (new THREE.Vector3(8,-0.3, 1.0)),
                    (new THREE.Vector3(30,6.0, -1.0)),
                    (new THREE.Vector3(4,6.0, -1.0)),
                    (new THREE.Vector3(8,-1.0, 61.0)),
                    (new THREE.Vector3(20,-1.6, 1.0))
                    ]
                },
                uFoam:
                {
                    type: "f",
                    value: 1
                },
                uMag:
                {
                    type: "f",
                    value: .5
                },
                texture:
                {
                    type: "t",
                    value: _SceneManager.getTexture("./checker.jpg")
                },
                oNormal:
                {
                    type: "t",
                    value: _SceneManager.getTexture("./ocean/oNormal.jpeg")
                },
                diffuse:
                {
                    type: "t",
                    value: _SceneManager.getTexture("./ocean/diffuse.jpg")
                },
                endColor:
                {
                    type: "v4",
                    value: new THREE.Vector4(0, 0, 0, 1)
                },
                mProj:
                {
                    type: "m4",
                    value: new THREE.Matrix4()
                },
                oCamPos:
                {
                    type: "v3",
                    value: new THREE.Vector3(0, 0, 0, 1)
                },
                wPosition:
                {
                    type: "v3",
                    value: new THREE.Vector3(0, 0, 0, 1)
                }
            };
            var sky = vwf_view.kernel.kernel.callMethod(vwf.application(), 'getSkyMat')
            if (sky)
            {
                this.uniforms.texture.value = sky.uniforms.texture.value;
                this.uniforms.texture.value.mapping = new THREE.CubeReflectionMapping();
            }
            for (var i in THREE.UniformsLib.fog)
            {
                this.uniforms[i] = THREE.UniformsLib.fog[i];
            }
            for (var i in THREE.UniformsLib.lights)
            {
                this.uniforms[i] = THREE.UniformsLib.lights[i];
            }
            this.buildMat();
            this.near = new THREE.PlaneGeometry(1, 1, 200, 200);
            this.nearmesh = new THREE.Mesh(this.near, this.mat);
            
            this.nearmesh.InvisibleToCPUPick = true;
            this.getRoot().add(this.nearmesh);
           
            this.nearmesh.material.uniforms.edgeLen = {type:"f",value:1}
         
            _dView.bind('prerender', this.prerender.bind(this));
            window._dOcean = this;
        }
        this.buildMat = function()
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
            this.mat.transparent = true;
            this.mat.lights = true;
            this.mat.side = 0;
            if (this.nearmesh)
                this.nearmesh.material = this.mat;
        }
        this.prerender = function()
        {
            var vp = _dView.getCamera().matrixWorld.elements;
            var root = this.getRoot();
            root.position.set(vp[12] , vp[13] , 20);
            root.position.set(0, 0, 0);
            root.updateMatrix();
            root.updateMatrixWorld();
            var now = performance.now();
            var deltaT = now - this.lastFrame;

            var _viewProjectionMatrix = new THREE.Matrix4();
             _viewProjectionMatrix.multiplyMatrices(_dView.getCamera().projectionMatrix, _dView.getCamera().matrixWorldInverse);

            this.uniforms.mProj.value.getInverse(_viewProjectionMatrix);
            this.uniforms.t.value += (deltaT / 1000.0) || 0;
            this.uniforms.oCamPos.value.set(vp[12] - root.matrixWorld.elements[12], vp[13] - root.matrixWorld.elements[13], vp[14] - root.matrixWorld.elements[14]);
            this.uniforms.wPosition.value.set(root.matrixWorld.elements[12]%1000, root.matrixWorld.elements[13]%1000, root.matrixWorld.elements[14]%1000);
            this.lastFrame = now;
        }
        this.settingProperty = function(propertyName, propertyValue) {

            if(propertyName == "uMag")
            {
                this.uniforms.uMag.value = propertyValue;
            }
            if(propertyName == "uReflectPow")
            {
                this.uniforms.uReflectPow.value = propertyValue;
            }
            if(propertyName == "uChop")
            {
                this.uniforms.uChop.value = propertyValue;
            }
            if(propertyName == "uFoam")
            {
                this.uniforms.uFoam.value = propertyValue;
            }

        }
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
