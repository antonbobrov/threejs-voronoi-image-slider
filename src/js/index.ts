import '../styles/index.scss';
import { Slider } from './Slider';
import { WebglManager } from './webgl/Manager';

const container = document.getElementById('scene') as HTMLElement;

const manager = new WebglManager(container, {});
manager.play();

// SLIDER

const imagesSrc = ['./0.jpg', './1.jpg', './2.jpg'];

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.src = src;
  });

const sliderContainer = document.getElementById('carousel');

if (sliderContainer) {
  Promise.all(imagesSrc.map((src) => loadImage(src)))
    .then((images) => {
      const slider = new Slider({
        manager,
        images,
        container: sliderContainer,
      });

      const nextButton = document.getElementById('carousel-next-button');
      if (nextButton) {
        nextButton.addEventListener('click', () => slider.next());
      }
    })
    .catch(() => {});
}
