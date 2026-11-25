// WebGL2: camera ortografica che gira, terreno, fili, fiori e figura.
import { BLADE_VS, BLADE_FS, GROUND_VS, GROUND_FS, FIGURE_VS, FIGURE_FS } from './shaders.js';
import { plantMeadow, groundPixels } from './meadow.js';
import { FIGURES, figureSize } from './figures.js';
import { fitView } from './ui-state.js';

const PITCH = 0.38;
const PAPER = [250 / 255, 248 / 255, 242 / 255];
const ROWS = [0, 0.2, 0.4, 0.58, 0.73, 0.85, 0.94, 1];
const STRIP = new Float32Array(ROWS.flatMap((t) => [-1, t, 1, t]));
const FLOWER_QUAD = new Float32Array([-1, 0, 1, 0, -1, 1, 1, 1]);
const SQUARE = new Float32Array([-1, -1, -1, 1, 1, -1, 1, 1]);
const UNIT = new Float32Array([0, 0, 0, 1, 1, 0, 1, 1]);

export function createScene(canvas, { bladeCount, figureUrls }) {
  const gl = canvas.getContext('webgl2', { antialias: true, alpha: false });
  if (!gl) throw new Error('WebGL2 non disponibile');

  function program(vs, fs) {
    const p = gl.createProgram();
    for (const [type, src] of [[gl.VERTEX_SHADER, vs], [gl.FRAGMENT_SHADER, fs]]) {
      const s = gl.createShader(type);
      gl.shaderSource(s, '#version 300 es\nprecision highp float;\n' + src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
      gl.attachShader(p, s);
    }
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    const u = {};
    for (let i = 0; i < gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS); i++) {
      const name = gl.getActiveUniform(p, i).name.replace('[0]', '');
      u[name] = gl.getUniformLocation(p, name);
    }
    return { p, u };
  }

  function attrib(index, size, stride, offset, divisor) {
    gl.enableVertexAttribArray(index);
    gl.vertexAttribPointer(index, size, gl.FLOAT, false, stride, offset);
    gl.vertexAttribDivisor(index, divisor);
  }

  function mesh(geometry, instances) {
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, geometry, gl.STATIC_DRAW);
    attrib(0, 2, 8, 0, 0);
    if (instances) {
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, instances, gl.STATIC_DRAW);
      for (let k = 0; k < 3; k++) attrib(k + 1, 4, 48, k * 16, 1);
    }
    return { vao, verts: geometry.length / 2, count: instances ? instances.length / 12 : 0 };
  }

  function texture(width, height, source, mipmap) {
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    if (width) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, source);
    else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    if (mipmap) gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, mipmap ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return tex;
  }

  const bladeProgram = program(BLADE_VS, BLADE_FS);
  const groundProgram = program(GROUND_VS, GROUND_FS);
  const figureProgram = program(FIGURE_VS, FIGURE_FS);
  const meadow = plantMeadow({ count: bladeCount });
  const bladeMesh = mesh(STRIP, meadow.blades);
  const flowerMesh = mesh(FLOWER_QUAD, meadow.flowers);
  const groundMesh = mesh(SQUARE);
  const figureMesh = mesh(UNIT);
  const groundTexture = texture(512, 512, groundPixels(512), false);

  // Le figure arrivano quando arrivano; una che non si carica non si disegna.
  const figures = figureUrls.map(() => ({ texture: null, requested: false }));
  let disposed = false;
  function load(i) {
    if (figures[i].requested) return;
    figures[i].requested = true;
    const image = new Image();
    image.onload = () => {
      if (disposed || gl.isContextLost()) return;
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
      figures[i].texture = texture(0, 0, image, true);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    };
    image.src = figureUrls[i];
  }

  const view = { hw: 1, hh: 1, cy: 0, width: 1, height: 1 };
  const vp = new Float32Array(16);
  let basis;
  let rect = null;

  function camera(yaw) {
    const sy = Math.sin(yaw), cy = Math.cos(yaw), sp = Math.sin(PITCH), cp = Math.cos(PITCH);
    const right = [cy, 0, -sy];
    const up = [-sy * sp, cp, -cy * sp];
    const back = [sy * cp, sp, cy * cp];
    basis = { right, up, back };
    const sx = 1 / view.hw, vy = 1 / view.hh, sz = -1 / 40;
    vp.set([
      right[0] * sx, up[0] * vy, back[0] * sz, 0,
      right[1] * sx, up[1] * vy, back[1] * sz, 0,
      right[2] * sx, up[2] * vy, back[2] * sz, 0,
      0, -view.cy * vy, 0, 1,
    ]);
  }

  /** Rettangolo della figura in unità di mondo: base appoggiata a terra. */
  function placement(i, visibility) {
    const f = FIGURES[i];
    const { w, h } = figureSize(f);
    const tall = h / Math.cos(PITCH); // compensa lo scorcio della camera
    const sink = (1 - visibility) * tall;
    return { left: -f.anchorX * w, right: (1 - f.anchorX) * w, top: tall - sink, bottom: -sink, width: w };
  }

  function screenRect(p) {
    // un punto sul piano verticale che guarda la camera
    const x = (u) => ((u / view.hw + 1) / 2) * view.width;
    const y = (v) => ((1 - (v * Math.cos(PITCH) - view.cy) / view.hh) / 2) * view.height;
    return { left: x(p.left), right: x(p.right), top: y(p.top), bottom: y(p.bottom) };
  }

  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const w = canvas.clientWidth || 1, h = canvas.clientHeight || 1;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    Object.assign(view, fitView(w, h, innerWidth, innerHeight));
    view.width = w;
    view.height = h;
  }

  function shadowUniforms(u, shadow) {
    gl.uniform4f(u.uShadow, shadow.x, shadow.z, shadow.reach, shadow.strength);
    gl.uniform2f(u.uShadowAxis, basis.right[0], basis.right[2]);
  }

  function render({ yaw, time, wake, figure, visibility }) {
    if (gl.isContextLost()) return;
    load(figure);
    camera(yaw);
    const p = placement(figure, visibility);
    const ready = figures[figure].texture !== null;
    const centre = (p.left + p.right) / 2;
    const shadow = {
      x: basis.right[0] * centre,
      z: basis.right[2] * centre,
      reach: p.width * 0.42,
      strength: ready ? 0.34 * visibility : 0,
    };

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(...PAPER, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    gl.useProgram(groundProgram.p);
    gl.uniformMatrix4fv(groundProgram.u.uVP, false, vp);
    shadowUniforms(groundProgram.u, shadow);
    gl.bindTexture(gl.TEXTURE_2D, groundTexture);
    gl.bindVertexArray(groundMesh.vao);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    gl.useProgram(bladeProgram.p);
    gl.uniformMatrix4fv(bladeProgram.u.uVP, false, vp);
    gl.uniform3fv(bladeProgram.u.uRight, basis.right);
    gl.uniform3fv(bladeProgram.u.uUp, basis.up);
    gl.uniform1f(bladeProgram.u.uTime, time);
    gl.uniform4fv(bladeProgram.u.uPush, wake);
    shadowUniforms(bladeProgram.u, shadow);
    for (const m of [bladeMesh, flowerMesh]) {
      gl.bindVertexArray(m.vao);
      gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, m.verts, m.count);
    }

    rect = null;
    if (ready && visibility > 0) {
      gl.useProgram(figureProgram.p);
      gl.uniformMatrix4fv(figureProgram.u.uVP, false, vp);
      gl.uniform3fv(figureProgram.u.uRight, basis.right);
      gl.uniform4f(figureProgram.u.uRect, p.left, p.right, p.top, p.bottom);
      gl.bindTexture(gl.TEXTURE_2D, figures[figure].texture);
      gl.bindVertexArray(figureMesh.vao);
      gl.enable(gl.SAMPLE_ALPHA_TO_COVERAGE);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      gl.disable(gl.SAMPLE_ALPHA_TO_COVERAGE);
      if (visibility === 1) rect = screenRect(p);
    }
  }

  /** Il punto del terreno sotto il cursore, poco sopra la terra. */
  function toGround(clientX, clientY) {
    const box = canvas.getBoundingClientRect();
    const a = (((clientX - box.left) / box.width) * 2 - 1) * view.hw;
    const b = (1 - ((clientY - box.top) / box.height) * 2) * view.hh + view.cy;
    const { right, up, back } = basis;
    const o = [0, 1, 2].map((i) => right[i] * a + up[i] * b);
    const s = (o[1] - 0.25) / back[1];
    return [o[0] - back[0] * s, o[2] - back[2] * s];
  }

  resize();
  camera(0);

  return {
    resize,
    render,
    toGround,
    /** In coordinate della finestra, come i puntatori. */
    figureRect() {
      if (!rect) return null;
      const box = canvas.getBoundingClientRect();
      return { left: rect.left + box.left, right: rect.right + box.left, top: rect.top + box.top, bottom: rect.bottom + box.top };
    },
    preload: () => figureUrls.forEach((_, i) => load(i)),
    dispose() { disposed = true; },
  };
}
