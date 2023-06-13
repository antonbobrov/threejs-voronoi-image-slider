import { WebGLRenderer } from 'three';
import { IWebglRendererProps } from './types';

export class WebglRenderer {
  private _renderer: WebGLRenderer;
  get renderer() {
    return this._renderer;
  }

  private _width = 1;
  private _height = 1;

  get canvas() {
    return this._canvas;
  }

  get dpr() {
    return this._props.dpr ?? window.devicePixelRatio;
  }

  get width() {
    return this._width;
  }

  get height() {
    return this._height;
  }

  constructor(
    private _parent: HTMLElement,
    private _canvas: HTMLCanvasElement,
    private _props: IWebglRendererProps
  ) {
    this._renderer = new WebGLRenderer({
      ..._props,
      canvas: _canvas,
    });

    this.resize();
  }

  public resize() {
    this._width = this._parent.clientWidth;
    this._height = this._parent.clientHeight;

    this._renderer.setSize(this.width, this.height);
    this._renderer.setPixelRatio(this.dpr);
  }

  public destroy() {
    this._renderer.dispose();
  }
}
