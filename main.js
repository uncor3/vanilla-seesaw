const BASE_WIDTH = 10;
const BASE_HEIGHT = 10;
const MULTIPLIER = 1.1;
const COLORS = ['red', 'green', 'blue', 'yellow', 'cyan', 'magenta'];
let color = COLORS[0];

const preview_weight = document.getElementById('preview-weight');
const seesaw_container = document.getElementById('seesaw-container');
const seesaw = document.getElementById('seesaw');

function createWeight(weight, style) {
  const div = document.createElement('div');
  div.className = 'weight';
  div.style = style;
  div.innerText = weight;
  return div;
}

class App {
  constructor() {
    this.weightElms = [];
  }

  addWeight(weight, style) {
    const elm = createWeight(weight, style);
    this.weightElms.push(elm);
    seesaw.appendChild(elm);
  }
}

let clickable = false;

seesaw_container.addEventListener('mousemove', (e) => {
  const rect = seesaw_container.getBoundingClientRect();
  // subtract absolute clientX mouse position from
  // div's left rect to get the distance of
  // mouse's distance to the left side of container
  const x = e.clientX - rect.left;

  // dont let it overflow the container
  if (x < preview_weight.offsetWidth) {
    return;
  }

  // subtract element's width from X diff and set it as style
  preview_weight.style.left = `${x - preview_weight.offsetWidth}px`;
});

function computeStyles(weight, offset) {
  color = COLORS[Math.floor(Math.random() * COLORS.length)];
  const width = Math.max(weight * MULTIPLIER * BASE_WIDTH, 25);
  const height = Math.max(weight * MULTIPLIER * BASE_HEIGHT, 25);

  const style = `left:${offset}px; width: ${width}px; height: ${height}px; background-color: ${color};`;

  return style;
}

function nextWeight() {
  const random = Math.max(Math.floor(Math.random() * 10), 1);
  const text = `${random}kg`;
  preview_weight.textContent = text;

  const prevLeft = preview_weight.style.left || 0;

  preview_weight.style = computeStyles(random, prevLeft);
  return random;
}

const app = new App();

seesaw_container.addEventListener('click', (e) => {
  const rect = seesaw_container.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const _nextWeight = nextWeight();

  app.addWeight(
    `${_nextWeight}KG`,
    computeStyles(_nextWeight, x - preview_weight.offsetWidth)
  );
});

nextWeight();
