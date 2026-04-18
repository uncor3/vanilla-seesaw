const BASE_WIDTH = 7.5;
const BASE_HEIGHT = 7.5;
const MULTIPLIER = 1.1;
const COLORS = [
  '#4ade80',
  '#facc15',
  '#22d3ee',
  '#f472b6',
  '#818cf8',
  '#fb923c',
];
const WEIGHT_FORMAT = 'kg';

let color = COLORS[0];
let resetting = false;

const preview_weight = document.getElementById('preview-weight');
const seesaw_container = document.getElementById('seesaw-container');
const seesaw = document.getElementById('seesaw');
const ruler = document.getElementById('ruler');
const reset_btn = document.getElementById('reset-btn');

const left_weight_val = document.querySelector('#left-weight .val');
const tilt_angle_val = document.querySelector('#tilt-angle .val');
const next_weight_val = document.querySelector('#next-weight .val');
const right_weight_val = document.querySelector('#right-weight .val');

const logs = document.getElementById('logs');

function createWeight(weight, style) {
  const div = document.createElement('div');
  div.className = 'weight';
  div.style = style;
  div.innerText = weight;
  return div;
}

function createLog(weight, side, distance) {
  const div = document.createElement('div');
  div.className = 'log';
  div.textContent = `${weight}${WEIGHT_FORMAT} dropped on ${side} ${Math.floor(
    distance
  )}px further from the center`;
  return div;
}

function clearLogs() {
  logs.innerHTML = '';
}

class App {
  constructor() {
    this.weights = [];
    this.angle = 0;
  }

  /* -1 for left, 1 for right */
  addWeight(weight, side, distance, style) {
    const elm = createWeight(`${weight}${WEIGHT_FORMAT}`, style);
    const log = createLog(weight, side == -1 ? 'left' : 'right', distance);
    this.weights.push({ elm, weight, side, distance });
    seesaw.appendChild(elm);
    logs.prepend(log);
    this.computeAndUpdate();
  }

  computeAndUpdate() {
    let left_torque = 0;
    let left_weight = 0;

    let right_torque = 0;
    let right_weight = 0;

    for (const w of this.weights) {
      // left
      if (w.side == -1) {
        /* the formula : torque = weight * distance */
        left_torque += w.weight * w.distance * w.side;
        left_weight += w.weight;
      }
      //   right
      else {
        /* the formula : torque = weight * distance */
        right_torque += w.weight * w.distance * w.side;
        right_weight += w.weight;
      }
    }
    left_weight_val.textContent = `${left_weight}kg (${Math.abs(
      Math.floor(left_torque)
    )} torque)`;
    right_weight_val.textContent = `${right_weight}kg (${Math.abs(
      Math.floor(right_torque)
    )} torque)`;

    const torque = left_torque + right_torque;

    this.angle = torque * 0.06;

    /* capped at ±30 deg as requested in the pdf */
    const cappedAngle = Math.max(-30, Math.min(this.angle, 30));

    seesaw.style.transform = `rotate(${cappedAngle}deg)`;

    tilt_angle_val.textContent = `${Math.floor(cappedAngle)}°`;
  }

  getAngle() {
    return this.angle;
  }

  reset() {
    resetting = true;
    for (const w of this.weights) {
      seesaw.removeChild(w.elm);
    }

    seesaw.style.transform = '';
    this.angle = 0;
    this.weights = [];
    left_weight_val.textContent = '0kg (0 torque)';
    right_weight_val.textContent = '0kg (0 torque)';
    tilt_angle_val.textContent = '0°';

    resetting = false;
  }
}

let clickable = false;

const app = new App();

seesaw_container.addEventListener('mousemove', (e) => {
  preview_weight.style.opacity = 1;

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
  next_weight_val.textContent = text;

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
  if (resetting) return;
  preview_weight.style.opacity = 0;
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

  // +1 required for center
  const pointCount = Math.floor(rulerWidth / 20) + 1;
  const center = Math.floor(pointCount / 2);

  for (let i = 0; i < pointCount; i++) {
    const elm = document.createElement('div');
    elm.className = 'rule-point';
    elm.setAttribute('data-distance', Math.abs(i - center));
    if (i == center) elm.classList.add('center');
    ruler.appendChild(elm);
  }
}

handleRuler();

reset_btn.addEventListener('click', () => {
  app.reset();
  clearLogs();
});
