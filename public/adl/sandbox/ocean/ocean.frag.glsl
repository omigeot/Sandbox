

varying vec3 vSundir;
varying vec3 vNormal;
varying vec3 vCamDir;
varying vec3 texcoord0;
varying mat3 TBN;
varying float vCamLength;
varying float h;
vec3 upwelling = vec3(0.2, 0.4, 0.6);
vec3 sky = vec3(0.69, 0.84, 1.0);
vec3 air = vec3(0.1, 0.1, 0.1);
uniform float t;
uniform float edgeLen;
float nSnell = 1.34;
float kD = .91;
uniform samplerCube texture;
uniform sampler2D oNormal;
uniform sampler2D diffuse;

uniform vec3 ambientLightColor;
#if MAX_DIR_LIGHTS > 0
uniform vec3 directionalLightColor[ MAX_DIR_LIGHTS ];
uniform vec3 directionalLightDirection[ MAX_DIR_LIGHTS ];
#endif
#if MAX_HEMI_LIGHTS > 0
uniform vec3 hemisphereLightSkyColor[ MAX_HEMI_LIGHTS ];
uniform vec3 hemisphereLightGroundColor[ MAX_HEMI_LIGHTS ];
uniform vec3 hemisphereLightDirection[ MAX_HEMI_LIGHTS ];
#endif
#if MAX_POINT_LIGHTS > 0
uniform vec3 pointLightColor[ MAX_POINT_LIGHTS ];
uniform vec3 pointLightPosition[ MAX_POINT_LIGHTS ];
uniform float pointLightDistance[ MAX_POINT_LIGHTS ];
#endif
#if MAX_SPOT_LIGHTS > 0
uniform vec3 spotLightColor[ MAX_SPOT_LIGHTS ];
uniform vec3 spotLightPosition[ MAX_SPOT_LIGHTS ];
uniform vec3 spotLightDirection[ MAX_SPOT_LIGHTS ];
uniform float spotLightAngleCos[ MAX_SPOT_LIGHTS ];
uniform float spotLightExponent[ MAX_SPOT_LIGHTS ];
uniform float spotLightDistance[ MAX_SPOT_LIGHTS ];
#endif
#if MAX_SPOT_LIGHTS > 0 || defined( USE_BUMPMAP ) || defined( USE_ENVMAP )|| defined( USE_NORMALMAP )
varying vec3 vWorldPosition;
#endif
#ifdef WRAP_AROUND
uniform vec3 wrapRGB;
#endif

uniform float uChop;
uniform float uReflectPow;
uniform float uFoam;
varying vec3 vViewPosition;
varying vec2 texcoord1;

void main() {

	vec3 tc = texcoord0 / edgeLen;
	vec3 mapNormal = texture2D(oNormal, tc.xy / 5.0 + 0.02 * -t).rgb + texture2D(oNormal, tc.yx / 3.0 + 0.015 * t).rgb + texture2D(oNormal, tc.xy / 1.0 + 0.05 * t).rgb;

	vec3 diffuseTex = texture2D(diffuse, tc.xy / 5.0 + 0.02 * -t).rgb + texture2D(diffuse, tc.yx / 3.0 + 0.015 * t).rgb + texture2D(diffuse, tc.xy / 5.0 + 0.05 * t).rgb;

	mapNormal /= 3.0;
	mapNormal = 2.0 * mapNormal.xyz - 1.0;

	mapNormal.xy *= max(0.0,uChop/2.0);
	vec3 texNormal =  normalize(TBN * mapNormal);
	float ref = 0.0;
	vec3 nI  = normalize(vCamDir);
	vec3 nN = normalize(texNormal);
	float cosT = (dot(nI, nN));
	float Ti = acos(cosT);
	float sinT = sin(Ti) / nSnell;
	float Tt = asin(sinT);

	float ndotl = max(0.00, dot(directionalLightDirection[ 0], texNormal));
	float spec = pow(clamp(dot(vCamDir, reflect(-directionalLightDirection[ 0], texNormal)), 0.0, 1.0), 16.0);
		
	float scatter =1.0-dot( vNormal,vCamDir);	
	upwelling +=  ambientLightColor;
	upwelling *= .4 + scatter;
	
//	if(Ti == 0.0)
	//{
	//	ref = (nSnell - 1.0)/(nSnell + 1.0);
	//	ref = ref*ref;
	//}else
	{

		float fs = sin(Tt - Ti) / sin(Tt + Ti);
		float ts = tan(Tt - Ti) / tan(Tt + Ti);
		ref = .5 * (fs * fs + ts * ts);

	}
	vec3 camdir = vCamDir;
	//if(vCamDir.z < 0.0)   //underwater looking up
	//{
	//	ref = 0.1;
	//	camdir *= -1.0;
	//	texNormal.z *= -1.0;
	//	upwelling =  0.8 * textureCube(texture,refract(camdir,texNormal,.9)).xyz;
	//}
	ref = min(1.0, ref);
	float dist = 0.3;//exp(-vCamLength/200.0) * kD;
	vec3 ref_vec = reflect(-camdir, texNormal);
	ref_vec = mix(-ref_vec, ref_vec,sign(ref_vec.z));
	sky = uReflectPow * textureCube(texture, ref_vec).xyz;
	vec3 upwellingC = (1.0 - ref) * upwelling;
	vec4 water  =  vec4(dist * (ref * sky + upwellingC) + (1.0 - dist) * air, max(.5 + 3.0 * (1.0 - dist), 1.0));
	water += vec4(directionalLightColor[ 0 ],1.0) * spec;
	
	
	

	vec4 foam = vec4(1.0,1.0,1.0, 1.0) * ndotl + vec4(ambientLightColor,1.0);;
	foam.a = 1.0;
	//water.a = 1.0-(pow(vCamLength/40.0,15.0));
	float foamMix = max(0.0,(h)*diffuseTex.r) ;
	gl_FragColor = mix(water, foam, clamp(foamMix * uFoam,0.0,1.0));
	
	float tcl = length(vec2(.5,.5) - texcoord1);
		gl_FragColor.a = 1.0-smoothstep(.35,.50,tcl);

}