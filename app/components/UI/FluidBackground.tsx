"use client";

import React, { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useBackgroundStore } from "@/app/store/useBackgroundStore";

interface ColorRGB {
  r: number;
  g: number;
  b: number;
}

interface AnimationConfig {
  speed: number;
  smoothness: number;
  pauseChance: number;
  pauseDuration: number;
  edgeBounce: boolean;
  changeDirectionChance: number;
  directionChangeAmount: number;
  clickChance: number;
  clickIntensity: number;
  colorSpeed: number;
  colorIntensity: number;
  colorMode: "rainbow" | "greyscale" | "redHues" | "custom";
  customColorHueRange?: [number, number];
  customColorSaturation?: number;
  fadingRate?: number;
  pathMode: "random" | "circle" | "constrained";
  pathRadius?: number;
  pathCenter?: [number, number];
  pathSpeed?: number;
  pathDirection?: "clockwise" | "counterclockwise";
  startPosition?: [number, number];
  spawnCount: number;
  jitter?: number;
}

interface Pointer {
  id: number;
  texcoordX: number;
  texcoordY: number;
  prevTexcoordX: number;
  prevTexcoordY: number;
  deltaX: number;
  deltaY: number;
  down: boolean;
  moved: boolean;
  color: ColorRGB;
  direction: number;
  targetX: number;
  targetY: number;
  moving: boolean;
  pauseUntil: number;
  pathAngle?: number;
}

const NAV_BOOST_MS = 1200;
const MIC_THRESHOLD = 0.03;
const OUTPUT_THRESHOLD = 0.03;

const DEFAULT_ANIMATION_CONFIG: AnimationConfig = {
  speed: 0.0002,
  smoothness: 0.94,
  pauseChance: 0.001,
  pauseDuration: 700,
  edgeBounce: true,
  changeDirectionChance: 0.08,
  directionChangeAmount: 0.7,
  clickChance: 0.04,
  clickIntensity: 1,
  colorSpeed: 4,
  colorIntensity: 0.01,
  colorMode: "greyscale",
  fadingRate: 3.6,
  pathMode: "random",
  pathRadius: 0.32,
  pathCenter: [0.5, 0.5],
  pathSpeed: 0.0012,
  pathDirection: "clockwise",
  startPosition: [0.5, 0.5],
  spawnCount: 4,
  jitter: 0,
};

function pointerPrototype(): Pointer {
  return {
    id: -1,
    texcoordX: 0.5,
    texcoordY: 0.5,
    prevTexcoordX: 0.5,
    prevTexcoordY: 0.5,
    deltaX: 0,
    deltaY: 0,
    down: false,
    moved: false,
    color: { r: 0, g: 0, b: 0 },
    direction: Math.random() * Math.PI * 2,
    targetX: 0.5,
    targetY: 0.5,
    moving: true,
    pauseUntil: 0,
  };
}

export default function FluidBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pathname = usePathname();

  const micLevel = useBackgroundStore((state) => state.micLevel);
  const outputLevel = useBackgroundStore((state) => state.outputLevel);
  const isThinking = useBackgroundStore((state) =>
    Object.keys(state.thinkingSources).length > 0,
  );

  const envRef = useRef({
    micLevel: 0,
    outputLevel: 0,
    isThinking: false,
    navBoostUntil: 0,
  });

  useEffect(() => {
    envRef.current.micLevel = micLevel;
  }, [micLevel]);

  useEffect(() => {
    envRef.current.outputLevel = outputLevel;
  }, [outputLevel]);

  useEffect(() => {
    envRef.current.isThinking = isThinking;
  }, [isThinking]);

  useEffect(() => {
    envRef.current.navBoostUntil = Date.now() + NAV_BOOST_MS;
  }, [pathname]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const pickSeedPositions = (count: number, minDistance: number) => {
      const positions: Array<[number, number]> = [];
      const maxAttempts = count * 40;
      let attempts = 0;

      while (positions.length < count && attempts < maxAttempts) {
        const candidate: [number, number] = [
          0.1 + Math.random() * 0.8,
          0.1 + Math.random() * 0.8,
        ];
        const isFarEnough = positions.every(([x, y]) => {
          const dx = x - candidate[0];
          const dy = y - candidate[1];
          return Math.sqrt(dx * dx + dy * dy) >= minDistance;
        });
        if (isFarEnough) positions.push(candidate);
        attempts += 1;
      }

      while (positions.length < count) {
        positions.push([0.1 + Math.random() * 0.8, 0.1 + Math.random() * 0.8]);
      }

      return positions;
    };

    const seedPositions = pickSeedPositions(DEFAULT_ANIMATION_CONFIG.spawnCount, 0.28);

    let pointers: Pointer[] = Array.from(
      { length: DEFAULT_ANIMATION_CONFIG.spawnCount },
      (_, index) => {
        const p = pointerPrototype();
        const seed = seedPositions[index];
        if (seed) {
          p.texcoordX = seed[0];
          p.texcoordY = seed[1];
          p.prevTexcoordX = p.texcoordX;
          p.prevTexcoordY = p.texcoordY;
        } else if (
          DEFAULT_ANIMATION_CONFIG.startPosition &&
          DEFAULT_ANIMATION_CONFIG.spawnCount === 1
        ) {
          p.texcoordX = DEFAULT_ANIMATION_CONFIG.startPosition[0];
          p.texcoordY = DEFAULT_ANIMATION_CONFIG.startPosition[1];
          p.prevTexcoordX = p.texcoordX;
          p.prevTexcoordY = p.texcoordY;
        }
        return p;
      },
    );

    let config = {
      SIM_RESOLUTION: 128,
      DYE_RESOLUTION: 1440,
      CAPTURE_RESOLUTION: 512,
      DENSITY_DISSIPATION: 1.6,
      VELOCITY_DISSIPATION: 2,
      PRESSURE: 0.1,
      PRESSURE_ITERATIONS: 20,
      CURL: 4,
      SPLAT_RADIUS: 0.7,
      SPLAT_FORCE: 6500,
      SHADING: true,
      COLOR_UPDATE_SPEED: 4,
      PAUSED: false,
      BACK_COLOR: { r: 0, g: 0, b: 0 } as ColorRGB,
      TRANSPARENT: true,
      ANIMATION: { ...DEFAULT_ANIMATION_CONFIG },
    };

    const baseAnimation = { ...config.ANIMATION };
    const baseSplatForce = config.SPLAT_FORCE;
    const baseCurl = config.CURL;
    const baseDissipation = config.DENSITY_DISSIPATION;

    const { gl, ext } = getWebGLContext(canvas);
    if (!gl || !ext) return;

    if (!ext.supportLinearFiltering) {
      config.DYE_RESOLUTION = 256;
      config.SHADING = false;
    }

    function getWebGLContext(canvas: HTMLCanvasElement) {
      const params = {
        alpha: true,
        depth: false,
        stencil: false,
        antialias: false,
        preserveDrawingBuffer: false,
      };

      let gl = canvas.getContext("webgl2", params) as WebGL2RenderingContext | null;

      if (!gl) {
        gl = (canvas.getContext("webgl", params) ||
          canvas.getContext("experimental-webgl", params)) as WebGL2RenderingContext | null;
      }

      if (!gl) {
        throw new Error("Unable to initialize WebGL.");
      }

      const isWebGL2 = "drawBuffers" in gl;

      let supportLinearFiltering = false;
      let halfFloat = null;

      if (isWebGL2) {
        (gl as WebGL2RenderingContext).getExtension("EXT_color_buffer_float");
        supportLinearFiltering = !!(gl as WebGL2RenderingContext).getExtension(
          "OES_texture_float_linear",
        );
      } else {
        halfFloat = gl.getExtension("OES_texture_half_float");
        supportLinearFiltering = !!gl.getExtension("OES_texture_half_float_linear");
      }

      gl.clearColor(0, 0, 0, 1);

      const halfFloatTexType = isWebGL2
        ? (gl as WebGL2RenderingContext).HALF_FLOAT
        : (halfFloat && (halfFloat as any).HALF_FLOAT_OES) || 0;

      let formatRGBA: any;
      let formatRG: any;
      let formatR: any;

      if (isWebGL2) {
        formatRGBA = getSupportedFormat(
          gl,
          (gl as WebGL2RenderingContext).RGBA16F,
          gl.RGBA,
          halfFloatTexType,
        );
        formatRG = getSupportedFormat(
          gl,
          (gl as WebGL2RenderingContext).RG16F,
          (gl as WebGL2RenderingContext).RG,
          halfFloatTexType,
        );
        formatR = getSupportedFormat(
          gl,
          (gl as WebGL2RenderingContext).R16F,
          (gl as WebGL2RenderingContext).RED,
          halfFloatTexType,
        );
      } else {
        formatRGBA = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
        formatRG = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
        formatR = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
      }

      return {
        gl,
        ext: {
          formatRGBA,
          formatRG,
          formatR,
          halfFloatTexType,
          supportLinearFiltering,
        },
      };
    }

    function getSupportedFormat(
      gl: WebGLRenderingContext | WebGL2RenderingContext,
      internalFormat: number,
      format: number,
      type: number,
    ): { internalFormat: number; format: number } | null {
      if (!supportRenderTextureFormat(gl, internalFormat, format, type)) {
        if ("drawBuffers" in gl) {
          const gl2 = gl as WebGL2RenderingContext;
          switch (internalFormat) {
            case gl2.R16F:
              return getSupportedFormat(gl2, gl2.RG16F, gl2.RG, type);
            case gl2.RG16F:
              return getSupportedFormat(gl2, gl2.RGBA16F, gl2.RGBA, type);
            default:
              return null;
          }
        }
        return null;
      }
      return { internalFormat, format };
    }

    function supportRenderTextureFormat(
      gl: WebGLRenderingContext | WebGL2RenderingContext,
      internalFormat: number,
      format: number,
      type: number,
    ) {
      const texture = gl.createTexture();
      if (!texture) return false;

      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        internalFormat,
        4,
        4,
        0,
        format,
        type,
        null,
      );

      const fbo = gl.createFramebuffer();
      if (!fbo) return false;

      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D,
        texture,
        0,
      );
      const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
      return status === gl.FRAMEBUFFER_COMPLETE;
    }

    function hashCode(s: string) {
      if (!s.length) return 0;
      let hash = 0;
      for (let i = 0; i < s.length; i++) {
        hash = (hash << 5) - hash + s.charCodeAt(i);
        hash |= 0;
      }
      return hash;
    }

    function addKeywords(source: string, keywords: string[] | null) {
      if (!keywords) return source;
      let keywordsString = "";
      for (const keyword of keywords) {
        keywordsString += `#define ${keyword}\n`;
      }
      return keywordsString + source;
    }

    function compileShader(
      type: number,
      source: string,
      keywords: string[] | null = null,
    ): WebGLShader | null {
      const shaderSource = addKeywords(source, keywords);
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, shaderSource);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.trace(gl.getShaderInfoLog(shader));
      }
      return shader;
    }

    function createProgram(
      vertexShader: WebGLShader | null,
      fragmentShader: WebGLShader | null,
    ): WebGLProgram | null {
      if (!vertexShader || !fragmentShader) return null;
      const program = gl.createProgram();
      if (!program) return null;
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.trace(gl.getProgramInfoLog(program));
      }
      return program;
    }

    function getUniforms(program: WebGLProgram) {
      let uniforms: Record<string, WebGLUniformLocation | null> = {};
      const uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
      for (let i = 0; i < uniformCount; i++) {
        const uniformInfo = gl.getActiveUniform(program, i);
        if (uniformInfo) {
          uniforms[uniformInfo.name] = gl.getUniformLocation(program, uniformInfo.name);
        }
      }
      return uniforms;
    }

    class Program {
      program: WebGLProgram | null;
      uniforms: Record<string, WebGLUniformLocation | null>;

      constructor(vertexShader: WebGLShader | null, fragmentShader: WebGLShader | null) {
        this.program = createProgram(vertexShader, fragmentShader);
        this.uniforms = this.program ? getUniforms(this.program) : {};
      }

      bind() {
        if (this.program) gl.useProgram(this.program);
      }
    }

    class Material {
      vertexShader: WebGLShader | null;
      fragmentShaderSource: string;
      programs: Record<number, WebGLProgram | null>;
      activeProgram: WebGLProgram | null;
      uniforms: Record<string, WebGLUniformLocation | null>;

      constructor(vertexShader: WebGLShader | null, fragmentShaderSource: string) {
        this.vertexShader = vertexShader;
        this.fragmentShaderSource = fragmentShaderSource;
        this.programs = {};
        this.activeProgram = null;
        this.uniforms = {};
      }

      setKeywords(keywords: string[]) {
        let hash = 0;
        for (const kw of keywords) {
          hash += hashCode(kw);
        }
        let program = this.programs[hash];
        if (program == null) {
          const fragmentShader = compileShader(
            gl.FRAGMENT_SHADER,
            this.fragmentShaderSource,
            keywords,
          );
          program = createProgram(this.vertexShader, fragmentShader);
          this.programs[hash] = program;
        }
        if (program === this.activeProgram) return;
        if (program) {
          this.uniforms = getUniforms(program);
        }
        this.activeProgram = program;
      }

      bind() {
        if (this.activeProgram) {
          gl.useProgram(this.activeProgram);
        }
      }
    }

    const baseVertexShader = compileShader(
      gl.VERTEX_SHADER,
      `
      precision highp float;
      attribute vec2 aPosition;
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform vec2 texelSize;

      void main () {
        vUv = aPosition * 0.5 + 0.5;
        vL = vUv - vec2(texelSize.x, 0.0);
        vR = vUv + vec2(texelSize.x, 0.0);
        vT = vUv + vec2(0.0, texelSize.y);
        vB = vUv - vec2(0.0, texelSize.y);
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `,
    );

    const copyShader = compileShader(
      gl.FRAGMENT_SHADER,
      `
      precision mediump float;
      precision mediump sampler2D;
      varying highp vec2 vUv;
      uniform sampler2D uTexture;

      void main () {
          gl_FragColor = texture2D(uTexture, vUv);
      }
    `,
    );

    const clearShader = compileShader(
      gl.FRAGMENT_SHADER,
      `
      precision mediump float;
      precision mediump sampler2D;
      varying highp vec2 vUv;
      uniform sampler2D uTexture;
      uniform float value;

      void main () {
          gl_FragColor = value * texture2D(uTexture, vUv);
      }
    `,
    );

    const displayShaderSource = `
      precision highp float;
      precision highp sampler2D;
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform sampler2D uTexture;
      uniform sampler2D uDithering;
      uniform vec2 ditherScale;
      uniform vec2 texelSize;

      vec3 linearToGamma (vec3 color) {
          color = max(color, vec3(0));
          return max(1.055 * pow(color, vec3(0.416666667)) - 0.055, vec3(0));
      }

      void main () {
          vec3 c = texture2D(uTexture, vUv).rgb;
          #ifdef SHADING
              vec3 lc = texture2D(uTexture, vL).rgb;
              vec3 rc = texture2D(uTexture, vR).rgb;
              vec3 tc = texture2D(uTexture, vT).rgb;
              vec3 bc = texture2D(uTexture, vB).rgb;

              float dx = length(rc) - length(lc);
              float dy = length(tc) - length(bc);

              vec3 n = normalize(vec3(dx, dy, length(texelSize)));
              vec3 l = vec3(0.0, 0.0, 1.0);

              float diffuse = clamp(dot(n, l) + 0.7, 0.7, 1.0);
              c *= diffuse;
          #endif

          float a = max(c.r, max(c.g, c.b));
          gl_FragColor = vec4(c, a);
      }
    `;

    const splatShader = compileShader(
      gl.FRAGMENT_SHADER,
      `
      precision highp float;
      precision highp sampler2D;
      varying vec2 vUv;
      uniform sampler2D uTarget;
      uniform float aspectRatio;
      uniform vec3 color;
      uniform vec2 point;
      uniform float radius;

      void main () {
          vec2 p = vUv - point.xy;
          p.x *= aspectRatio;
          vec3 splat = exp(-dot(p, p) / radius) * color;
          vec3 base = texture2D(uTarget, vUv).xyz;
          gl_FragColor = vec4(base + splat, 1.0);
      }
    `,
    );

    const advectionShader = compileShader(
      gl.FRAGMENT_SHADER,
      `
      precision highp float;
      precision highp sampler2D;
      varying vec2 vUv;
      uniform sampler2D uVelocity;
      uniform sampler2D uSource;
      uniform vec2 texelSize;
      uniform vec2 dyeTexelSize;
      uniform float dt;
      uniform float dissipation;

      vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) {
          vec2 st = uv / tsize - 0.5;
          vec2 iuv = floor(st);
          vec2 fuv = fract(st);

          vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);
          vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);
          vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);
          vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);

          return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
      }

      void main () {
          #ifdef MANUAL_FILTERING
              vec2 coord = vUv - dt * bilerp(uVelocity, vUv, texelSize).xy * texelSize;
              vec4 result = bilerp(uSource, coord, dyeTexelSize);
          #else
              vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
              vec4 result = texture2D(uSource, coord);
          #endif
          float decay = 1.0 + dissipation * dt;
          gl_FragColor = result / decay;
      }
    `,
      ext.supportLinearFiltering ? null : ["MANUAL_FILTERING"],
    );

    const divergenceShader = compileShader(
      gl.FRAGMENT_SHADER,
      `
      precision mediump float;
      precision mediump sampler2D;
      varying highp vec2 vUv;
      varying highp vec2 vL;
      varying highp vec2 vR;
      varying highp vec2 vT;
      varying highp vec2 vB;
      uniform sampler2D uVelocity;

      void main () {
          float L = texture2D(uVelocity, vL).x;
          float R = texture2D(uVelocity, vR).x;
          float T = texture2D(uVelocity, vT).y;
          float B = texture2D(uVelocity, vB).y;

          vec2 C = texture2D(uVelocity, vUv).xy;
          if (vL.x < 0.0) { L = -C.x; }
          if (vR.x > 1.0) { R = -C.x; }
          if (vT.y > 1.0) { T = -C.y; }
          if (vB.y < 0.0) { B = -C.y; }

          float div = 0.5 * (R - L + T - B);
          gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
      }
    `,
    );

    const curlShader = compileShader(
      gl.FRAGMENT_SHADER,
      `
      precision mediump float;
      precision mediump sampler2D;
      varying highp vec2 vUv;
      varying highp vec2 vL;
      varying highp vec2 vR;
      varying highp vec2 vT;
      varying highp vec2 vB;
      uniform sampler2D uVelocity;

      void main () {
          float L = texture2D(uVelocity, vL).y;
          float R = texture2D(uVelocity, vR).y;
          float T = texture2D(uVelocity, vT).x;
          float B = texture2D(uVelocity, vB).x;
          float vorticity = R - L - T + B;
          gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
      }
    `,
    );

    const vorticityShader = compileShader(
      gl.FRAGMENT_SHADER,
      `
      precision highp float;
      precision highp sampler2D;
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform sampler2D uVelocity;
      uniform sampler2D uCurl;
      uniform float curl;
      uniform float dt;

      void main () {
          float L = texture2D(uCurl, vL).x;
          float R = texture2D(uCurl, vR).x;
          float T = texture2D(uCurl, vT).x;
          float B = texture2D(uCurl, vB).x;
          float C = texture2D(uCurl, vUv).x;

          vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
          force /= length(force) + 0.0001;
          force *= curl * C;
          force.y *= -1.0;

          vec2 velocity = texture2D(uVelocity, vUv).xy;
          velocity += force * dt;
          velocity = min(max(velocity, -1000.0), 1000.0);
          gl_FragColor = vec4(velocity, 0.0, 1.0);
      }
    `,
    );

    const pressureShader = compileShader(
      gl.FRAGMENT_SHADER,
      `
      precision mediump float;
      precision mediump sampler2D;
      varying highp vec2 vUv;
      varying highp vec2 vL;
      varying highp vec2 vR;
      varying highp vec2 vT;
      varying highp vec2 vB;
      uniform sampler2D uPressure;
      uniform sampler2D uDivergence;

      void main () {
          float L = texture2D(uPressure, vL).x;
          float R = texture2D(uPressure, vR).x;
          float T = texture2D(uPressure, vT).x;
          float B = texture2D(uPressure, vB).x;
          float C = texture2D(uPressure, vUv).x;
          float divergence = texture2D(uDivergence, vUv).x;
          float pressure = (L + R + B + T - divergence) * 0.25;
          gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
      }
    `,
    );

    const gradientSubtractShader = compileShader(
      gl.FRAGMENT_SHADER,
      `
      precision mediump float;
      precision mediump sampler2D;
      varying highp vec2 vUv;
      varying highp vec2 vL;
      varying highp vec2 vR;
      varying highp vec2 vT;
      varying highp vec2 vB;
      uniform sampler2D uPressure;
      uniform sampler2D uVelocity;

      void main () {
          float L = texture2D(uPressure, vL).x;
          float R = texture2D(uPressure, vR).x;
          float T = texture2D(uPressure, vT).x;
          float B = texture2D(uPressure, vB).x;
          vec2 velocity = texture2D(uVelocity, vUv).xy;
          velocity.xy -= vec2(R - L, T - B);
          gl_FragColor = vec4(velocity, 0.0, 1.0);
      }
    `,
    );

    const blit = (() => {
      const buffer = gl.createBuffer()!;
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]),
        gl.STATIC_DRAW,
      );
      const elemBuffer = gl.createBuffer()!;
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elemBuffer);
      gl.bufferData(
        gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array([0, 1, 2, 0, 2, 3]),
        gl.STATIC_DRAW,
      );
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(0);

      return (target: FBO | null, doClear = false) => {
        if (!gl) return;
        if (!target) {
          gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
          gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        } else {
          gl.viewport(0, 0, target.width, target.height);
          gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
        }
        if (doClear) {
          gl.clearColor(0, 0, 0, 1);
          gl.clear(gl.COLOR_BUFFER_BIT);
        }
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
      };
    })();

    interface FBO {
      texture: WebGLTexture;
      fbo: WebGLFramebuffer;
      width: number;
      height: number;
      texelSizeX: number;
      texelSizeY: number;
      attach: (id: number) => number;
    }

    interface DoubleFBO {
      width: number;
      height: number;
      texelSizeX: number;
      texelSizeY: number;
      read: FBO;
      write: FBO;
      swap: () => void;
    }

    let dye: DoubleFBO;
    let velocity: DoubleFBO;
    let divergence: FBO;
    let curl: FBO;
    let pressure: DoubleFBO;

    const copyProgram = new Program(baseVertexShader, copyShader);
    const clearProgram = new Program(baseVertexShader, clearShader);
    const splatProgram = new Program(baseVertexShader, splatShader);
    const advectionProgram = new Program(baseVertexShader, advectionShader);
    const divergenceProgram = new Program(baseVertexShader, divergenceShader);
    const curlProgram = new Program(baseVertexShader, curlShader);
    const vorticityProgram = new Program(baseVertexShader, vorticityShader);
    const pressureProgram = new Program(baseVertexShader, pressureShader);
    const gradienSubtractProgram = new Program(baseVertexShader, gradientSubtractShader);
    const displayMaterial = new Material(baseVertexShader, displayShaderSource);

    function createFBO(
      w: number,
      h: number,
      internalFormat: number,
      format: number,
      type: number,
      param: number,
    ): FBO {
      gl.activeTexture(gl.TEXTURE0);
      const texture = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, param);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, param);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null);
      const fbo = gl.createFramebuffer()!;
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
      gl.viewport(0, 0, w, h);
      gl.clear(gl.COLOR_BUFFER_BIT);

      const texelSizeX = 1 / w;
      const texelSizeY = 1 / h;

      return {
        texture,
        fbo,
        width: w,
        height: h,
        texelSizeX,
        texelSizeY,
        attach(id: number) {
          gl.activeTexture(gl.TEXTURE0 + id);
          gl.bindTexture(gl.TEXTURE_2D, texture);
          return id;
        },
      };
    }

    function createDoubleFBO(
      w: number,
      h: number,
      internalFormat: number,
      format: number,
      type: number,
      param: number,
    ): DoubleFBO {
      const fbo1 = createFBO(w, h, internalFormat, format, type, param);
      const fbo2 = createFBO(w, h, internalFormat, format, type, param);
      return {
        width: w,
        height: h,
        texelSizeX: fbo1.texelSizeX,
        texelSizeY: fbo1.texelSizeY,
        read: fbo1,
        write: fbo2,
        swap() {
          const tmp = this.read;
          this.read = this.write;
          this.write = tmp;
        },
      };
    }

    function resizeFBO(
      target: FBO,
      w: number,
      h: number,
      internalFormat: number,
      format: number,
      type: number,
      param: number,
    ) {
      const newFBO = createFBO(w, h, internalFormat, format, type, param);
      copyProgram.bind();
      if (copyProgram.uniforms.uTexture) gl.uniform1i(copyProgram.uniforms.uTexture, target.attach(0));
      blit(newFBO, false);
      return newFBO;
    }

    function resizeDoubleFBO(
      target: DoubleFBO,
      w: number,
      h: number,
      internalFormat: number,
      format: number,
      type: number,
      param: number,
    ) {
      if (target.width === w && target.height === h) return target;
      target.read = resizeFBO(target.read, w, h, internalFormat, format, type, param);
      target.write = createFBO(w, h, internalFormat, format, type, param);
      target.width = w;
      target.height = h;
      target.texelSizeX = 1 / w;
      target.texelSizeY = 1 / h;
      return target;
    }

    function initFramebuffers() {
      const simRes = getResolution(config.SIM_RESOLUTION);
      const dyeRes = getResolution(config.DYE_RESOLUTION);

      const texType = ext.halfFloatTexType;
      const rgba = ext.formatRGBA;
      const rg = ext.formatRG;
      const r = ext.formatR;
      const filtering = ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST;
      gl.disable(gl.BLEND);

      if (!dye) {
        dye = createDoubleFBO(dyeRes.width, dyeRes.height, rgba.internalFormat, rgba.format, texType, filtering);
      } else {
        dye = resizeDoubleFBO(dye, dyeRes.width, dyeRes.height, rgba.internalFormat, rgba.format, texType, filtering);
      }

      if (!velocity) {
        velocity = createDoubleFBO(
          simRes.width,
          simRes.height,
          rg.internalFormat,
          rg.format,
          texType,
          filtering,
        );
      } else {
        velocity = resizeDoubleFBO(
          velocity,
          simRes.width,
          simRes.height,
          rg.internalFormat,
          rg.format,
          texType,
          filtering,
        );
      }

      divergence = createFBO(simRes.width, simRes.height, r.internalFormat, r.format, texType, gl.NEAREST);
      curl = createFBO(simRes.width, simRes.height, r.internalFormat, r.format, texType, gl.NEAREST);
      pressure = createDoubleFBO(simRes.width, simRes.height, r.internalFormat, r.format, texType, gl.NEAREST);
    }

    function updateKeywords() {
      const displayKeywords: string[] = [];
      if (config.SHADING) displayKeywords.push("SHADING");
      displayMaterial.setKeywords(displayKeywords);
    }

    function getResolution(resolution: number) {
      const w = gl.drawingBufferWidth;
      const h = gl.drawingBufferHeight;
      const aspectRatio = w / h;
      let aspect = aspectRatio < 1 ? 1 / aspectRatio : aspectRatio;
      const min = Math.round(resolution);
      const max = Math.round(resolution * aspect);
      if (w > h) {
        return { width: max, height: min };
      }
      return { width: min, height: max };
    }

    function scaleByPixelRatio(input: number) {
      const pixelRatio = window.devicePixelRatio || 1;
      return Math.floor(input * pixelRatio);
    }

    updateKeywords();
    initFramebuffers();

    let lastUpdateTime = Date.now();
    let colorUpdateTimer = 0.0;
    let hasSeeded = false;
    let lastMode: "idle" | "thinking" | "mic" | "output" = "idle";
    let lastLogTime = 0;

    function applyDynamicConfig() {
      const now = Date.now();
      const navBoost = now < envRef.current.navBoostUntil;
      const thinking = envRef.current.isThinking || navBoost;
      const mic = envRef.current.micLevel;
      const output = envRef.current.outputLevel;

      const outputActive = output > OUTPUT_THRESHOLD;
      const micActive = mic > MIC_THRESHOLD;

      let mode: "idle" | "thinking" | "mic" | "output" = "idle";
      if (outputActive) {
        mode = "output";
      } else if (micActive) {
        mode = "mic";
      } else if (thinking) {
        mode = "thinking";
      }

      const energy =
        mode === "output" ? output : mode === "mic" ? mic : mode === "thinking" ? 0.55 : 0;

      Object.assign(config.ANIMATION, baseAnimation);
      config.SPLAT_FORCE = baseSplatForce;
      config.CURL = baseCurl;
      config.DENSITY_DISSIPATION = baseDissipation;

      const boost = 1 + energy * 10;
      config.ANIMATION.speed = baseAnimation.speed * boost;
      config.ANIMATION.pathSpeed = (baseAnimation.pathSpeed || baseAnimation.speed) * boost;
      config.ANIMATION.pauseChance = Math.max(0, baseAnimation.pauseChance * (1 - energy * 2));
      config.ANIMATION.changeDirectionChance = Math.min(1, baseAnimation.changeDirectionChance + energy * 1.2);
      config.ANIMATION.directionChangeAmount = baseAnimation.directionChangeAmount + energy * 2.2;
      config.ANIMATION.clickChance = Math.min(1, baseAnimation.clickChance + energy * 1.0);
      config.ANIMATION.clickIntensity = baseAnimation.clickIntensity + energy * 16;
      config.ANIMATION.colorIntensity = baseAnimation.colorIntensity + energy * 0.2;
      config.ANIMATION.jitter = 0.02 * energy;
      config.SPLAT_FORCE = baseSplatForce * (1 + energy * 7);
      config.CURL = baseCurl + energy * 16;
      config.ANIMATION.fadingRate = baseAnimation.fadingRate;

      if (mode === "thinking") {
        config.ANIMATION.pathMode = "circle";
        config.ANIMATION.pathCenter = [0.5, 0.5];
        config.ANIMATION.pathRadius = 0.24;
        config.ANIMATION.speed = baseAnimation.speed * 4.5;
        config.ANIMATION.pathSpeed = baseAnimation.speed * 6.5;
        config.ANIMATION.changeDirectionChance = 0.12;
        config.ANIMATION.directionChangeAmount = 0.35;
        config.ANIMATION.clickChance = 0.12;
        config.ANIMATION.colorMode = "greyscale";
        config.ANIMATION.colorIntensity = 0.1;
        config.ANIMATION.jitter = 0.01;
        config.CURL = baseCurl + 26;
        config.SPLAT_FORCE = baseSplatForce * 3.4;
        config.ANIMATION.fadingRate = (baseAnimation.fadingRate || baseDissipation) * 0.95;
      }

      if (mode === "mic") {
        config.ANIMATION.colorMode = "greyscale";
        config.ANIMATION.pathMode = "random";
        config.ANIMATION.speed = baseAnimation.speed * (2 + energy * 8);
        config.ANIMATION.pathSpeed = (baseAnimation.pathSpeed || baseAnimation.speed) * (2 + energy * 8);
        config.ANIMATION.changeDirectionChance = Math.min(1, 0.35 + energy * 0.9);
        config.ANIMATION.directionChangeAmount = baseAnimation.directionChangeAmount + 2.5 + energy * 3;
        config.ANIMATION.clickChance = Math.min(1, 0.2 + energy * 1.0);
        config.ANIMATION.jitter = 0.05 + energy * 0.12;
        config.SPLAT_FORCE = baseSplatForce * (2.2 + energy * 6);
        config.CURL = baseCurl + 10 + energy * 18;
      }

      if (mode === "output") {
        config.ANIMATION.colorMode = "rainbow";
        config.ANIMATION.colorSpeed = 16;
        config.ANIMATION.colorIntensity = 0.28 + energy * 0.5;
        config.ANIMATION.pathMode = "random";
        config.ANIMATION.speed = baseAnimation.speed * (2.5 + energy * 9);
        config.ANIMATION.pathSpeed = (baseAnimation.pathSpeed || baseAnimation.speed) * (2.5 + energy * 9);
        config.ANIMATION.changeDirectionChance = Math.min(1, 0.4 + energy * 0.9);
        config.ANIMATION.directionChangeAmount = baseAnimation.directionChangeAmount + 3 + energy * 4;
        config.ANIMATION.clickChance = Math.min(1, 0.3 + energy * 1.1);
        config.ANIMATION.jitter = 0.06 + energy * 0.14;
        config.SPLAT_FORCE = baseSplatForce * (2.6 + energy * 7);
        config.CURL = baseCurl + 12 + energy * 20;
      }

      if (mode !== lastMode || now - lastLogTime > 1500) {
        const round3 = (value: number) => Math.round(value * 1000) / 1000;
        console.log("[Fluid] Mode update", {
          mode,
          mic: round3(mic),
          output: round3(output),
          thinking,
          energy: round3(energy),
          speed: round3(config.ANIMATION.speed),
          pathMode: config.ANIMATION.pathMode,
          pathSpeed: round3(config.ANIMATION.pathSpeed || config.ANIMATION.speed),
          pathRadius: config.ANIMATION.pathRadius,
          jitter: round3(config.ANIMATION.jitter || 0),
          clickChance: round3(config.ANIMATION.clickChance),
          directionChangeChance: round3(config.ANIMATION.changeDirectionChance),
          directionChangeAmount: round3(config.ANIMATION.directionChangeAmount),
          splatForce: round3(config.SPLAT_FORCE),
          curl: round3(config.CURL),
          dissipation: round3(config.DENSITY_DISSIPATION),
          colorMode: config.ANIMATION.colorMode,
          colorIntensity: round3(config.ANIMATION.colorIntensity),
        });
        lastMode = mode;
        lastLogTime = now;
      }
    }

    function updateFrame() {
      const dt = calcDeltaTime();
      if (resizeCanvas()) initFramebuffers();

      applyDynamicConfig();
      seedInitialSplats();

      if (config.ANIMATION.fadingRate !== undefined) {
        config.DENSITY_DISSIPATION = config.ANIMATION.fadingRate;
      }

      updateColors(dt);
      updateAutonomousMovement(dt);
      step(dt);
      render(null);
      requestAnimationFrame(updateFrame);
    }

    function calcDeltaTime() {
      const now = Date.now();
      let dt = (now - lastUpdateTime) / 1000;
      dt = Math.min(dt, 0.016666);
      lastUpdateTime = now;
      return dt;
    }

    function resizeCanvas() {
      const width = scaleByPixelRatio(canvas!.clientWidth);
      const height = scaleByPixelRatio(canvas!.clientHeight);
      if (canvas!.width !== width || canvas!.height !== height) {
        canvas!.width = width;
        canvas!.height = height;
        return true;
      }
      return false;
    }

    function updateColors(dt: number) {
      colorUpdateTimer += dt * config.COLOR_UPDATE_SPEED;
      if (colorUpdateTimer >= 1) {
        colorUpdateTimer = wrap(colorUpdateTimer, 0, 1);
        pointers.forEach((p) => {
          p.color = generateColor();
        });
      }
    }

    function seedInitialSplats() {
      if (hasSeeded) return;
      pointers.forEach((pointer) => {
        const color = generateColor();
        const dx = (Math.random() - 0.5) * config.SPLAT_FORCE * 0.2;
        const dy = (Math.random() - 0.5) * config.SPLAT_FORCE * 0.2;
        splat(pointer.texcoordX, pointer.texcoordY, dx, dy, color);
      });
      hasSeeded = true;
    }

    function updateAutonomousMovement(dt: number) {
      const anim = config.ANIMATION;
      const now = Date.now();

      pointers.forEach((pointer) => {
        if (pointer.pauseUntil > now) {
          return;
        }

        if (Math.random() < anim.pauseChance) {
          pointer.pauseUntil = now + anim.pauseDuration;
          return;
        }

        pointer.prevTexcoordX = pointer.texcoordX;
        pointer.prevTexcoordY = pointer.texcoordY;

        switch (anim.pathMode) {
          case "circle": {
            const center = anim.pathCenter ?? [0.5, 0.5];
            const radius = anim.pathRadius ?? 0.3;
            const speed = anim.pathSpeed ?? anim.speed;
            const clockwise = anim.pathDirection !== "counterclockwise";

            if (pointer.pathAngle === undefined) {
              pointer.pathAngle = Math.random() * Math.PI * 2;
            }

            const angleChange = speed * (clockwise ? 1 : -1) * 10;
            pointer.pathAngle += angleChange;

            pointer.texcoordX = center[0] + Math.cos(pointer.pathAngle) * radius;
            pointer.texcoordY = center[1] + Math.sin(pointer.pathAngle) * radius;
            break;
          }

          case "constrained": {
            const center = anim.pathCenter ?? [0.5, 0.5];
            const radius = anim.pathRadius ?? 0.3;

            if (Math.random() < anim.changeDirectionChance) {
              pointer.direction += (Math.random() * 2 - 1) * anim.directionChangeAmount;
            }

            const dx = Math.cos(pointer.direction) * anim.speed;
            const dy = Math.sin(pointer.direction) * anim.speed;

            pointer.texcoordX += dx;
            pointer.texcoordY += dy;

            const distX = pointer.texcoordX - center[0];
            const distY = pointer.texcoordY - center[1];
            const distance = Math.sqrt(distX * distX + distY * distY);

            if (distance > radius) {
              const normalX = distX / distance;
              const normalY = distY / distance;

              const dot = 2 * (dx * normalX + dy * normalY);

              pointer.direction = Math.atan2(dy - dot * normalY, dx - dot * normalX);

              pointer.texcoordX = center[0] + normalX * radius;
              pointer.texcoordY = center[1] + normalY * radius;
            }

            break;
          }

          case "random":
          default: {
            if (Math.random() < anim.changeDirectionChance) {
              pointer.direction += (Math.random() * 2 - 1) * anim.directionChangeAmount;
            }

            const dx = Math.cos(pointer.direction) * anim.speed;
            const dy = Math.sin(pointer.direction) * anim.speed;

            pointer.texcoordX += dx;
            pointer.texcoordY += dy;

            if (anim.edgeBounce) {
              if (pointer.texcoordX < 0.02 || pointer.texcoordX > 0.98) {
                pointer.direction = Math.PI - pointer.direction;
                pointer.texcoordX = Math.max(0.02, Math.min(0.98, pointer.texcoordX));
              }
              if (pointer.texcoordY < 0.02 || pointer.texcoordY > 0.98) {
                pointer.direction = -pointer.direction;
                pointer.texcoordY = Math.max(0.02, Math.min(0.98, pointer.texcoordY));
              }
            } else {
              pointer.texcoordX = wrap(pointer.texcoordX, 0, 1);
              pointer.texcoordY = wrap(pointer.texcoordY, 0, 1);
            }

            break;
          }
        }

        const jitter = anim.jitter ?? 0;
        if (jitter > 0) {
          pointer.texcoordX += (Math.random() - 0.5) * jitter;
          pointer.texcoordY += (Math.random() - 0.5) * jitter;
          pointer.texcoordX = Math.max(0.01, Math.min(0.99, pointer.texcoordX));
          pointer.texcoordY = Math.max(0.01, Math.min(0.99, pointer.texcoordY));
        }

        pointer.deltaX = correctDeltaX(pointer.texcoordX - pointer.prevTexcoordX)!;
        pointer.deltaY = correctDeltaY(pointer.texcoordY - pointer.prevTexcoordY)!;

        pointer.moved =
          Math.abs(pointer.deltaX) > 0.0001 || Math.abs(pointer.deltaY) > 0.0001;

        if (Math.random() < anim.clickChance) {
          clickSplat(pointer);
        }

        if (pointer.moved) {
          splatPointer(pointer);
        }
      });
    }

    function step(dt: number) {
      gl.disable(gl.BLEND);

      curlProgram.bind();
      if (curlProgram.uniforms.texelSize) {
        gl.uniform2f(curlProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      }
      if (curlProgram.uniforms.uVelocity) {
        gl.uniform1i(curlProgram.uniforms.uVelocity, velocity.read.attach(0));
      }
      blit(curl);

      vorticityProgram.bind();
      if (vorticityProgram.uniforms.texelSize) {
        gl.uniform2f(
          vorticityProgram.uniforms.texelSize,
          velocity.texelSizeX,
          velocity.texelSizeY,
        );
      }
      if (vorticityProgram.uniforms.uVelocity) {
        gl.uniform1i(vorticityProgram.uniforms.uVelocity, velocity.read.attach(0));
      }
      if (vorticityProgram.uniforms.uCurl) {
        gl.uniform1i(vorticityProgram.uniforms.uCurl, curl.attach(1));
      }
      if (vorticityProgram.uniforms.curl) {
        gl.uniform1f(vorticityProgram.uniforms.curl, config.CURL);
      }
      if (vorticityProgram.uniforms.dt) {
        gl.uniform1f(vorticityProgram.uniforms.dt, dt);
      }
      blit(velocity.write);
      velocity.swap();

      divergenceProgram.bind();
      if (divergenceProgram.uniforms.texelSize) {
        gl.uniform2f(
          divergenceProgram.uniforms.texelSize,
          velocity.texelSizeX,
          velocity.texelSizeY,
        );
      }
      if (divergenceProgram.uniforms.uVelocity) {
        gl.uniform1i(divergenceProgram.uniforms.uVelocity, velocity.read.attach(0));
      }
      blit(divergence);

      clearProgram.bind();
      if (clearProgram.uniforms.uTexture) {
        gl.uniform1i(clearProgram.uniforms.uTexture, pressure.read.attach(0));
      }
      if (clearProgram.uniforms.value) {
        gl.uniform1f(clearProgram.uniforms.value, config.PRESSURE);
      }
      blit(pressure.write);
      pressure.swap();

      pressureProgram.bind();
      if (pressureProgram.uniforms.texelSize) {
        gl.uniform2f(
          pressureProgram.uniforms.texelSize,
          velocity.texelSizeX,
          velocity.texelSizeY,
        );
      }
      if (pressureProgram.uniforms.uDivergence) {
        gl.uniform1i(pressureProgram.uniforms.uDivergence, divergence.attach(0));
      }
      for (let i = 0; i < config.PRESSURE_ITERATIONS; i++) {
        if (pressureProgram.uniforms.uPressure) {
          gl.uniform1i(pressureProgram.uniforms.uPressure, pressure.read.attach(1));
        }
        blit(pressure.write);
        pressure.swap();
      }

      gradienSubtractProgram.bind();
      if (gradienSubtractProgram.uniforms.texelSize) {
        gl.uniform2f(
          gradienSubtractProgram.uniforms.texelSize,
          velocity.texelSizeX,
          velocity.texelSizeY,
        );
      }
      if (gradienSubtractProgram.uniforms.uPressure) {
        gl.uniform1i(gradienSubtractProgram.uniforms.uPressure, pressure.read.attach(0));
      }
      if (gradienSubtractProgram.uniforms.uVelocity) {
        gl.uniform1i(gradienSubtractProgram.uniforms.uVelocity, velocity.read.attach(1));
      }
      blit(velocity.write);
      velocity.swap();

      advectionProgram.bind();
      if (advectionProgram.uniforms.texelSize) {
        gl.uniform2f(advectionProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      }
      if (!ext.supportLinearFiltering && advectionProgram.uniforms.dyeTexelSize) {
        gl.uniform2f(
          advectionProgram.uniforms.dyeTexelSize,
          velocity.texelSizeX,
          velocity.texelSizeY,
        );
      }
      const velocityId = velocity.read.attach(0);
      if (advectionProgram.uniforms.uVelocity) {
        gl.uniform1i(advectionProgram.uniforms.uVelocity, velocityId);
      }
      if (advectionProgram.uniforms.uSource) {
        gl.uniform1i(advectionProgram.uniforms.uSource, velocityId);
      }
      if (advectionProgram.uniforms.dt) {
        gl.uniform1f(advectionProgram.uniforms.dt, dt);
      }
      if (advectionProgram.uniforms.dissipation) {
        gl.uniform1f(advectionProgram.uniforms.dissipation, config.VELOCITY_DISSIPATION);
      }
      blit(velocity.write);
      velocity.swap();

      if (!ext.supportLinearFiltering && advectionProgram.uniforms.dyeTexelSize) {
        gl.uniform2f(advectionProgram.uniforms.dyeTexelSize, dye.texelSizeX, dye.texelSizeY);
      }
      if (advectionProgram.uniforms.uVelocity) {
        gl.uniform1i(advectionProgram.uniforms.uVelocity, velocity.read.attach(0));
      }
      if (advectionProgram.uniforms.uSource) {
        gl.uniform1i(advectionProgram.uniforms.uSource, dye.read.attach(1));
      }
      if (advectionProgram.uniforms.dissipation) {
        gl.uniform1f(advectionProgram.uniforms.dissipation, config.DENSITY_DISSIPATION);
      }
      blit(dye.write);
      dye.swap();
    }

    function render(target: FBO | null) {
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.enable(gl.BLEND);
      drawDisplay(target);
    }

    function drawDisplay(target: FBO | null) {
      const width = target ? target.width : gl.drawingBufferWidth;
      const height = target ? target.height : gl.drawingBufferHeight;
      displayMaterial.bind();
      if (config.SHADING && displayMaterial.uniforms.texelSize) {
        gl.uniform2f(displayMaterial.uniforms.texelSize, 1 / width, 1 / height);
      }
      if (displayMaterial.uniforms.uTexture) {
        gl.uniform1i(displayMaterial.uniforms.uTexture, dye.read.attach(0));
      }
      blit(target, false);
    }

    function splatPointer(pointer: Pointer) {
      const dx = pointer.deltaX * config.SPLAT_FORCE;
      const dy = pointer.deltaY * config.SPLAT_FORCE;
      splat(pointer.texcoordX, pointer.texcoordY, dx, dy, pointer.color);
    }

    function clickSplat(pointer: Pointer) {
      const color = generateColor();
      color.r *= config.ANIMATION.clickIntensity;
      color.g *= config.ANIMATION.clickIntensity;
      color.b *= config.ANIMATION.clickIntensity;
      const dx = 10 * (Math.random() - 0.5);
      const dy = 30 * (Math.random() - 0.5);
      splat(pointer.texcoordX, pointer.texcoordY, dx, dy, color);
    }

    function splat(x: number, y: number, dx: number, dy: number, color: ColorRGB) {
      splatProgram.bind();
      if (splatProgram.uniforms.uTarget) {
        gl.uniform1i(splatProgram.uniforms.uTarget, velocity.read.attach(0));
      }
      if (splatProgram.uniforms.aspectRatio) {
        gl.uniform1f(splatProgram.uniforms.aspectRatio, canvas!.width / canvas!.height);
      }
      if (splatProgram.uniforms.point) {
        gl.uniform2f(splatProgram.uniforms.point, x, y);
      }
      if (splatProgram.uniforms.color) {
        gl.uniform3f(splatProgram.uniforms.color, dx, dy, 0);
      }
      if (splatProgram.uniforms.radius) {
        gl.uniform1f(splatProgram.uniforms.radius, correctRadius(config.SPLAT_RADIUS / 100)!);
      }
      blit(velocity.write);
      velocity.swap();

      if (splatProgram.uniforms.uTarget) {
        gl.uniform1i(splatProgram.uniforms.uTarget, dye.read.attach(0));
      }
      if (splatProgram.uniforms.color) {
        gl.uniform3f(splatProgram.uniforms.color, color.r, color.g, color.b);
      }
      blit(dye.write);
      dye.swap();
    }

    function correctRadius(radius: number) {
      const aspectRatio = canvas!.width / canvas!.height;
      if (aspectRatio > 1) radius *= aspectRatio;
      return radius;
    }

    function correctDeltaX(delta: number) {
      const aspectRatio = canvas!.width / canvas!.height;
      if (aspectRatio < 1) delta *= aspectRatio;
      return delta;
    }

    function correctDeltaY(delta: number) {
      const aspectRatio = canvas!.width / canvas!.height;
      if (aspectRatio > 1) delta /= aspectRatio;
      return delta;
    }

    function generateColor(): ColorRGB {
      const anim = config.ANIMATION;

      switch (anim.colorMode) {
        case "greyscale": {
          const value = Math.random() * anim.colorIntensity;
          return { r: value, g: value, b: value };
        }

        case "redHues": {
          return {
            r: (0.5 + Math.random() * 0.5) * anim.colorIntensity,
            g: Math.random() * 0.3 * anim.colorIntensity,
            b: Math.random() * 0.3 * anim.colorIntensity,
          };
        }

        case "custom": {
          if (anim.customColorHueRange) {
            const hueMin = anim.customColorHueRange[0];
            const hueMax = anim.customColorHueRange[1];
            const hue = hueMin + Math.random() * (hueMax - hueMin);
            const sat = anim.customColorSaturation ?? 1.0;
            const c = HSVtoRGB(hue, sat, 1.0);
            c.r *= anim.colorIntensity;
            c.g *= anim.colorIntensity;
            c.b *= anim.colorIntensity;
            return c;
          }
        }

        case "rainbow":
        default: {
          const c = HSVtoRGB(Math.random(), 1.0, 1.0);
          c.r *= anim.colorIntensity;
          c.g *= anim.colorIntensity;
          c.b *= anim.colorIntensity;
          return c;
        }
      }
    }

    function HSVtoRGB(h: number, s: number, v: number): ColorRGB {
      let r = 0,
        g = 0,
        b = 0;
      const i = Math.floor(h * 6);
      const f = h * 6 - i;
      const p = v * (1 - s);
      const q = v * (1 - f * s);
      const t = v * (1 - (1 - f) * s);

      switch (i % 6) {
        case 0:
          r = v;
          g = t;
          b = p;
          break;
        case 1:
          r = q;
          g = v;
          b = p;
          break;
        case 2:
          r = p;
          g = v;
          b = t;
          break;
        case 3:
          r = p;
          g = q;
          b = v;
          break;
        case 4:
          r = t;
          g = p;
          b = v;
          break;
        case 5:
          r = v;
          g = p;
          b = q;
          break;
      }
      return { r, g, b };
    }

    function wrap(value: number, min: number, max: number) {
      const range = max - min;
      if (range === 0) return min;
      return ((value - min) % range) + min;
    }

    updateFrame();
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <canvas ref={canvasRef} id="fluid" className="h-full w-full block" />
    </div>
  );
}
