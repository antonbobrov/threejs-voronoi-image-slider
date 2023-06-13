varying vec2 vUv;

uniform float u_aspect;
uniform float u_time;
uniform sampler2D u_textures[COUNT];
uniform float u_progress;
uniform float u_noiseSeed;
uniform bool u_hasNoiseDisplacement;

struct Slide {
  vec3 texColor;
  float progress;
};

vec2 random2(vec2 p) {
  return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);
}

vec3 noiseColor() {
  vec2 st = vUv;
  st.x *= u_aspect;
  st *= u_noiseSeed;

  vec3 color = vec3(.0);

  // Scale
  st *= 5.;

  // Tile the space
  vec2 i_st = floor(st);
  vec2 f_st = fract(st);

  float m_dist = 1.; // minimum distance
  vec2 m_point; // minimum point

  for (int j=-1; j<=1; j++ ) {
    for (int i=-1; i<=1; i++ ) {
      vec2 neighbor = vec2(float(i),float(j));

      vec2 point = random2(i_st + neighbor);
      point = 0.5 + 0.5 * sin(u_time + 6.2831 * point);

      vec2 diff = neighbor + point - f_st;
      float dist = length(diff);

      if (dist < m_dist) {
        m_dist = dist;
        m_point = point;
      }
    }
  }

  // Assign a color using the closest point position
  color += dot(m_point, vec2(.3,.6));

  return color;
}

Slide getSlide(sampler2D tex, float progress) {
  vec3 nColor = noiseColor();
  float noise = (nColor.r + nColor.g + nColor.b) / 3.0;
  float noiseIntensity = noise * (1.0 - progress);

  vec2 textureCoords = vUv;
  if (u_hasNoiseDisplacement) {
    textureCoords.x *= 1.0 - noiseIntensity;
  }

  Slide result;
  result.texColor = texture2D(tex, textureCoords).rgb;
  result.progress = 1.0 - clamp(noiseIntensity / progress, 0.0, 1.0);

  return result;
}

void main() {
  Slide prev = getSlide(u_textures[PREV_INDEX], 1.0 - u_progress);
  Slide next = getSlide(u_textures[NEXT_INDEX], u_progress);

  vec3 color = mix(prev.texColor, next.texColor, next.progress);

  gl_FragColor = vec4(color, 1.0);
}
