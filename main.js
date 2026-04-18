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
const SEESAW_MAX_DISTANCE = 200;
const CACHE_KEY = 'app_state';
const DEFAULT_APP_STATE = {
  weights: [],
};

const preview_weight = document.getElementById('preview-weight');
const seesaw_container = document.getElementById('seesaw-container');
const seesaw = document.getElementById('seesaw');
const ruler = document.getElementById('ruler');
const reset_btn = document.getElementById('reset-btn');

const left_weight_val = document.querySelector('#left-weight .val');
const tilt_angle_val = document.querySelector('#tilt-angle .val');
const next_weight_val = document.querySelector('#next-weight .val');
const right_weight_val = document.querySelector('#right-weight .val');

const sfx = document.getElementById('sfx');
const sfx_toggle = document.getElementById('sfx-toggle');
sfx.volume = 0.1;
const logs = document.getElementById('logs');

let color = COLORS[0];
let resetting = false;
let weight_to_add = 0;
let last_distance = 0;
let last_side = 1; // 1 for right, -1 for left
let last_left = 0;

function parseState() {
  const state = localStorage.getItem(CACHE_KEY);
  if (!state || !state.length) return DEFAULT_APP_STATE;

  try {
    const data = JSON.parse(state);
    // very basic validator as using libs is not allowed
    // also no sanitation whatsover
    if (typeof data == 'object' && Array.isArray(data.weights)) {
      return data;
    }
  } catch (error) {
    return DEFAULT_APP_STATE;
  }
  return DEFAULT_APP_STATE;
}

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
  div.textContent = `🪨 ${weight}${WEIGHT_FORMAT} dropped on ${side} ${Math.floor(
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

    this.left_torque = 0;
    this.left_weight = 0;

    this.right_torque = 0;
    this.right_weight = 0;

    const prevState = parseState();

    // if we had anything before
    if (prevState.weights.length) {
      for (const w of prevState.weights) {
        this.addWeight(w.weight, w.side, w.distance, w.style);
      }
    }
  }

  /* -1 for left, 1 for right */
  addWeight(weight, side, distance, style) {
    const elm = createWeight(`${weight}${WEIGHT_FORMAT}`, style);
    const log = createLog(weight, side == -1 ? 'left' : 'right', distance);
    const w = { weight, side, distance, style };
    this.weights.push(w);
    seesaw.appendChild(elm);
    logs.prepend(log);
    this.computeAndUpdate(w);
  }

  computeAndUpdate(w) {
    // left
    if (w.side == -1) {
      /* the formula : torque = weight * distance */
      this.left_torque += w.weight * w.distance * w.side;
      this.left_weight += w.weight;
    }
    //   right
    else {
      /* the formula : torque = weight * distance */
      this.right_torque += w.weight * w.distance * w.side;
      this.right_weight += w.weight;
    }
    this.updateUI();
    this.serialize();
  }

  reset() {
    resetting = true;
    seesaw.querySelectorAll('.weight').forEach((el) => el.remove());
    seesaw.style.transform = '';
    this.angle = 0;
    this.weights = [];
    this.left_torque = 0;
    this.left_weight = 0;
    this.right_torque = 0;
    this.right_weight = 0;
    this.updateUI();
    localStorage.removeItem(CACHE_KEY);

    resetting = false;
  }

  updateUI() {
    left_weight_val.textContent = `${this.left_weight}kg (${Math.abs(
      Math.floor(this.left_torque)
    )} torque)`;
    right_weight_val.textContent = `${this.right_weight}kg (${Math.abs(
      Math.floor(this.right_torque)
    )} torque)`;

    const torque = this.left_torque + this.right_torque;

    this.angle = torque * 0.06;

    /* capped at ±30 deg as requested in the pdf */
    const cappedAngle = Math.max(-30, Math.min(this.angle, 30));

    seesaw.style.transform = `rotate(${cappedAngle}deg)`;

    tilt_angle_val.textContent = `${Math.floor(cappedAngle)}°`;
  }

  serialize() {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        weights: this.weights,
      })
    );
  }
}
const app = new App();

seesaw_container.addEventListener('mousemove', (e) => {
  preview_weight.style.opacity = 1;

  const rect = seesaw.getBoundingClientRect();
  // subtract div's left rect from
  // clientX cursor position to get
  // cursor's distance to the left side of container
  const x = e.clientX - rect.left;

  // using seesaw.offsetWidth instead of rect.width
  // because of applied transform to seesaw
  const center = seesaw.offsetWidth / 2;
  const distance = Math.min(Math.abs(x - center), SEESAW_MAX_DISTANCE);
  const side = x > center ? 1 : -1;

  const { width: weight_width } = getWeightSize(weight_to_add);

  // clamp so the weight stays on seesaw
  // also center the weight
  const left = Math.max(
    -(weight_width / 2),
    Math.min(x - weight_width / 2, seesaw.offsetWidth - weight_width / 2)
  );

  preview_weight.style.left = `${left}px`;

  last_distance = distance;
  last_side = side;
  last_left = left;
});

function computeStyles(weight, left) {
  const width = Math.max(weight * MULTIPLIER * BASE_WIDTH, 25);
  const height = Math.max(weight * MULTIPLIER * BASE_HEIGHT, 25);

  const style = `left:${left}px; width: ${width}px; height: ${height}px; background-color: ${color};`;
  return style;
}

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
  if (sfx_toggle.checked) {
    sfx.currentTime = 0;
    sfx.play();
  }
  preview_weight.style.opacity = 0;

  app.addWeight(
    weight_to_add,
    last_side,
    last_distance,
    computeStyles(weight_to_add, last_left)
  );
  nextWeight();
});

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

reset_btn.addEventListener('click', () => {
  app.reset();
  clearLogs();
});

handleRuler();
nextWeight();

const log_styles = 'font-size: 20px;';
console.log(
  '%cHi Insider One team, i knew you would check here :)',
  log_styles
);
console.log('%cI would really want to work with you guys', log_styles);
console.log('%cI hope you liked it', log_styles);
console.log('%cVisit my site maybe? https://uncore.me', log_styles);
console.log('%cWritten by Uncore Ø3 https://github.com/uncor3', log_styles);
