varying vec3 vNormal;
varying vec3 vSundir;
vec3 sundir = vec3(.5, .5, 1);
uniform float t;
#define numWaves 9
#define PI 3.1415926535897932384626433832795

float gA = .5;
float L[numWaves];
float A[numWaves];
float S[numWaves];
vec2 D[numWaves];
void setup() {

      L[0] = 10.0;
      L[1] = 5.0;
      L[2] = 3.0;
      L[3] = 5.0;
      L[4] = 6.0;
      L[5] = 10.0;
      L[6] = 3.0;
      L[7] = 1.0;
      L[8] = 15.0;
      
     

      D[0] = normalize(vec2(1.0, 1.0));
      D[1] = normalize(vec2(-1.0, 1.0));
      D[2] = normalize(vec2(1.0, -1.0));

      D[3] = normalize(vec2(1.6, 1.4));
      D[4] = normalize(vec2(-0.3, 1.0));
      D[5] = normalize(vec2(6.0, -1.0));


      D[6] = normalize(vec2(6.0, -1.0));
      D[7] = normalize(vec2(-1.0, 61.0));
      D[8] = normalize(vec2(-1.6, 1.0));

}
void main() {

      setup();
      float x = position.x;
      float y = position.y;

      float h;
      float n;

      float dxH = 0.0;
      float dyH = 0.0;

      float x1 = x;
      float y1 = y;

      for (int i = 0; i < numWaves; i++)
      {
            float w =  2.0 * PI / L[i];
            A[i] = 0.5/(w * 2.718281828459045); //for ocean on Earth, A is ususally related to L
            S[i] = PI/(w * 2.718281828459045);  //for ocean on Earth, S is ususally related to L
            float q = S[i] * w;
           
            vec2 xy = vec2(x, y);

            // simple sum-of-sines
            //float hi = A[i] * sin( dot(D[i], xy) * w + t * q);
            //h += hi * gA;
           
            float dxHi = w * D[i].x * A[i] * cos(     dot(D[i],xy)*w + t * q );
            float dyHi = w * D[i].y * A[i] * cos(     dot(D[i],xy)*w + t * q );

            dxH += dxHi * gA;
            dyH += dyHi * gA;
            
            //Gerstner

            float Q = 2.0;
            float Qi = Q/(w*A[i]*float(numWaves)); // *numWaves?
            float xi = Qi * A[i] * D[i].x * cos( dot(w*D[i],xy) + q*t);
            float yi = Qi * A[i] * D[i].y * cos( dot(w*D[i],xy) + q*t);
            float hi = A[i] * sin( dot(w*D[i],xy) + q * t );

            x1 += xi;
            y1 += yi;
            h += hi;


      }
      vec3 tPos = vec3(x1, y1, h);
      vec3 tNormal = normalize(vec3(-dxH, -dyH, 1));
      vNormal = normalMatrix * normalize(tNormal);
      vSundir = normalMatrix * normalize(sundir);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(tPos, 1);
}