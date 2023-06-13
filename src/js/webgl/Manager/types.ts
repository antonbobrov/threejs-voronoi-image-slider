import { NViewport } from '@anton.bobrov/vevet-init';
import { IWebglRendererProps } from '../Renderer/types';

export interface IWebglManagerProps {
  fps?: number;
  resizeProps?:
    | {
        target?: keyof NViewport.CallbacksTypes;
        timeout?: number;
      }
    | false;
  cameraProps?: {
    fov?: number;
    perspective?: number | (() => number);
    near?: number;
    far?: number;
  };
  rendererProps?: IWebglRendererProps;
}

export interface IWebglManagerCallbacksTypes {
  destroy: false;
  beforeResize: false;
  resize: false;
  frame: false;
  afterRender: false;
}
