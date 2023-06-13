import { Scene, Camera } from 'three';
import {
  AnimationFrame,
  Callbacks,
  NCallbacks,
  utils,
  vevet,
} from '@anton.bobrov/vevet-init';
import { DeepRequired } from 'ts-essentials';
import { WebglCamera } from '../Camera';
import { WebglRenderer } from '../Renderer';
import { IWebglManagerCallbacksTypes, IWebglManagerProps } from './types';

export class WebglManager<TCamera extends Camera | undefined = undefined> {
  private _props: DeepRequired<IWebglManagerProps>;
  get props() {
    return this._props;
  }

  private _parent: HTMLElement;
  get parent() {
    return this._parent;
  }

  private _canvas: HTMLCanvasElement;

  private _rendererInstance: WebglRenderer;
  get renderer() {
    return this._rendererInstance.renderer;
  }

  private _cameraInstance?: WebglCamera;
  private _camera!: TCamera extends Camera ? TCamera : WebglCamera['camera'];
  get camera() {
    return this._camera;
  }

  private _scene: Scene;
  get scene() {
    return this._scene;
  }

  private _viewportCallback?: NCallbacks.AddedCallback;

  private _callbacks: Callbacks<IWebglManagerCallbacksTypes>;
  get callbacks() {
    return this._callbacks;
  }

  private _animationFrame: AnimationFrame;
  get animationFrame() {
    return this._animationFrame;
  }

  constructor(
    parentSelector: HTMLElement | string,
    initialProps: IWebglManagerProps,
    camera?: TCamera
  ) {
    const parent =
      typeof parentSelector === 'string'
        ? (document.querySelector(parentSelector) as HTMLElement)
        : parentSelector;

    if (parent) {
      this._parent = parent;
    } else {
      throw new Error('No Parent Element');
    }

    // create canvas
    this._canvas = document.createElement('canvas');
    parent.appendChild(this._canvas);

    // set props
    const defaultProps: DeepRequired<IWebglManagerProps> = {
      fps: 240,
      resizeProps: {
        target: '',
        timeout: 0,
      },
      cameraProps: {
        fov: undefined as any,
        perspective: 800,
        near: 1,
        far: 10000,
      },
      rendererProps: {} as any,
    };
    this._props = utils.common.mergeWithoutArrays(defaultProps, initialProps);

    const { fps, rendererProps, cameraProps, resizeProps } = this.props;

    // create base elements
    this._rendererInstance = new WebglRenderer(
      parent,
      this._canvas,
      rendererProps
    );

    // create camera
    if (camera) {
      this._camera = camera as any;
    } else {
      this._cameraInstance = new WebglCamera(
        parent,
        cameraProps.fov,
        cameraProps.perspective,
        cameraProps.near,
        cameraProps.far
      );
      this._camera = this._cameraInstance.camera as any;
    }

    // create scene
    this._scene = new Scene();

    // create viewport callbacks
    if (resizeProps) {
      this._viewportCallback = vevet.viewport.add(
        resizeProps.target,
        () => this.resize(),
        {
          name: 'Webgl Manager',
          timeout: resizeProps.timeout,
        }
      );
    }

    // create callbacks
    this._callbacks = new Callbacks();

    // resize for the first time
    this.resize();

    // create an animation frame
    this._animationFrame = new AnimationFrame({ fps });
    this._animationFrame.addCallback('frame', () => this.render());
  }

  /**
   * Resize the scnee
   */
  public resize() {
    this.callbacks.tbt('beforeResize', false);

    this._rendererInstance.resize();
    this._cameraInstance?.resize();

    this.callbacks.tbt('resize', false);

    this.render();
  }

  /**
   * Play animation
   */
  public play() {
    this.animationFrame.play();
  }

  /**
   * Pause animation
   */
  public pause() {
    this.animationFrame.pause();
  }

  get width() {
    return this._rendererInstance.width;
  }

  get height() {
    return this._rendererInstance.height;
  }

  get dpr() {
    return this._rendererInstance.dpr;
  }

  /**
   * Render the scene
   */
  public render() {
    // launch callbacks
    this.callbacks.tbt('frame', false);

    // render
    if (this.width > 0 && this.height > 0) {
      this.renderer.render(this.scene, this.camera);
    }

    // launch callbacks
    this.callbacks.tbt('afterRender', false);
  }

  /**
   * Destroy the scene
   */
  destroy() {
    this._canvas.remove();

    this._rendererInstance.destroy();

    this._animationFrame.destroy();
    this._viewportCallback?.remove();
    this._callbacks.destroy();
  }
}
