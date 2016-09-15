(function()
{
	//draw a 2D quad, let the user place text on it.
	function toRGBA(array)
	{
		return "rgba(" + parseInt(array[0]*255) +"," + parseInt(array[1]*255)+"," + parseInt(array[2]*255)+"," + parseInt(array[3]*255)+")";
	}

	function text2D(childID, childSource, childName)
	{
		this._length = 1;
		this.width = 1;


		this.outputType = "Primitive";
		this.inputType = null;

		this.___ready = false;
		this.mesh = null;
		this.mat = null;
		this.text = "hey";
		this.resolutionX = 100;
		this.resolutionY = 100;
		this.forecolor = [1,1,1,1];
		this.backcolor = [0,0,0,1];
		this.startX = 10;
		this.startY = 50;
		this.font = "bold 40px Arial";
		this.inherits = ['vwf/model/threejs/transformable.js', 'vwf/model/threejs/visible.js'];
		this.transparent = true;
		//the node constructor
		this.settingProperty = function(propertyName, propertyValue)
		{
			if (propertyName == '_length' || propertyName == 'width')
			{
				this[propertyName] = propertyValue;
				this.build();
			}
			if (propertyName == 'resolutionX' || propertyName == 'resolutionY')
			{
				this.destroyMat();
				this.build();
			}
			if (propertyName == "text")
			{
				this[propertyName] = propertyValue;
				if (this.___ready && this.mesh)
					this.updateCanvas();
				else
					this.build();
			}
			if (propertyName == "transparent")
			{
				this[propertyName] = propertyValue;
				this.destroyMat();
				this.build();
			}
			if (propertyName == "forecolor")
			{
				this[propertyName] = propertyValue;
				if (this.___ready && this.mesh)
					this.updateCanvas();
				else
					this.build();
			}
			if (propertyName == "backcolor")
			{
				this[propertyName] = propertyValue;
				if (this.___ready && this.mesh)
					this.updateCanvas();
				else
					this.build();
			}
			if (propertyName == "startX")
			{
				this[propertyName] = propertyValue;
				if (this.___ready && this.mesh)
					this.updateCanvas();
				else
					this.build();
			}
			if (propertyName == "startY")
			{
				this[propertyName] = propertyValue;
				if (this.___ready && this.mesh)
					this.updateCanvas();
				else
					this.build();
			}
			if (propertyName == "font")
			{
				this[propertyName] = propertyValue;
				if (this.___ready && this.mesh)
					this.updateCanvas();
				else
					this.build();
			}
		}
		this.initializingNode = function()
		{
			this.___ready = true;
			this.build();
		}
		this.gettingProperty = function(propertyName)
		{
			if (propertyName == '_length' || propertyName == 'width' || propertyName == 'EditorData' || propertyName == 'text')
				return this[propertyName];
		}
		this.destroyMat = function()
		{
			this.mat = null;
		}
		this.updateCanvas = function()
		{
			var context1 = this.canvas1.getContext('2d');
			context1.clearRect(0, 0, this.resolutionX,this.resolutionY);
			context1.fillStyle = toRGBA(this.backcolor);
			context1.fillRect(0, 0, this.resolutionX,this.resolutionY);
			context1.font = this.font;
			context1.fillStyle = toRGBA(this.forecolor);
			context1.fillText(this.text, this.startX, this.startY);
			this.mat.map.needsUpdate = true;
		}
		this.buildMat = function()
		{
			this.canvas1 = document.createElement('canvas');
			this.canvas1.width = this.resolutionX;
			this.canvas1.height = this.resolutionY;
			
			// canvas contents will be used for a texture
			var texture1 = new THREE.Texture(this.canvas1)
			texture1.needsUpdate = true;

			var material1 = new THREE.MeshBasicMaterial(
			{
				map: texture1,
				side: THREE.DoubleSide
			});
			this.mat = material1;
			this.mat.transparent = this.transparent;
			this.updateCanvas();
		}
		this.build = debounce(function()
		{
			if (!this.___ready) return;

			if (!this.mat)
			{
				this.buildMat();
			}

			if (this.mesh)
			{
				if (this.mesh.parent)
					this.mesh.parent.remove(this.mesh);
				this.mesh.geometry.dispose();
			}
			this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(this._length, this.width, 1, 1), this.mat);
			this.rootnode.add(this.mesh);
		},200);

		//must be defined by the object
		this.getRoot = function()
		{
			return this.rootnode;
		}
		this.rootnode = new THREE.Object3D();
		//this.Build();
	}
	//default factory code
	return function(childID, childSource, childName)
	{
		//name of the node constructor
		return new text2D(childID, childSource, childName);
	}
})();
//@ sourceURL=threejs.subdriver.text2d