export const particleVertex = /* glsl */ `
uniform float uTime;
uniform float uW[7];
uniform float uSize;
uniform float uPixelRatio;
uniform float uIntro;
uniform float uTurb;
uniform float uAlpha;
uniform vec3 uMouse;
uniform vec3 uColorA;
uniform vec3 uColorB;

attribute vec3 aT1;
attribute vec3 aT2;
attribute vec3 aT3;
attribute vec3 aT4;
attribute vec3 aT5;
attribute vec3 aT6;
attribute vec4 aRand;
attribute vec3 aScatter;

varying vec3 vColor;
varying float vAlpha;

vec3 rotY(vec3 p, float a) {
  float c = cos(a), s = sin(a);
  return vec3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z);
}
vec3 rotX(vec3 p, float a) {
  float c = cos(a), s = sin(a);
  return vec3(p.x, c * p.y - s * p.z, s * p.y + c * p.z);
}

// Cheap divergence-ish flow: enough to make particles drift and swirl between shapes.
vec3 flow(vec3 p, float t) {
  return vec3(
    sin(p.y * 1.7 + t + aRand.x * 6.2831),
    sin(p.z * 1.9 + t * 1.13 + aRand.y * 6.2831),
    sin(p.x * 1.3 + t * 0.87 + aRand.z * 6.2831)
  );
}

void main() {
  float t = uTime;

  vec3 helix = rotY(aT1, t * 0.22);
  vec3 coin = rotY(aT3, t * 0.5);
  vec3 funnel = rotY(aT4, t * 0.18);
  vec3 net = rotY(aT5, sin(t * 0.2) * 0.25);
  vec3 wave = aT6;
  wave.y += sin(wave.x * 1.1 + t * 1.1) * 0.22 + cos(wave.z * 1.7 + t * 0.8) * 0.16 + sin((wave.x + wave.z) * 0.6 - t * 0.6) * 0.12;
  wave = rotX(wave, 0.5);

  float sum = uW[0] + uW[1] + uW[2] + uW[3] + uW[4] + uW[5] + uW[6] + 0.0001;
  vec3 p = (position * uW[0] + helix * uW[1] + aT2 * uW[2] + coin * uW[3] + funnel * uW[4] + net * uW[5] + wave * uW[6]) / sum;

  p += flow(p * 0.9, t * 0.6) * (0.012 + uTurb * 0.85);
  p = mix(aScatter, p, uIntro);

  vec4 world = modelMatrix * vec4(p, 1.0);
  vec2 away = world.xy - uMouse.xy;
  float dist = length(away);
  float push = smoothstep(1.0, 0.0, dist);
  world.xy += normalize(away + 0.0001) * push * 0.42;
  world.z += push * 0.35;

  vec4 mv = viewMatrix * world;
  gl_Position = projectionMatrix * mv;

  float size = uSize * (0.35 + aRand.w * 0.95);
  gl_PointSize = size * uPixelRatio * (8.0 / -mv.z);

  vColor = mix(uColorA, uColorB, smoothstep(0.15, 0.95, aRand.w)) * (1.0 + push * 0.9);
  vAlpha = (0.3 + 0.55 * aRand.z) * (0.45 + 0.55 * uIntro) * uAlpha;
}
`

export const particleFragment = /* glsl */ `
varying vec3 vColor;
varying float vAlpha;

void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  float a = smoothstep(0.5, 0.05, d);
  gl_FragColor = vec4(vColor, a * vAlpha);
}
`

export const pulseVertex = /* glsl */ `
uniform float uTime;
uniform float uPixelRatio;
attribute vec3 aFrom;
attribute vec3 aTo;
attribute vec2 aSeed;
varying float vFade;

void main() {
  float k = fract(uTime * aSeed.y + aSeed.x);
  vec3 p = mix(aFrom, aTo, k);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = 7.0 * uPixelRatio * (8.0 / -mv.z);
  vFade = sin(k * 3.14159);
}
`

export const pulseFragment = /* glsl */ `
uniform float uOpacity;
uniform vec3 uColor;
varying float vFade;

void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  gl_FragColor = vec4(uColor, smoothstep(0.5, 0.0, d) * vFade * uOpacity);
}
`
