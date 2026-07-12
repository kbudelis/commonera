import { useEffect, useRef, useState } from 'react';

type MotionPermission = 'unsupported' | 'available' | 'needed' | 'granted' | 'denied';

type DeviceMotionEventWithPermission = typeof DeviceMotionEvent & {
  requestPermission?: () => Promise<'granted' | 'denied'>;
};

type FlameProgram = {
  program: WebGLProgram;
  vertexShader: WebGLShader;
  fragmentShader: WebGLShader;
};

const vertexShaderSource = `
attribute vec2 a_position;

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const fragmentShaderSource = `
precision mediump float;

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_turbulence;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

float teardrop(vec2 p, float width, float height) {
  p.y += 0.18;
  float taper = mix(width, 0.03, smoothstep(-0.42, height * 0.92, p.y));
  return length(vec2(p.x / taper, (p.y + 0.1) / height)) - 1.0;
}

vec4 flame(vec2 uv, float t) {
  float n = noise(vec2(uv.x * 3.0 + t * 0.08, uv.y * 2.4 - t * 0.06));
  float drift = (n - 0.5) * (0.018 + u_turbulence * 0.09);
  vec2 p = vec2(uv.x + drift * smoothstep(-0.35, 0.55, uv.y), uv.y);

  float outer = teardrop(p, 0.33, 0.76);
  float inner = teardrop(vec2(p.x * 1.05, p.y + 0.05), 0.17, 0.48);
  float core = teardrop(vec2(p.x * 1.15, p.y + 0.1), 0.08, 0.28);

  float outerGlow = exp(-12.0 * abs(outer));
  float emberGlow = exp(-28.0 * max(outer, 0.0));
  float outerMask = smoothstep(0.035, -0.015, outer);
  float innerMask = smoothstep(0.025, -0.01, inner);
  float coreMask = smoothstep(0.02, -0.006, core);

  vec3 gold = vec3(0.91, 0.72, 0.29);
  vec3 ember = vec3(0.79, 0.54, 0.17);
  vec3 parchment = vec3(0.96, 0.93, 0.86);

  vec3 color = ember * outerGlow * 0.15;
  color += ember * outerMask * 0.52;
  color = mix(color, gold, innerMask * 0.82);
  color = mix(color, parchment, coreMask * 0.92);
  color += gold * emberGlow * 0.12;

  float alpha = max(outerMask * 0.82, outerGlow * 0.32);
  alpha = max(alpha, innerMask);
  alpha = max(alpha, coreMask);

  return vec4(color, alpha);
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.x, u_resolution.y);
  uv.y -= 0.02;

  // two candles — Shabbat legible to those who know, universal to those who don't;
  // independent time phase so they breathe separately
  vec4 left = flame(vec2((uv.x + 0.24) / 0.68, uv.y / 0.68), u_time);
  vec4 right = flame(vec2((uv.x - 0.24) / 0.68, uv.y / 0.68), u_time + 17.3);

  vec3 color = left.rgb + right.rgb;
  float alpha = max(left.a, right.a);

  gl_FragColor = vec4(min(color, 1.0), alpha);
}
`;

function compileShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function createProgram(gl: WebGLRenderingContext): FlameProgram | null {
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
  if (!vertexShader || !fragmentShader) {
    if (vertexShader) gl.deleteShader(vertexShader);
    if (fragmentShader) gl.deleteShader(fragmentShader);
    return null;
  }

  const program = gl.createProgram();
  if (!program) {
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    return null;
  }

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    return null;
  }

  return { program, vertexShader, fragmentShader };
}

export default function Flame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const turbulenceTargetRef = useRef(0.18);
  const turbulenceRef = useRef(0.18);
  const lastMotionAtRef = useRef(0);
  const forceCssFallback = shouldForceCssFallback();
  const [showCssFallback, setShowCssFallback] = useState(forceCssFallback);
  const [contextEpoch, setContextEpoch] = useState(0);
  const [permission, setPermission] = useState<MotionPermission>('unsupported');

  useEffect(() => {
    const motionEvent = globalThis.DeviceMotionEvent as DeviceMotionEventWithPermission | undefined;
    if (!motionEvent) {
      setPermission('unsupported');
      return;
    }

    setPermission(typeof motionEvent.requestPermission === 'function' ? 'needed' : 'available');
  }, []);

  useEffect(() => {
    if (permission !== 'available' && permission !== 'granted') return;

    const onMotion = (event: DeviceMotionEvent) => {
      const acceleration = event.accelerationIncludingGravity;
      const x = acceleration?.x ?? 0;
      const y = acceleration?.y ?? 0;
      const z = acceleration?.z ?? 0;
      const magnitude = Math.sqrt(x * x + y * y + z * z);

      lastMotionAtRef.current = performance.now();
      turbulenceTargetRef.current = Math.min(1.0, 0.08 + Math.abs(magnitude - 9.8) / 8);
    };

    window.addEventListener('devicemotion', onMotion);
    return () => window.removeEventListener('devicemotion', onMotion);
  }, [permission]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (forceCssFallback) {
      setShowCssFallback(true);
      return;
    }

    let gl: WebGLRenderingContext | null = null;
    let program: FlameProgram | null = null;
    let buffer: WebGLBuffer | null = null;
    let frame = 0;

    const releaseGlResources = () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
        frame = 0;
      }

      if (!gl || gl.isContextLost()) return;

      if (buffer) {
        gl.deleteBuffer(buffer);
        buffer = null;
      }

      if (program) {
        gl.deleteProgram(program.program);
        gl.deleteShader(program.vertexShader);
        gl.deleteShader(program.fragmentShader);
        program = null;
      }
    };

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      releaseGlResources();
      setShowCssFallback(true);
    };

    const handleContextRestored = () => {
      setShowCssFallback(false);
      setContextEpoch((epoch) => epoch + 1);
    };

    canvas.addEventListener('webglcontextlost', handleContextLost);
    canvas.addEventListener('webglcontextrestored', handleContextRestored);

    gl = canvas.getContext('webgl', {
      alpha: true,
      antialias: true,
      premultipliedAlpha: false,
    });

    if (!gl) {
      setShowCssFallback(true);
      return () => {
        canvas.removeEventListener('webglcontextlost', handleContextLost);
        canvas.removeEventListener('webglcontextrestored', handleContextRestored);
      };
    }

    program = createProgram(gl);
    if (!program) {
      setShowCssFallback(true);
      return () => {
        releaseGlResources();
        canvas.removeEventListener('webglcontextlost', handleContextLost);
        canvas.removeEventListener('webglcontextrestored', handleContextRestored);
      };
    }

    buffer = gl.createBuffer();
    const positionLocation = gl.getAttribLocation(program.program, 'a_position');
    const resolutionLocation = gl.getUniformLocation(program.program, 'u_resolution');
    const timeLocation = gl.getUniformLocation(program.program, 'u_time');
    const turbulenceLocation = gl.getUniformLocation(program.program, 'u_turbulence');
    const startedAt = performance.now();

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );

    const render = (now: number) => {
      if (!gl || !program || gl.isContextLost()) {
        setShowCssFallback(true);
        return;
      }

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.floor(canvas.clientWidth * dpr));
      const height = Math.max(1, Math.floor(canvas.clientHeight * dpr));

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      const quietFor = now - lastMotionAtRef.current;
      if (!lastMotionAtRef.current || quietFor > 600) {
        turbulenceTargetRef.current = 0.08;
      }

      const settleRate = 1 / (8 * 60);
      turbulenceRef.current += (turbulenceTargetRef.current - turbulenceRef.current) * settleRate;

      gl.viewport(0, 0, width, height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(program.program);
      gl.enableVertexAttribArray(positionLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
      gl.uniform2f(resolutionLocation, width, height);
      gl.uniform1f(timeLocation, (now - startedAt) / 1000);
      gl.uniform1f(turbulenceLocation, turbulenceRef.current);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      frame = window.requestAnimationFrame(render);
    };

    setShowCssFallback(false);
    frame = window.requestAnimationFrame(render);
    return () => {
      releaseGlResources();
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);
    };
  }, [contextEpoch, forceCssFallback]);

  const requestMotion = async () => {
    const motionEvent = globalThis.DeviceMotionEvent as DeviceMotionEventWithPermission | undefined;
    if (!motionEvent?.requestPermission) return;

    try {
      const result = await motionEvent.requestPermission();
      setPermission(result === 'granted' ? 'granted' : 'denied');
    } catch {
      setPermission('denied');
    }
  };

  return (
    <div className="ceremony-flame-stage">
      <canvas ref={canvasRef} className={`ceremony-flame-canvas${showCssFallback ? ' ceremony-flame-canvas-hidden' : ''}`} aria-hidden="true" />
      {showCssFallback ? <div className="ceremony-flame-css" aria-hidden="true" /> : null}
      {permission === 'needed' ? (
        <div className="ceremony-motion-permission">
          <p>The flame settles when the phone is set down. Motion stays on this screen and is never stored.</p>
          <button type="button" onClick={requestMotion}>
            Let the flame feel for stillness
          </button>
        </div>
      ) : null}
    </div>
  );
}

function shouldForceCssFallback() {
  if (typeof window === 'undefined') return false;

  const params = new URLSearchParams(window.location.search);
  return params.has('forceCssFlame');
}
