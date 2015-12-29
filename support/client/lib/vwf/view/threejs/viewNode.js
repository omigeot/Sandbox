
function nevillesIteratedInterpolation (x, X, Y) {
  var Q = [Y]
  for (var i = 1; i < X.length; i++) {
    Q.push([])
    for (var j = 1; j <= i; j++) {
      Q[j][i] = ((x-X[i-j])*Q[j-1][i] - (x-X[i])*Q[j-1][i-1])/( X[i] - X[i-j] )
    }
  }
  return Q[j-1][i-1]
}

function VectorQueue(length)
{
	this.length = length
	this.values = [];
	this.times = [];
	for(var i = 0; i < this.length; i++)
	{
		this.values.push([0,0,0]);
		this.times.push(Engine.realTime());
	}
}
VectorQueue.prototype.push = function(val)
{
    this.values.shift();
    this.times.shift();
    this.values.push(val);
    this.times.push(Engine.realTime());
}
VectorQueue.prototype.getIdxArray = function(idx)
{
	var arr = [];
	for(var i = 0; i < this.length; i++)
	{
		arr.push(this.values[i][idx]);
	}
	return arr;
}
VectorQueue.prototype.getXArray = function()
{
	return this.getIdxArray(0);
}
VectorQueue.prototype.getYArray = function()
{
	return this.getIdxArray(1);
}
VectorQueue.prototype.getZArray = function()
{
	return this.getIdxArray(2);
}
VectorQueue.prototype.interpolate = function(time)
{
	var x = nevillesIteratedInterpolation(Engine.realTime()-.05,this.times,this.getXArray());
	var y = nevillesIteratedInterpolation(Engine.realTime()-.05,this.times,this.getYArray());
	var z = nevillesIteratedInterpolation(Engine.realTime()-.05,this.times,this.getZArray());
	return [x,y,z];
}

function QuaternionQueue(length)
{
	this.length = length
	this.values = [];
	this.times = [];
	for(var i = 0; i < this.length; i++)
	{
		this.values.push([0,0,0,1]);
		this.times.push(Engine.realTime());
	}
}
QuaternionQueue.prototype.push = function(val)
{
    this.values.pop();
    this.times.pop();
    this.values.unshift(val);
    this.times.unshift(Engine.realTime());
}
QuaternionQueue.prototype.getIdxArray = function(idx)
{
	var arr = [];
	for(var i = 0; i < this.length; i++)
	{
		arr.push(this.values[i][idx]);
	}
	return arr;
}
QuaternionQueue.prototype.getXArray = function()
{
	return this.getIdxArray(0);
}
QuaternionQueue.prototype.getYArray = function()
{
	return this.getIdxArray(1);
}
QuaternionQueue.prototype.getZArray = function()
{
	return this.getIdxArray(2);
}
QuaternionQueue.prototype.interpolate = function(time)
{
	var x = nevillesIteratedInterpolation(Engine.realTime(),this.times,this.getXArray());
	var y = nevillesIteratedInterpolation(Engine.realTime(),this.times,this.getYArray());
	var z = nevillesIteratedInterpolation(Engine.realTime(),this.times,this.getZArray());
	var w = nevillesIteratedInterpolation(Engine.realTime(),this.times,this.getZArray());
	return [x,y,z,w];
}

function viewInterpolationNode(id,childExtendsID,threejsNode){
	this.id = id;
	this.threejsNode = threejsNode;
	this.childExtendsID = childExtendsID;
	this.properties={};
	this.positionQueue = new VectorQueue(3);
	this.ScaleQueue = new VectorQueue(3);
	this.quaternionQueue = new QuaternionQueue(3);
	this.transformBackup = null;
	this.animationFrameBackup = null;
}
viewInterpolationNode.prototype.tick = function()
{

}
viewInterpolationNode.prototype.pushTransform = function(newTransform)
{
	var position = [newTransform[12],newTransform[13],newTransform[14]];
	this.positionQueue.push(position);
	//get quat
	//push quat
}
viewInterpolationNode.prototype.setProperty = function(propertyName,propertyValue)
{
	this.properties[propertyName] = propertyValue;
	if(propertyName == 'transform')
	{
		this.pushTransform(propertyValue);
	}
}

viewInterpolationNode.prototype.getProperty = function(propertyName)
{
	return this.properties[propertyName];
}

viewInterpolationNode.prototype.interpolate = function()
{
	var viewnode = this.threejsNode;
	if(!viewnode) return;
	var position = this.positionQueue.interpolate();

	if(Engine.propertyAge(this.id,'transform')* 1000 > 50)
	{
		var newTransform = matCpy(this.getProperty('transform'));
		var position = [newTransform[12],newTransform[13],newTransform[14]];
		this.positionQueue.push(position);
	}

	var oldTransform = matCpy(this.getProperty('transform'));
	oldTransform[12] = position[0];
	oldTransform[13] = position[1];
	oldTransform[14] = position[2];
	if(viewnode.setTransformInternal)
	{
		viewnode.setTransformInternal(oldTransform,false);	
	}
}
viewInterpolationNode.prototype.restore = function()
{
	var viewnode = this.threejsNode;
	if(!viewnode) return;
	var position = this.positionQueue.interpolate();
	
	var oldTransform = matCpy(this.getProperty('transform'));
	if(viewnode.setTransformInternal)
	{
		viewnode.setTransformInternal(oldTransform,false);	
	}
}


define([],function()
{
	return	viewInterpolationNode;
}
)