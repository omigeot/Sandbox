

varying vec3 vSundir;
varying vec3 vNormal;
varying vec3 vCamDir;

void main() {

	 float r = max(0.0,pow(1.0-dot(vNormal,vCamDir),3.0));	

	 float r1 = max(0.0,pow(1.0-dot(vec3(0.0,0.0,1.0),vCamDir),.1));	
	 vec3 reflection = vec3(0.2,0.2,0.2) * (r);
	 
	 float n = dot(normalize(vNormal),normalize(vSundir));
	 vec3 transmission = vec3(0.2,0.3,0.35)* r1 + vec3(0.2,0.28,0.45)  * (1.0 - r1);// *max(0.0, 1.0 - r);
      gl_FragColor = vec4( transmission + reflection,1.0);
}