// GLSL ES 3.0. L'intestazione (#version, precision) la aggiunge il renderer.
const SHADOW = `
uniform vec4 uShadow;      // centro x, centro z, semiasse lungo, intensità
uniform vec2 uShadowAxis;  // asse "destra" della camera sul terreno
float shadow(vec2 p){
  vec2 d = p - uShadow.xy;
  vec2 q = vec2(dot(d, uShadowAxis) / uShadow.z, dot(d, vec2(-uShadowAxis.y, uShadowAxis.x)) / 1.1);
  return uShadow.w * (1.0 - smoothstep(0.35, 1.25, length(q)));
}`;

export const BLADE_VS = `
layout(location=0) in vec2 aV;      // lato (-1..1), t (0..1)
layout(location=1) in vec4 iPos;    // x, z, altezza, larghezza
layout(location=2) in vec4 iBend;   // piega x, piega z, fase, punta
layout(location=3) in vec4 iColor;  // rgb, tipo (0 filo, 1 fiore)
uniform mat4 uVP;
uniform vec3 uRight, uUp;
uniform float uTime;
uniform vec4 uPush[16];             // x, z, raggio, forza
out vec3 vColor;
out float vT;
out float vShade;
out vec2 vDisc;
${SHADOW}
float h(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
float n(vec2 p){
  vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
  return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y);
}
void main(){
  bool flower = iColor.a > 0.5;
  float t = flower ? 1.0 : aV.y;
  float height = iPos.z;
  vec2 dir = normalize(vec2(1.0, 0.45));
  vec2 q = iPos.xy * 0.22 - dir * uTime * 1.15;
  float gust = n(q) * 0.7 + n(q * 2.3) * 0.3;
  vec2 bend = iBend.xy + dir * ((gust - 0.35) * 0.95)
            + vec2(1.0, -0.6) * sin(uTime * 3.3 + iBend.z * 2.1) * 0.07;
  // le spinte si sommano e solo dopo si limitano: il risultato non dipende dall'ordine
  vec2 push = vec2(0.0);
  for (int k = 0; k < 16; k++) {
    float r = uPush[k].z;
    if (uPush[k].w <= 0.0) continue;
    vec2 d = iPos.xy - uPush[k].xy;
    float len = length(d);
    push += d / max(len, r * 0.35) * (1.0 - smoothstep(r * 0.5, r * 2.1, len)) * uPush[k].w;
  }
  float pushed = length(push);
  if (pushed > 1.0) push /= pushed;
  bend += push * 1.6;
  float amount = length(bend);
  if (amount > 1.25) bend *= 1.25 / amount;
  vec2 off = bend * t * t * height * 0.75;
  float drop = dot(bend, bend) * t * t * height * 0.24;
  vec3 p = vec3(iPos.x + off.x, height * t - drop, iPos.y + off.y);
  if (flower) {
    vec2 disc = vec2(aV.x, aV.y * 2.0 - 1.0);
    p += (uRight * disc.x + uUp * disc.y) * iPos.w;
    vDisc = disc;
  } else {
    float w = iPos.w * pow(max(0.0, 1.0 - pow(t, iBend.w)), 0.5) * (0.65 + 0.35 * smoothstep(0.0, 0.25, t));
    p += uRight * aV.x * w;
    vDisc = vec2(0.0);
  }
  vColor = iColor.rgb;
  vT = flower ? -1.0 : t;
  vShade = shadow(iPos.xy) * (1.0 - 0.7 * t);
  gl_Position = uVP * vec4(p, 1.0);
}`;

export const BLADE_FS = `
in vec3 vColor; in float vT; in float vShade; in vec2 vDisc;
out vec4 o;
void main(){
  if (vT < 0.0) {
    if (dot(vDisc, vDisc) > 1.0) discard;
    o = vec4(vColor * (1.0 - vShade), 1.0); return;
  }
  // base uguale al terreno, più scura in basso, punte al sole
  vec3 c = vColor;
  c *= 1.0 - 0.30 * smoothstep(0.0, 0.18, vT) * (1.0 - smoothstep(0.18, 0.62, vT));
  c = mix(c, c * 1.18 + vec3(0.07, 0.06, 0.0), smoothstep(0.55, 1.0, vT));
  o = vec4(c * (1.0 - vShade), 1.0);
}`;

export const GROUND_VS = `
layout(location=0) in vec2 a;
uniform mat4 uVP; out vec2 vUv; out vec2 vWorld;
void main(){ vUv = a * 0.5 + 0.5; vWorld = a * 13.0; gl_Position = uVP * vec4(vWorld.x, 0.0, vWorld.y, 1.0); }`;

export const GROUND_FS = `
in vec2 vUv; in vec2 vWorld; uniform sampler2D uTex; out vec4 o;
${SHADOW}
void main(){ vec4 c = texture(uTex, vUv); if (c.a < 0.5) discard; o = vec4(c.rgb * (1.0 - shadow(vWorld)), 1.0); }`;

export const FIGURE_VS = `
layout(location=0) in vec2 a;       // angolo del rettangolo: u, v in 0..1 (v dall'alto)
uniform mat4 uVP;
uniform vec3 uRight;
uniform vec4 uRect;                 // sinistra, destra, alto, basso in unità di mondo
out vec2 vUv; out float vHeight;
void main(){
  vec3 p = uRight * mix(uRect.x, uRect.y, a.x);
  p.y = mix(uRect.z, uRect.w, a.y);
  vUv = a; vHeight = p.y;
  gl_Position = uVP * vec4(p, 1.0);
}`;

export const FIGURE_FS = `
in vec2 vUv; in float vHeight; uniform sampler2D uTex; out vec4 o;
void main(){
  if (vHeight < -0.001) discard;    // sotto terra mentre sprofonda
  vec4 c = texture(uTex, vUv);      // alfa premoltiplicata
  float a = clamp((c.a - 0.5) / max(fwidth(c.a), 0.001) + 0.5, 0.0, 1.0);
  if (a <= 0.0) discard;
  o = vec4(c.rgb / max(c.a, 0.001), a);
}`;
