

varying vec3 vSundir;
varying vec3 vNormal;
void main() {
	 float n = dot(normalize(vNormal),normalize(vSundir));
      gl_FragColor = vec4(n * vec3(0.0,0.0,1.0),1.0);
}