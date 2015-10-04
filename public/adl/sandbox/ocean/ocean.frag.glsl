

varying vec3 vSundir;
varying vec3 vNormal;
varying vec3 vCamDir;
varying float vCamLength;
vec3 upwelling = vec3(0.0,0.2,0.3);
vec3 sky = vec3(0.69,0.84,1.0);
vec3 air = vec3(0.1,0.1,0.1);
float nSnell = 1.34;
float kD = .91;
uniform samplerCube texture;
void main() {

	float ref = 0.0;
	vec3 nI  = normalize(vCamDir);
	vec3 nN = normalize(vNormal);
	float cosT = (dot(nI,nN));
	float Ti = acos(cosT);
	float sinT = sin(Ti)/nSnell;
	float Tt =asin(sinT);

	if(Ti == 0.0)
	{
		ref = (nSnell - 1.0)/(nSnell + 1.0);
		ref = ref*ref;
	}else
	{

		float fs = sin(Tt - Ti) / sin(Tt + Ti);
		float ts = tan(Tt - Ti) / tan(Tt + Ti);
		ref = 0.5 * (fs*fs+ts*ts);

	}
	float dist = exp(-vCamLength/100.0) * kD;
	sky = textureCube(texture,vNormal).xyz;
	gl_FragColor =  vec4(dist * (ref * sky + (1.0-ref)*upwelling)+(1.0-dist)*air,max(.5 + 3.0*(1.0-dist),ref));

}