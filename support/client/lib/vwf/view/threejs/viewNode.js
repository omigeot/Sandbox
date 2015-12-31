function nevillesIteratedInterpolation(x, order, X, Y)
{
	var Q = [Y]
	for (var i = 1; i < order; i++)
	{
		Q.push([])
		for (var j = 1; j <= i; j++)
		{
			Q[j][i] = ((x - X[i - j]) * Q[j - 1][i] - (x - X[i]) * Q[j - 1][i - 1]) / (X[i] - X[i - j])
		}
	}
	return Q[j - 1][i - 1] || 0;
}

function stepWiseInterpolation(x, X, Y, sm1)
{
	return Y[Y.length - 1];
}

function runningAverageInterpolation(x, X, Y, sm1)
{
	var ret = 0;
	for (var i = 0; i < Y.length; i++)
	{
		ret += Y[i];
	}
	return ret / Y.length;
}

function linearExtrapolation(x, X, Y, arr)
{
	var len = Y.length - 1;
	var slope = (Y[len] - Y[len - 1]) / (X[len] - X[len - 1]);
	var dist = x - X[len];
	return Y[len] + dist * slope;
}

function exponentialInterpolation(x, X, Y, sm1)
{
	var a = .5;
	return a * (Y[0]) + (1 - a) * sm1[sm1.length - 1];
}

function exponentialInterpolationLinearExtrapolation(x, X, Y, sm1)
{
	var a = .5;
	return a * (linearExtrapolation(x, X, Y, sm1)) + (1 - a) * sm1[sm1.length - 1];
}

function linearInterpolation(x, X, Y, sm1)
{
	return nevillesIteratedInterpolation(x, 2, X, Y);
}

function quadInterpolation(x, X, Y, sm1)
{
	return nevillesIteratedInterpolation(x, 3, X, Y);
}
var INTERP_TYPE = exponentialInterpolationLinearExtrapolation;

function interpolate(time, xArr, yArr, sm1)
{
	return INTERP_TYPE(time, xArr, yArr, sm1);
}

function interpolationQueue(length, default_val)
{
	this.length = length
	this.values = [];
	this.times = [];
	this.interpolatedValues = [];
	this.setCount = 0;
	for (var i = 0; i < this.length; i++)
	{
		this.values.push(default_val);
		this.times.push(0);
		this.interpolatedValues.push(default_val);
	}
}
interpolationQueue.prototype.push = function(val)
{
	this.values.shift();
	this.times.shift();
	this.values.push(val);
	this.times.push(Engine.realTime());
	this.setCount++;
}
interpolationQueue.prototype.interpolate = function(time)
{
	if (this.setCount < 3)
		return this.values[0];
	var newVal = this._interpolate(time);
	this.interpolatedValues.shift();
	this.interpolatedValues.push(newVal);
	return newVal;
}

function floatQueue(length)
{
	interpolationQueue.call(this, length, 0);
}
floatQueue.prototype = new interpolationQueue();
floatQueue.prototype._interpolate = function(time)
{
	return interpolate(time, this.times, this.values, this.interpolatedValues);
}

function VectorQueue(length)
{
	interpolationQueue.call(this, length, [0, 0, 0])
	this.xQueue = new floatQueue(length);
	this.yQueue = new floatQueue(length);
	this.zQueue = new floatQueue(length);
}
VectorQueue.prototype = new interpolationQueue();
VectorQueue.prototype._interpolate = function(time)
{
	var x = this.xQueue.interpolate(time)
	var y = this.yQueue.interpolate(time)
	var z = this.zQueue.interpolate(time)
	return [x, y, z];
}
VectorQueue.prototype.push = function(val)
{
	this.xQueue.push(val[0]);
	this.yQueue.push(val[1]);
	this.zQueue.push(val[2]);
	this.setCount++;
}

function QuaternionQueue(length)
{
	interpolationQueue.call(this, length, [0, 0, 1, 0]);
}
QuaternionQueue.prototype = new interpolationQueue();
QuaternionQueue.prototype._interpolate = function(time)
{
	var Y = this.values;
	var X = this.times;
	var x = time;
	var len = Y.length - 1;
	var slope = Quaternion.scale(Quaternion.add(Y[len], Quaternion.negate(Y[len - 1], []), []), 1 / (X[len] - X[len - 1]), []); //(Y[len] - Y[len-1])/(X[len] - X[len-1]);
	var dist = x - X[len];
	var extrapolated = Quaternion.add(Y[len], Quaternion.scale(slope, dist, []), []);
	var ret = Quaternion.slerp(this.interpolatedValues[len] || [0, 0, 0, 1], extrapolated, .9, []);
	return Quaternion.normalize(ret, []);
}

function viewInterpolationNode(id, childExtendsID, threejsNode)
{
	this.id = id;
	this.threejsNode = threejsNode;
	this.childExtendsID = childExtendsID;
	this.properties = {};
	this.positionQueue = new VectorQueue(5);
	this.scaleQueue = new VectorQueue(5);
	this.quaternionQueue = new QuaternionQueue(5);
	this.transformBackup = null;
	this.animationFrameBackup = null;
}
viewInterpolationNode.prototype.tick = function() {}
viewInterpolationNode.prototype.pushTransform = function(newTransform)
{
	var mat = new THREE.Matrix4();
	mat.elements.set(newTransform);
	var position = new THREE.Vector3();
	var scale = new THREE.Vector3();
	var rotation = new THREE.Quaternion();
	mat.decompose(position, rotation, scale);
	this.positionQueue.push([position.x, position.y, position.z]);
	this.scaleQueue.push([scale.x, scale.y, scale.z]);
	this.quaternionQueue.push([rotation.x, rotation.y, rotation.z, rotation.w]);
	//get quat
	//push quat
}
viewInterpolationNode.prototype.setProperty = function(propertyName, propertyValue)
{
	if (propertyName == 'transform')
	{
		this.properties[propertyName] = matCpy(propertyValue);
		if (Engine.realTime() - this.positionQueue.xQueue.times[4] > .04)
			this.pushTransform(matCpy(propertyValue));
	}
}
viewInterpolationNode.prototype.getProperty = function(propertyName)
{
	return this.properties[propertyName];
}
viewInterpolationNode.prototype.interpolate = function()
{
	var viewnode = this.threejsNode;
	if (!viewnode) return;
	//	if(_Editor.isSelected(this.id))
	//		return;
	if (Engine.realTime() - this.positionQueue.xQueue.times[4] > .05)
	{
		this.pushTransform(matCpy(this.getProperty('transform')))
	}
	var position = this.positionQueue.interpolate(Engine.realTime());
	var rotation = this.quaternionQueue.interpolate(Engine.realTime());
	var scale = this.scaleQueue.interpolate(Engine.realTime());
	var mat = new THREE.Matrix4();
	mat.compose(new THREE.Vector3(position[0], position[1], position[2]), new THREE.Quaternion(rotation[0], rotation[1], rotation[2], rotation[3]), new THREE.Vector3(scale[0], scale[1], scale[2]))
	if (viewnode.setTransformInternal)
	{
		viewnode.setTransformInternal(mat.elements, false);
	}
}
viewInterpolationNode.prototype.restore = function()
{
	var viewnode = this.threejsNode;
	if (!viewnode) return;
	var oldTransform = matCpy(this.getProperty('transform'));
	if (viewnode.setTransformInternal)
	{
		viewnode.setTransformInternal(oldTransform, false);
	}
}
define([], function()
{
	return viewInterpolationNode;
})