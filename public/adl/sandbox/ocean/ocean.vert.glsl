varying vec3 vNormal;
varying vec3 vSundir;
vec3 sundir = vec3(.5, .5, 1);

#define numWaves 3
#define PI 3.1415926535897932384626433832795
float L[numWaves];
float A[numWaves];
float S[numWaves];
vec2 D[numWaves];
void setup() {

      L[0] = 10.0;
      L[1] = 5.0;
      L[2] = 3.0;
      A[0] = 3.0;
      A[1] = 2.0;
      A[2] = 1.0;
      S[0] = 2.0;
      S[1] = 4.0;
      S[2] = 3.0;

      D[0] = normalize(vec2(1.0, 1.0));
      D[1] = normalize(vec2(-1.0, 1.0));
      D[2] = normalize(vec2(1.0, -1.0));

}
void main() {

      setup();
      float x = position.x;
      float y = position.y;

      float h;
      float n;

      //float dxH = 
      for (int i = 0; i < numWaves; i++)
      {
            float w =  2.0 * PI / L[i];
            float q = S[i] * w;
            float t = 1.0;
            vec2 xy = vec2(x, y);
            float hi = A[i] * sin( dot(D[i], xy) * w + t * q);
            h += hi;
           
            //float dxHi = w * D[i].x * A[i] * cos(                 );


      }
      vec3 tPos = vec3(position.x, position.y, h);
      vec3 tNormal = vec3(cos(position.x), cos(position.x), 1);
      vNormal = normalMatrix * normalize(tNormal);
      vSundir = normalMatrix * normalize(sundir);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(tPos, 1);
}