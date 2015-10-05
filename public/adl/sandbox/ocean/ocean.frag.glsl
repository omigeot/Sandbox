

varying vec3 vSundir;
varying vec3 vNormal;
varying vec3 vCamDir;
varying vec3 texcoord0;
varying mat3 TBN;
varying float vCamLength;
varying float h;
vec3 upwelling = vec3(0.0,0.2,0.3);
vec3 sky = vec3(0.69,0.84,1.0);
vec3 air = vec3(0.1,0.1,0.1);
uniform float t;
float nSnell = 1.34;
float kD = .91;
uniform samplerCube texture;
uniform sampler2D oNormal;
uniform sampler2D diffuse;
void main() {

	vec3 mapNormal = texture2D(oNormal,texcoord0.xy/20.0 + 0.02*t).rgb + texture2D(oNormal,texcoord0.yx/15.0+ 0.015*t).rgb + texture2D(oNormal,texcoord0.xy/5.0 + 0.05*t).rgb;

	vec3 diffuseTex = texture2D(diffuse,texcoord0.xy/20.0 + 0.02*t).rgb + texture2D(diffuse,texcoord0.yx/15.0+ 0.015*t).rgb + texture2D(diffuse,texcoord0.xy/25.0 + 0.05*t).rgb;

	diffuseTex/= 3.0;

	mapNormal/= 3.0;
	mapNormal = 2.0*mapNormal.xyz - 1.0;

	vec3 texNormal =  normalize(TBN * mapNormal);
	float ref = 0.0;
	vec3 nI  = normalize(vCamDir);
	vec3 nN = normalize(texNormal);
	float cosT = (dot(nI,nN));
	float Ti = acos(cosT);
	float sinT = sin(Ti)/nSnell;
	float Tt =asin(sinT);

	float ndotl = max(0.35,dot(vSundir,texNormal));
	float spec = pow(clamp(dot(vCamDir,reflect(-vSundir,texNormal)),0.0,1.0),16.0);
	upwelling *= ndotl;

//	if(Ti == 0.0)
	//{
	//	ref = (nSnell - 1.0)/(nSnell + 1.0);
	//	ref = ref*ref;
	//}else
	{

		float fs = sin(Tt - Ti) / sin(Tt + Ti);
		float ts = tan(Tt - Ti) / tan(Tt + Ti);
		ref = .5 * (fs*fs+ts*ts);

	}
	vec3 camdir = vCamDir;
	//if(vCamDir.z < 0.0)   //underwater looking up
	//{
	//	ref = 0.1;
	//	camdir *= -1.0;
	//	texNormal.z *= -1.0;
	//	upwelling =  0.8 * textureCube(texture,refract(camdir,texNormal,.9)).xyz;
	//}
	ref = min(1.0,ref);
	float dist = exp(-vCamLength/100.0) * kD;
	sky = 2.0*textureCube(texture,reflect(-camdir,texNormal)).xyz;
	vec3 upwellingC = (1.0-ref)*upwelling;
	vec4 water  =  vec4(dist * (ref * sky + upwellingC)+(1.0-dist)*air,max(.5 + 3.0*(1.0-dist),ref));
	water += vec4(1.0,1.0,1.0,1.0) * spec;
	vec4 foam = vec4(diffuseTex,1.0);
	float foamMix = max(0.0,foam.g*abs(h)*6.0);
	gl_FragColor = mix(water,foam,foamMix);
	
	//gl_FragColor.xyz = vCamDir;

}