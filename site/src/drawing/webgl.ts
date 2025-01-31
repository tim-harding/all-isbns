import { unwrap } from "@/shared/util";
import {
  countryLuts,
  datasetNames,
  getValue,
  type Key,
  loadLut,
  loadTile,
  modeNames,
} from "./image-cache";
import { MAX_LEVEL } from "@/shared/constant";
import vertSrc from "./vertex.glsl?raw";
import fragSrcTile from "./tile-fragment.glsl?raw";
import fragSrcCountry from "./country-fragment.glsl?raw";
import { useViewportStore } from "@/stores/viewportStore";
import { useUiStore } from "@/stores/uiStore";
import { Rect } from "@/shared/Rect";
import { Vec } from "@/shared/Vec";
import { Rgb } from "@/shared/Rgb";
import { useHoverStore } from "@/stores/hoverStore";

function createShader(
  gl: WebGL2RenderingContext,
  type: GLenum,
  source: string
) {
  const shader = unwrap(gl.createShader(type));
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (!success) {
    const message = gl.getShaderInfoLog(shader) ?? "";
    gl.deleteShader(shader);
    throw new Error(message);
  }
  return shader;
}

function createProgram(
  gl: WebGL2RenderingContext,
  vert: WebGLShader,
  frag: WebGLShader
) {
  const program = gl.createProgram();
  gl.attachShader(program, vert);
  gl.attachShader(program, frag);
  gl.linkProgram(program);
  const success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!success) {
    const message = gl.getProgramInfoLog(program) ?? "";
    gl.deleteProgram(program);
    throw new Error(message);
  }
  return program;
}

export function useDrawing(canvas: HTMLCanvasElement) {
  const vp = useViewportStore();
  const ui = useUiStore();
  const hover = useHoverStore();

  const gl = unwrap(canvas.getContext("webgl2"));
  const vert = createShader(gl, gl.VERTEX_SHADER, vertSrc);
  const programTile = createProgram(
    gl,
    vert,
    createShader(gl, gl.FRAGMENT_SHADER, fragSrcTile)
  );
  const programCountry = createProgram(
    gl,
    vert,
    createShader(gl, gl.FRAGMENT_SHADER, fragSrcCountry)
  );

  const attrTile = {
    aUv: gl.getAttribLocation(programTile, "a_uv"),
    uColor: unwrap(gl.getUniformLocation(programTile, "u_color")),
    uVpTl: unwrap(gl.getUniformLocation(programTile, "u_vp_tl")),
    uVpSz: unwrap(gl.getUniformLocation(programTile, "u_vp_sz")),
  };

  const attrCountry = {
    aUv: gl.getAttribLocation(programCountry, "a_uv"),
    uBrightness: gl.getUniformLocation(programCountry, "u_brightness"),
    uCountryIndex: gl.getUniformLocation(programCountry, "u_country_index"),
    uVpTl: unwrap(gl.getUniformLocation(programCountry, "u_vp_tl")),
    uVpSz: unwrap(gl.getUniformLocation(programCountry, "u_vp_sz")),
  };

  const uvs = [0, 0, 0, 1, 1, 0, 1, 1, 1, 0, 0, 1];
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs), gl.STATIC_DRAW);

  const vaoTile = gl.createVertexArray();
  gl.bindVertexArray(vaoTile);
  gl.enableVertexAttribArray(attrTile.aUv);
  gl.vertexAttribPointer(attrTile.aUv, 2, gl.FLOAT, false, 0, 0);

  const vaoCountry = gl.createVertexArray();
  gl.bindVertexArray(vaoCountry);
  gl.enableVertexAttribArray(attrCountry.aUv);
  gl.vertexAttribPointer(attrCountry.aUv, 2, gl.FLOAT, false, 0, 0);

  for (const mode of modeNames) {
    loadLut(mode, (image) => {
      requestRedraw();
      return bindLut(image);
    });
  }

  function bindLut(image: HTMLImageElement): WebGLTexture {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.R8UI,
      gl.RED_INTEGER,
      gl.UNSIGNED_BYTE,
      image
    );
    return texture;
  }

  function bindTile(
    image: HTMLImageElement,
    magnifyNearest: boolean
  ): WebGLTexture {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    const filter = magnifyNearest ? gl.NEAREST : gl.LINEAR;
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.LUMINANCE,
      gl.LUMINANCE,
      gl.UNSIGNED_BYTE,
      image
    );
    // gl.generateMipmap(gl.TEXTURE_2D);
    return texture;
  }

  function loadTiles() {
    const level = vp.desiredLevel();
    for (const { x, y } of vp.visibleTiles(level)) {
      for (const dataset of datasetNames) {
        if (!ui.datasets[dataset].isEnabled) continue;
        const key: Key = { dataset, mode: ui.layoutMode, level, x, y };
        loadTile(key, (image) => {
          requestRedraw();
          return bindTile(image, level === 0);
        });
      }
    }
  }

  let redrawRequest: number | null = null;
  function requestRedraw() {
    loadTiles();
    if (redrawRequest !== null) return;
    redrawRequest = requestAnimationFrame(() => {
      redrawRequest = null;
      draw();
    });
  }

  requestRedraw();

  function draw() {
    const { x: w, y: h } = vp.size;
    if (w === 0 || h === 0) return;

    if (canvas === null) return;
    canvas.width = w;
    canvas.height = h;

    gl.viewport(0, 0, w, h);

    gl.disable(gl.SCISSOR_TEST);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const scissor = Rect.transform(
      Rect.make(
        Vec.max(
          Vec.zero(),
          vp.viewportToViewportPx(vp.texToViewport(Vec.zero()))
        ),
        Vec.min(vp.size, vp.viewportToViewportPx(vp.texToViewport(Vec.one())))
      ),
      Vec.floor
    );
    const scissorSize = Rect.size(scissor);
    gl.enable(gl.SCISSOR_TEST);
    gl.scissor(
      scissor.tl.x,
      vp.size.y - scissorSize.y - scissor.tl.y,
      scissorSize.x,
      scissorSize.y
    );

    gl.enable(gl.BLEND);
    switch (ui.blendMode) {
      case "union":
        gl.clearColor(0, 0, 0, 1);
        gl.blendFunc(gl.ONE, gl.ONE);
        break;
      case "intersect":
        gl.clearColor(1, 1, 1, 1);
        gl.blendFunc(gl.DST_COLOR, gl.ZERO);
        break;
    }
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(programTile);
    gl.bindVertexArray(vaoTile);
    for (const dataset of datasetNames) {
      const { isEnabled, color } = ui.datasets[dataset];
      if (!isEnabled) continue;

      const toDraw: {
        key: Key;
        texture: WebGLTexture;
      }[] = [];

      for (let level = vp.desiredLevel(); level <= MAX_LEVEL; level++) {
        let isCompleteLevel = true;
        for (const { x, y } of vp.visibleTiles(level)) {
          const key: Key = { dataset, mode: ui.layoutMode, level, x, y };
          const value = getValue(key);
          if (value === null || value.kind === "loading") {
            isCompleteLevel = false;
            continue;
          }
          toDraw.push({ key, texture: value.texture });
        }
        if (isCompleteLevel) break;
        while (toDraw.pop() !== undefined) {}
      }

      for (let i = toDraw.length - 1; i >= 0; i--) {
        const {
          texture,
          key: { level, x, y },
        } = unwrap(toDraw[i]);

        const tile = Vec.make(x, y);
        const imgMip = Rect.unitAt(tile);
        const texVpPx = Rect.transform(imgMip, (v) =>
          vp.viewportToViewportPx(
            vp.texToViewport(vp.texPxToTex(vp.mipToTexPx(v, level)))
          )
        );
        const texVpPxSz = Rect.size(texVpPx);
        const tl = Vec.div(texVpPx.tl, vp.size);
        const sz = Vec.div(texVpPxSz, vp.size);

        const { r, g, b } = Rgb.normalized(color);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform4f(attrTile.uColor, r, g, b, 1);
        gl.uniform2f(attrTile.uVpTl, tl.x, tl.y);
        gl.uniform2f(attrTile.uVpSz, sz.x, sz.y);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      }
    }

    const lut = countryLuts[ui.layoutMode];
    if (lut !== null) {
      const rect = Rect.transform(Rect.unitAt(Vec.zero()), (v) =>
        Vec.div(vp.viewportToViewportPx(vp.texToViewport(v)), vp.size)
      );
      const tl = rect.tl;
      const sz = Rect.size(rect);

      gl.blendFunc(gl.ONE, gl.ONE);
      gl.useProgram(programCountry);
      gl.bindVertexArray(vaoCountry);
      gl.bindTexture(gl.TEXTURE_2D, lut);
      gl.uniform1ui(attrCountry.uCountryIndex, hover.countryIndex ?? -1);
      gl.uniform1f(attrCountry.uBrightness, 0.25);
      gl.uniform2f(attrCountry.uVpTl, tl.x, tl.y);
      gl.uniform2f(attrCountry.uVpSz, sz.x, sz.y);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
  }

  return { requestRedraw };
}
