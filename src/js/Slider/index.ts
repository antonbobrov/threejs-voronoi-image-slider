import { CanvasTexture, Mesh, PlaneGeometry, ShaderMaterial } from 'three';
import {
  Ctx2DPrerender,
  NCallbacks,
  Timeline,
  utils,
} from '@anton.bobrov/vevet-init';
import { GUI } from 'dat.gui';
import vertexShader from './vertex.glsl';
import fragmentShader from './fragment.glsl';
import { ISlide, ISliderProps } from './types';

export class Slider {
  private _props: ISliderProps;
  private get props() {
    return this._props;
  }

  private _slides: ISlide[];

  private _resizeObserver: ResizeObserver;
  private _startSize: { width: number; height: number };
  private _webglEvents: NCallbacks.AddedCallback[] = [];
  private _timeline?: Timeline;
  private _datGUI?: GUI;

  private _mesh: Mesh;
  private _material: ShaderMaterial;

  private _activeIndex = 0;

  constructor(initialProps: ISliderProps) {
    this._props = {
      duration: 1500,
      noiseSeed: 2,
      hasNoiseDisplacement: true,
      ...initialProps,
    };

    const { images, container, manager, noiseSeed, hasNoiseDisplacement } =
      this.props;

    this._slides = images.map((image) => ({
      prerender: new Ctx2DPrerender({
        container: this.props.container,
        media: image,
        posRule: 'cover',
        updateOnResize: false,
        append: false,
        dpr: 1,
      }),
    }));

    this._startSize = {
      width: container.clientWidth,
      height: container.clientHeight,
    };

    this._resizeObserver = new ResizeObserver(() => this._resize());
    this._resizeObserver.observe(container);

    const geometry = new PlaneGeometry(
      this._startSize.width,
      this._startSize.height
    );

    this._material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        u_aspect: { value: manager.width / manager.height },
        u_time: { value: 0 },
        u_textures: { value: [] },
        u_progress: { value: 1 },
        u_noiseSeed: { value: noiseSeed },
        u_hasNoiseDisplacement: { value: hasNoiseDisplacement },
      },
      defines: {
        COUNT: this._slides.length,
        PREV_INDEX: this._activeIndex,
        NEXT_INDEX: this._activeIndex,
      },
    });

    this._webglEvents.push(
      manager.callbacks.add('resize', () => {
        this._material.uniforms.u_aspect.value = manager.width / manager.height;
      })
    );

    this._mesh = new Mesh(geometry, this._material);
    manager.scene.add(this._mesh);

    this._addGUI();
  }

  /** Resize the scene */
  private _resize() {
    const { clientWidth, clientHeight } = this.props.container;
    const widthScale = clientWidth / this._startSize.width;
    const heightScale = clientHeight / this._startSize.height;

    this._mesh.scale.set(widthScale, heightScale, 1);

    this._slides.forEach(({ prerender }) => prerender.resize());

    this._material.uniforms.u_textures.value = this._slides.map(
      ({ prerender }) => new CanvasTexture(prerender.canvas)
    );
  }

  /** Get index of the next slide */
  private _getNextIndex() {
    if (this._activeIndex < this._slides.length - 1) {
      return this._activeIndex + 1;
    }

    return 0;
  }

  /** Go to next slide */
  next() {
    if (this._timeline) {
      return;
    }

    this._material.defines.PREV_INDEX = this._activeIndex;
    this._material.defines.NEXT_INDEX = this._getNextIndex();
    this._material.needsUpdate = true;

    this._activeIndex = this._getNextIndex();

    let prevProgress = 0;

    this._timeline = new Timeline({ duration: this.props.duration });
    this._timeline.callbacks.add('progress', ({ progress }) => {
      this._material.uniforms.u_time.value += (progress - prevProgress) * 5;
      prevProgress = progress;

      this._material.uniforms.u_progress.value = utils.math.easing(
        utils.math.clampScope(progress, [0, 1])
      );
    });

    this._timeline.addCallback('end', () => {
      this._timeline?.destroy();
      this._timeline = undefined;
    });

    this._timeline.play();
  }

  /** Add gui settings */
  private _addGUI() {
    this._datGUI = new GUI({ closed: false });

    const folder = this._datGUI.addFolder('Slider');
    folder.open();

    folder.add(this.props, 'duration', 250, 5000, 50);

    folder.add(this.props, 'noiseSeed', 1, 20, 0.1).onChange((value) => {
      this._material.uniforms.u_noiseSeed.value = value;
    });

    folder.add(this.props, 'hasNoiseDisplacement').onChange((value) => {
      this._material.uniforms.u_hasNoiseDisplacement.value = value;
    });
  }

  /** Destroy the scene */
  destroy() {
    this.props.manager.scene.remove(this._mesh);

    this._resizeObserver.disconnect();
    this._webglEvents.forEach((event) => event.remove());
    this._timeline?.destroy();
    this._datGUI?.destroy();
  }
}
