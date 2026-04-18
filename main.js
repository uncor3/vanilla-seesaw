const BASE_WIDTH = 7.5;
const BASE_HEIGHT = 7.5;
const MULTIPLIER = 1.1;
const COLORS = ['green', 'yellow', 'cyan', 'magenta'];
const WEIGHT_FORMAT = 'kg';

let color = COLORS[0];

const preview_weight = document.getElementById('preview-weight');
const seesaw_container = document.getElementById('seesaw-container');
const seesaw = document.getElementById('seesaw');
const ruler = document.getElementById('ruler');

function createWeight(weight, style) {
  const div = document.createElement('div');
  div.className = 'weight';
  div.style = style;
  div.innerText = weight;
  return div;
}

class App {
  constructor() {
    this.weights = [];
    this.angle = 0;
  }

  /* -1 for left, 1 for right */
  addWeight(weight, side, distance, style) {
    console.log({ weight, side, distance, style });
    const elm = createWeight(`${weight}${WEIGHT_FORMAT}`, style);
    this.weights.push({ elm, weight, side, distance });
    seesaw.appendChild(elm);
    this.computeAndUpdate();
  }

  computeAndUpdate() {
    let torque = 0;

    for (const w of this.weights) {
      /* the formula : torque = weight * distance */
      torque += w.weight * w.distance * w.side;
      console.log(w);
    }

    this.angle = torque * 0.06;

    console.log(this.angle);

    /* capped at ±30 deg as requested in the pdf */
    seesaw.style.transform = `rotate(${Math.max(
      -30,
      Math.min(this.angle, 30)
    )}deg)`;
  }

  getAngle() {
    return this.angle;
  }
}

let clickable = false;

const app = new App();

seesaw_container.addEventListener('mousemove', (e) => {
  const rect = seesaw.getBoundingClientRect();
  // subtract div's left rect from
  // clientX cursor position to get
  // cursor's distance to the left side of container
  const x = e.clientX - rect.left;

  // dont let it overflow the seesaw completely
  // also align in the center
  if (
    (x < preview_weight.offsetWidth / 2) |
    (x > seesaw.offsetWidth + preview_weight.offsetWidth / 2)
  ) {
    return;
  }

  // subtract element's width from X diff and set it as style
  preview_weight.style.left = `${x - preview_weight.offsetWidth}px`;
});

function computeStyles(weight, offset) {
  const width = Math.max(weight * MULTIPLIER * BASE_WIDTH, 25);
  const height = Math.max(weight * MULTIPLIER * BASE_HEIGHT, 25);

  const style = `left:${offset}px; width: ${width}px; height: ${height}px; background-color: ${color};`;

  return style;
}

let weight_to_add = 0;

function nextWeight() {
  const random = Math.max(Math.floor(Math.random() * 10), 1);
  weight_to_add = random;
  const text = `${random}${WEIGHT_FORMAT}`;
  preview_weight.textContent = text;

  const { width, height } = getWeightSize(weight_to_add);
  preview_weight.style.width = `${width}px`;
  preview_weight.style.height = `${height}px`;
  color = COLORS[Math.floor(Math.random() * COLORS.length)];
  preview_weight.style.backgroundColor = color;

  return random;
}

function getWeightSize(weight) {
  return {
    width: Math.max(weight * MULTIPLIER * BASE_WIDTH, 25),
    height: Math.max(weight * MULTIPLIER * BASE_HEIGHT, 25),
  };
}

seesaw_container.addEventListener('click', (e) => {
  const rect = seesaw.getBoundingClientRect();
  const x = e.clientX - rect.left;

  const center = rect.width / 2;
  // cap it 200 at because it can bigger than the
  // width of the seesaw
  const distance = Math.min(Math.abs(x - center), 200);
  /* if the weight was dropped further from the center, 
    it is on the right side*/
  const side = x > center ? 1 : -1;
  const { width: weight_width } = getWeightSize(weight_to_add);

  // make sure that weight doesn't overflow the seesaw
  // center it to the begining as min
  // or center it at the very end as max
  const left = Math.max(
    -(weight_width / 2),
    Math.min(x - weight_width / 2, seesaw.offsetWidth - weight_width / 2)
  );
  app.addWeight(
    weight_to_add,
    side,
    distance,
    computeStyles(weight_to_add, left)
  );
  nextWeight();
});

nextWeight();

function handleRuler() {
  const rulerWidth = ruler.scrollWidth;
  const pointCount = rulerWidth / 20;

  console.log({ pointCount });

  for (let i = 0; i < pointCount; i++) {
    console.log('adding');

    const elm = document.createElement('div');
    elm.className = 'rule-point';
    /* center */
    if (i == 10) elm.classList.add('center');
    ruler.appendChild(elm);
  }
}

handleRuler();
