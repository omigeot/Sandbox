

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


varying float edl;

uniform float uChop;
uniform float uReflectPow;
uniform float uFoam;
varying vec3 vViewPosition;
varying vec2 texcoord1;

varying vec3 vPos;

uniform vec3 waves[9];

#define numWaves 9
#define PI 3.1415926535897932384626433832795
uniform float uMag;

float L[numWaves];
float A[numWaves];
float S[numWaves];
vec2 D[numWaves];
void setup() {

      for (int i = 0; i < numWaves; i++)
      {

            L[i] = waves[i].x;

            D[i] = normalize(vec2(waves[i].y, waves[i].z));
      }

}



void main() {

	setup();

	vec3 B;
	vec3 N;
	vec3 T;
	
	float x,y,z,gA;
	gA = 1.0;
	vec3 tPos = vPos;
	 for (int i = 0; i < 8; i++)
      {
            L[i] *= uMag / 2.0;
            //if (L[i] > edgeLen2*4.0)
            {


                  
                  float w =  2.0 * PI / L[i];
                  A[i] = 0.15 / (w * 2.718281828459045); //for ocean on Earth, A is ususally related to L
                  A[i] *= mix(0.01,1.0,clamp(0.0,1.0,vCamLength/1000.0));
                  
                  S[i] = 3.0 * PI / (w  * 2.718281828459045); //for ocean on Earth, S is ususally related to L
                  float q = S[i] * w;

                  vec2 xy = vec2(x, y);

                  // simple sum-of-sines
                  //float hi = A[i] * sin( dot(D[i], xy) * w + t * q);
                  //h += hi * gA;

                  //Gerstner


                  //position
                  float Q = uChop / uMag;
                  float Qi = Q / (w * A[i] * float(numWaves)); // *numWaves?
                  float xi = Qi * A[i] * D[i].x * cos( dot(w * D[i], xy) + q * t);
                  float yi = Qi * A[i] * D[i].y * cos( dot(w * D[i], xy) + q * t);
                  float hi =  A[i] * sin( dot(w * D[i], xy) + q * t );

                  tPos.x += xi * gA;
                  tPos.y += yi * gA;
                  tPos.z += hi * gA;

                  float WA = w * A[i] * gA;
                  float S0 = sin(w * dot(D[i], tPos.xy) + q * t);
                  float C0 = cos(w * dot(D[i], tPos.xy) + q * t);


                  N.x +=  D[i].x * WA * C0;
                  N.y +=  D[i].y * WA * C0;
                  N.z +=  Qi * WA * S0;

                  B.x += Qi * (D[i].x * D[i].x) * WA * S0;
                  B.y += Qi * D[i].y * D[i].y * WA * S0;
                  B.z += D[i].x * WA * C0;
            }
        }



		vec3 tNormal = normalize(vec3(-N.x, -N.y, 1.0 - N.z));
      vec3 tBinormal = normalize(vec3(1.0 - B.x, -B.y, N.z));
      vec3 tTangent = cross(tBinormal, tNormal);

      mat3 TBN2 = mat3(tBinormal.x, tBinormal.y, tBinormal.z,
                 tTangent.x, tTangent.y, tTangent.z,
                 tNormal.x, tNormal.y, tNormal.z);


	vec3 tc = texcoord0 / edgeLen;
	vec3 mapNormal = texture2D(oNormal, tc.xy / 5.0 + 0.02 * -t).rgb + texture2D(oNormal, tc.yx / 3.0 + 0.015 * t).rgb + texture2D(oNormal, tc.xy / 1.0 + 0.05 * t).rgb;

	vec3 diffuseTex = texture2D(diffuse, tc.xy / 5.0 + 0.02 * -t).rgb + texture2D(diffuse, tc.yx / 3.0 + 0.015 * t).rgb + texture2D(diffuse, tc.xy / 5.0 + 0.05 * t).rgb;

	mapNormal /= 3.0;
	mapNormal = 2.0 * mapNormal.xyz - 1.0;

	mapNormal.xy *= max(0.0,uChop/2.0);

	

	vec3 texNormal =  normalize(TBN * mapNormal);
	vec3 texNormal1 =  normalize(TBN2 * mapNormal);
	
	texNormal = mix(texNormal,texNormal1,clamp(0.0,1.0,vCamLength/100.0));
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
	  
	//gl_FragColor.rgb = vec3(edl);

}