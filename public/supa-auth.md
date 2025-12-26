This file is a merged representation of the entire codebase, combined into a single document by Repomix.

# File Summary

## Purpose
This file contains a packed representation of the entire repository's contents.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
```
app/
  (auth-pages)/
    forgot-password/
      page.tsx
    sign-in/
      page.tsx
    sign-up/
      page.tsx
    layout.tsx
  auth/
    callback/
      route.ts
  protected/
    reset-password/
      page.tsx
    page.tsx
  actions.ts
  favicon.ico
  globals.css
  layout.tsx
  opengraph-image.png
  page.tsx
  twitter-image.png
components/
  typography/
    inline-code.tsx
  ui/
    AutoSplashCursor.tsx
    badge.tsx
    button.tsx
    checkbox.tsx
    ControllerAutoSplash.tsx
    dropdown-menu.tsx
    input.tsx
    label.tsx
  form-message.tsx
  header-auth.tsx
  numinous-portal.tsx
  submit-button.tsx
  theme-switcher.tsx
lib/
  utils.ts
utils/
  supabase/
    client.ts
    isEmailAllowed.ts
    middleware.ts
    server.ts
  utils.ts
.dockerignore
.gitignore
CLAUDE.md
components.json
Dockerfile
middleware.ts
next.config.ts
package.json
postcss.config.js
README.md
repomix-output.xml
tailwind.config.ts
tsconfig.json
```

# Files

## File: repomix-output.xml
````xml
This file is a merged representation of the entire codebase, combined into a single document by Repomix.

<file_summary>
This section contains a summary of this file.

<purpose>
This file contains a packed representation of the entire repository's contents.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.
</purpose>

<file_format>
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  - File path as an attribute
  - Full contents of the file
</file_format>

<usage_guidelines>
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.
</usage_guidelines>

<notes>
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)
</notes>

</file_summary>

<directory_structure>
app/
  (auth-pages)/
    forgot-password/
      page.tsx
    sign-in/
      page.tsx
    sign-up/
      page.tsx
    layout.tsx
  auth/
    callback/
      route.ts
  protected/
    reset-password/
      page.tsx
    page.tsx
  actions.ts
  favicon.ico
  globals.css
  layout.tsx
  opengraph-image.png
  page.tsx
  twitter-image.png
components/
  typography/
    inline-code.tsx
  ui/
    AutoSplashCursor.tsx
    badge.tsx
    button.tsx
    checkbox.tsx
    ControllerAutoSplash.tsx
    dropdown-menu.tsx
    input.tsx
    label.tsx
  form-message.tsx
  header-auth.tsx
  numinous-portal.tsx
  submit-button.tsx
  theme-switcher.tsx
lib/
  utils.ts
utils/
  supabase/
    client.ts
    isEmailAllowed.ts
    middleware.ts
    server.ts
  utils.ts
.dockerignore
.gitignore
CLAUDE.md
components.json
Dockerfile
middleware.ts
next.config.ts
package.json
postcss.config.js
README.md
tailwind.config.ts
tsconfig.json
</directory_structure>

<files>
This section contains the contents of the repository's files.

<file path="app/(auth-pages)/layout.tsx">
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-7xl flex flex-col gap-12 items-start">{children}</div>
  );
}
</file>

<file path="app/auth/callback/route.ts">
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // The `/auth/callback` route is required for the server-side auth flow implemented
  // by the SSR package. It exchanges an auth code for the user's session.
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;
  const redirectTo = requestUrl.searchParams.get("redirect_to")?.toString();

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  if (redirectTo) {
    return NextResponse.redirect(`${origin}${redirectTo}`);
  }

  // URL to redirect to after sign up process completes
  return NextResponse.redirect(`${origin}/protected`);
}
</file>

<file path="app/protected/reset-password/page.tsx">
import { resetPasswordAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function ResetPassword(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  return (
    <form className="flex flex-col w-full max-w-md p-4 gap-2 [&>input]:mb-4">
      <h1 className="text-2xl font-medium">Reset password</h1>
      <p className="text-sm text-foreground/60">
        Please enter your new password below.
      </p>
      <Label htmlFor="password">New password</Label>
      <Input
        type="password"
        name="password"
        placeholder="New password"
        required
      />
      <Label htmlFor="confirmPassword">Confirm password</Label>
      <Input
        type="password"
        name="confirmPassword"
        placeholder="Confirm password"
        required
      />
      <SubmitButton formAction={resetPasswordAction}>
        Reset password
      </SubmitButton>
      <FormMessage message={searchParams} />
    </form>
  );
}
</file>

<file path="app/globals.css">
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 0 0% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 0 0% 3.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 0 0% 3.9%;
    --primary: 0 0% 9%;
    --primary-foreground: 0 0% 98%;
    --secondary: 0 0% 96.1%;
    --secondary-foreground: 0 0% 9%;
    --muted: 0 0% 96.1%;
    --muted-foreground: 0 0% 45.1%;
    --accent: 0 0% 96.1%;
    --accent-foreground: 0 0% 9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 0 0% 89.8%;
    --input: 0 0% 89.8%;
    --ring: 0 0% 3.9%;
    --radius: 0.5rem;
    --chart-1: 12 76% 61%;
    --chart-2: 173 58% 39%;
    --chart-3: 197 37% 24%;
    --chart-4: 43 74% 66%;
    --chart-5: 27 87% 67%;
  }

  .dark {
    --background: 0 0% 3.9%;
    --foreground: 0 0% 98%;
    --card: 0 0% 3.9%;
    --card-foreground: 0 0% 98%;
    --popover: 0 0% 3.9%;
    --popover-foreground: 0 0% 98%;
    --primary: 0 0% 98%;
    --primary-foreground: 0 0% 9%;
    --secondary: 0 0% 14.9%;
    --secondary-foreground: 0 0% 98%;
    --muted: 0 0% 14.9%;
    --muted-foreground: 0 0% 63.9%;
    --accent: 0 0% 14.9%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    --border: 0 0% 14.9%;
    --input: 0 0% 14.9%;
    --ring: 0 0% 83.1%;
    --chart-1: 220 70% 50%;
    --chart-2: 160 60% 45%;
    --chart-3: 30 80% 55%;
    --chart-4: 280 65% 60%;
    --chart-5: 340 75% 55%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
</file>

<file path="components/typography/inline-code.tsx">
export function TypographyInlineCode() {
  return (
    <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
      @radix-ui/react-alert-dialog
    </code>
  );
}
</file>

<file path="components/ui/AutoSplashCursor.tsx">
"use client";
import React, { useEffect, useRef } from "react";

interface ColorRGB {
  r: number;
  g: number;
  b: number;
}

// Animation configuration for autonomous movement
interface AnimationConfig {
  // Movement parameters
  speed: number;            // Base movement speed
  smoothness: number;       // How smooth the movement is (0-1)
  pauseChance: number;      // Chance of pausing movement (0-1)
  pauseDuration: number;    // Duration of pauses in ms
  edgeBounce: boolean;      // Whether to bounce off edges
  
  // Path parameters
  changeDirectionChance: number;  // Chance to change direction (0-1)
  directionChangeAmount: number;  // How much direction changes (radians)
  
  // Click/splat parameters
  clickChance: number;      // Chance of generating a "click" splat (0-1)
  clickIntensity: number;   // Intensity multiplier for click splats
  
  // Color parameters
  colorSpeed: number;       // Speed of color changes
  colorIntensity: number;   // Base color intensity
  colorMode: 'rainbow' | 'greyscale' | 'redHues' | 'custom'; // Color generation mode
  customColorHueRange?: [number, number];  // For custom color mode, hue range [0-1]
  customColorSaturation?: number;          // For custom mode, saturation value
  
  // Fade controls
  fadingRate?: number;                     // Override for DENSITY_DISSIPATION
  
  // Path mode controls
  pathMode: 'random' | 'circle' | 'constrained'; // Type of motion path
  pathRadius?: number;                      // For circle/constrained modes
  pathCenter?: [number, number];            // Center point for paths [x, y] in [0-1] range
  pathSpeed?: number;                       // Speed for predefined paths
  pathDirection?: 'clockwise' | 'counterclockwise'; // For circle mode
  
  // Starting position
  startPosition?: [number, number];         // Starting position [x, y] in [0-1] range
  
  // Spawn parameters
  spawnCount: number;       // Number of animation points to spawn
}

interface SplashCursorProps {
  // Original simulation parameters
  SIM_RESOLUTION?: number;
  DYE_RESOLUTION?: number;
  CAPTURE_RESOLUTION?: number;
  DENSITY_DISSIPATION?: number;
  VELOCITY_DISSIPATION?: number;
  PRESSURE?: number;
  PRESSURE_ITERATIONS?: number;
  CURL?: number;
  SPLAT_RADIUS?: number;
  SPLAT_FORCE?: number;
  SHADING?: boolean;
  COLOR_UPDATE_SPEED?: number;
  BACK_COLOR?: ColorRGB;
  TRANSPARENT?: boolean;
  
  // Animation configuration
  animation?: Partial<AnimationConfig>;
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
  // Animation specific properties
  direction: number;      // Direction in radians
  targetX: number;        // Target position
  targetY: number;
  moving: boolean;        // Whether currently moving
  pauseUntil: number;     // Timestamp until pause ends
  pathAngle?: number;     // For circular paths
}

function pointerPrototype(): Pointer {
  return {
    id: -1,
    texcoordX: 0.5,       // Start in center
    texcoordY: 0.5,
    prevTexcoordX: 0.5,
    prevTexcoordY: 0.5,
    deltaX: 0,
    deltaY: 0,
    down: false,
    moved: false,
    color: { r: 0, g: 0, b: 0 },
    direction: Math.random() * Math.PI * 2, // Random direction
    targetX: 0.5,
    targetY: 0.5,
    moving: true,
    pauseUntil: 0
  };
}

// Default animation config
const DEFAULT_ANIMATION_CONFIG: AnimationConfig = {
  speed: 0.002,             // Base movement speed
  smoothness: 0.92,         // How smooth the movement is (0-1)
  pauseChance: 0.005,       // Chance of pausing movement (0-1)
  pauseDuration: 500,       // Duration of pauses in ms
  edgeBounce: true,         // Whether to bounce off edges
  
  changeDirectionChance: 0.03, // Chance to change direction (0-1)
  directionChangeAmount: 0.5,  // How much direction changes (radians)
  
  clickChance: 0.01,        // Chance of generating a "click" splat (0-1)
  clickIntensity: 15,       // Intensity multiplier for click splats
  
  colorSpeed: 10,           // Speed of color changes
  colorIntensity: 0.15,     // Base color intensity
  colorMode: 'rainbow',     // Default to rainbow colors
  
  fadingRate: 3.5,          // Default to match DENSITY_DISSIPATION
  
  pathMode: 'random',       // Default to random movement
  pathRadius: 0.3,          // 30% of screen width
  pathCenter: [0.5, 0.5],   // Center of screen
  pathSpeed: 0.002,         // Same as default speed
  pathDirection: 'clockwise',
  
  startPosition: [0.5, 0.5], // Start in center
  
  spawnCount: 1             // Number of animation points
};

export default function AutoSplashCursor({
  SIM_RESOLUTION = 128,
  DYE_RESOLUTION = 1440,
  CAPTURE_RESOLUTION = 512,
  DENSITY_DISSIPATION = 3.5,
  VELOCITY_DISSIPATION = 2,
  PRESSURE = 0.1,
  PRESSURE_ITERATIONS = 20,
  CURL = 3,
  SPLAT_RADIUS = 0.2,
  SPLAT_FORCE = 6000,
  SHADING = true,
  COLOR_UPDATE_SPEED = 10,
  BACK_COLOR = { r: 0.5, g: 0, b: 0 },
  TRANSPARENT = true,
  animation = {}
}: SplashCursorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return; // Guard canvas early

    // Merge default animation config with provided options
    const animConfig: AnimationConfig = {
      ...DEFAULT_ANIMATION_CONFIG,
      ...animation
    };

    // Initialize pointers based on spawn count
    let pointers: Pointer[] = Array.from(
      { length: animConfig.spawnCount }, 
      () => {
        const p = pointerPrototype();
        // Set initial position from config if provided
        if (animConfig.startPosition) {
          p.texcoordX = animConfig.startPosition[0];
          p.texcoordY = animConfig.startPosition[1];
          p.prevTexcoordX = p.texcoordX;
          p.prevTexcoordY = p.texcoordY;
        }
        return p;
      }
    );

    // All these are guaranteed numbers due to destructuring defaults
    // So we cast them to remove TS warnings:
    let config = {
      SIM_RESOLUTION: SIM_RESOLUTION!,
      DYE_RESOLUTION: DYE_RESOLUTION!,
      CAPTURE_RESOLUTION: CAPTURE_RESOLUTION!,
      DENSITY_DISSIPATION: DENSITY_DISSIPATION!,
      VELOCITY_DISSIPATION: VELOCITY_DISSIPATION!,
      PRESSURE: PRESSURE!,
      PRESSURE_ITERATIONS: PRESSURE_ITERATIONS!,
      CURL: CURL!,
      SPLAT_RADIUS: SPLAT_RADIUS!,
      SPLAT_FORCE: SPLAT_FORCE!,
      SHADING,
      COLOR_UPDATE_SPEED: COLOR_UPDATE_SPEED!,
      PAUSED: false,
      BACK_COLOR,
      TRANSPARENT,
      ANIMATION: animConfig
    };

    // Get WebGL context (WebGL1 or WebGL2)
    const { gl, ext } = getWebGLContext(canvas);
    if (!gl || !ext) return;

    // If no linear filtering, reduce resolution
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

      let gl = canvas.getContext(
        "webgl2",
        params
      ) as WebGL2RenderingContext | null;

      if (!gl) {
        gl = (canvas.getContext("webgl", params) ||
          canvas.getContext(
            "experimental-webgl",
            params
          )) as WebGL2RenderingContext | null;
      }

      if (!gl) {
        throw new Error("Unable to initialize WebGL.");
      }

      const isWebGL2 = "drawBuffers" in gl;

      let supportLinearFiltering = false;
      let halfFloat = null;

      if (isWebGL2) {
        // For WebGL2
        (gl as WebGL2RenderingContext).getExtension("EXT_color_buffer_float");
        supportLinearFiltering = !!(gl as WebGL2RenderingContext).getExtension(
          "OES_texture_float_linear"
        );
      } else {
        // For WebGL1
        halfFloat = gl.getExtension("OES_texture_half_float");
        supportLinearFiltering = !!gl.getExtension(
          "OES_texture_half_float_linear"
        );
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
          halfFloatTexType
        );
        formatRG = getSupportedFormat(
          gl,
          (gl as WebGL2RenderingContext).RG16F,
          (gl as WebGL2RenderingContext).RG,
          halfFloatTexType
        );
        formatR = getSupportedFormat(
          gl,
          (gl as WebGL2RenderingContext).R16F,
          (gl as WebGL2RenderingContext).RED,
          halfFloatTexType
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
      type: number
    ): { internalFormat: number; format: number } | null {
      if (!supportRenderTextureFormat(gl, internalFormat, format, type)) {
        // For WebGL2 fallback:
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
      type: number
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
        null
      );

      const fbo = gl.createFramebuffer();
      if (!fbo) return false;

      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D,
        texture,
        0
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
      keywords: string[] | null = null
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
      fragmentShader: WebGLShader | null
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
          uniforms[uniformInfo.name] = gl.getUniformLocation(
            program,
            uniformInfo.name
          );
        }
      }
      return uniforms;
    }

    class Program {
      program: WebGLProgram | null;
      uniforms: Record<string, WebGLUniformLocation | null>;

      constructor(
        vertexShader: WebGLShader | null,
        fragmentShader: WebGLShader | null
      ) {
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

      constructor(
        vertexShader: WebGLShader | null,
        fragmentShaderSource: string
      ) {
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
            keywords
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

    // -------------------- Shaders --------------------
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
    `
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
    `
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
    `
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
    `
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
      ext.supportLinearFiltering ? null : ["MANUAL_FILTERING"]
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
    `
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
    `
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
    `
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
    `
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
    `
    );

    // -------------------- Fullscreen Triangles --------------------
    const blit = (() => {
      const buffer = gl.createBuffer()!;
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]),
        gl.STATIC_DRAW
      );
      const elemBuffer = gl.createBuffer()!;
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elemBuffer);
      gl.bufferData(
        gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array([0, 1, 2, 0, 2, 3]),
        gl.STATIC_DRAW
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

    // Types for Framebuffers
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

    // FBO variables
    let dye: DoubleFBO;
    let velocity: DoubleFBO;
    let divergence: FBO;
    let curl: FBO;
    let pressure: DoubleFBO;

    // WebGL Programs
    const copyProgram = new Program(baseVertexShader, copyShader);
    const clearProgram = new Program(baseVertexShader, clearShader);
    const splatProgram = new Program(baseVertexShader, splatShader);
    const advectionProgram = new Program(baseVertexShader, advectionShader);
    const divergenceProgram = new Program(baseVertexShader, divergenceShader);
    const curlProgram = new Program(baseVertexShader, curlShader);
    const vorticityProgram = new Program(baseVertexShader, vorticityShader);
    const pressureProgram = new Program(baseVertexShader, pressureShader);
    const gradienSubtractProgram = new Program(
      baseVertexShader,
      gradientSubtractShader
    );
    const displayMaterial = new Material(baseVertexShader, displayShaderSource);

    // -------------------- FBO creation --------------------
    function createFBO(
      w: number,
      h: number,
      internalFormat: number,
      format: number,
      type: number,
      param: number
    ): FBO {
      gl.activeTexture(gl.TEXTURE0);
      const texture = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, param);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, param);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        internalFormat,
        w,
        h,
        0,
        format,
        type,
        null
      );
      const fbo = gl.createFramebuffer()!;
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D,
        texture,
        0
      );
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
      param: number
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
      param: number
    ) {
      const newFBO = createFBO(w, h, internalFormat, format, type, param);
      copyProgram.bind();
      if (copyProgram.uniforms.uTexture)
        gl.uniform1i(copyProgram.uniforms.uTexture, target.attach(0));
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
      param: number
    ) {
      if (target.width === w && target.height === h) return target;
      target.read = resizeFBO(
        target.read,
        w,
        h,
        internalFormat,
        format,
        type,
        param
      );
      target.write = createFBO(w, h, internalFormat, format, type, param);
      target.width = w;
      target.height = h;
      target.texelSizeX = 1 / w;
      target.texelSizeY = 1 / h;
      return target;
    }

    function initFramebuffers() {
      const simRes = getResolution(config.SIM_RESOLUTION!);
      const dyeRes = getResolution(config.DYE_RESOLUTION!);

      const texType = ext.halfFloatTexType;
      const rgba = ext.formatRGBA;
      const rg = ext.formatRG;
      const r = ext.formatR;
      const filtering = ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST;
      gl.disable(gl.BLEND);

      if (!dye) {
        dye = createDoubleFBO(
          dyeRes.width,
          dyeRes.height,
          rgba.internalFormat,
          rgba.format,
          texType,
          filtering
        );
      } else {
        dye = resizeDoubleFBO(
          dye,
          dyeRes.width,
          dyeRes.height,
          rgba.internalFormat,
          rgba.format,
          texType,
          filtering
        );
      }

      if (!velocity) {
        velocity = createDoubleFBO(
          simRes.width,
          simRes.height,
          rg.internalFormat,
          rg.format,
          texType,
          filtering
        );
      } else {
        velocity = resizeDoubleFBO(
          velocity,
          simRes.width,
          simRes.height,
          rg.internalFormat,
          rg.format,
          texType,
          filtering
        );
      }

      divergence = createFBO(
        simRes.width,
        simRes.height,
        r.internalFormat,
        r.format,
        texType,
        gl.NEAREST
      );
      curl = createFBO(
        simRes.width,
        simRes.height,
        r.internalFormat,
        r.format,
        texType,
        gl.NEAREST
      );
      pressure = createDoubleFBO(
        simRes.width,
        simRes.height,
        r.internalFormat,
        r.format,
        texType,
        gl.NEAREST
      );
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

    // -------------------- Simulation Setup --------------------
    updateKeywords();
    initFramebuffers();

    let lastUpdateTime = Date.now();
    let colorUpdateTimer = 0.0;
    let animationStarted = false;

    function updateFrame() {
      const dt = calcDeltaTime();
      if (resizeCanvas()) initFramebuffers();
      
      // Apply custom fading rate if provided
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

    // New function to update autonomous movement of pointers
    function updateAutonomousMovement(dt: number) {
      const anim = config.ANIMATION;
      const now = Date.now();
      
      pointers.forEach((pointer) => {
        // Handle pausing
        if (pointer.pauseUntil > now) {
          return; // Skip updating this pointer until pause is over
        }
        
        // Random pause
        if (Math.random() < anim.pauseChance) {
          pointer.pauseUntil = now + anim.pauseDuration;
          return;
        }
        
        // Store previous position
        pointer.prevTexcoordX = pointer.texcoordX;
        pointer.prevTexcoordY = pointer.texcoordY;
        
        // Handle different path modes
        switch(anim.pathMode) {
          case 'circle': {
            // Circular motion around pathCenter
            const center = anim.pathCenter ?? [0.5, 0.5];
            const radius = anim.pathRadius ?? 0.3; // Default 30% of screen
            const speed = anim.pathSpeed ?? anim.speed;
            const clockwise = anim.pathDirection !== 'counterclockwise';
            
            // Initialize pathAngle if not already set
            if (pointer.pathAngle === undefined) {
              pointer.pathAngle = Math.random() * Math.PI * 2;
            }
            
            // Update angle based on speed and direction
            const angleChange = speed * (clockwise ? 1 : -1) * 10; // Multiply by 10 for better visibility
            pointer.pathAngle += angleChange;
            
            // Calculate new position on circle
            pointer.texcoordX = center[0] + Math.cos(pointer.pathAngle) * radius;
            pointer.texcoordY = center[1] + Math.sin(pointer.pathAngle) * radius;
            
            break;
          }
          
          case 'constrained': {
            // Random motion constrained within a radius
            const center = anim.pathCenter ?? [0.5, 0.5];
            const radius = anim.pathRadius ?? 0.3;
            
            // Update with random direction changes
            if (Math.random() < anim.changeDirectionChance) {
              pointer.direction += (Math.random() * 2 - 1) * anim.directionChangeAmount;
            }
            
            // Calculate new position
            const dx = Math.cos(pointer.direction) * anim.speed;
            const dy = Math.sin(pointer.direction) * anim.speed;
            
            pointer.texcoordX += dx;
            pointer.texcoordY += dy;
            
            // Check if outside constraint radius and bounce if needed
            const distX = pointer.texcoordX - center[0];
            const distY = pointer.texcoordY - center[1];
            const distance = Math.sqrt(distX * distX + distY * distY);
            
            if (distance > radius) {
              // Bounce off invisible boundary
              // Calculate reflection vector
              const normalX = distX / distance;
              const normalY = distY / distance;
              
              // Calculate dot product of velocity and normal
              const dot = 2 * (dx * normalX + dy * normalY);
              
              // Calculate reflection direction
              pointer.direction = Math.atan2(
                dy - dot * normalY, 
                dx - dot * normalX
              );
              
              // Place back on boundary
              pointer.texcoordX = center[0] + normalX * radius;
              pointer.texcoordY = center[1] + normalY * radius;
            }
            
            break;
          }
          
          case 'random':
          default: {
            // Original random movement logic
            if (Math.random() < anim.changeDirectionChance) {
              pointer.direction += (Math.random() * 2 - 1) * anim.directionChangeAmount;
            }
            
            // Calculate new position
            const dx = Math.cos(pointer.direction) * anim.speed;
            const dy = Math.sin(pointer.direction) * anim.speed;
            
            pointer.texcoordX += dx;
            pointer.texcoordY += dy;
            
            // Handle edge bouncing
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
              // Wrap around if not bouncing
              pointer.texcoordX = wrap(pointer.texcoordX, 0, 1);
              pointer.texcoordY = wrap(pointer.texcoordY, 0, 1);
            }
            
            break;
          }
        }
        
        // Calculate deltas for fluid simulation
        pointer.deltaX = correctDeltaX(pointer.texcoordX - pointer.prevTexcoordX)!;
        pointer.deltaY = correctDeltaY(pointer.texcoordY - pointer.prevTexcoordY)!;
        
        // Mark as moved if there's significant movement
        pointer.moved = 
          Math.abs(pointer.deltaX) > 0.0001 || 
          Math.abs(pointer.deltaY) > 0.0001;
        
        // Random "click" effect
        if (Math.random() < anim.clickChance) {
          clickSplat(pointer);
        }
        
        // Regular movement splat if moved
        if (pointer.moved) {
          splatPointer(pointer);
        }
      });
    }

    function step(dt: number) {
      gl.disable(gl.BLEND);

      // Curl
      curlProgram.bind();
      if (curlProgram.uniforms.texelSize) {
        gl.uniform2f(
          curlProgram.uniforms.texelSize,
          velocity.texelSizeX,
          velocity.texelSizeY
        );
      }
      if (curlProgram.uniforms.uVelocity) {
        gl.uniform1i(curlProgram.uniforms.uVelocity, velocity.read.attach(0));
      }
      blit(curl);

      // Vorticity
      vorticityProgram.bind();
      if (vorticityProgram.uniforms.texelSize) {
        gl.uniform2f(
          vorticityProgram.uniforms.texelSize,
          velocity.texelSizeX,
          velocity.texelSizeY
        );
      }
      if (vorticityProgram.uniforms.uVelocity) {
        gl.uniform1i(
          vorticityProgram.uniforms.uVelocity,
          velocity.read.attach(0)
        );
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

      // Divergence
      divergenceProgram.bind();
      if (divergenceProgram.uniforms.texelSize) {
        gl.uniform2f(
          divergenceProgram.uniforms.texelSize,
          velocity.texelSizeX,
          velocity.texelSizeY
        );
      }
      if (divergenceProgram.uniforms.uVelocity) {
        gl.uniform1i(
          divergenceProgram.uniforms.uVelocity,
          velocity.read.attach(0)
        );
      }
      blit(divergence);

      // Clear pressure
      clearProgram.bind();
      if (clearProgram.uniforms.uTexture) {
        gl.uniform1i(clearProgram.uniforms.uTexture, pressure.read.attach(0));
      }
      if (clearProgram.uniforms.value) {
        gl.uniform1f(clearProgram.uniforms.value, config.PRESSURE);
      }
      blit(pressure.write);
      pressure.swap();

      // Pressure
      pressureProgram.bind();
      if (pressureProgram.uniforms.texelSize) {
        gl.uniform2f(
          pressureProgram.uniforms.texelSize,
          velocity.texelSizeX,
          velocity.texelSizeY
        );
      }
      if (pressureProgram.uniforms.uDivergence) {
        gl.uniform1i(
          pressureProgram.uniforms.uDivergence,
          divergence.attach(0)
        );
      }
      for (let i = 0; i < config.PRESSURE_ITERATIONS; i++) {
        if (pressureProgram.uniforms.uPressure) {
          gl.uniform1i(
            pressureProgram.uniforms.uPressure,
            pressure.read.attach(1)
          );
        }
        blit(pressure.write);
        pressure.swap();
      }

      // Gradient Subtract
      gradienSubtractProgram.bind();
      if (gradienSubtractProgram.uniforms.texelSize) {
        gl.uniform2f(
          gradienSubtractProgram.uniforms.texelSize,
          velocity.texelSizeX,
          velocity.texelSizeY
        );
      }
      if (gradienSubtractProgram.uniforms.uPressure) {
        gl.uniform1i(
          gradienSubtractProgram.uniforms.uPressure,
          pressure.read.attach(0)
        );
      }
      if (gradienSubtractProgram.uniforms.uVelocity) {
        gl.uniform1i(
          gradienSubtractProgram.uniforms.uVelocity,
          velocity.read.attach(1)
        );
      }
      blit(velocity.write);
      velocity.swap();

      // Advection - velocity
      advectionProgram.bind();
      if (advectionProgram.uniforms.texelSize) {
        gl.uniform2f(
          advectionProgram.uniforms.texelSize,
          velocity.texelSizeX,
          velocity.texelSizeY
        );
      }
      if (
        !ext.supportLinearFiltering &&
        advectionProgram.uniforms.dyeTexelSize
      ) {
        gl.uniform2f(
          advectionProgram.uniforms.dyeTexelSize,
          velocity.texelSizeX,
          velocity.texelSizeY
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
        gl.uniform1f(
          advectionProgram.uniforms.dissipation,
          config.VELOCITY_DISSIPATION
        );
      }
      blit(velocity.write);
      velocity.swap();

      // Advection - dye
      if (
        !ext.supportLinearFiltering &&
        advectionProgram.uniforms.dyeTexelSize
      ) {
        gl.uniform2f(
          advectionProgram.uniforms.dyeTexelSize,
          dye.texelSizeX,
          dye.texelSizeY
        );
      }
      if (advectionProgram.uniforms.uVelocity) {
        gl.uniform1i(
          advectionProgram.uniforms.uVelocity,
          velocity.read.attach(0)
        );
      }
      if (advectionProgram.uniforms.uSource) {
        gl.uniform1i(advectionProgram.uniforms.uSource, dye.read.attach(1));
      }
      if (advectionProgram.uniforms.dissipation) {
        gl.uniform1f(
          advectionProgram.uniforms.dissipation,
          config.DENSITY_DISSIPATION
        );
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

    // -------------------- Interaction --------------------
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

    function splat(
      x: number,
      y: number,
      dx: number,
      dy: number,
      color: ColorRGB
    ) {
      splatProgram.bind();
      if (splatProgram.uniforms.uTarget) {
        gl.uniform1i(splatProgram.uniforms.uTarget, velocity.read.attach(0));
      }
      if (splatProgram.uniforms.aspectRatio) {
        gl.uniform1f(
          splatProgram.uniforms.aspectRatio,
          canvas!.width / canvas!.height
        );
      }
      if (splatProgram.uniforms.point) {
        gl.uniform2f(splatProgram.uniforms.point, x, y);
      }
      if (splatProgram.uniforms.color) {
        gl.uniform3f(splatProgram.uniforms.color, dx, dy, 0);
      }
      if (splatProgram.uniforms.radius) {
        gl.uniform1f(
          splatProgram.uniforms.radius,
          correctRadius(config.SPLAT_RADIUS / 100)!
        );
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
      // Use non-null assertion (canvas can't be null here)
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
      
      switch(anim.colorMode) {
        case 'greyscale': {
          const value = Math.random() * anim.colorIntensity;
          return { r: value, g: value, b: value };
        }
        
        case 'redHues': {
          // Red hues: keep high R value, low G/B values
          return { 
            r: (0.5 + Math.random() * 0.5) * anim.colorIntensity, 
            g: Math.random() * 0.3 * anim.colorIntensity, 
            b: Math.random() * 0.3 * anim.colorIntensity 
          };
        }
        
        case 'custom': {
          if (anim.customColorHueRange) {
            // Use custom hue range but keep HSV conversion
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
          // Fall through to rainbow if not properly configured
        }
        
        case 'rainbow':
        default: {
          // Existing rainbow generation
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

    // Start the animation immediately
    updateFrame();
    
  }, [
    SIM_RESOLUTION,
    DYE_RESOLUTION,
    CAPTURE_RESOLUTION,
    DENSITY_DISSIPATION,
    VELOCITY_DISSIPATION,
    PRESSURE,
    PRESSURE_ITERATIONS,
    CURL,
    SPLAT_RADIUS,
    SPLAT_FORCE,
    SHADING,
    COLOR_UPDATE_SPEED,
    BACK_COLOR,
    TRANSPARENT,
    animation,
  ]);

  return (
    <div className="relative w-full h-full">
      <canvas ref={canvasRef} id="fluid" className="w-full h-full block"></canvas>
    </div>
  );
}
</file>

<file path="components/ui/badge.tsx">
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
</file>

<file path="components/ui/button.tsx">
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
</file>

<file path="components/ui/checkbox.tsx">
"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("flex items-center justify-center text-current")}
    >
      <Check className="h-4 w-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
</file>

<file path="components/ui/ControllerAutoSplash.tsx">
"use client";
import AutoSplashCursor from "./AutoSplashCursor";

export default function ControllerAutoSplash() {
  // Example animation config demonstrating all new parameters
  const animationConfig = {
    // Movement parameters
    speed: 0.011,                // Base movement speed
    smoothness: 0.82,           // How smooth the movement is (0-1)
    pauseChance: 0.001,          // Chance of pausing movement (0-1)
    pauseDuration: 500,         // Duration of pauses in ms
    
    // Direction parameters
    changeDirectionChance: 0.6, // Chance to change direction (0-1)
    directionChangeAmount: 0.6,  // How much direction changes (radians)
    
    // Click parameters
    clickChance: 0.3,           // Chance of generating a "click" splat (0-1)
    clickIntensity: 3,          // Intensity multiplier for click splats
    
    // Color parameters
    colorMode: 'greyscale' as 'greyscale',  // Type assertion to specific literal type
    colorIntensity: 0.052,        // Base color intensity
    customColorHueRange: [0.5, 0.7] as [number, number], // Optional: for 'custom' mode, hue range [0-1]
    customColorSaturation: 0.5,      // Optional: for 'custom' mode, saturation value
    
    // Path parameters
    pathMode: 'random' as 'random',    // Options: 'random', 'circle', 'constrained'
    pathRadius: 0.1,            // For circle/constrained: radius as portion of screen
    pathCenter: [0.1, 0.9] as [number, number],  // Center of path [x, y] in range [0-1]
    pathDirection: 'clockwise' as 'clockwise', // For circle mode: 'clockwise' or 'counterclockwise'
    
    // Starting position
    startPosition: [0.1, 0.9] as [number, number],  // Start position [x, y] in range [0-1]
    
    // Fading rate
    fadingRate: 0.9,            // Override for density dissipation (faster fading)
    
    // Spawn count
    spawnCount: 1               // Two independent animation points
  };

  return (
    <div className="w-full h-full absolute inset-0 overflow-hidden pointer-events-none">
      <AutoSplashCursor 
        CURL={3}                 // Fluid physics parameter
        SPLAT_FORCE={10000}       // Increase the force of splats
        animation={animationConfig}
      />
    </div>
  );
}
</file>

<file path="components/ui/dropdown-menu.tsx">
"use client";

import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { Check, ChevronRight, Circle } from "lucide-react";

import { cn } from "@/lib/utils";

const DropdownMenu = DropdownMenuPrimitive.Root;

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

const DropdownMenuGroup = DropdownMenuPrimitive.Group;

const DropdownMenuPortal = DropdownMenuPrimitive.Portal;

const DropdownMenuSub = DropdownMenuPrimitive.Sub;

const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

const DropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & {
    inset?: boolean;
  }
>(({ className, inset, children, ...props }, ref) => (
  <DropdownMenuPrimitive.SubTrigger
    ref={ref}
    className={cn(
      "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent",
      inset && "pl-8",
      className,
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto h-4 w-4" />
  </DropdownMenuPrimitive.SubTrigger>
));
DropdownMenuSubTrigger.displayName =
  DropdownMenuPrimitive.SubTrigger.displayName;

const DropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.SubContent
    ref={ref}
    className={cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className,
    )}
    {...props}
  />
));
DropdownMenuSubContent.displayName =
  DropdownMenuPrimitive.SubContent.displayName;

const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className,
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
));
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      inset && "pl-8",
      className,
    )}
    {...props}
  />
));
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;

const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <DropdownMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className,
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.CheckboxItem>
));
DropdownMenuCheckboxItem.displayName =
  DropdownMenuPrimitive.CheckboxItem.displayName;

const DropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className,
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Circle className="h-2 w-2 fill-current" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.RadioItem>
));
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName;

const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn(
      "px-2 py-1.5 text-sm font-semibold",
      inset && "pl-8",
      className,
    )}
    {...props}
  />
));
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName;

const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
));
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;

const DropdownMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn("ml-auto text-xs tracking-widest opacity-60", className)}
      {...props}
    />
  );
};
DropdownMenuShortcut.displayName = "DropdownMenuShortcut";

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
};
</file>

<file path="components/ui/input.tsx">
import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
</file>

<file path="components/ui/label.tsx">
"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
);

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
));
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
</file>

<file path="components/form-message.tsx">
export type Message =
  | { success: string }
  | { error: string }
  | { message: string };

export function FormMessage({ message }: { message: Message }) {
  return (
    <div className="flex flex-col gap-2 w-full max-w-md text-sm">
      {"success" in message && (
        <div className="text-foreground border-l-2 border-foreground px-4">
          {message.success}
        </div>
      )}
      {"error" in message && (
        <div className="text-destructive-foreground border-l-2 border-destructive-foreground px-4">
          {message.error}
        </div>
      )}
      {"message" in message && (
        <div className="text-foreground border-l-2 px-4">{message.message}</div>
      )}
    </div>
  );
}
</file>

<file path="components/numinous-portal.tsx">
'use client';

import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

const NuminousPortal: React.FC = () => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    // Get container dimensions
    const containerWidth = mountRef.current.clientWidth;
    const containerHeight = mountRef.current.clientHeight;
    
    const camera = new THREE.PerspectiveCamera(75, containerWidth / containerHeight, 0.1, 100);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerWidth, containerHeight);
    renderer.setClearColor(0x000000, 1);
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    // Materials
    const unifiedMaterial = new THREE.LineBasicMaterial({ 
      color: 0xd4d4aa,
      transparent: true, 
      opacity: 0.8
    });
    
    const lineMaterial = new THREE.LineBasicMaterial({ 
      color: 0xd4d4aa,
      transparent: true, 
      opacity: 0.7
    });
    
    const glowMaterial = new THREE.LineBasicMaterial({ 
      color: 0xd4d4aa,
      transparent: true, 
      opacity: 0.9
    });
    
    const accentMaterial = new THREE.LineBasicMaterial({ 
      color: 0xd4d4aa,
      transparent: true, 
      opacity: 0.8
    });

    // Neural network materials
    const neuralNodeMaterial = new THREE.MeshBasicMaterial({
      color: 0xd4d4aa,
      transparent: true,
      opacity: 0.7
    });

    const neuralEdgeMaterial = new THREE.LineBasicMaterial({
      color: 0xd4d4aa,
      transparent: true,
      opacity: 0.5
    });

    const activeNeuralMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.8
    });

    // Create text texture function
    const createTextTexture = (text: string, fontSize: number = 32, color: string = '#ffffff') => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d')!;
      
      canvas.width = 512;
      canvas.height = 128;
      
      context.fillStyle = color;
      context.font = `${fontSize}px Arial, sans-serif`;
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.fillText(text, canvas.width / 2, canvas.height / 2);
      
      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;
      return texture;
    };

    // Center text
    const centerTextTexture = createTextTexture('Fatima College', 34, '#ffffff');
    const centerTextMaterial = new THREE.MeshBasicMaterial({ 
      map: centerTextTexture, 
      transparent: true,
      opacity: 0.8
    });
    const centerTextGeometry = new THREE.PlaneGeometry(2, 0.5);
    const centerText = new THREE.Mesh(centerTextGeometry, centerTextMaterial);
    centerText.position.set(0, 0, 0.1);
    scene.add(centerText);

    // Create concentric circles
    const circles: THREE.Line[] = [];
    const numCircles = 8;
    
    for (let i = 0; i < numCircles; i++) {
      const radius = 0.5 + i * 0.3;
      const positions = [];
      
      for (let j = 0; j <= 64; j++) {
        const angle = (j / 64) * Math.PI * 2;
        positions.push(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
      }
      
      const lineGeometry = new THREE.BufferGeometry();
      lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      
      const circle = new THREE.Line(lineGeometry, i < 3 ? glowMaterial : lineMaterial);
      circle.userData = { initialRadius: radius, index: i };
      circles.push(circle);
      scene.add(circle);
    }

    // Simplified neural network shape creators
    const createNeuralNetwork = (size: number) => {
      const group = new THREE.Group();
      const nodes: THREE.Vector3[] = [];
      const nodeGeometry = new THREE.SphereGeometry(0.025, 8, 6);
      
      // Create fewer nodes (3-5 instead of 4-10)
      const numNodes = 3 + Math.floor(Math.random() * 3);
      for (let i = 0; i < numNodes; i++) {
        const node = new THREE.Mesh(nodeGeometry, neuralNodeMaterial);
        const pos = new THREE.Vector3(
          (Math.random() - 0.5) * size,
          (Math.random() - 0.5) * size,
          (Math.random() - 0.5) * size * 0.4
        );
        node.position.copy(pos);
        nodes.push(pos);
        group.add(node);
      }
      
      // Create fewer connections between nodes (30% chance instead of 60%)
      const edgeGeometry = new THREE.BufferGeometry();
      const edgePositions = [];
      
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          if (Math.random() < 0.3) {
            edgePositions.push(nodes[i].x, nodes[i].y, nodes[i].z);
            edgePositions.push(nodes[j].x, nodes[j].y, nodes[j].z);
          }
        }
      }
      
      edgeGeometry.setAttribute('position', new THREE.Float32BufferAttribute(edgePositions, 3));
      const edges = new THREE.LineSegments(edgeGeometry, neuralEdgeMaterial);
      group.add(edges);
      
      return group;
    };

    const createGraphCluster = (size: number) => {
      const group = new THREE.Group();
      const hubGeometry = new THREE.SphereGeometry(0.03, 8, 6);
      const satelliteGeometry = new THREE.SphereGeometry(0.02, 6, 4);
      
      // Central hub
      const hub = new THREE.Mesh(hubGeometry, neuralNodeMaterial);
      group.add(hub);
      
      // Fewer satellite nodes (2-4 instead of 3-7)
      const numSatellites = 2 + Math.floor(Math.random() * 3);
      const satellites: THREE.Vector3[] = [];
      
      for (let i = 0; i < numSatellites; i++) {
        const satellite = new THREE.Mesh(satelliteGeometry, neuralNodeMaterial);
        const angle = (i / numSatellites) * Math.PI * 2 + Math.random() * 0.5;
        const distance = size * (0.4 + Math.random() * 0.4);
        const pos = new THREE.Vector3(
          Math.cos(angle) * distance,
          Math.sin(angle) * distance,
          (Math.random() - 0.5) * size * 0.3
        );
        satellite.position.copy(pos);
        satellites.push(pos);
        group.add(satellite);
      }
      
      // Connect hub to satellites
      const connectionGeometry = new THREE.BufferGeometry();
      const connectionPositions: number[] = [];
      
      satellites.forEach(sat => {
        connectionPositions.push(0, 0, 0); // Hub position
        connectionPositions.push(sat.x, sat.y, sat.z);
      });
      
      connectionGeometry.setAttribute('position', new THREE.Float32BufferAttribute(connectionPositions, 3));
      const connections = new THREE.LineSegments(connectionGeometry, neuralEdgeMaterial);
      group.add(connections);
      
      return group;
    };

    const createNeuralBranch = (size: number) => {
      const group = new THREE.Group();
      const nodeGeometry = new THREE.SphereGeometry(0.022, 6, 4);
      
      // Create simpler branching structure
      const positions: number[] = [];
      const nodes: THREE.Vector3[] = [];
      
      // Root node
      const root = new THREE.Vector3(0, 0, 0);
      nodes.push(root);
      
      // Simplified branch creation - only 2 levels deep
      const createBranch = (parent: THREE.Vector3, depth: number, maxDepth: number) => {
        if (depth >= maxDepth) return;
        
        const numBranches = depth === 0 ? 2 + Math.floor(Math.random() * 2) : 1 + Math.floor(Math.random() * 2);
        
        for (let i = 0; i < numBranches; i++) {
          const angle = Math.random() * Math.PI * 2;
          const distance = size * (0.35 + Math.random() * 0.3) * (1 - depth * 0.3);
          const child = new THREE.Vector3(
            parent.x + Math.cos(angle) * distance,
            parent.y + Math.sin(angle) * distance,
            parent.z + (Math.random() - 0.5) * size * 0.15
          );
          
          nodes.push(child);
          
          // Add connection line
          positions.push(parent.x, parent.y, parent.z);
          positions.push(child.x, child.y, child.z);
          
          if (Math.random() < 0.6) { // 60% chance to continue branching (reduced from 80%)
            createBranch(child, depth + 1, maxDepth);
          }
        }
      };
      
      createBranch(root, 0, 2); // Reduced max depth from 3-5 to 2
      
      // Add nodes
      nodes.forEach(nodePos => {
        const node = new THREE.Mesh(nodeGeometry, neuralNodeMaterial);
        node.position.copy(nodePos);
        group.add(node);
      });
      
      // Add connections
      const branchGeometry = new THREE.BufferGeometry();
      branchGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      const branches = new THREE.LineSegments(branchGeometry, neuralEdgeMaterial);
      group.add(branches);
      
      return group;
    };

    const createDataFlow = (size: number) => {
      const group = new THREE.Group();
      const flowGeometry = new THREE.BufferGeometry();
      const nodeGeometry = new THREE.SphereGeometry(0.02, 6, 4);
      
      // Create simpler flow path with fewer points
      const pathPoints: THREE.Vector3[] = [];
      const numPoints = 3 + Math.floor(Math.random() * 2); // Reduced from 5-9 to 3-5
      
      for (let i = 0; i < numPoints; i++) {
        const t = i / (numPoints - 1);
        const curve = Math.sin(t * Math.PI * 2) * 0.3; // Reduced curve intensity
        pathPoints.push(new THREE.Vector3(
          (t - 0.5) * size,
          curve * size,
          (Math.random() - 0.5) * size * 0.25
        ));
      }
      
      // Add nodes at path points
      pathPoints.forEach(point => {
        const node = new THREE.Mesh(nodeGeometry, neuralNodeMaterial);
        node.position.copy(point);
        group.add(node);
      });
      
      // Create flow lines
      const flowPositions: number[] = [];
      for (let i = 0; i < pathPoints.length - 1; i++) {
        flowPositions.push(pathPoints[i].x, pathPoints[i].y, pathPoints[i].z);
        flowPositions.push(pathPoints[i + 1].x, pathPoints[i + 1].y, pathPoints[i + 1].z);
      }
      
      flowGeometry.setAttribute('position', new THREE.Float32BufferAttribute(flowPositions, 3));
      const flow = new THREE.LineSegments(flowGeometry, activeNeuralMaterial);
      group.add(flow);
      
      return group;
    };

    // Sacred geometry shape creators (made smaller)
    const createSacredTriangle = (size: number) => {
      const geometry = new THREE.BufferGeometry();
      const height = size * Math.sqrt(3) / 2;
      const vertices = [
        0, height * 0.6, 0,
        -size * 0.5, -height * 0.4, 0,
        size * 0.5, -height * 0.4, 0,
        0, 0, 0
      ];
      
      const indices = [0, 1, 1, 2, 2, 0, 0, 3, 1, 3, 2, 3];
      
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      geometry.setIndex(indices);
      return new THREE.LineSegments(geometry, glowMaterial);
    };

    const createGeometricDiamond = (size: number) => {
      const geometry = new THREE.BufferGeometry();
      const vertices = [
        0, size, 0, -size * 0.7, 0, 0, 0, -size, 0, size * 0.7, 0, 0,
        0, 0, size * 0.5, 0, 0, -size * 0.5
      ];
      
      const indices = [0, 1, 1, 2, 2, 3, 3, 0, 0, 4, 1, 4, 2, 4, 3, 4, 0, 5, 1, 5, 2, 5, 3, 5];
      
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      geometry.setIndex(indices);
      return new THREE.LineSegments(geometry, accentMaterial);
    };

    const createStarPattern = (size: number) => {
      const geometry = new THREE.BufferGeometry();
      const vertices = [];
      const numPoints = 6;
      
      // Outer points
      for (let i = 0; i < numPoints; i++) {
        const angle = (i / numPoints) * Math.PI * 2;
        vertices.push(Math.cos(angle) * size, Math.sin(angle) * size, 0);
      }
      
      // Inner points
      for (let i = 0; i < numPoints; i++) {
        const angle = (i / numPoints) * Math.PI * 2 + Math.PI / numPoints;
        vertices.push(Math.cos(angle) * size * 0.4, Math.sin(angle) * size * 0.4, 0);
      }
      
      vertices.push(0, 0, 0);
      
      const indices = [];
      for (let i = 0; i < numPoints; i++) {
        indices.push(i, i + numPoints);
        indices.push(i, (i + 1) % numPoints);
        indices.push(i + numPoints, 12);
      }
      
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      geometry.setIndex(indices);
      return new THREE.LineSegments(geometry, lineMaterial);
    };

    // Create floating geometric shapes
    const geometricShapes: THREE.Group[] = [];
    const originalShapeCreators = [createSacredTriangle, createGeometricDiamond, createStarPattern];
    const neuralShapeCreators = [createNeuralNetwork, createGraphCluster, createNeuralBranch, createDataFlow];
    
    for (let i = 0; i < 200; i++) {
      const group = new THREE.Group();
      
      // 50% chance for neural network shapes, 50% for original shapes (more balanced for debugging)
      const useNeural = Math.random() < 0.5;
      const shapeCreators = useNeural ? neuralShapeCreators : originalShapeCreators;
      const shapeType = Math.floor(Math.random() * shapeCreators.length);
      
      // Adjust size based on shape type
      const shapeSize = useNeural ? 
        0.6 + Math.random() * 0.6 : // Neural shapes 
        0.3 + Math.random() * 0.4; // Geometric shapes (increased for visibility)
      
      try {
        const shape = shapeCreators[shapeType](shapeSize);
        
        if (shape) {
          group.add(shape);
          
          const angle = (i / 200) * Math.PI * 2;
          const distance = 2.5 + Math.random() * 6; // Closer to center for better visibility
          group.position.x = Math.cos(angle) * distance + (Math.random() - 0.5) * 3;
          group.position.y = Math.sin(angle) * distance + (Math.random() - 0.5) * 3;
          group.position.z = (Math.random() - 0.5) * 8; // Reduced Z spread
          
          group.rotation.x = Math.random() * Math.PI * 2;
          group.rotation.y = Math.random() * Math.PI * 2;
          group.rotation.z = Math.random() * Math.PI * 2;
          
          group.userData = {
            rotationSpeed: {
              x: (Math.random() - 0.5) * 0.02,
              y: (Math.random() - 0.5) * 0.02,
              z: (Math.random() - 0.5) * 0.02
            },
            floatSpeed: Math.random() * 0.01 + 0.006,
            floatOffset: Math.random() * Math.PI * 2,
            pulseSpeed: Math.random() * 0.02 + 0.01,
            isNeural: useNeural
          };
          
          geometricShapes.push(group);
          scene.add(group);
        }
      } catch (error) {
        console.error('Error creating shape:', error);
      }
    }

    // Shooting stars setup - much slower with larger travel distance
    const shootingStars: Array<{
      position: THREE.Vector3;
      velocity: THREE.Vector3;
      trail: THREE.Vector3[];
      mesh: THREE.Mesh;
      line: THREE.Line;
      lifeTime: number;
      maxLifeTime: number;
      isActive: boolean;
    }> = [];

    const starMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xd4d4aa,
      transparent: true, 
      opacity: 0.9
    });

    const trailMaterial = new THREE.LineBasicMaterial({
      color: 0xd4d4aa,
      transparent: true,
      opacity: 0.6
    });

    // Create more shooting stars (increased from 45 to 60)
    for (let i = 0; i < 60; i++) {
      const starGeometry = new THREE.SphereGeometry(0.02, 8, 6);
      const starMesh = new THREE.Mesh(starGeometry, starMaterial);
      
      starMesh.visible = false;
      starMesh.frustumCulled = false;
      scene.add(starMesh);

      const trailGeometry = new THREE.BufferGeometry();
      const trailLine = new THREE.Line(trailGeometry, trailMaterial);
      trailLine.visible = false;
      trailLine.frustumCulled = false;
      scene.add(trailLine);

      shootingStars.push({
        position: new THREE.Vector3(),
        velocity: new THREE.Vector3(),
        trail: [],
        mesh: starMesh,
        line: trailLine,
        lifeTime: 0,
        maxLifeTime: 60,
        isActive: false
      });
    }

    // Animation loop
    let time = 0;
    const animate = () => {
      time += 0.01;
      
      // Animate circles
      circles.forEach((circle, index) => {
        const scale = 1 + Math.sin(time * 2 + index * 0.3) * 0.2;
        circle.scale.setScalar(scale);
        circle.rotation.z = time * 0.5 + index * 0.2;
        
        const opacity = 0.5 + Math.sin(time * 3 + index * 0.5) * 0.25;
        if (circle.material instanceof THREE.LineBasicMaterial) {
          circle.material.opacity = Math.max(opacity, 0.25);
        }
      });

      // Animate geometric shapes
      geometricShapes.forEach((shape) => {
        const data = shape.userData;
        
        shape.rotation.x += data.rotationSpeed.x;
        shape.rotation.y += data.rotationSpeed.y;
        shape.rotation.z += data.rotationSpeed.z;
        
        shape.position.y += Math.sin(time * data.floatSpeed + data.floatOffset) * 0.003;
        shape.position.x += Math.cos(time * data.floatSpeed * 0.7 + data.floatOffset) * 0.002;
        
        // Different pulsing for neural vs geometric shapes
        const pulse = data.isNeural ? 
          0.8 + Math.sin(time * data.pulseSpeed + data.floatOffset) * 0.15 :
          0.7 + Math.sin(time * 2 + data.floatOffset) * 0.25;
        shape.scale.setScalar(pulse);

        // Special animation for neural network elements
        if (data.isNeural) {
          shape.traverse((child) => {
            if (child instanceof THREE.LineSegments && child.material instanceof THREE.LineBasicMaterial) {
              // Animate neural connections
              const connectionOpacity = 0.3 + Math.sin(time * 3 + data.floatOffset) * 0.3;
              child.material.opacity = Math.max(connectionOpacity, 0.1);
            }
          });
        }
      });

      // Animate shooting stars with much slower movement and larger travel distance
      shootingStars.forEach((star) => {
        if (!star.isActive && Math.random() < 0.01) { // Reduced spawn rate for longer lasting stars
          // Spawn new shooting star - larger starting area for longer travel
          star.isActive = true;
          star.lifeTime = 0;
          star.maxLifeTime = 300 + Math.random() * 200; // Much longer lifespan for larger travel
          
          // Larger starting position range for longer travel distance
          star.position.set(
            (Math.random() - 0.5) * 20, // Much larger range ±10
            (Math.random() - 0.5) * 16, // Much larger range ±8
            (Math.random() - 0.5) * 12  // Larger Z depth range
          );
          
          // Much slower velocity - 10x slower than before
          const velocityMagnitude = 0.0002 + Math.random() * 0.0003; // Speed between 0.0002 and 0.0005 (10x slower)
          const angle = Math.random() * Math.PI * 2; // Random horizontal angle
          const verticalAngle = (Math.random() - 0.5) * Math.PI * 0.5; // Random vertical component
          
          star.velocity.set(
            Math.cos(angle) * Math.cos(verticalAngle) * velocityMagnitude,
            Math.sin(angle) * Math.cos(verticalAngle) * velocityMagnitude,
            Math.sin(verticalAngle) * velocityMagnitude * 0.3 // Less Z movement
          );
          
          star.trail = [star.position.clone()];
          star.mesh.position.copy(star.position);
          star.mesh.visible = true;
          star.line.visible = true;
        }
        
        if (star.isActive) {
          star.lifeTime++;
          
          // Update position
          star.position.add(star.velocity);
          star.mesh.position.copy(star.position);
          
          // Update trail
          star.trail.push(star.position.clone());
          if (star.trail.length > 15) { // Even longer trails for slower movement
            star.trail.shift();
          }
          
          // Update trail geometry
          if (star.trail.length > 1) {
            const positions: number[] = [];
            star.trail.forEach(pos => {
              positions.push(pos.x, pos.y, pos.z);
            });
            
            star.line.geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
            star.line.geometry.attributes.position.needsUpdate = true;
          }
          
          // Fade out
          const fadeRatio = Math.max(0, 1 - (star.lifeTime / star.maxLifeTime));
          if (star.mesh.material instanceof THREE.Material) {
            (star.mesh.material as THREE.MeshBasicMaterial).opacity = fadeRatio * 0.9;
          }
          if (star.line.material instanceof THREE.Material) {
            (star.line.material as THREE.LineBasicMaterial).opacity = fadeRatio * 0.6;
          }
          
          // Deactivate when life ends
          if (star.lifeTime >= star.maxLifeTime) {
            star.isActive = false;
            star.mesh.visible = false;
            star.line.visible = false;
            star.trail = [];
          }
        }
      });

      // Animate center text
      centerText.material.opacity = 0.7 + Math.sin(time * 1.8) * 0.15;

      // Camera movement
      camera.position.x = Math.sin(time * 0.3) * 0.5;
      camera.position.y = Math.cos(time * 0.2) * 0.3;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();

    // Handle window resize
    const handleResize = () => {
      if (!rendererRef.current || !mountRef.current || !camera) return;
      
      const containerWidth = mountRef.current.clientWidth;
      const containerHeight = mountRef.current.clientHeight;
      
      camera.aspect = containerWidth / containerHeight;
      camera.updateProjectionMatrix();
      
      rendererRef.current.setSize(containerWidth, containerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      if (rendererRef.current && mountRef.current && mountRef.current.contains(rendererRef.current.domElement)) {
        mountRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
      
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Line || object instanceof THREE.LineSegments) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
    };
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full bg-black overflow-hidden">
      <div 
        ref={mountRef} 
        className="absolute inset-0 w-full h-full"
        style={{ touchAction: 'none' }}
      />
      
      <div className="absolute bottom-8 left-0 right-0 text-center px-8">
        <p className="text-white text-lg md:text-xl font-light tracking-wide opacity-80">
          "The essential skill of the future is the ability to learn, unlearn, and relearn."
        </p>
      </div>
    </div>
  );
};

export default NuminousPortal;
</file>

<file path="components/submit-button.tsx">
"use client";

import { Button } from "@/components/ui/button";
import { type ComponentProps } from "react";
import { useFormStatus } from "react-dom";

type Props = ComponentProps<typeof Button> & {
  pendingText?: string;
};

export function SubmitButton({
  children,
  pendingText = "Submitting...",
  ...props
}: Props) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" aria-disabled={pending} {...props}>
      {pending ? pendingText : children}
    </Button>
  );
}
</file>

<file path="components/theme-switcher.tsx">
"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const ThemeSwitcher = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const ICON_SIZE = 16;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size={"sm"}>
          {theme === "light" ? (
            <Sun
              key="light"
              size={ICON_SIZE}
              className={"text-muted-foreground"}
            />
          ) : theme === "dark" ? (
            <Moon
              key="dark"
              size={ICON_SIZE}
              className={"text-muted-foreground"}
            />
          ) : (
            <Laptop
              key="system"
              size={ICON_SIZE}
              className={"text-muted-foreground"}
            />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-content" align="start">
        <DropdownMenuRadioGroup
          value={theme}
          onValueChange={(e) => setTheme(e)}
        >
          <DropdownMenuRadioItem className="flex gap-2" value="light">
            <Sun size={ICON_SIZE} className="text-muted-foreground" />{" "}
            <span>Light</span>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem className="flex gap-2" value="dark">
            <Moon size={ICON_SIZE} className="text-muted-foreground" />{" "}
            <span>Dark</span>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem className="flex gap-2" value="system">
            <Laptop size={ICON_SIZE} className="text-muted-foreground" />{" "}
            <span>System</span>
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export { ThemeSwitcher };
</file>

<file path="lib/utils.ts">
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
</file>

<file path="utils/supabase/client.ts">
import { createBrowserClient } from "@supabase/ssr";

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
</file>

<file path="utils/supabase/isEmailAllowed.ts">
import { type SupabaseClient } from "@supabase/supabase-js";

/**
 * Returns true if the e-mail is present in public.allowed_users
 */
export async function isEmailAllowed(
  supabase: SupabaseClient,
  email: string,
): Promise<boolean> {
  console.log(`Checking if email '${email}' is allowed...`);
  
  try {
    // First, debug by listing all allowed emails
    const allAllowedQuery = await supabase
      .from("allowed_users")
      .select("email");
    
    console.log('Available allowed emails:', allAllowedQuery.data);
    console.log('Query error (if any):', allAllowedQuery.error);
    
    // Now check the specific email
    const { data, error } = await supabase
      .from("allowed_users")
      .select("email")
      .eq("email", email.toLowerCase()) // normalise case if you like
      .maybeSingle();
    
    console.log(`Query for '${email}' returned:`, { data, error });
    
    if (error) {
      console.error('Error checking allowed email:', error);
      return false;
    }
    
    return !!data;
  } catch (e) {
    console.error('Exception in isEmailAllowed:', e);
    return false;
  }
}
</file>

<file path="utils/supabase/server.ts">
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const createClient = async () => {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    },
  );
};
</file>

<file path="utils/utils.ts">
import { redirect } from "next/navigation";

/**
 * Redirects to a specified path with an encoded message as a query parameter.
 * @param {('error' | 'success')} type - The type of message, either 'error' or 'success'.
 * @param {string} path - The path to redirect to.
 * @param {string} message - The message to be encoded and added as a query parameter.
 * @returns {never} This function doesn't return as it triggers a redirect.
 */
export function encodedRedirect(
  type: "error" | "success",
  path: string,
  message: string,
) {
  return redirect(`${path}?${type}=${encodeURIComponent(message)}`);
}
</file>

<file path=".dockerignore">
.git
node_modules
.next
*.log
</file>

<file path="CLAUDE.md">
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Development:
- `npm run dev` - Start development server on localhost:3000
- `npm run build` - Build production version
- `npm start` - Start production server

## Architecture

This is a Next.js 15 authentication application built with the App Router and Supabase backend. The key architectural components:

### Authentication Flow
- **Middleware-based protection**: `middleware.ts` handles route protection using Supabase session management
- **Email allowlist system**: Only emails present in `public.allowed_users` table can register (enforced in `signUpAction`)
- **Route structure**: 
  - `/` redirects authenticated users to `/protected`
  - `/protected/*` requires authentication, redirects to `/sign-in` if not authenticated
  - `(auth-pages)` group contains sign-in, sign-up, forgot-password with shared layout

### Key Files
- `app/actions.ts` - Server actions for auth operations (sign up, sign in, password reset, sign out)
- `utils/supabase/` - Supabase client configurations for different contexts (client, server, middleware)
- `utils/supabase/isEmailAllowed.ts` - Email allowlist validation function
- `middleware.ts` - Session management and route protection

### Environment Requirements
The app requires these environment variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key

### UI Components
- Built with Tailwind CSS and Radix UI components
- Theme switching with `next-themes`
- Custom 3D portal component (`components/numinous-portal.tsx`) using Three.js for visual effects
- Responsive layout with fixed navigation and footer

### Database Schema
The app expects a Supabase database with:
- `public.allowed_users` table with `email` column for registration allowlist
- Standard Supabase auth tables for user management
</file>

<file path="components.json">
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
</file>

<file path="Dockerfile">
# ---------- 1️⃣ Builder layer ----------
    FROM node:20-bookworm AS builder

    WORKDIR /app
    
    COPY package*.json ./
    RUN npm ci --ignore-scripts
    
    COPY . .
    
    # Next 14+ uses `next build` for static & server bundles
    RUN npm run build
    
    # ---------- 2️⃣ Runtime layer ----------
    FROM gcr.io/distroless/nodejs20-debian11
    
    WORKDIR /app
    
    # Copy only the files needed at runtime
    COPY --from=builder /app/package*.json ./
    COPY --from=builder /app/node_modules ./node_modules
    COPY --from=builder /app/.next ./.next
    COPY --from=builder /app/public ./public
    
    # Tell Cloud Run which port the app listens on
    ENV PORT=8080
    
    # Start Next.js in production mode.
    # App Router projects default to port 3000; Cloud Run routes 8080 ➜ 8080
    CMD ["node_modules/.bin/next", "start", "-p", "8080"]
</file>

<file path="middleware.ts">
import { type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
</file>

<file path="postcss.config.js">
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
</file>

<file path="tailwind.config.ts">
import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
</file>

<file path="tsconfig.json">
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
</file>

<file path="app/(auth-pages)/forgot-password/page.tsx">
import { forgotPasswordAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default async function ForgotPassword(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  return (
    <>
      <form className="flex-1 flex flex-col w-full gap-2 text-foreground [&>input]:mb-6 min-w-64 max-w-64 mx-auto">
        <div>
          <h1 className="text-2xl font-medium">Reset Password</h1>
          <p className="text-sm text-secondary-foreground">
            Already have an account?{" "}
            <Link className="text-primary underline" href="/sign-in">
              Sign in
            </Link>
          </p>
        </div>
        <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
          <Label htmlFor="email">Email</Label>
          <Input name="email" placeholder="you@example.com" required />
          <SubmitButton formAction={forgotPasswordAction}>
            Reset Password
          </SubmitButton>
          <FormMessage message={searchParams} />
        </div>
      </form>
    </>
  );
}
</file>

<file path="app/(auth-pages)/sign-in/page.tsx">
import { signInAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default async function Login(props: { searchParams: Promise<Message> }) {
  const searchParams = await props.searchParams;
  return (
    <form className="flex-1 flex flex-col min-w-64 max-w-64 mx-auto">
      <h1 className="text-2xl font-medium">Sign in</h1>
      <p className="text-sm text-foreground">
        Don't have an account?{" "}
        <Link className="text-foreground font-medium underline" href="/sign-up">
          Sign up
        </Link>
      </p>
      <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
        <Label htmlFor="email">Email</Label>
        <Input name="email" placeholder="you@example.com" required />
        <div className="flex justify-between items-center">
          <Label htmlFor="password">Password</Label>
          <Link
            className="text-xs text-foreground underline"
            href="/forgot-password"
          >
            Forgot Password?
          </Link>
        </div>
        <Input
          type="password"
          name="password"
          placeholder="Your password"
          required
        />
        <SubmitButton pendingText="Signing In..." formAction={signInAction}>
          Sign in
        </SubmitButton>
        <FormMessage message={searchParams} />
      </div>
    </form>
  );
}
</file>

<file path="app/(auth-pages)/sign-up/page.tsx">
import { signUpAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default async function Signup(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  if ("message" in searchParams) {
    return (
      <div className="w-full flex-1 flex items-center h-screen sm:max-w-md justify-center gap-2 p-4">
        <FormMessage message={searchParams} />
      </div>
    );
  }

  return (
    <>
      <form action={signUpAction} className="flex flex-col min-w-64 max-w-64 mx-auto">
        <h1 className="text-2xl font-medium">Sign up</h1>
        <p className="text-sm text text-foreground">
          Already have an account?{" "}
          <Link className="text-primary font-medium underline" href="/sign-in">
            Sign in
          </Link>
        </p>
        <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
          <Label htmlFor="email">Email</Label>
          <Input name="email" placeholder="you@example.com" required />
          <Label htmlFor="password">Password</Label>
          <Input
            type="password"
            name="password"
            placeholder="Your password"
            minLength={6}
            required
          />
          <SubmitButton pendingText="Signing up...">
            Sign up
          </SubmitButton>
          <FormMessage message={searchParams} />
        </div>
      </form>
    </>
  );
}
</file>

<file path="components/header-auth.tsx">
import { signOutAction } from "@/app/actions";
import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/utils/supabase/server";

export default async function AuthButton() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user ? (
    <div className="flex items-center gap-4">
      Hey, {user.email}!
      <form action={signOutAction}>
        <Button type="submit" variant={"outline"}>
          Sign out
        </Button>
      </form>
    </div>
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant={"outline"}>
        <Link href="/sign-in">Sign in</Link>
      </Button>
      <Button asChild size="sm" variant={"default"}>
        <Link href="/sign-up">Sign up</Link>
      </Button>
    </div>
  );
}
</file>

<file path="utils/supabase/middleware.ts">
import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export const updateSession = async (request: NextRequest) => {
  try {
    // Create an unmodified response
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value),
            );
            response = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options),
            );
          },
        },
      },
    );

    // This will refresh session if expired - required for Server Components
    // https://supabase.com/docs/guides/auth/server-side/nextjs
    const user = await supabase.auth.getUser();

    // protected routes
    if (request.nextUrl.pathname.startsWith("/protected") && user.error) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    if (request.nextUrl.pathname === "/" && !user.error) {
      return NextResponse.redirect(new URL("/protected", request.url));
    }

    return response;
  } catch (e) {
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }
};
</file>

<file path=".gitignore">
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.*
.yarn/*
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/versions

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local
.env
cloudrun.env

# Docker
docker-image.tar

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
</file>

<file path="next.config.ts">
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],
  }
};

export default nextConfig;
</file>

<file path="package.json">
{
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "@radix-ui/react-checkbox": "^1.1.1",
    "@radix-ui/react-dropdown-menu": "^2.1.1",
    "@radix-ui/react-label": "^2.1.0",
    "@radix-ui/react-slot": "^1.1.0",
    "@supabase/ssr": "latest",
    "@supabase/supabase-js": "latest",
    "autoprefixer": "10.4.20",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "lucide-react": "^0.468.0",
    "next": "latest",
    "next-themes": "^0.4.3",
    "prettier": "^3.3.3",
    "react": "19.0.0",
    "react-dom": "19.0.0",
    "three": "^0.177.0"
  },
  "devDependencies": {
    "@types/node": "22.10.2",
    "@types/react": "^19.0.2",
    "@types/react-dom": "19.0.2",
    "@types/three": "^0.176.0",
    "postcss": "8.4.49",
    "tailwind-merge": "^2.5.2",
    "tailwindcss": "3.4.17",
    "tailwindcss-animate": "^1.0.7",
    "typescript": "5.7.2"
  }
}
</file>

<file path="README.md">
# Authentication App

A simple authentication application built with Next.js and Supabase.

## Features

- Complete authentication system
  - Sign up
  - Sign in
  - Password reset
  - Protected routes
- Works across the entire Next.js stack
  - App Router
  - Middleware
  - Server Components
  - Client Components

## Getting Started

1. Clone this repository
   ```bash
   git clone <repository-url>
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn
   # or
   pnpm install
   ```

3. Create a `.env.local` file with your Supabase credentials
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. Run the development server
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Technology Stack

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/) for authentication
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [TypeScript](https://www.typescriptlang.org/) for type safety
</file>

<file path="app/protected/page.tsx">
import { createClient } from "@/utils/supabase/server";
import { signOutAction } from "@/app/actions";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import ControllerAutoSplash from "@/components/ui/ControllerAutoSplash";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-8">
      <div className="flex flex-col gap-6">
        <h2 className="font-bold text-2xl">Welcome!</h2>
        <ControllerAutoSplash />
      </div>
    </div>
  );
}
</file>

<file path="app/actions.ts">
"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isEmailAllowed } from "@/utils/supabase/isEmailAllowed";

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  if (!email || !password) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "Email and password are required",
    );
  }
  
  const allowed = await isEmailAllowed(supabase, email);
  if (!allowed) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "This e-mail address is not authorised to register.",
    );
  }

  console.log(`Attempting to sign up user with email: ${email}`);
  console.log(`Email redirect URL: ${origin}/auth/callback`);
  
  const { error, data } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    console.error('Supabase signup error:', { 
      code: error.code, 
      message: error.message
    });
    return encodedRedirect("error", "/sign-up", error.message);
  } else {
    return encodedRedirect(
      "success",
      "/sign-up",
      "Thanks for signing up! Please check your email for a verification link.",
    );
  }
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }

  return redirect("/protected");
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/protected/reset-password`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password",
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password.",
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password and confirm password are required",
    );
  }

  if (password !== confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Passwords do not match",
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password update failed",
    );
  }

  encodedRedirect("success", "/protected/reset-password", "Password updated");
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};
</file>

<file path="app/layout.tsx">
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import Link from "next/link";
import "./globals.css";
import AuthButton from "@/components/header-auth";

export const metadata = {
  title: "Authentication App",
  description: "A simple authentication application",
};

const geistSans = Geist({
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <main className="min-h-screen flex flex-col relative">
            {/* Navigation bar with fixed position */}
            <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16 bg-background z-10 relative">
              <div className="w-full max-w-7xl flex justify-between items-center p-3 px-5 text-sm">
                <div>
                  {/* Left side content/logo can go here */}
                </div>
                <div className="flex items-center gap-4">
                  <ThemeSwitcher />
                  <AuthButton />
                </div>
              </div>
            </nav>
            
            {/* Main content area with full height for the NuminousPortal */}
            <div className="flex-grow w-full">
              {children}
            </div>

            {/* Footer with relative position */}
            <footer className="w-full border-t py-6 text-center text-xs bg-background z-10 relative">
              <p className="text-foreground/60">
                © {new Date().getFullYear()} Fatima College for Health Sciences 
              </p>
            </footer>
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
</file>

<file path="app/page.tsx">
import NuminousPortal from "@/components/numinous-portal";
import ControllerAutoSplash from "@/components/ui/ControllerAutoSplash";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    return redirect("/protected");
  }

  return (
    <div className="w-full h-[calc(100vh-80px)] relative overflow-hidden">
      <ControllerAutoSplash />
      <NuminousPortal />
    </div>
  )
}
</file>

</files>
````

## File: app/(auth-pages)/layout.tsx
````typescript
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-7xl flex flex-col gap-12 items-start">{children}</div>
  );
}
````

## File: app/auth/callback/route.ts
````typescript
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // The `/auth/callback` route is required for the server-side auth flow implemented
  // by the SSR package. It exchanges an auth code for the user's session.
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;
  const redirectTo = requestUrl.searchParams.get("redirect_to")?.toString();

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  if (redirectTo) {
    return NextResponse.redirect(`${origin}${redirectTo}`);
  }

  // URL to redirect to after sign up process completes
  return NextResponse.redirect(`${origin}/protected`);
}
````

## File: app/protected/reset-password/page.tsx
````typescript
import { resetPasswordAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function ResetPassword(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  return (
    <form className="flex flex-col w-full max-w-md p-4 gap-2 [&>input]:mb-4">
      <h1 className="text-2xl font-medium">Reset password</h1>
      <p className="text-sm text-foreground/60">
        Please enter your new password below.
      </p>
      <Label htmlFor="password">New password</Label>
      <Input
        type="password"
        name="password"
        placeholder="New password"
        required
      />
      <Label htmlFor="confirmPassword">Confirm password</Label>
      <Input
        type="password"
        name="confirmPassword"
        placeholder="Confirm password"
        required
      />
      <SubmitButton formAction={resetPasswordAction}>
        Reset password
      </SubmitButton>
      <FormMessage message={searchParams} />
    </form>
  );
}
````

## File: app/globals.css
````css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 0 0% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 0 0% 3.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 0 0% 3.9%;
    --primary: 0 0% 9%;
    --primary-foreground: 0 0% 98%;
    --secondary: 0 0% 96.1%;
    --secondary-foreground: 0 0% 9%;
    --muted: 0 0% 96.1%;
    --muted-foreground: 0 0% 45.1%;
    --accent: 0 0% 96.1%;
    --accent-foreground: 0 0% 9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 0 0% 89.8%;
    --input: 0 0% 89.8%;
    --ring: 0 0% 3.9%;
    --radius: 0.5rem;
    --chart-1: 12 76% 61%;
    --chart-2: 173 58% 39%;
    --chart-3: 197 37% 24%;
    --chart-4: 43 74% 66%;
    --chart-5: 27 87% 67%;
  }

  .dark {
    --background: 0 0% 3.9%;
    --foreground: 0 0% 98%;
    --card: 0 0% 3.9%;
    --card-foreground: 0 0% 98%;
    --popover: 0 0% 3.9%;
    --popover-foreground: 0 0% 98%;
    --primary: 0 0% 98%;
    --primary-foreground: 0 0% 9%;
    --secondary: 0 0% 14.9%;
    --secondary-foreground: 0 0% 98%;
    --muted: 0 0% 14.9%;
    --muted-foreground: 0 0% 63.9%;
    --accent: 0 0% 14.9%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    --border: 0 0% 14.9%;
    --input: 0 0% 14.9%;
    --ring: 0 0% 83.1%;
    --chart-1: 220 70% 50%;
    --chart-2: 160 60% 45%;
    --chart-3: 30 80% 55%;
    --chart-4: 280 65% 60%;
    --chart-5: 340 75% 55%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
````

## File: components/typography/inline-code.tsx
````typescript
export function TypographyInlineCode() {
  return (
    <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
      @radix-ui/react-alert-dialog
    </code>
  );
}
````

## File: components/ui/AutoSplashCursor.tsx
````typescript
"use client";
import React, { useEffect, useRef } from "react";

interface ColorRGB {
  r: number;
  g: number;
  b: number;
}

// Animation configuration for autonomous movement
interface AnimationConfig {
  // Movement parameters
  speed: number;            // Base movement speed
  smoothness: number;       // How smooth the movement is (0-1)
  pauseChance: number;      // Chance of pausing movement (0-1)
  pauseDuration: number;    // Duration of pauses in ms
  edgeBounce: boolean;      // Whether to bounce off edges
  
  // Path parameters
  changeDirectionChance: number;  // Chance to change direction (0-1)
  directionChangeAmount: number;  // How much direction changes (radians)
  
  // Click/splat parameters
  clickChance: number;      // Chance of generating a "click" splat (0-1)
  clickIntensity: number;   // Intensity multiplier for click splats
  
  // Color parameters
  colorSpeed: number;       // Speed of color changes
  colorIntensity: number;   // Base color intensity
  colorMode: 'rainbow' | 'greyscale' | 'redHues' | 'custom'; // Color generation mode
  customColorHueRange?: [number, number];  // For custom color mode, hue range [0-1]
  customColorSaturation?: number;          // For custom mode, saturation value
  
  // Fade controls
  fadingRate?: number;                     // Override for DENSITY_DISSIPATION
  
  // Path mode controls
  pathMode: 'random' | 'circle' | 'constrained'; // Type of motion path
  pathRadius?: number;                      // For circle/constrained modes
  pathCenter?: [number, number];            // Center point for paths [x, y] in [0-1] range
  pathSpeed?: number;                       // Speed for predefined paths
  pathDirection?: 'clockwise' | 'counterclockwise'; // For circle mode
  
  // Starting position
  startPosition?: [number, number];         // Starting position [x, y] in [0-1] range
  
  // Spawn parameters
  spawnCount: number;       // Number of animation points to spawn
}

interface SplashCursorProps {
  // Original simulation parameters
  SIM_RESOLUTION?: number;
  DYE_RESOLUTION?: number;
  CAPTURE_RESOLUTION?: number;
  DENSITY_DISSIPATION?: number;
  VELOCITY_DISSIPATION?: number;
  PRESSURE?: number;
  PRESSURE_ITERATIONS?: number;
  CURL?: number;
  SPLAT_RADIUS?: number;
  SPLAT_FORCE?: number;
  SHADING?: boolean;
  COLOR_UPDATE_SPEED?: number;
  BACK_COLOR?: ColorRGB;
  TRANSPARENT?: boolean;
  
  // Animation configuration
  animation?: Partial<AnimationConfig>;
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
  // Animation specific properties
  direction: number;      // Direction in radians
  targetX: number;        // Target position
  targetY: number;
  moving: boolean;        // Whether currently moving
  pauseUntil: number;     // Timestamp until pause ends
  pathAngle?: number;     // For circular paths
}

function pointerPrototype(): Pointer {
  return {
    id: -1,
    texcoordX: 0.5,       // Start in center
    texcoordY: 0.5,
    prevTexcoordX: 0.5,
    prevTexcoordY: 0.5,
    deltaX: 0,
    deltaY: 0,
    down: false,
    moved: false,
    color: { r: 0, g: 0, b: 0 },
    direction: Math.random() * Math.PI * 2, // Random direction
    targetX: 0.5,
    targetY: 0.5,
    moving: true,
    pauseUntil: 0
  };
}

// Default animation config
const DEFAULT_ANIMATION_CONFIG: AnimationConfig = {
  speed: 0.002,             // Base movement speed
  smoothness: 0.92,         // How smooth the movement is (0-1)
  pauseChance: 0.005,       // Chance of pausing movement (0-1)
  pauseDuration: 500,       // Duration of pauses in ms
  edgeBounce: true,         // Whether to bounce off edges
  
  changeDirectionChance: 0.03, // Chance to change direction (0-1)
  directionChangeAmount: 0.5,  // How much direction changes (radians)
  
  clickChance: 0.01,        // Chance of generating a "click" splat (0-1)
  clickIntensity: 15,       // Intensity multiplier for click splats
  
  colorSpeed: 10,           // Speed of color changes
  colorIntensity: 0.15,     // Base color intensity
  colorMode: 'rainbow',     // Default to rainbow colors
  
  fadingRate: 3.5,          // Default to match DENSITY_DISSIPATION
  
  pathMode: 'random',       // Default to random movement
  pathRadius: 0.3,          // 30% of screen width
  pathCenter: [0.5, 0.5],   // Center of screen
  pathSpeed: 0.002,         // Same as default speed
  pathDirection: 'clockwise',
  
  startPosition: [0.5, 0.5], // Start in center
  
  spawnCount: 1             // Number of animation points
};

export default function AutoSplashCursor({
  SIM_RESOLUTION = 128,
  DYE_RESOLUTION = 1440,
  CAPTURE_RESOLUTION = 512,
  DENSITY_DISSIPATION = 3.5,
  VELOCITY_DISSIPATION = 2,
  PRESSURE = 0.1,
  PRESSURE_ITERATIONS = 20,
  CURL = 3,
  SPLAT_RADIUS = 0.2,
  SPLAT_FORCE = 6000,
  SHADING = true,
  COLOR_UPDATE_SPEED = 10,
  BACK_COLOR = { r: 0.5, g: 0, b: 0 },
  TRANSPARENT = true,
  animation = {}
}: SplashCursorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return; // Guard canvas early

    // Merge default animation config with provided options
    const animConfig: AnimationConfig = {
      ...DEFAULT_ANIMATION_CONFIG,
      ...animation
    };

    // Initialize pointers based on spawn count
    let pointers: Pointer[] = Array.from(
      { length: animConfig.spawnCount }, 
      () => {
        const p = pointerPrototype();
        // Set initial position from config if provided
        if (animConfig.startPosition) {
          p.texcoordX = animConfig.startPosition[0];
          p.texcoordY = animConfig.startPosition[1];
          p.prevTexcoordX = p.texcoordX;
          p.prevTexcoordY = p.texcoordY;
        }
        return p;
      }
    );

    // All these are guaranteed numbers due to destructuring defaults
    // So we cast them to remove TS warnings:
    let config = {
      SIM_RESOLUTION: SIM_RESOLUTION!,
      DYE_RESOLUTION: DYE_RESOLUTION!,
      CAPTURE_RESOLUTION: CAPTURE_RESOLUTION!,
      DENSITY_DISSIPATION: DENSITY_DISSIPATION!,
      VELOCITY_DISSIPATION: VELOCITY_DISSIPATION!,
      PRESSURE: PRESSURE!,
      PRESSURE_ITERATIONS: PRESSURE_ITERATIONS!,
      CURL: CURL!,
      SPLAT_RADIUS: SPLAT_RADIUS!,
      SPLAT_FORCE: SPLAT_FORCE!,
      SHADING,
      COLOR_UPDATE_SPEED: COLOR_UPDATE_SPEED!,
      PAUSED: false,
      BACK_COLOR,
      TRANSPARENT,
      ANIMATION: animConfig
    };

    // Get WebGL context (WebGL1 or WebGL2)
    const { gl, ext } = getWebGLContext(canvas);
    if (!gl || !ext) return;

    // If no linear filtering, reduce resolution
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

      let gl = canvas.getContext(
        "webgl2",
        params
      ) as WebGL2RenderingContext | null;

      if (!gl) {
        gl = (canvas.getContext("webgl", params) ||
          canvas.getContext(
            "experimental-webgl",
            params
          )) as WebGL2RenderingContext | null;
      }

      if (!gl) {
        throw new Error("Unable to initialize WebGL.");
      }

      const isWebGL2 = "drawBuffers" in gl;

      let supportLinearFiltering = false;
      let halfFloat = null;

      if (isWebGL2) {
        // For WebGL2
        (gl as WebGL2RenderingContext).getExtension("EXT_color_buffer_float");
        supportLinearFiltering = !!(gl as WebGL2RenderingContext).getExtension(
          "OES_texture_float_linear"
        );
      } else {
        // For WebGL1
        halfFloat = gl.getExtension("OES_texture_half_float");
        supportLinearFiltering = !!gl.getExtension(
          "OES_texture_half_float_linear"
        );
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
          halfFloatTexType
        );
        formatRG = getSupportedFormat(
          gl,
          (gl as WebGL2RenderingContext).RG16F,
          (gl as WebGL2RenderingContext).RG,
          halfFloatTexType
        );
        formatR = getSupportedFormat(
          gl,
          (gl as WebGL2RenderingContext).R16F,
          (gl as WebGL2RenderingContext).RED,
          halfFloatTexType
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
      type: number
    ): { internalFormat: number; format: number } | null {
      if (!supportRenderTextureFormat(gl, internalFormat, format, type)) {
        // For WebGL2 fallback:
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
      type: number
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
        null
      );

      const fbo = gl.createFramebuffer();
      if (!fbo) return false;

      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D,
        texture,
        0
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
      keywords: string[] | null = null
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
      fragmentShader: WebGLShader | null
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
          uniforms[uniformInfo.name] = gl.getUniformLocation(
            program,
            uniformInfo.name
          );
        }
      }
      return uniforms;
    }

    class Program {
      program: WebGLProgram | null;
      uniforms: Record<string, WebGLUniformLocation | null>;

      constructor(
        vertexShader: WebGLShader | null,
        fragmentShader: WebGLShader | null
      ) {
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

      constructor(
        vertexShader: WebGLShader | null,
        fragmentShaderSource: string
      ) {
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
            keywords
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

    // -------------------- Shaders --------------------
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
    `
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
    `
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
    `
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
    `
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
      ext.supportLinearFiltering ? null : ["MANUAL_FILTERING"]
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
    `
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
    `
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
    `
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
    `
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
    `
    );

    // -------------------- Fullscreen Triangles --------------------
    const blit = (() => {
      const buffer = gl.createBuffer()!;
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]),
        gl.STATIC_DRAW
      );
      const elemBuffer = gl.createBuffer()!;
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elemBuffer);
      gl.bufferData(
        gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array([0, 1, 2, 0, 2, 3]),
        gl.STATIC_DRAW
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

    // Types for Framebuffers
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

    // FBO variables
    let dye: DoubleFBO;
    let velocity: DoubleFBO;
    let divergence: FBO;
    let curl: FBO;
    let pressure: DoubleFBO;

    // WebGL Programs
    const copyProgram = new Program(baseVertexShader, copyShader);
    const clearProgram = new Program(baseVertexShader, clearShader);
    const splatProgram = new Program(baseVertexShader, splatShader);
    const advectionProgram = new Program(baseVertexShader, advectionShader);
    const divergenceProgram = new Program(baseVertexShader, divergenceShader);
    const curlProgram = new Program(baseVertexShader, curlShader);
    const vorticityProgram = new Program(baseVertexShader, vorticityShader);
    const pressureProgram = new Program(baseVertexShader, pressureShader);
    const gradienSubtractProgram = new Program(
      baseVertexShader,
      gradientSubtractShader
    );
    const displayMaterial = new Material(baseVertexShader, displayShaderSource);

    // -------------------- FBO creation --------------------
    function createFBO(
      w: number,
      h: number,
      internalFormat: number,
      format: number,
      type: number,
      param: number
    ): FBO {
      gl.activeTexture(gl.TEXTURE0);
      const texture = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, param);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, param);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        internalFormat,
        w,
        h,
        0,
        format,
        type,
        null
      );
      const fbo = gl.createFramebuffer()!;
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D,
        texture,
        0
      );
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
      param: number
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
      param: number
    ) {
      const newFBO = createFBO(w, h, internalFormat, format, type, param);
      copyProgram.bind();
      if (copyProgram.uniforms.uTexture)
        gl.uniform1i(copyProgram.uniforms.uTexture, target.attach(0));
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
      param: number
    ) {
      if (target.width === w && target.height === h) return target;
      target.read = resizeFBO(
        target.read,
        w,
        h,
        internalFormat,
        format,
        type,
        param
      );
      target.write = createFBO(w, h, internalFormat, format, type, param);
      target.width = w;
      target.height = h;
      target.texelSizeX = 1 / w;
      target.texelSizeY = 1 / h;
      return target;
    }

    function initFramebuffers() {
      const simRes = getResolution(config.SIM_RESOLUTION!);
      const dyeRes = getResolution(config.DYE_RESOLUTION!);

      const texType = ext.halfFloatTexType;
      const rgba = ext.formatRGBA;
      const rg = ext.formatRG;
      const r = ext.formatR;
      const filtering = ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST;
      gl.disable(gl.BLEND);

      if (!dye) {
        dye = createDoubleFBO(
          dyeRes.width,
          dyeRes.height,
          rgba.internalFormat,
          rgba.format,
          texType,
          filtering
        );
      } else {
        dye = resizeDoubleFBO(
          dye,
          dyeRes.width,
          dyeRes.height,
          rgba.internalFormat,
          rgba.format,
          texType,
          filtering
        );
      }

      if (!velocity) {
        velocity = createDoubleFBO(
          simRes.width,
          simRes.height,
          rg.internalFormat,
          rg.format,
          texType,
          filtering
        );
      } else {
        velocity = resizeDoubleFBO(
          velocity,
          simRes.width,
          simRes.height,
          rg.internalFormat,
          rg.format,
          texType,
          filtering
        );
      }

      divergence = createFBO(
        simRes.width,
        simRes.height,
        r.internalFormat,
        r.format,
        texType,
        gl.NEAREST
      );
      curl = createFBO(
        simRes.width,
        simRes.height,
        r.internalFormat,
        r.format,
        texType,
        gl.NEAREST
      );
      pressure = createDoubleFBO(
        simRes.width,
        simRes.height,
        r.internalFormat,
        r.format,
        texType,
        gl.NEAREST
      );
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

    // -------------------- Simulation Setup --------------------
    updateKeywords();
    initFramebuffers();

    let lastUpdateTime = Date.now();
    let colorUpdateTimer = 0.0;
    let animationStarted = false;

    function updateFrame() {
      const dt = calcDeltaTime();
      if (resizeCanvas()) initFramebuffers();
      
      // Apply custom fading rate if provided
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

    // New function to update autonomous movement of pointers
    function updateAutonomousMovement(dt: number) {
      const anim = config.ANIMATION;
      const now = Date.now();
      
      pointers.forEach((pointer) => {
        // Handle pausing
        if (pointer.pauseUntil > now) {
          return; // Skip updating this pointer until pause is over
        }
        
        // Random pause
        if (Math.random() < anim.pauseChance) {
          pointer.pauseUntil = now + anim.pauseDuration;
          return;
        }
        
        // Store previous position
        pointer.prevTexcoordX = pointer.texcoordX;
        pointer.prevTexcoordY = pointer.texcoordY;
        
        // Handle different path modes
        switch(anim.pathMode) {
          case 'circle': {
            // Circular motion around pathCenter
            const center = anim.pathCenter ?? [0.5, 0.5];
            const radius = anim.pathRadius ?? 0.3; // Default 30% of screen
            const speed = anim.pathSpeed ?? anim.speed;
            const clockwise = anim.pathDirection !== 'counterclockwise';
            
            // Initialize pathAngle if not already set
            if (pointer.pathAngle === undefined) {
              pointer.pathAngle = Math.random() * Math.PI * 2;
            }
            
            // Update angle based on speed and direction
            const angleChange = speed * (clockwise ? 1 : -1) * 10; // Multiply by 10 for better visibility
            pointer.pathAngle += angleChange;
            
            // Calculate new position on circle
            pointer.texcoordX = center[0] + Math.cos(pointer.pathAngle) * radius;
            pointer.texcoordY = center[1] + Math.sin(pointer.pathAngle) * radius;
            
            break;
          }
          
          case 'constrained': {
            // Random motion constrained within a radius
            const center = anim.pathCenter ?? [0.5, 0.5];
            const radius = anim.pathRadius ?? 0.3;
            
            // Update with random direction changes
            if (Math.random() < anim.changeDirectionChance) {
              pointer.direction += (Math.random() * 2 - 1) * anim.directionChangeAmount;
            }
            
            // Calculate new position
            const dx = Math.cos(pointer.direction) * anim.speed;
            const dy = Math.sin(pointer.direction) * anim.speed;
            
            pointer.texcoordX += dx;
            pointer.texcoordY += dy;
            
            // Check if outside constraint radius and bounce if needed
            const distX = pointer.texcoordX - center[0];
            const distY = pointer.texcoordY - center[1];
            const distance = Math.sqrt(distX * distX + distY * distY);
            
            if (distance > radius) {
              // Bounce off invisible boundary
              // Calculate reflection vector
              const normalX = distX / distance;
              const normalY = distY / distance;
              
              // Calculate dot product of velocity and normal
              const dot = 2 * (dx * normalX + dy * normalY);
              
              // Calculate reflection direction
              pointer.direction = Math.atan2(
                dy - dot * normalY, 
                dx - dot * normalX
              );
              
              // Place back on boundary
              pointer.texcoordX = center[0] + normalX * radius;
              pointer.texcoordY = center[1] + normalY * radius;
            }
            
            break;
          }
          
          case 'random':
          default: {
            // Original random movement logic
            if (Math.random() < anim.changeDirectionChance) {
              pointer.direction += (Math.random() * 2 - 1) * anim.directionChangeAmount;
            }
            
            // Calculate new position
            const dx = Math.cos(pointer.direction) * anim.speed;
            const dy = Math.sin(pointer.direction) * anim.speed;
            
            pointer.texcoordX += dx;
            pointer.texcoordY += dy;
            
            // Handle edge bouncing
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
              // Wrap around if not bouncing
              pointer.texcoordX = wrap(pointer.texcoordX, 0, 1);
              pointer.texcoordY = wrap(pointer.texcoordY, 0, 1);
            }
            
            break;
          }
        }
        
        // Calculate deltas for fluid simulation
        pointer.deltaX = correctDeltaX(pointer.texcoordX - pointer.prevTexcoordX)!;
        pointer.deltaY = correctDeltaY(pointer.texcoordY - pointer.prevTexcoordY)!;
        
        // Mark as moved if there's significant movement
        pointer.moved = 
          Math.abs(pointer.deltaX) > 0.0001 || 
          Math.abs(pointer.deltaY) > 0.0001;
        
        // Random "click" effect
        if (Math.random() < anim.clickChance) {
          clickSplat(pointer);
        }
        
        // Regular movement splat if moved
        if (pointer.moved) {
          splatPointer(pointer);
        }
      });
    }

    function step(dt: number) {
      gl.disable(gl.BLEND);

      // Curl
      curlProgram.bind();
      if (curlProgram.uniforms.texelSize) {
        gl.uniform2f(
          curlProgram.uniforms.texelSize,
          velocity.texelSizeX,
          velocity.texelSizeY
        );
      }
      if (curlProgram.uniforms.uVelocity) {
        gl.uniform1i(curlProgram.uniforms.uVelocity, velocity.read.attach(0));
      }
      blit(curl);

      // Vorticity
      vorticityProgram.bind();
      if (vorticityProgram.uniforms.texelSize) {
        gl.uniform2f(
          vorticityProgram.uniforms.texelSize,
          velocity.texelSizeX,
          velocity.texelSizeY
        );
      }
      if (vorticityProgram.uniforms.uVelocity) {
        gl.uniform1i(
          vorticityProgram.uniforms.uVelocity,
          velocity.read.attach(0)
        );
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

      // Divergence
      divergenceProgram.bind();
      if (divergenceProgram.uniforms.texelSize) {
        gl.uniform2f(
          divergenceProgram.uniforms.texelSize,
          velocity.texelSizeX,
          velocity.texelSizeY
        );
      }
      if (divergenceProgram.uniforms.uVelocity) {
        gl.uniform1i(
          divergenceProgram.uniforms.uVelocity,
          velocity.read.attach(0)
        );
      }
      blit(divergence);

      // Clear pressure
      clearProgram.bind();
      if (clearProgram.uniforms.uTexture) {
        gl.uniform1i(clearProgram.uniforms.uTexture, pressure.read.attach(0));
      }
      if (clearProgram.uniforms.value) {
        gl.uniform1f(clearProgram.uniforms.value, config.PRESSURE);
      }
      blit(pressure.write);
      pressure.swap();

      // Pressure
      pressureProgram.bind();
      if (pressureProgram.uniforms.texelSize) {
        gl.uniform2f(
          pressureProgram.uniforms.texelSize,
          velocity.texelSizeX,
          velocity.texelSizeY
        );
      }
      if (pressureProgram.uniforms.uDivergence) {
        gl.uniform1i(
          pressureProgram.uniforms.uDivergence,
          divergence.attach(0)
        );
      }
      for (let i = 0; i < config.PRESSURE_ITERATIONS; i++) {
        if (pressureProgram.uniforms.uPressure) {
          gl.uniform1i(
            pressureProgram.uniforms.uPressure,
            pressure.read.attach(1)
          );
        }
        blit(pressure.write);
        pressure.swap();
      }

      // Gradient Subtract
      gradienSubtractProgram.bind();
      if (gradienSubtractProgram.uniforms.texelSize) {
        gl.uniform2f(
          gradienSubtractProgram.uniforms.texelSize,
          velocity.texelSizeX,
          velocity.texelSizeY
        );
      }
      if (gradienSubtractProgram.uniforms.uPressure) {
        gl.uniform1i(
          gradienSubtractProgram.uniforms.uPressure,
          pressure.read.attach(0)
        );
      }
      if (gradienSubtractProgram.uniforms.uVelocity) {
        gl.uniform1i(
          gradienSubtractProgram.uniforms.uVelocity,
          velocity.read.attach(1)
        );
      }
      blit(velocity.write);
      velocity.swap();

      // Advection - velocity
      advectionProgram.bind();
      if (advectionProgram.uniforms.texelSize) {
        gl.uniform2f(
          advectionProgram.uniforms.texelSize,
          velocity.texelSizeX,
          velocity.texelSizeY
        );
      }
      if (
        !ext.supportLinearFiltering &&
        advectionProgram.uniforms.dyeTexelSize
      ) {
        gl.uniform2f(
          advectionProgram.uniforms.dyeTexelSize,
          velocity.texelSizeX,
          velocity.texelSizeY
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
        gl.uniform1f(
          advectionProgram.uniforms.dissipation,
          config.VELOCITY_DISSIPATION
        );
      }
      blit(velocity.write);
      velocity.swap();

      // Advection - dye
      if (
        !ext.supportLinearFiltering &&
        advectionProgram.uniforms.dyeTexelSize
      ) {
        gl.uniform2f(
          advectionProgram.uniforms.dyeTexelSize,
          dye.texelSizeX,
          dye.texelSizeY
        );
      }
      if (advectionProgram.uniforms.uVelocity) {
        gl.uniform1i(
          advectionProgram.uniforms.uVelocity,
          velocity.read.attach(0)
        );
      }
      if (advectionProgram.uniforms.uSource) {
        gl.uniform1i(advectionProgram.uniforms.uSource, dye.read.attach(1));
      }
      if (advectionProgram.uniforms.dissipation) {
        gl.uniform1f(
          advectionProgram.uniforms.dissipation,
          config.DENSITY_DISSIPATION
        );
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

    // -------------------- Interaction --------------------
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

    function splat(
      x: number,
      y: number,
      dx: number,
      dy: number,
      color: ColorRGB
    ) {
      splatProgram.bind();
      if (splatProgram.uniforms.uTarget) {
        gl.uniform1i(splatProgram.uniforms.uTarget, velocity.read.attach(0));
      }
      if (splatProgram.uniforms.aspectRatio) {
        gl.uniform1f(
          splatProgram.uniforms.aspectRatio,
          canvas!.width / canvas!.height
        );
      }
      if (splatProgram.uniforms.point) {
        gl.uniform2f(splatProgram.uniforms.point, x, y);
      }
      if (splatProgram.uniforms.color) {
        gl.uniform3f(splatProgram.uniforms.color, dx, dy, 0);
      }
      if (splatProgram.uniforms.radius) {
        gl.uniform1f(
          splatProgram.uniforms.radius,
          correctRadius(config.SPLAT_RADIUS / 100)!
        );
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
      // Use non-null assertion (canvas can't be null here)
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
      
      switch(anim.colorMode) {
        case 'greyscale': {
          const value = Math.random() * anim.colorIntensity;
          return { r: value, g: value, b: value };
        }
        
        case 'redHues': {
          // Red hues: keep high R value, low G/B values
          return { 
            r: (0.5 + Math.random() * 0.5) * anim.colorIntensity, 
            g: Math.random() * 0.3 * anim.colorIntensity, 
            b: Math.random() * 0.3 * anim.colorIntensity 
          };
        }
        
        case 'custom': {
          if (anim.customColorHueRange) {
            // Use custom hue range but keep HSV conversion
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
          // Fall through to rainbow if not properly configured
        }
        
        case 'rainbow':
        default: {
          // Existing rainbow generation
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

    // Start the animation immediately
    updateFrame();
    
  }, [
    SIM_RESOLUTION,
    DYE_RESOLUTION,
    CAPTURE_RESOLUTION,
    DENSITY_DISSIPATION,
    VELOCITY_DISSIPATION,
    PRESSURE,
    PRESSURE_ITERATIONS,
    CURL,
    SPLAT_RADIUS,
    SPLAT_FORCE,
    SHADING,
    COLOR_UPDATE_SPEED,
    BACK_COLOR,
    TRANSPARENT,
    animation,
  ]);

  return (
    <div className="relative w-full h-full">
      <canvas ref={canvasRef} id="fluid" className="w-full h-full block"></canvas>
    </div>
  );
}
````

## File: components/ui/badge.tsx
````typescript
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
````

## File: components/ui/button.tsx
````typescript
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
````

## File: components/ui/checkbox.tsx
````typescript
"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("flex items-center justify-center text-current")}
    >
      <Check className="h-4 w-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
````

## File: components/ui/ControllerAutoSplash.tsx
````typescript
"use client";
import AutoSplashCursor from "./AutoSplashCursor";

export default function ControllerAutoSplash() {
  // Example animation config demonstrating all new parameters
  const animationConfig = {
    // Movement parameters
    speed: 0.011,                // Base movement speed
    smoothness: 0.82,           // How smooth the movement is (0-1)
    pauseChance: 0.001,          // Chance of pausing movement (0-1)
    pauseDuration: 500,         // Duration of pauses in ms
    
    // Direction parameters
    changeDirectionChance: 0.6, // Chance to change direction (0-1)
    directionChangeAmount: 0.6,  // How much direction changes (radians)
    
    // Click parameters
    clickChance: 0.3,           // Chance of generating a "click" splat (0-1)
    clickIntensity: 3,          // Intensity multiplier for click splats
    
    // Color parameters
    colorMode: 'greyscale' as 'greyscale',  // Type assertion to specific literal type
    colorIntensity: 0.052,        // Base color intensity
    customColorHueRange: [0.5, 0.7] as [number, number], // Optional: for 'custom' mode, hue range [0-1]
    customColorSaturation: 0.5,      // Optional: for 'custom' mode, saturation value
    
    // Path parameters
    pathMode: 'random' as 'random',    // Options: 'random', 'circle', 'constrained'
    pathRadius: 0.1,            // For circle/constrained: radius as portion of screen
    pathCenter: [0.1, 0.9] as [number, number],  // Center of path [x, y] in range [0-1]
    pathDirection: 'clockwise' as 'clockwise', // For circle mode: 'clockwise' or 'counterclockwise'
    
    // Starting position
    startPosition: [0.1, 0.9] as [number, number],  // Start position [x, y] in range [0-1]
    
    // Fading rate
    fadingRate: 0.9,            // Override for density dissipation (faster fading)
    
    // Spawn count
    spawnCount: 1               // Two independent animation points
  };

  return (
    <div className="w-full h-full absolute inset-0 overflow-hidden pointer-events-none">
      <AutoSplashCursor 
        CURL={3}                 // Fluid physics parameter
        SPLAT_FORCE={10000}       // Increase the force of splats
        animation={animationConfig}
      />
    </div>
  );
}
````

## File: components/ui/dropdown-menu.tsx
````typescript
"use client";

import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { Check, ChevronRight, Circle } from "lucide-react";

import { cn } from "@/lib/utils";

const DropdownMenu = DropdownMenuPrimitive.Root;

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

const DropdownMenuGroup = DropdownMenuPrimitive.Group;

const DropdownMenuPortal = DropdownMenuPrimitive.Portal;

const DropdownMenuSub = DropdownMenuPrimitive.Sub;

const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

const DropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & {
    inset?: boolean;
  }
>(({ className, inset, children, ...props }, ref) => (
  <DropdownMenuPrimitive.SubTrigger
    ref={ref}
    className={cn(
      "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent",
      inset && "pl-8",
      className,
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto h-4 w-4" />
  </DropdownMenuPrimitive.SubTrigger>
));
DropdownMenuSubTrigger.displayName =
  DropdownMenuPrimitive.SubTrigger.displayName;

const DropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.SubContent
    ref={ref}
    className={cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className,
    )}
    {...props}
  />
));
DropdownMenuSubContent.displayName =
  DropdownMenuPrimitive.SubContent.displayName;

const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className,
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
));
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      inset && "pl-8",
      className,
    )}
    {...props}
  />
));
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;

const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <DropdownMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className,
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.CheckboxItem>
));
DropdownMenuCheckboxItem.displayName =
  DropdownMenuPrimitive.CheckboxItem.displayName;

const DropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className,
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Circle className="h-2 w-2 fill-current" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.RadioItem>
));
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName;

const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn(
      "px-2 py-1.5 text-sm font-semibold",
      inset && "pl-8",
      className,
    )}
    {...props}
  />
));
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName;

const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
));
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;

const DropdownMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn("ml-auto text-xs tracking-widest opacity-60", className)}
      {...props}
    />
  );
};
DropdownMenuShortcut.displayName = "DropdownMenuShortcut";

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
};
````

## File: components/ui/input.tsx
````typescript
import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
````

## File: components/ui/label.tsx
````typescript
"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
);

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
));
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
````

## File: components/form-message.tsx
````typescript
export type Message =
  | { success: string }
  | { error: string }
  | { message: string };

export function FormMessage({ message }: { message: Message }) {
  return (
    <div className="flex flex-col gap-2 w-full max-w-md text-sm">
      {"success" in message && (
        <div className="text-foreground border-l-2 border-foreground px-4">
          {message.success}
        </div>
      )}
      {"error" in message && (
        <div className="text-destructive-foreground border-l-2 border-destructive-foreground px-4">
          {message.error}
        </div>
      )}
      {"message" in message && (
        <div className="text-foreground border-l-2 px-4">{message.message}</div>
      )}
    </div>
  );
}
````

## File: components/numinous-portal.tsx
````typescript
'use client';

import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

const NuminousPortal: React.FC = () => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    // Get container dimensions
    const containerWidth = mountRef.current.clientWidth;
    const containerHeight = mountRef.current.clientHeight;
    
    const camera = new THREE.PerspectiveCamera(75, containerWidth / containerHeight, 0.1, 100);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerWidth, containerHeight);
    renderer.setClearColor(0x000000, 1);
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    // Materials
    const unifiedMaterial = new THREE.LineBasicMaterial({ 
      color: 0xd4d4aa,
      transparent: true, 
      opacity: 0.8
    });
    
    const lineMaterial = new THREE.LineBasicMaterial({ 
      color: 0xd4d4aa,
      transparent: true, 
      opacity: 0.7
    });
    
    const glowMaterial = new THREE.LineBasicMaterial({ 
      color: 0xd4d4aa,
      transparent: true, 
      opacity: 0.9
    });
    
    const accentMaterial = new THREE.LineBasicMaterial({ 
      color: 0xd4d4aa,
      transparent: true, 
      opacity: 0.8
    });

    // Neural network materials
    const neuralNodeMaterial = new THREE.MeshBasicMaterial({
      color: 0xd4d4aa,
      transparent: true,
      opacity: 0.7
    });

    const neuralEdgeMaterial = new THREE.LineBasicMaterial({
      color: 0xd4d4aa,
      transparent: true,
      opacity: 0.5
    });

    const activeNeuralMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.8
    });

    // Create text texture function
    const createTextTexture = (text: string, fontSize: number = 32, color: string = '#ffffff') => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d')!;
      
      canvas.width = 512;
      canvas.height = 128;
      
      context.fillStyle = color;
      context.font = `${fontSize}px Arial, sans-serif`;
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.fillText(text, canvas.width / 2, canvas.height / 2);
      
      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;
      return texture;
    };

    // Center text
    const centerTextTexture = createTextTexture('Fatima College', 34, '#ffffff');
    const centerTextMaterial = new THREE.MeshBasicMaterial({ 
      map: centerTextTexture, 
      transparent: true,
      opacity: 0.8
    });
    const centerTextGeometry = new THREE.PlaneGeometry(2, 0.5);
    const centerText = new THREE.Mesh(centerTextGeometry, centerTextMaterial);
    centerText.position.set(0, 0, 0.1);
    scene.add(centerText);

    // Create concentric circles
    const circles: THREE.Line[] = [];
    const numCircles = 8;
    
    for (let i = 0; i < numCircles; i++) {
      const radius = 0.5 + i * 0.3;
      const positions = [];
      
      for (let j = 0; j <= 64; j++) {
        const angle = (j / 64) * Math.PI * 2;
        positions.push(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
      }
      
      const lineGeometry = new THREE.BufferGeometry();
      lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      
      const circle = new THREE.Line(lineGeometry, i < 3 ? glowMaterial : lineMaterial);
      circle.userData = { initialRadius: radius, index: i };
      circles.push(circle);
      scene.add(circle);
    }

    // Simplified neural network shape creators
    const createNeuralNetwork = (size: number) => {
      const group = new THREE.Group();
      const nodes: THREE.Vector3[] = [];
      const nodeGeometry = new THREE.SphereGeometry(0.025, 8, 6);
      
      // Create fewer nodes (3-5 instead of 4-10)
      const numNodes = 3 + Math.floor(Math.random() * 3);
      for (let i = 0; i < numNodes; i++) {
        const node = new THREE.Mesh(nodeGeometry, neuralNodeMaterial);
        const pos = new THREE.Vector3(
          (Math.random() - 0.5) * size,
          (Math.random() - 0.5) * size,
          (Math.random() - 0.5) * size * 0.4
        );
        node.position.copy(pos);
        nodes.push(pos);
        group.add(node);
      }
      
      // Create fewer connections between nodes (30% chance instead of 60%)
      const edgeGeometry = new THREE.BufferGeometry();
      const edgePositions = [];
      
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          if (Math.random() < 0.3) {
            edgePositions.push(nodes[i].x, nodes[i].y, nodes[i].z);
            edgePositions.push(nodes[j].x, nodes[j].y, nodes[j].z);
          }
        }
      }
      
      edgeGeometry.setAttribute('position', new THREE.Float32BufferAttribute(edgePositions, 3));
      const edges = new THREE.LineSegments(edgeGeometry, neuralEdgeMaterial);
      group.add(edges);
      
      return group;
    };

    const createGraphCluster = (size: number) => {
      const group = new THREE.Group();
      const hubGeometry = new THREE.SphereGeometry(0.03, 8, 6);
      const satelliteGeometry = new THREE.SphereGeometry(0.02, 6, 4);
      
      // Central hub
      const hub = new THREE.Mesh(hubGeometry, neuralNodeMaterial);
      group.add(hub);
      
      // Fewer satellite nodes (2-4 instead of 3-7)
      const numSatellites = 2 + Math.floor(Math.random() * 3);
      const satellites: THREE.Vector3[] = [];
      
      for (let i = 0; i < numSatellites; i++) {
        const satellite = new THREE.Mesh(satelliteGeometry, neuralNodeMaterial);
        const angle = (i / numSatellites) * Math.PI * 2 + Math.random() * 0.5;
        const distance = size * (0.4 + Math.random() * 0.4);
        const pos = new THREE.Vector3(
          Math.cos(angle) * distance,
          Math.sin(angle) * distance,
          (Math.random() - 0.5) * size * 0.3
        );
        satellite.position.copy(pos);
        satellites.push(pos);
        group.add(satellite);
      }
      
      // Connect hub to satellites
      const connectionGeometry = new THREE.BufferGeometry();
      const connectionPositions: number[] = [];
      
      satellites.forEach(sat => {
        connectionPositions.push(0, 0, 0); // Hub position
        connectionPositions.push(sat.x, sat.y, sat.z);
      });
      
      connectionGeometry.setAttribute('position', new THREE.Float32BufferAttribute(connectionPositions, 3));
      const connections = new THREE.LineSegments(connectionGeometry, neuralEdgeMaterial);
      group.add(connections);
      
      return group;
    };

    const createNeuralBranch = (size: number) => {
      const group = new THREE.Group();
      const nodeGeometry = new THREE.SphereGeometry(0.022, 6, 4);
      
      // Create simpler branching structure
      const positions: number[] = [];
      const nodes: THREE.Vector3[] = [];
      
      // Root node
      const root = new THREE.Vector3(0, 0, 0);
      nodes.push(root);
      
      // Simplified branch creation - only 2 levels deep
      const createBranch = (parent: THREE.Vector3, depth: number, maxDepth: number) => {
        if (depth >= maxDepth) return;
        
        const numBranches = depth === 0 ? 2 + Math.floor(Math.random() * 2) : 1 + Math.floor(Math.random() * 2);
        
        for (let i = 0; i < numBranches; i++) {
          const angle = Math.random() * Math.PI * 2;
          const distance = size * (0.35 + Math.random() * 0.3) * (1 - depth * 0.3);
          const child = new THREE.Vector3(
            parent.x + Math.cos(angle) * distance,
            parent.y + Math.sin(angle) * distance,
            parent.z + (Math.random() - 0.5) * size * 0.15
          );
          
          nodes.push(child);
          
          // Add connection line
          positions.push(parent.x, parent.y, parent.z);
          positions.push(child.x, child.y, child.z);
          
          if (Math.random() < 0.6) { // 60% chance to continue branching (reduced from 80%)
            createBranch(child, depth + 1, maxDepth);
          }
        }
      };
      
      createBranch(root, 0, 2); // Reduced max depth from 3-5 to 2
      
      // Add nodes
      nodes.forEach(nodePos => {
        const node = new THREE.Mesh(nodeGeometry, neuralNodeMaterial);
        node.position.copy(nodePos);
        group.add(node);
      });
      
      // Add connections
      const branchGeometry = new THREE.BufferGeometry();
      branchGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      const branches = new THREE.LineSegments(branchGeometry, neuralEdgeMaterial);
      group.add(branches);
      
      return group;
    };

    const createDataFlow = (size: number) => {
      const group = new THREE.Group();
      const flowGeometry = new THREE.BufferGeometry();
      const nodeGeometry = new THREE.SphereGeometry(0.02, 6, 4);
      
      // Create simpler flow path with fewer points
      const pathPoints: THREE.Vector3[] = [];
      const numPoints = 3 + Math.floor(Math.random() * 2); // Reduced from 5-9 to 3-5
      
      for (let i = 0; i < numPoints; i++) {
        const t = i / (numPoints - 1);
        const curve = Math.sin(t * Math.PI * 2) * 0.3; // Reduced curve intensity
        pathPoints.push(new THREE.Vector3(
          (t - 0.5) * size,
          curve * size,
          (Math.random() - 0.5) * size * 0.25
        ));
      }
      
      // Add nodes at path points
      pathPoints.forEach(point => {
        const node = new THREE.Mesh(nodeGeometry, neuralNodeMaterial);
        node.position.copy(point);
        group.add(node);
      });
      
      // Create flow lines
      const flowPositions: number[] = [];
      for (let i = 0; i < pathPoints.length - 1; i++) {
        flowPositions.push(pathPoints[i].x, pathPoints[i].y, pathPoints[i].z);
        flowPositions.push(pathPoints[i + 1].x, pathPoints[i + 1].y, pathPoints[i + 1].z);
      }
      
      flowGeometry.setAttribute('position', new THREE.Float32BufferAttribute(flowPositions, 3));
      const flow = new THREE.LineSegments(flowGeometry, activeNeuralMaterial);
      group.add(flow);
      
      return group;
    };

    // Sacred geometry shape creators (made smaller)
    const createSacredTriangle = (size: number) => {
      const geometry = new THREE.BufferGeometry();
      const height = size * Math.sqrt(3) / 2;
      const vertices = [
        0, height * 0.6, 0,
        -size * 0.5, -height * 0.4, 0,
        size * 0.5, -height * 0.4, 0,
        0, 0, 0
      ];
      
      const indices = [0, 1, 1, 2, 2, 0, 0, 3, 1, 3, 2, 3];
      
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      geometry.setIndex(indices);
      return new THREE.LineSegments(geometry, glowMaterial);
    };

    const createGeometricDiamond = (size: number) => {
      const geometry = new THREE.BufferGeometry();
      const vertices = [
        0, size, 0, -size * 0.7, 0, 0, 0, -size, 0, size * 0.7, 0, 0,
        0, 0, size * 0.5, 0, 0, -size * 0.5
      ];
      
      const indices = [0, 1, 1, 2, 2, 3, 3, 0, 0, 4, 1, 4, 2, 4, 3, 4, 0, 5, 1, 5, 2, 5, 3, 5];
      
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      geometry.setIndex(indices);
      return new THREE.LineSegments(geometry, accentMaterial);
    };

    const createStarPattern = (size: number) => {
      const geometry = new THREE.BufferGeometry();
      const vertices = [];
      const numPoints = 6;
      
      // Outer points
      for (let i = 0; i < numPoints; i++) {
        const angle = (i / numPoints) * Math.PI * 2;
        vertices.push(Math.cos(angle) * size, Math.sin(angle) * size, 0);
      }
      
      // Inner points
      for (let i = 0; i < numPoints; i++) {
        const angle = (i / numPoints) * Math.PI * 2 + Math.PI / numPoints;
        vertices.push(Math.cos(angle) * size * 0.4, Math.sin(angle) * size * 0.4, 0);
      }
      
      vertices.push(0, 0, 0);
      
      const indices = [];
      for (let i = 0; i < numPoints; i++) {
        indices.push(i, i + numPoints);
        indices.push(i, (i + 1) % numPoints);
        indices.push(i + numPoints, 12);
      }
      
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      geometry.setIndex(indices);
      return new THREE.LineSegments(geometry, lineMaterial);
    };

    // Create floating geometric shapes
    const geometricShapes: THREE.Group[] = [];
    const originalShapeCreators = [createSacredTriangle, createGeometricDiamond, createStarPattern];
    const neuralShapeCreators = [createNeuralNetwork, createGraphCluster, createNeuralBranch, createDataFlow];
    
    for (let i = 0; i < 200; i++) {
      const group = new THREE.Group();
      
      // 50% chance for neural network shapes, 50% for original shapes (more balanced for debugging)
      const useNeural = Math.random() < 0.5;
      const shapeCreators = useNeural ? neuralShapeCreators : originalShapeCreators;
      const shapeType = Math.floor(Math.random() * shapeCreators.length);
      
      // Adjust size based on shape type
      const shapeSize = useNeural ? 
        0.6 + Math.random() * 0.6 : // Neural shapes 
        0.3 + Math.random() * 0.4; // Geometric shapes (increased for visibility)
      
      try {
        const shape = shapeCreators[shapeType](shapeSize);
        
        if (shape) {
          group.add(shape);
          
          const angle = (i / 200) * Math.PI * 2;
          const distance = 2.5 + Math.random() * 6; // Closer to center for better visibility
          group.position.x = Math.cos(angle) * distance + (Math.random() - 0.5) * 3;
          group.position.y = Math.sin(angle) * distance + (Math.random() - 0.5) * 3;
          group.position.z = (Math.random() - 0.5) * 8; // Reduced Z spread
          
          group.rotation.x = Math.random() * Math.PI * 2;
          group.rotation.y = Math.random() * Math.PI * 2;
          group.rotation.z = Math.random() * Math.PI * 2;
          
          group.userData = {
            rotationSpeed: {
              x: (Math.random() - 0.5) * 0.02,
              y: (Math.random() - 0.5) * 0.02,
              z: (Math.random() - 0.5) * 0.02
            },
            floatSpeed: Math.random() * 0.01 + 0.006,
            floatOffset: Math.random() * Math.PI * 2,
            pulseSpeed: Math.random() * 0.02 + 0.01,
            isNeural: useNeural
          };
          
          geometricShapes.push(group);
          scene.add(group);
        }
      } catch (error) {
        console.error('Error creating shape:', error);
      }
    }

    // Shooting stars setup - much slower with larger travel distance
    const shootingStars: Array<{
      position: THREE.Vector3;
      velocity: THREE.Vector3;
      trail: THREE.Vector3[];
      mesh: THREE.Mesh;
      line: THREE.Line;
      lifeTime: number;
      maxLifeTime: number;
      isActive: boolean;
    }> = [];

    const starMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xd4d4aa,
      transparent: true, 
      opacity: 0.9
    });

    const trailMaterial = new THREE.LineBasicMaterial({
      color: 0xd4d4aa,
      transparent: true,
      opacity: 0.6
    });

    // Create more shooting stars (increased from 45 to 60)
    for (let i = 0; i < 60; i++) {
      const starGeometry = new THREE.SphereGeometry(0.02, 8, 6);
      const starMesh = new THREE.Mesh(starGeometry, starMaterial);
      
      starMesh.visible = false;
      starMesh.frustumCulled = false;
      scene.add(starMesh);

      const trailGeometry = new THREE.BufferGeometry();
      const trailLine = new THREE.Line(trailGeometry, trailMaterial);
      trailLine.visible = false;
      trailLine.frustumCulled = false;
      scene.add(trailLine);

      shootingStars.push({
        position: new THREE.Vector3(),
        velocity: new THREE.Vector3(),
        trail: [],
        mesh: starMesh,
        line: trailLine,
        lifeTime: 0,
        maxLifeTime: 60,
        isActive: false
      });
    }

    // Animation loop
    let time = 0;
    const animate = () => {
      time += 0.01;
      
      // Animate circles
      circles.forEach((circle, index) => {
        const scale = 1 + Math.sin(time * 2 + index * 0.3) * 0.2;
        circle.scale.setScalar(scale);
        circle.rotation.z = time * 0.5 + index * 0.2;
        
        const opacity = 0.5 + Math.sin(time * 3 + index * 0.5) * 0.25;
        if (circle.material instanceof THREE.LineBasicMaterial) {
          circle.material.opacity = Math.max(opacity, 0.25);
        }
      });

      // Animate geometric shapes
      geometricShapes.forEach((shape) => {
        const data = shape.userData;
        
        shape.rotation.x += data.rotationSpeed.x;
        shape.rotation.y += data.rotationSpeed.y;
        shape.rotation.z += data.rotationSpeed.z;
        
        shape.position.y += Math.sin(time * data.floatSpeed + data.floatOffset) * 0.003;
        shape.position.x += Math.cos(time * data.floatSpeed * 0.7 + data.floatOffset) * 0.002;
        
        // Different pulsing for neural vs geometric shapes
        const pulse = data.isNeural ? 
          0.8 + Math.sin(time * data.pulseSpeed + data.floatOffset) * 0.15 :
          0.7 + Math.sin(time * 2 + data.floatOffset) * 0.25;
        shape.scale.setScalar(pulse);

        // Special animation for neural network elements
        if (data.isNeural) {
          shape.traverse((child) => {
            if (child instanceof THREE.LineSegments && child.material instanceof THREE.LineBasicMaterial) {
              // Animate neural connections
              const connectionOpacity = 0.3 + Math.sin(time * 3 + data.floatOffset) * 0.3;
              child.material.opacity = Math.max(connectionOpacity, 0.1);
            }
          });
        }
      });

      // Animate shooting stars with much slower movement and larger travel distance
      shootingStars.forEach((star) => {
        if (!star.isActive && Math.random() < 0.01) { // Reduced spawn rate for longer lasting stars
          // Spawn new shooting star - larger starting area for longer travel
          star.isActive = true;
          star.lifeTime = 0;
          star.maxLifeTime = 300 + Math.random() * 200; // Much longer lifespan for larger travel
          
          // Larger starting position range for longer travel distance
          star.position.set(
            (Math.random() - 0.5) * 20, // Much larger range ±10
            (Math.random() - 0.5) * 16, // Much larger range ±8
            (Math.random() - 0.5) * 12  // Larger Z depth range
          );
          
          // Much slower velocity - 10x slower than before
          const velocityMagnitude = 0.0002 + Math.random() * 0.0003; // Speed between 0.0002 and 0.0005 (10x slower)
          const angle = Math.random() * Math.PI * 2; // Random horizontal angle
          const verticalAngle = (Math.random() - 0.5) * Math.PI * 0.5; // Random vertical component
          
          star.velocity.set(
            Math.cos(angle) * Math.cos(verticalAngle) * velocityMagnitude,
            Math.sin(angle) * Math.cos(verticalAngle) * velocityMagnitude,
            Math.sin(verticalAngle) * velocityMagnitude * 0.3 // Less Z movement
          );
          
          star.trail = [star.position.clone()];
          star.mesh.position.copy(star.position);
          star.mesh.visible = true;
          star.line.visible = true;
        }
        
        if (star.isActive) {
          star.lifeTime++;
          
          // Update position
          star.position.add(star.velocity);
          star.mesh.position.copy(star.position);
          
          // Update trail
          star.trail.push(star.position.clone());
          if (star.trail.length > 15) { // Even longer trails for slower movement
            star.trail.shift();
          }
          
          // Update trail geometry
          if (star.trail.length > 1) {
            const positions: number[] = [];
            star.trail.forEach(pos => {
              positions.push(pos.x, pos.y, pos.z);
            });
            
            star.line.geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
            star.line.geometry.attributes.position.needsUpdate = true;
          }
          
          // Fade out
          const fadeRatio = Math.max(0, 1 - (star.lifeTime / star.maxLifeTime));
          if (star.mesh.material instanceof THREE.Material) {
            (star.mesh.material as THREE.MeshBasicMaterial).opacity = fadeRatio * 0.9;
          }
          if (star.line.material instanceof THREE.Material) {
            (star.line.material as THREE.LineBasicMaterial).opacity = fadeRatio * 0.6;
          }
          
          // Deactivate when life ends
          if (star.lifeTime >= star.maxLifeTime) {
            star.isActive = false;
            star.mesh.visible = false;
            star.line.visible = false;
            star.trail = [];
          }
        }
      });

      // Animate center text
      centerText.material.opacity = 0.7 + Math.sin(time * 1.8) * 0.15;

      // Camera movement
      camera.position.x = Math.sin(time * 0.3) * 0.5;
      camera.position.y = Math.cos(time * 0.2) * 0.3;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();

    // Handle window resize
    const handleResize = () => {
      if (!rendererRef.current || !mountRef.current || !camera) return;
      
      const containerWidth = mountRef.current.clientWidth;
      const containerHeight = mountRef.current.clientHeight;
      
      camera.aspect = containerWidth / containerHeight;
      camera.updateProjectionMatrix();
      
      rendererRef.current.setSize(containerWidth, containerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      if (rendererRef.current && mountRef.current && mountRef.current.contains(rendererRef.current.domElement)) {
        mountRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
      
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Line || object instanceof THREE.LineSegments) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
    };
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full bg-black overflow-hidden">
      <div 
        ref={mountRef} 
        className="absolute inset-0 w-full h-full"
        style={{ touchAction: 'none' }}
      />
      
      <div className="absolute bottom-8 left-0 right-0 text-center px-8">
        <p className="text-white text-lg md:text-xl font-light tracking-wide opacity-80">
          "The essential skill of the future is the ability to learn, unlearn, and relearn."
        </p>
      </div>
    </div>
  );
};

export default NuminousPortal;
````

## File: components/submit-button.tsx
````typescript
"use client";

import { Button } from "@/components/ui/button";
import { type ComponentProps } from "react";
import { useFormStatus } from "react-dom";

type Props = ComponentProps<typeof Button> & {
  pendingText?: string;
};

export function SubmitButton({
  children,
  pendingText = "Submitting...",
  ...props
}: Props) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" aria-disabled={pending} {...props}>
      {pending ? pendingText : children}
    </Button>
  );
}
````

## File: components/theme-switcher.tsx
````typescript
"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const ThemeSwitcher = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const ICON_SIZE = 16;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size={"sm"}>
          {theme === "light" ? (
            <Sun
              key="light"
              size={ICON_SIZE}
              className={"text-muted-foreground"}
            />
          ) : theme === "dark" ? (
            <Moon
              key="dark"
              size={ICON_SIZE}
              className={"text-muted-foreground"}
            />
          ) : (
            <Laptop
              key="system"
              size={ICON_SIZE}
              className={"text-muted-foreground"}
            />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-content" align="start">
        <DropdownMenuRadioGroup
          value={theme}
          onValueChange={(e) => setTheme(e)}
        >
          <DropdownMenuRadioItem className="flex gap-2" value="light">
            <Sun size={ICON_SIZE} className="text-muted-foreground" />{" "}
            <span>Light</span>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem className="flex gap-2" value="dark">
            <Moon size={ICON_SIZE} className="text-muted-foreground" />{" "}
            <span>Dark</span>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem className="flex gap-2" value="system">
            <Laptop size={ICON_SIZE} className="text-muted-foreground" />{" "}
            <span>System</span>
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export { ThemeSwitcher };
````

## File: lib/utils.ts
````typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
````

## File: utils/supabase/client.ts
````typescript
import { createBrowserClient } from "@supabase/ssr";

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
````

## File: utils/supabase/isEmailAllowed.ts
````typescript
import { type SupabaseClient } from "@supabase/supabase-js";

/**
 * Returns true if the e-mail is present in public.allowed_users
 */
export async function isEmailAllowed(
  supabase: SupabaseClient,
  email: string,
): Promise<boolean> {
  console.log(`Checking if email '${email}' is allowed...`);
  
  try {
    // First, debug by listing all allowed emails
    const allAllowedQuery = await supabase
      .from("allowed_users")
      .select("email");
    
    console.log('Available allowed emails:', allAllowedQuery.data);
    console.log('Query error (if any):', allAllowedQuery.error);
    
    // Now check the specific email
    const { data, error } = await supabase
      .from("allowed_users")
      .select("email")
      .eq("email", email.toLowerCase()) // normalise case if you like
      .maybeSingle();
    
    console.log(`Query for '${email}' returned:`, { data, error });
    
    if (error) {
      console.error('Error checking allowed email:', error);
      return false;
    }
    
    return !!data;
  } catch (e) {
    console.error('Exception in isEmailAllowed:', e);
    return false;
  }
}
````

## File: utils/supabase/server.ts
````typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const createClient = async () => {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    },
  );
};
````

## File: utils/utils.ts
````typescript
import { redirect } from "next/navigation";

/**
 * Redirects to a specified path with an encoded message as a query parameter.
 * @param {('error' | 'success')} type - The type of message, either 'error' or 'success'.
 * @param {string} path - The path to redirect to.
 * @param {string} message - The message to be encoded and added as a query parameter.
 * @returns {never} This function doesn't return as it triggers a redirect.
 */
export function encodedRedirect(
  type: "error" | "success",
  path: string,
  message: string,
) {
  return redirect(`${path}?${type}=${encodeURIComponent(message)}`);
}
````

## File: .dockerignore
````
.git
node_modules
.next
*.log
````

## File: CLAUDE.md
````markdown
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Development:
- `npm run dev` - Start development server on localhost:3000
- `npm run build` - Build production version
- `npm start` - Start production server

## Architecture

This is a Next.js 15 authentication application built with the App Router and Supabase backend. The key architectural components:

### Authentication Flow
- **Middleware-based protection**: `middleware.ts` handles route protection using Supabase session management
- **Email allowlist system**: Only emails present in `public.allowed_users` table can register (enforced in `signUpAction`)
- **Route structure**: 
  - `/` redirects authenticated users to `/protected`
  - `/protected/*` requires authentication, redirects to `/sign-in` if not authenticated
  - `(auth-pages)` group contains sign-in, sign-up, forgot-password with shared layout

### Key Files
- `app/actions.ts` - Server actions for auth operations (sign up, sign in, password reset, sign out)
- `utils/supabase/` - Supabase client configurations for different contexts (client, server, middleware)
- `utils/supabase/isEmailAllowed.ts` - Email allowlist validation function
- `middleware.ts` - Session management and route protection

### Environment Requirements
The app requires these environment variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key

### UI Components
- Built with Tailwind CSS and Radix UI components
- Theme switching with `next-themes`
- Custom 3D portal component (`components/numinous-portal.tsx`) using Three.js for visual effects
- Responsive layout with fixed navigation and footer

### Database Schema
The app expects a Supabase database with:
- `public.allowed_users` table with `email` column for registration allowlist
- Standard Supabase auth tables for user management
````

## File: components.json
````json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
````

## File: Dockerfile
````dockerfile
# ---------- 1️⃣ Builder layer ----------
    FROM node:20-bookworm AS builder

    WORKDIR /app
    
    COPY package*.json ./
    RUN npm ci --ignore-scripts
    
    COPY . .
    
    # Next 14+ uses `next build` for static & server bundles
    RUN npm run build
    
    # ---------- 2️⃣ Runtime layer ----------
    FROM gcr.io/distroless/nodejs20-debian11
    
    WORKDIR /app
    
    # Copy only the files needed at runtime
    COPY --from=builder /app/package*.json ./
    COPY --from=builder /app/node_modules ./node_modules
    COPY --from=builder /app/.next ./.next
    COPY --from=builder /app/public ./public
    
    # Tell Cloud Run which port the app listens on
    ENV PORT=8080
    
    # Start Next.js in production mode.
    # App Router projects default to port 3000; Cloud Run routes 8080 ➜ 8080
    CMD ["node_modules/.bin/next", "start", "-p", "8080"]
````

## File: middleware.ts
````typescript
import { type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
````

## File: postcss.config.js
````javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
````

## File: tailwind.config.ts
````typescript
import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
````

## File: tsconfig.json
````json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
````

## File: app/(auth-pages)/forgot-password/page.tsx
````typescript
import { forgotPasswordAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default async function ForgotPassword(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  return (
    <>
      <form className="flex-1 flex flex-col w-full gap-2 text-foreground [&>input]:mb-6 min-w-64 max-w-64 mx-auto">
        <div>
          <h1 className="text-2xl font-medium">Reset Password</h1>
          <p className="text-sm text-secondary-foreground">
            Already have an account?{" "}
            <Link className="text-primary underline" href="/sign-in">
              Sign in
            </Link>
          </p>
        </div>
        <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
          <Label htmlFor="email">Email</Label>
          <Input name="email" placeholder="you@example.com" required />
          <SubmitButton formAction={forgotPasswordAction}>
            Reset Password
          </SubmitButton>
          <FormMessage message={searchParams} />
        </div>
      </form>
    </>
  );
}
````

## File: app/(auth-pages)/sign-in/page.tsx
````typescript
import { signInAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default async function Login(props: { searchParams: Promise<Message> }) {
  const searchParams = await props.searchParams;
  return (
    <form className="flex-1 flex flex-col min-w-64 max-w-64 mx-auto">
      <h1 className="text-2xl font-medium">Sign in</h1>
      <p className="text-sm text-foreground">
        Don't have an account?{" "}
        <Link className="text-foreground font-medium underline" href="/sign-up">
          Sign up
        </Link>
      </p>
      <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
        <Label htmlFor="email">Email</Label>
        <Input name="email" placeholder="you@example.com" required />
        <div className="flex justify-between items-center">
          <Label htmlFor="password">Password</Label>
          <Link
            className="text-xs text-foreground underline"
            href="/forgot-password"
          >
            Forgot Password?
          </Link>
        </div>
        <Input
          type="password"
          name="password"
          placeholder="Your password"
          required
        />
        <SubmitButton pendingText="Signing In..." formAction={signInAction}>
          Sign in
        </SubmitButton>
        <FormMessage message={searchParams} />
      </div>
    </form>
  );
}
````

## File: app/(auth-pages)/sign-up/page.tsx
````typescript
import { signUpAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default async function Signup(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  if ("message" in searchParams) {
    return (
      <div className="w-full flex-1 flex items-center h-screen sm:max-w-md justify-center gap-2 p-4">
        <FormMessage message={searchParams} />
      </div>
    );
  }

  return (
    <>
      <form action={signUpAction} className="flex flex-col min-w-64 max-w-64 mx-auto">
        <h1 className="text-2xl font-medium">Sign up</h1>
        <p className="text-sm text text-foreground">
          Already have an account?{" "}
          <Link className="text-primary font-medium underline" href="/sign-in">
            Sign in
          </Link>
        </p>
        <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
          <Label htmlFor="email">Email</Label>
          <Input name="email" placeholder="you@example.com" required />
          <Label htmlFor="password">Password</Label>
          <Input
            type="password"
            name="password"
            placeholder="Your password"
            minLength={6}
            required
          />
          <SubmitButton pendingText="Signing up...">
            Sign up
          </SubmitButton>
          <FormMessage message={searchParams} />
        </div>
      </form>
    </>
  );
}
````

## File: components/header-auth.tsx
````typescript
import { signOutAction } from "@/app/actions";
import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/utils/supabase/server";

export default async function AuthButton() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user ? (
    <div className="flex items-center gap-4">
      Hey, {user.email}!
      <form action={signOutAction}>
        <Button type="submit" variant={"outline"}>
          Sign out
        </Button>
      </form>
    </div>
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant={"outline"}>
        <Link href="/sign-in">Sign in</Link>
      </Button>
      <Button asChild size="sm" variant={"default"}>
        <Link href="/sign-up">Sign up</Link>
      </Button>
    </div>
  );
}
````

## File: utils/supabase/middleware.ts
````typescript
import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export const updateSession = async (request: NextRequest) => {
  try {
    // Create an unmodified response
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value),
            );
            response = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options),
            );
          },
        },
      },
    );

    // This will refresh session if expired - required for Server Components
    // https://supabase.com/docs/guides/auth/server-side/nextjs
    const user = await supabase.auth.getUser();

    // protected routes
    if (request.nextUrl.pathname.startsWith("/protected") && user.error) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    if (request.nextUrl.pathname === "/" && !user.error) {
      return NextResponse.redirect(new URL("/protected", request.url));
    }

    return response;
  } catch (e) {
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }
};
````

## File: .gitignore
````
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.*
.yarn/*
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/versions

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local
.env
cloudrun.env

# Docker
docker-image.tar

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
````

## File: next.config.ts
````typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],
  }
};

export default nextConfig;
````

## File: package.json
````json
{
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "@radix-ui/react-checkbox": "^1.1.1",
    "@radix-ui/react-dropdown-menu": "^2.1.1",
    "@radix-ui/react-label": "^2.1.0",
    "@radix-ui/react-slot": "^1.1.0",
    "@supabase/ssr": "latest",
    "@supabase/supabase-js": "latest",
    "autoprefixer": "10.4.20",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "lucide-react": "^0.468.0",
    "next": "latest",
    "next-themes": "^0.4.3",
    "prettier": "^3.3.3",
    "react": "19.0.0",
    "react-dom": "19.0.0",
    "three": "^0.177.0"
  },
  "devDependencies": {
    "@types/node": "22.10.2",
    "@types/react": "^19.0.2",
    "@types/react-dom": "19.0.2",
    "@types/three": "^0.176.0",
    "postcss": "8.4.49",
    "tailwind-merge": "^2.5.2",
    "tailwindcss": "3.4.17",
    "tailwindcss-animate": "^1.0.7",
    "typescript": "5.7.2"
  }
}
````

## File: README.md
````markdown
# Authentication App

A simple authentication application built with Next.js and Supabase.

## Features

- Complete authentication system
  - Sign up
  - Sign in
  - Password reset
  - Protected routes
- Works across the entire Next.js stack
  - App Router
  - Middleware
  - Server Components
  - Client Components

## Getting Started

1. Clone this repository
   ```bash
   git clone <repository-url>
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn
   # or
   pnpm install
   ```

3. Create a `.env.local` file with your Supabase credentials
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. Run the development server
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Technology Stack

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/) for authentication
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [TypeScript](https://www.typescriptlang.org/) for type safety
````

## File: app/protected/page.tsx
````typescript
import { createClient } from "@/utils/supabase/server";
import { signOutAction } from "@/app/actions";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import ControllerAutoSplash from "@/components/ui/ControllerAutoSplash";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-8">
      <div className="flex flex-col gap-6">
        <h2 className="font-bold text-2xl">Welcome!</h2>
        <ControllerAutoSplash />
      </div>
    </div>
  );
}
````

## File: app/actions.ts
````typescript
"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isEmailAllowed } from "@/utils/supabase/isEmailAllowed";

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  if (!email || !password) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "Email and password are required",
    );
  }
  
  const allowed = await isEmailAllowed(supabase, email);
  if (!allowed) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "This e-mail address is not authorised to register.",
    );
  }

  console.log(`Attempting to sign up user with email: ${email}`);
  console.log(`Email redirect URL: ${origin}/auth/callback`);
  
  const { error, data } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    console.error('Supabase signup error:', { 
      code: error.code, 
      message: error.message
    });
    return encodedRedirect("error", "/sign-up", error.message);
  } else {
    return encodedRedirect(
      "success",
      "/sign-up",
      "Thanks for signing up! Please check your email for a verification link.",
    );
  }
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }

  return redirect("/protected");
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/protected/reset-password`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password",
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password.",
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password and confirm password are required",
    );
  }

  if (password !== confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Passwords do not match",
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password update failed",
    );
  }

  encodedRedirect("success", "/protected/reset-password", "Password updated");
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};
````

## File: app/layout.tsx
````typescript
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import Link from "next/link";
import "./globals.css";
import AuthButton from "@/components/header-auth";

export const metadata = {
  title: "Authentication App",
  description: "A simple authentication application",
};

const geistSans = Geist({
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <main className="min-h-screen flex flex-col relative">
            {/* Navigation bar with fixed position */}
            <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16 bg-background z-10 relative">
              <div className="w-full max-w-7xl flex justify-between items-center p-3 px-5 text-sm">
                <div>
                  {/* Left side content/logo can go here */}
                </div>
                <div className="flex items-center gap-4">
                  <ThemeSwitcher />
                  <AuthButton />
                </div>
              </div>
            </nav>
            
            {/* Main content area with full height for the NuminousPortal */}
            <div className="flex-grow w-full">
              {children}
            </div>

            {/* Footer with relative position */}
            <footer className="w-full border-t py-6 text-center text-xs bg-background z-10 relative">
              <p className="text-foreground/60">
                © {new Date().getFullYear()} Fatima College for Health Sciences 
              </p>
            </footer>
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
````

## File: app/page.tsx
````typescript
import NuminousPortal from "@/components/numinous-portal";
import ControllerAutoSplash from "@/components/ui/ControllerAutoSplash";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    return redirect("/protected");
  }

  return (
    <div className="w-full h-[calc(100vh-80px)] relative overflow-hidden">
      <ControllerAutoSplash />
      <NuminousPortal />
    </div>
  )
}
````
