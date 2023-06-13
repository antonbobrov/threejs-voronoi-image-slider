import { Ctx2DPrerender } from '@anton.bobrov/vevet-init';
import { WebglManager } from '../webgl/Manager';

export interface ISliderProps {
  container: HTMLElement;
  images: HTMLImageElement[];
  manager: WebglManager;
  /** @default 1500 */
  duration?: number;
  /** @default 2 */
  noiseSeed?: number;
  /** @default true */
  hasNoiseDisplacement?: boolean;
}

export interface ISlide {
  prerender: Ctx2DPrerender;
}
