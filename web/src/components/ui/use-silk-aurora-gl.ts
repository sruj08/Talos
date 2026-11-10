'use client';

import React from 'react';
import { SILK_FRAGMENT_SHADER, SILK_VERTEX_SHADER } from './silk-aurora-shaders';

const HEX_COLOR_REGEX = /^#?[0-9a-fA-F]{6}$/;
export const SILK_DEFAULT_BASE = '#07080D';
export const SILK_DEFAULT_MID = '#001435';
export const SILK_DEFAULT_SHEEN = '#FFC439';
export const SILK_DEFAULT_ACCENT = '#0070E0';

function sanitizeHexColor(value: string, fallback: string) {
  const trimmed = value.trim();
  if (!HEX_COLOR_REGEX.test(trimmed)) return fallback;
  return trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
}

function hexToRgb01(hex: string, fallback: string): [number, number, number] {
  const normalized = sanitizeHexColor(hex, fallback).replace('#', '');
  return [
    parseInt(normalized.slice(0, 2), 16) / 255,
    parseInt(normalized.slice(2, 4), 16) / 255,
    parseInt(normalized.slice(4, 6), 16) / 255,
  ];
}

export interface SilkAuroraGlSettings {
  baseColor: string;
  midColor: string;
  sheenColor: string;
  accentColor: string;
  speed: number;
  intensity: number;
  grain: number;
  vignette: number;
  mouseInfluence: number;
  interactive: boolean;
}

export function useSilkAuroraGl(
  containerRef: React.RefObject<HTMLDivElement | null>,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  settings: SilkAuroraGlSettings,
  hasWebGLError: boolean,
  setHasWebGLError: (value: boolean) => void,
) {
  const mouseRef = React.useRef({ x: 0.5, y: 0.5 });
  const targetMouseRef = React.useRef({ x: 0.5, y: 0.5 });

  React.useEffect(() => {
    if (hasWebGLError) return;
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const onMove = (event: PointerEvent) => {
      if (!settings.interactive) return;
      const rect = container.getBoundingClientRect();
      targetMouseRef.current = {
        x: (event.clientX - rect.left) / rect.width,
        y: 1 - (event.clientY - rect.top) / rect.height,
      };
    };
    const onLeave = () => {
      targetMouseRef.current = { x: 0.5, y: 0.5 };
    };
    container.addEventListener('pointermove', onMove);
    container.addEventListener('pointerleave', onLeave);

    try {
      const gl = canvas.getContext('webgl', { antialias: false, alpha: false });
      if (!gl) {
        setHasWebGLError(true);
        return () => {
          container.removeEventListener('pointermove', onMove);
          container.removeEventListener('pointerleave', onLeave);
        };
      }

      const compile = (type: number, source: string) => {
        const shader = gl.createShader(type);
        if (!shader) return null;
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
          gl.deleteShader(shader);
          return null;
        }
        return shader;
      };

      const vs = compile(gl.VERTEX_SHADER, SILK_VERTEX_SHADER);
      const fs = compile(gl.FRAGMENT_SHADER, SILK_FRAGMENT_SHADER);
      if (!vs || !fs) {
        setHasWebGLError(true);
        return;
      }

      const program = gl.createProgram();
      if (!program) {
        setHasWebGLError(true);
        return;
      }
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        setHasWebGLError(true);
        return;
      }
      gl.useProgram(program);

      const position = gl.getAttribLocation(program, 'position');
      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(position);
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

      const locs = {
        res: gl.getUniformLocation(program, 'u_res'),
        mouse: gl.getUniformLocation(program, 'u_mouse'),
        time: gl.getUniformLocation(program, 'u_time'),
        speed: gl.getUniformLocation(program, 'u_speed'),
        intensity: gl.getUniformLocation(program, 'u_intensity'),
        grain: gl.getUniformLocation(program, 'u_grain'),
        vignette: gl.getUniformLocation(program, 'u_vignette'),
        mouseInfluence: gl.getUniformLocation(program, 'u_mouseInfluence'),
        base: gl.getUniformLocation(program, 'u_base'),
        mid: gl.getUniformLocation(program, 'u_mid'),
        sheen: gl.getUniformLocation(program, 'u_sheen'),
        accent: gl.getUniformLocation(program, 'u_accent'),
      };
      if (Object.values(locs).some((v) => !v)) {
        setHasWebGLError(true);
        return;
      }

      const resize = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const { width, height } = container.getBoundingClientRect();
        canvas.width = Math.max(1, Math.floor(width * dpr));
        canvas.height = Math.max(1, Math.floor(height * dpr));
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.uniform2f(locs.res, canvas.width, canvas.height);
      };
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(container);

      const base = hexToRgb01(settings.baseColor, SILK_DEFAULT_BASE);
      const mid = hexToRgb01(settings.midColor, SILK_DEFAULT_MID);
      const sheen = hexToRgb01(settings.sheenColor, SILK_DEFAULT_SHEEN);
      const accent = hexToRgb01(settings.accentColor, SILK_DEFAULT_ACCENT);
      gl.uniform3f(locs.base, base[0], base[1], base[2]);
      gl.uniform3f(locs.mid, mid[0], mid[1], mid[2]);
      gl.uniform3f(locs.sheen, sheen[0], sheen[1], sheen[2]);
      gl.uniform3f(locs.accent, accent[0], accent[1], accent[2]);

      let rafId = 0;
      const start = performance.now();
      const render = (now: number) => {
        mouseRef.current.x += (targetMouseRef.current.x - mouseRef.current.x) * 0.045;
        mouseRef.current.y += (targetMouseRef.current.y - mouseRef.current.y) * 0.045;
        const elapsed = reducedMotion ? 8 : (now - start) / 1000;
        gl.uniform2f(locs.mouse, mouseRef.current.x, mouseRef.current.y);
        gl.uniform1f(locs.time, elapsed);
        gl.uniform1f(locs.speed, reducedMotion ? 0 : settings.speed);
        gl.uniform1f(locs.intensity, settings.intensity);
        gl.uniform1f(locs.grain, settings.grain);
        gl.uniform1f(locs.vignette, settings.vignette);
        gl.uniform1f(
          locs.mouseInfluence,
          settings.interactive && !reducedMotion ? settings.mouseInfluence : 0,
        );
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        rafId = requestAnimationFrame(render);
      };
      rafId = requestAnimationFrame(render);

      return () => {
        container.removeEventListener('pointermove', onMove);
        container.removeEventListener('pointerleave', onLeave);
        cancelAnimationFrame(rafId);
        ro.disconnect();
        gl.deleteBuffer(buffer);
        gl.deleteProgram(program);
        gl.deleteShader(vs);
        gl.deleteShader(fs);
      };
    } catch {
      setHasWebGLError(true);
      return () => {
        container.removeEventListener('pointermove', onMove);
        container.removeEventListener('pointerleave', onLeave);
      };
    }
  }, [canvasRef, containerRef, hasWebGLError, setHasWebGLError, settings]);
}
