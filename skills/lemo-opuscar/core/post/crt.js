// core/post/crt.js — WebGL CRT / phosphor / scanline / chromatic aberration post-processor
export function createCRTPost(glCanvas, sourceCanvas, opts = {}) {
  const gl = glCanvas.getContext('webgl', { preserveDrawingBuffer: true });
  if (!gl) return { render: () => {} };
  const vsSrc = `
    attribute vec2 a_pos;
    varying vec2 v_uv;
    void main() {
      v_uv = a_pos * 0.5 + 0.5;
      v_uv.y = 1.0 - v_uv.y;
      gl_Position = vec4(a_pos, 0.0, 1.0);
    }
  `;
  const fsSrc = `
    precision mediump float;
    varying vec2 v_uv;
    uniform sampler2D u_tex;
    uniform float u_time;
    uniform float u_curve;
    uniform float u_scan;
    uniform float u_chroma;
    uniform float u_vignette;
    vec2 barrel(vec2 uv, float amt) {
      vec2 cc = uv - 0.5;
      float r2 = dot(cc, cc);
      return uv + cc * r2 * amt;
    }
    void main() {
      vec2 uv = barrel(v_uv, u_curve);
      if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
        gl_FragColor = vec4(0.02, 0.02, 0.03, 1.0);
        return;
      }
      float r = texture2D(u_tex, uv + vec2(u_chroma, 0.0)).r;
      float g = texture2D(u_tex, uv).g;
      float b = texture2D(u_tex, uv - vec2(u_chroma, 0.0)).b;
      vec3 col = vec3(r, g, b);
      float scanline = sin(uv.y * 1080.0 * 3.14159) * u_scan;
      col -= scanline;
      vec2 d = uv - 0.5;
      col *= clamp(1.0 - dot(d, d) * u_vignette, 0.0, 1.0);
      gl_FragColor = vec4(col, 1.0);
    }
  `;
  const compile = (type, src) => {
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    return sh;
  };
  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, vsSrc));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fsSrc));
  gl.linkProgram(prog);
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, 'a_pos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  return {
    render(t = 0) {
      gl.viewport(0, 0, glCanvas.width, glCanvas.height);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, sourceCanvas);
      gl.uniform1f(gl.getUniformLocation(prog, 'u_time'), t);
      gl.uniform1f(gl.getUniformLocation(prog, 'u_curve'), opts.curve ?? 0.08);
      gl.uniform1f(gl.getUniformLocation(prog, 'u_scan'), opts.scan ?? 0.035);
      gl.uniform1f(gl.getUniformLocation(prog, 'u_chroma'), opts.chroma ?? 0.0015);
      gl.uniform1f(gl.getUniformLocation(prog, 'u_vignette'), opts.vignette ?? 0.85);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
  };
}
