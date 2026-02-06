let phraseInput, shapeSelect, presetSel;
let textPicker, bgPicker;

let ampSlider,
  freqSlider,
  trackSlider,
  trackRandSlider,
  leadSlider,
  noiseSlider;
let fontSizeSlider;
let wTrackSlider, wChaosSlider, wRampSlider;
let cChaosSlider, yJitterSlider, yAffectSlider, dropSlider;
let wordsPerRowSlider, hardWrapCheckbox;

let saveSvgBtn, randBtn, shuffleBtn;
let seedInput, seedPrevBtn;

let margin = 40;
let loadedFont;
let uiFont;

let params = {
  phrase: "art of type",

  time: 0,
  timeSpeed: 0.8,

  fontSize: 18,
  amp: 68,
  freq: 0.009,
  tracking: 0,
  trackRand: 0.84,
  leading: 12,
  noiseAmt: 22,
  noiseFreq: 0.006,

  shape: "wave",
  shapeAmp: 100,
  shapeFreq: 0.0045,
  trapezoidIn: 120,

  wordTrack: 52,
  wordChaos: 16,
  wordRamp: 0.8,

  charChaos: 40,
  yJitter: 3,
  jitterAffect: 0.11,
  dropProb: 0.34,

  rotJitter: 4,
  scaleJitter: 0.08,
  holeAmt: 0.12,
  holeScale: 0.006,

  wordsPerRow: 16,
  hardWrap: false,

  textColor: [0, 0, 0],
  bgColor: [255, 255, 255],

  seed: Math.floor(Math.random() * 100000),
};

let rowMul = [];
let svgCount = 1;
let seedHistory = [];

function preload() {
  loadedFont = loadFont("SeasonMix-TRIAL-Regular.otf");
  uiFont = loadFont("TWKContinental-Regular.otf");
}

function setup() {
  createCanvas(windowWidth*0.82, windowHeight);
  pixelDensity(2);
  noiseSeed(params.seed);

  textFont(loadedFont);
  textSize(params.fontSize);
  textAlign(LEFT, TOP);
  noStroke();

  // создаём сайдбар
  let sidebar = createDiv("").addClass("sidebar");
  
  const logoContainer = createDiv().addClass("logo-container").parent(sidebar);
  const logo = createDiv(`<svg xmlns="http://www.w3.org/2000/svg" width="153" height="27" viewBox="0 0 153 27" fill="none">
  <path d="M0 26.9461H5.64482L11.0369 7.67964L13.3678 27H18.6476L31.4537 7.67964L26.0898 26.9461H31.7346L39.2891 0H30.6955L17.5804 19.994L15.418 0H7.55452L0 26.9461ZM38.1096 26.9461H44.4003L51.9268 0H45.636L38.1096 26.9461ZM46.6189 26.9461H53.1624L57.1503 21.0988H68.8051L69.5072 26.9461H75.4328L71.7539 0H65.3508L46.6189 26.9461ZM60.3519 16.3563L67.092 6.46707L68.2434 16.3563H60.3519ZM81.5832 26.9461H87.9862L105.51 0H98.7985L86.7505 19.0509L84.1107 0H77.9042L81.5832 26.9461ZM100.568 26.9461H106.69L114.244 0H108.094L100.568 26.9461ZM118.906 26.9461H125.927L117.081 13.985L133.061 0H125.085L109.948 13.0689L118.906 26.9461ZM124.186 26.9461H130.73L134.689 21.0988H146.372L147.046 26.9461H153L149.293 0H142.918L124.186 26.9461ZM137.919 16.3563L144.659 6.46707L145.811 16.3563H137.919Z" fill="#272727"/>
</svg>
    `).addClass("logo").parent(logoContainer);

  // Phrase input
  phraseInput = createInput(params.phrase)
    .addClass("text-field")
    .parent(sidebar);
  phraseInput.input(() => {
    params.phrase = phraseInput.value().toLowerCase();
  });

  createP().addClass("spacer").parent(sidebar);

  // Shape & Preset in one row
  const shapePresetRow = createDiv().addClass("shape-preset-row").parent(sidebar);

  createSpan("Shape").addClass("field-label").parent(shapePresetRow);
  shapeSelect = createSelect().addClass("select-input").parent(shapePresetRow);
  ["rectangle", "wave", "trapezoid", "diamond"].forEach(s => shapeSelect.option(s));
  shapeSelect.selected(params.shape);
  shapeSelect.changed(() => (params.shape = shapeSelect.value()));

  createSpan("Preset:").addClass("field-label").parent(shapePresetRow);
  presetSel = createSelect().addClass("select-input").parent(shapePresetRow);
  presetSel.option("calm");
  presetSel.option("messy");
  presetSel.option("broken");
  presetSel.selected("messy");
  presetSel.changed(onPresetChange);

  // Colors row
  const colorsRow = createDiv().addClass("colors-row").parent(sidebar);
  createSpan("Colors").addClass("field-label").parent(colorsRow);

  textPicker = createColorPicker("#000000").addClass("color-picker").parent(colorsRow);
  textPicker.input(() => {
    const c = color(textPicker.value());
    params.textColor = [red(c), green(c), blue(c)];
  });

  bgPicker = createColorPicker("#ffffff").addClass("color-picker").parent(colorsRow);
  bgPicker.input(() => {
    const c = color(bgPicker.value());
    params.bgColor = [red(c), green(c), blue(c)];
  });
 

  createP().addClass("spacer").parent(sidebar);


  // Seed row (над слайдерами, с Randomize в начале)
  const seedRow = createDiv().addClass("seed-row").parent(sidebar);

  randBtn = createButton("Randomize values").addClass("rand-btn").parent(seedRow);
  randBtn.mousePressed(randomizeAll);


const seedWrapper = createDiv().addClass("seed-wrapper").parent(seedRow);
  createSpan("Seed").addClass("seed-label").parent(seedWrapper);

  seedInput = createInput(String(params.seed), "number")
    .addClass("seed-input")
    .parent(seedWrapper);
  seedInput.input(() => {
    const v = parseInt(seedInput.value(), 10);
    if (Number.isNaN(v)) return;
    applySeed(v, true);
  });

  const icons = createDiv().addClass("icons-wrapper").parent(seedRow);
  // Заглушки для иконок Shuffle и Prev
  const shuffleIcon = createDiv(`<svg xmlns="http://www.w3.org/2000/svg" width="17" height="16" viewBox="0 0 17 16" fill="none">
  <path d="M13.192 2.78L11.47 1.06L12.53 0L16.067 3.53L12.53 7.06L11.47 6L13.193 4.28H10.003C9.401 4.28 9.01 4.482 8.723 4.778C8.414 5.097 8.185 5.57 8.028 6.161C7.898 6.649 7.806 7.184 7.732 7.669C7.698 8.333 7.616 9.082 7.429 9.786C7.236 10.507 6.916 11.253 6.361 11.826C5.786 12.42 5.002 12.78 4.004 12.78H0V11.28H4.003C4.604 11.28 4.996 11.078 5.283 10.782C5.591 10.463 5.821 9.99 5.978 9.399C6.127 8.842 6.194 8.306 6.266 7.737L6.305 7.427C6.34783 6.86919 6.43883 6.31613 6.577 5.774C6.77 5.052 7.09 4.307 7.644 3.734C8.22 3.14 9.004 2.78 10.002 2.78H13.192ZM4.004 2.78C4.804 2.78 5.464 3.01 5.992 3.408C5.70633 3.84279 5.47653 4.31181 5.308 4.804L5.284 4.778C4.997 4.482 4.605 4.28 4.004 4.28H0V2.78H4.004ZM8.699 10.756C8.538 11.215 8.319 11.696 8.015 12.152C8.542 12.549 9.203 12.78 10.003 12.78H13.193L11.471 14.5L12.531 15.56L16.067 12.03L12.53 8.5L11.47 9.56L13.193 11.28H10.003C9.401 11.28 9.01 11.078 8.723 10.782L8.699 10.756Z" fill="black"/>
</svg>`).addClass("icon-placeholder").parent(icons);
  
  shuffleIcon.mousePressed(() => {
    pushSeedHistory();
    const next = Math.floor(Math.random() * 100000);
    applySeed(next, true);
  });

  const prevIcon = createDiv(
    `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M6.73566 16.106L8.91166 13.726L7.81866 12.698L3.97266 16.856L7.81866 21.014L8.91166 19.986L6.73566 17.606H9.54666C10.6717 17.606 11.7967 17.636 12.9207 17.606C14.3487 17.605 16.2827 17.356 17.8837 16.329C19.5437 15.264 20.7517 13.423 20.7517 10.47C20.7517 7.99096 19.4247 5.57396 17.1017 4.53996C15.2817 3.72696 14.0577 3.73996 12.2957 3.75196L11.7287 3.75396V5.25396L12.2817 5.25196C14.1017 5.24496 14.9857 5.23796 16.4917 5.90896C18.3457 6.73596 19.2517 8.56596 19.2517 10.47C19.2517 12.942 18.2787 14.294 17.0737 15.066C15.8157 15.873 14.2097 16.106 12.9107 16.106H12.8907C11.7757 16.136 10.6617 16.106 9.54666 16.106H6.73566Z" fill="black"/>
</svg>`
  ).addClass("icon-placeholder").parent(icons);
  prevIcon.mousePressed(popSeedHistory);


  // ——— Слайдеры ————————————————————————
  fontSizeSlider = makeSlider("FontSize", 8, 96, params.fontSize, 1, v => {
    params.fontSize = v;
    textSize(v);
  }, sidebar);

  ampSlider    = makeSlider("Amplitude",   0, 140, params.amp,    1, v => params.amp = v,    sidebar);
  freqSlider   = makeSlider("Frequency",   0.001, 0.03, params.freq, 0.0001, v => params.freq = v, sidebar);
  trackSlider  = makeSlider("CharTrack",   -12, 28, params.tracking, 1, v => params.tracking = v, sidebar);
  trackRandSlider = makeSlider("TrackRand", 0, 1, params.trackRand, 0.01, v => params.trackRand = v, sidebar);
  leadSlider   = makeSlider("Leading",     12, 120, params.leading, 1, v => {
    params.leading = v;
    buildRowMultipliers();
  }, sidebar);
  noiseSlider  = makeSlider("NoiseAmt",    0, 40, params.noiseAmt, 1, v => params.noiseAmt = v, sidebar);

  createP().addClass("spacer").parent(sidebar);

  wTrackSlider = makeSlider("WordTrack",   0, 80, params.wordTrack, 1, v => params.wordTrack = v, sidebar);
  wChaosSlider = makeSlider("WordChaos",   0, 60, params.wordChaos, 1, v => params.wordChaos = v, sidebar);
  wRampSlider  = makeSlider("WordRamp",    0, 1, params.wordRamp, 0.01, v => params.wordRamp = v, sidebar);

  createP().addClass("spacer").parent(sidebar);

  cChaosSlider = makeSlider("CharChaos",   0, 40, params.charChaos, 1, v => params.charChaos = v, sidebar);
  yJitterSlider = makeSlider("YJitter",    0, 20, params.yJitter, 1, v => params.yJitter = v, sidebar);
  yAffectSlider = makeSlider("YJitterAffect", 0, 1, params.jitterAffect, 0.01, v => params.jitterAffect = v, sidebar);
  dropSlider   = makeSlider("DropProb",    0, 0.9, params.dropProb, 0.01, v => params.dropProb = v, sidebar);

  createP().addClass("spacer").parent(sidebar);

  wordsPerRowSlider = makeSlider("Words/Row", 1, 30, params.wordsPerRow, 1, v => params.wordsPerRow = v, sidebar);

  hardWrapCheckbox = createCheckbox(" Hard wrap", params.hardWrap)
    .addClass("checkbox-input")
    .parent(sidebar)
    .changed(() => (params.hardWrap = hardWrapCheckbox.checked()));

  createP().addClass("spacer").parent(sidebar);

  

  // Save SVG button внизу на всю ширину
  saveSvgBtn = createButton("Save SVG").addClass("btn full-width").parent(sidebar);
  saveSvgBtn.mousePressed(saveSVGTransparent);

  buildRowMultipliers();
  onPresetChange();
}

function draw() {
  background(...params.bgColor);
  fill(params.textColor);

  const top = margin;
  const bottom = height - margin;
  let y = top;
  let row = 0;

  while (y + params.leading <= bottom) {
    const [L, R] = rowBounds(y);
    if (R - L > 30) layoutRow(y, L, R, row);
    y += params.leading;
    row++;
  }
}

function applySeed(newSeed, rebuildRows = true) {
  params.seed = Math.floor(newSeed);
  noiseSeed(params.seed);
  if (rebuildRows) buildRowMultipliers();
  seedInput.value(String(params.seed));
}

function pushSeedHistory() {
  const last = seedHistory.length ? seedHistory[seedHistory.length - 1] : null;
  if (last !== params.seed) seedHistory.push(params.seed);
}

function popSeedHistory() {
  if (!seedHistory.length) return;
  const prev = seedHistory.pop();
  applySeed(prev, true);
}

function updateRangeFill(sl) {
  const min = sl._min ?? Number(sl.elt.min);
  const max = sl._max ?? Number(sl.elt.max);
  const v = Number(sl.value());
  const pct = ((v - min) / (max - min)) * 100;
  sl.elt.style.setProperty("--pos", `${pct}%`);
}

function makeSlider(label, min, max, val, step, onChange, parent = null) {
  // создаём строку слайдера
  const row = createDiv().addClass("slider-row");
  if (parent) row.parent(parent);

  // метка
  createSpan(label).addClass("slider-label").parent(row);

  // сам слайдер
  const s = createSlider(min, max, val, step);
  s.addClass("param-slider").parent(row);
  
  

  // поле с числом
  const num = createInput(String(val), "number");
  num.addClass("slider-number");
  num.attribute("min", String(min));
  num.attribute("max", String(max));
  num.attribute("step", String(step));
  num.parent(row);

  num.input(() => {
    let v = parseFloat(num.value());
    if (Number.isNaN(v)) return;
    v = constrain(v, min, max);
    s.value(v);
    updateRangeFill(s);
    onChange(v);
  });

  s.input(() => {
    const v = parseFloat(s.value());
    num.value(String(v));
    updateRangeFill(s);
    onChange(v);
  });

  s._num = num;
  s._min = min;
  s._max = max;

  updateRangeFill(s);
  return s;
}

function setSlider(sl, v) {
  sl.value(v);
  if (sl._num) sl._num.value(String(v));
  updateRangeFill(sl);
}

function layoutRow(y, L, R, rowIdx) {
  const phrase =
    params.phrase && params.phrase.trim().length ? params.phrase : "text";
  const words = phrase.toLowerCase().split(/\s+/);

  const rm = rowMul[rowIdx % rowMul.length] || {
    ampMul: 1,
    freqMul: 1,
    rampSign: 1,
  };

  let x = L;
  let wordIdx = 0;
  let colWord = 0;

  while (true) {
    if (params.hardWrap && colWord >= params.wordsPerRow) break;

    const w = words[wordIdx % words.length];
    const wWidth = measureWordWidthDeterministic(w, rowIdx, colWord);

    if (!params.hardWrap && x + wWidth > R) break;

    let xChar = x;
    for (let i = 0; i < w.length; i++) {
      const r1 = noise(rowIdx * 0.13, colWord * 0.37, i * 0.19);
      const r2 = noise(rowIdx * 0.21, colWord * 0.41, i * 0.29);
      const r3 = noise(rowIdx * 0.31, colWord * 0.17, i * 0.11);
      const rRot =
        (noise(rowIdx * 0.07, colWord * 0.21, i * 0.33) - 0.5) *
        2 *
        params.rotJitter;
      const rSc =
        1.0 +
        (noise(rowIdx * 0.29, colWord * 0.47, i * 0.15) - 0.5) *
          2 *
          params.scaleJitter;

      if (r3 < params.dropProb) {
        const trackAdd = charTrackFor(rowIdx, colWord, i);
        xChar += textWidth(w[i]) + trackAdd + r1 * params.charChaos;
        continue;
      }

      const applyY = r2 < params.jitterAffect;
      const yJ = applyY ? (r2 - 0.5) * 2 * params.yJitter : 0;

      const baseX = xChar;

      // без анимации
      // const wave = sin(y * (params.freq * rm.freqMul)) * (params.amp * rm.ampMul);
      // с анимацией + frameCount * 0.04
      const wave =
        sin(y * (params.freq * rm.freqMul) ) *
        (params.amp * rm.ampMul);

      const n = noise(baseX * params.noiseFreq, y * params.noiseFreq);
      const nShift = (n - 0.5) * 2 * params.noiseAmt;

      const xx = baseX + wave + nShift;
      const yy = y + yJ;

      const hole = noise(xx * params.holeScale, yy * params.holeScale);
      if (hole < params.holeAmt) {
        const trackAdd = charTrackFor(rowIdx, colWord, i);
        xChar += textWidth(w[i]) + trackAdd + r1 * params.charChaos;
        continue;
      }

      push();
      translate(xx, yy);
      rotate(radians(rRot));
      scale(rSc, rSc);
      text(w[i], 0, 0);
      pop();

      const trackAdd = charTrackFor(rowIdx, colWord, i);
      xChar += textWidth(w[i]) + trackAdd + r1 * params.charChaos;
    }

    const xNorm = constrain((x + wWidth - L) / max(1, R - L), 0, 1);
    const chaos =
      (noise(colWord * 0.37, rowIdx * 0.61) - 0.5) * 2 * params.wordChaos;
    const ramp = params.wordRamp * xNorm * params.wordTrack * rm.rampSign;
    const gap = max(0, params.wordTrack + chaos + ramp);

    x += wWidth + gap;
    colWord++;
    wordIdx++;

    if (!params.hardWrap) {
      const nextW = measureWordWidthDeterministic(
        words[wordIdx % words.length],
        rowIdx,
        colWord,
      );
      if (x + nextW > R) break;
    } else {
      if (colWord >= params.wordsPerRow) break;
    }
  }
}

function measureWordWidthDeterministic(w, rowIdx, colWord) {
  let sum = 0;
  for (let i = 0; i < w.length; i++) {
    const adv = textWidth(w[i]);
    const r1 = noise(rowIdx * 0.13, colWord * 0.37, i * 0.19);
    const extraChaos = i < w.length - 1 ? r1 * params.charChaos : 0;
    const trackAdd = i < w.length - 1 ? charTrackFor(rowIdx, colWord, i) : 0;
    sum += adv + trackAdd + extraChaos;
  }
  return sum;
}

function charTrackFor(rowIdx, colWord, i) {
  const base = params.tracking;
  const uniform = constrain(params.trackRand, 0, 1);
  if (uniform >= 1) return base;

  const chaos = 1 - uniform;

  const n0 = noise(rowIdx * 0.05, (colWord * 7 + i) * 0.07);
  const zeroProb = 0.6 * chaos;
  if (n0 < zeroProb) return 0;

  const nv = noise(rowIdx * 0.09, (colWord * 7 + i) * 0.11);
  const spreadMax = 1 + 7.0 * chaos;
  const factor = 1 + (spreadMax - 1) * nv;

  const out = base * factor;
  return base >= 0 ? max(0, out) : min(0, out);
}

function rowBounds(y) {
  switch (params.shape) {
    case "rectangle":
      return [margin, width - margin];

    case "wave": {
      const centerL = width * 0.22;
      const centerR = width * 0.78;
      return [
        centerL + sin(y * params.shapeFreq) * params.shapeAmp,
        centerR + sin(y * params.shapeFreq + PI) * params.shapeAmp,
      ];
    }

    case "trapezoid": {
      const norm = map(y, margin, height - margin, 0, 1);
      const inset = norm * params.trapezoidIn;
      return [margin + inset, width - margin - inset];
    }

    case "diamond": {
      const mid = height / 2;
      const dy = abs(y - mid);
      const norm = constrain(dy / (height / 2 - margin), 0, 1);
      const inset = norm * params.shapeAmp;
      return [margin + inset, width - margin - inset];
    }

    default:
      return [margin, width - margin];
  }
}

function onPresetChange() {
  const p = presetSel.value();

  if (p === "calm") {
    params.charChaos = 3;
    setSlider(cChaosSlider, params.charChaos);
    params.yJitter = 1;
    setSlider(yJitterSlider, params.yJitter);
    params.jitterAffect = 0.3;
    setSlider(yAffectSlider, params.jitterAffect);
    params.dropProb = 0.0;
    setSlider(dropSlider, params.dropProb);
    params.wordChaos = 4;
    setSlider(wChaosSlider, params.wordChaos);
    params.wordRamp = 0.2;
    setSlider(wRampSlider, params.wordRamp);
    params.rotJitter = 1;
    params.scaleJitter = 0.02;
    params.holeAmt = 0.0;
  } else if (p === "messy") {
    params.charChaos = 12;
    setSlider(cChaosSlider, params.charChaos);
    params.yJitter = 3;
    setSlider(yJitterSlider, params.yJitter);
    params.jitterAffect = 0.6;
    setSlider(yAffectSlider, params.jitterAffect);
    params.dropProb = 0.04;
    setSlider(dropSlider, params.dropProb);
    params.wordChaos = 16;
    setSlider(wChaosSlider, params.wordChaos);
    params.wordRamp = 0.6;
    setSlider(wRampSlider, params.wordRamp);
    params.rotJitter = 3;
    params.scaleJitter = 0.05;
    params.holeAmt = 0.12;
  } else {
    params.charChaos = 24;
    setSlider(cChaosSlider, params.charChaos);
    params.yJitter = 7;
    setSlider(yJitterSlider, params.yJitter);
    params.jitterAffect = 0.85;
    setSlider(yAffectSlider, params.jitterAffect);
    params.dropProb = 0.12;
    setSlider(dropSlider, params.dropProb);
    params.wordChaos = 26;
    setSlider(wChaosSlider, params.wordChaos);
    params.wordRamp = 0.9;
    setSlider(wRampSlider, params.wordRamp);
    params.rotJitter = 6;
    params.scaleJitter = 0.1;
    params.holeAmt = 0.22;
  }
}

function buildRowMultipliers() {
  rowMul = [];
  const rows = floor((height - 2 * margin) / params.leading);
  for (let r = 0; r < rows; r++) {
    const n1 = noise(r * 0.17, 0.11);
    const n2 = noise(r * 0.23, 0.37);
    const n3 = noise(r * 0.41, 0.19);
    rowMul.push({
      ampMul: map(n1, 0, 1, 0.8, 1.25),
      freqMul: map(n2, 0, 1, 0.8, 1.25),
      rampSign: n3 < 0.5 ? -1 : +1,
    });
  }
}

function randomizeAll() {
  pushSeedHistory();
  applySeed(Math.floor(Math.random() * 100000), false);

  params.fontSize = Math.round(random(14, 56));
  setSlider(fontSizeSlider, params.fontSize);
  textSize(params.fontSize);
  params.amp = Math.round(random(20, 120));
  setSlider(ampSlider, params.amp);
  params.freq = random(0.003, 0.02);
  setSlider(freqSlider, params.freq);
  params.tracking = Math.round(random(-4, 14));
  setSlider(trackSlider, params.tracking);
  params.trackRand = random(0, 1);
  setSlider(trackRandSlider, params.trackRand);
  params.leading = Math.round(random(16, 72));
  setSlider(leadSlider, params.leading);
  params.noiseAmt = Math.round(random(0, 24));
  setSlider(noiseSlider, params.noiseAmt);
  params.noiseFreq = random(0.003, 0.012);

  params.shape = random(["rectangle", "wave", "trapezoid", "diamond"]);
  shapeSelect.value(params.shape);
  params.shapeAmp = Math.round(random(60, 160));
  params.shapeFreq = random(0.002, 0.008);
  params.trapezoidIn = Math.round(random(40, 180));

  params.wordTrack = Math.round(random(8, 60));
  setSlider(wTrackSlider, params.wordTrack);
  params.wordChaos = Math.round(random(0, 40));
  setSlider(wChaosSlider, params.wordChaos);
  params.wordRamp = random(0.0, 1.0);
  setSlider(wRampSlider, params.wordRamp);

  params.charChaos = Math.round(random(0, 28));
  setSlider(cChaosSlider, params.charChaos);
  params.yJitter = Math.round(random(0, 12));
  setSlider(yJitterSlider, params.yJitter);
  params.jitterAffect = random(0.2, 0.95);
  setSlider(yAffectSlider, params.jitterAffect);

  params.dropProb = random(0, 0.6);
  setSlider(dropSlider, params.dropProb);

  params.rotJitter = random(0, 6);
  params.scaleJitter = random(0, 0.12);
  params.holeAmt = random(0, 0.25);
  params.holeScale = random(0.003, 0.012);

  params.wordsPerRow = Math.round(random(3, 16));
  setSlider(wordsPerRowSlider, params.wordsPerRow);
  params.hardWrap = random() < 0.5;
  hardWrapCheckbox.checked(params.hardWrap);

  buildRowMultipliers();
  seedInput.value(String(params.seed));
}

// вывод
function baseFileName() {
  const raw = (params.phrase || "export").trim().toLowerCase();
  const safe = raw.replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  return safe.length ? safe : "export";
}

function saveSVGTransparent() {
  const g = createGraphics(width, height, SVG);
  g.pixelDensity(1);
  g.clear();

  g.textFont(loadedFont);
  g.textSize(params.fontSize);
  g.textAlign(LEFT, TOP);
  g.noStroke();
  g.fill(...params.textColor);

  const top = margin;
  const bottom = g.height - margin;
  let y = top;
  let row = 0;

  while (y + params.leading <= bottom) {
    const [L, R] = rowBounds(y);
    if (R - L > 30) layoutRowScaled(g, y, L, R, row, 1);
    y += params.leading;
    row++;
  }

  const name = `${baseFileName()}_${svgCount++}.svg`;
  g.save(name);
  g.remove();
}

//SVG
function layoutRowScaled(g, y, L, R, rowIdx, sc) {
  const phrase =
    params.phrase && params.phrase.trim().length ? params.phrase : "text";
  const words = phrase.toLowerCase().split(/\s+/);
  const rm = rowMul[rowIdx % rowMul.length] || {
    ampMul: 1,
    freqMul: 1,
    rampSign: 1,
  };

  let x = L;
  let wordIdx = 0;
  let colWord = 0;

  while (true) {
    if (params.hardWrap && colWord >= params.wordsPerRow) break;

    const w = words[wordIdx % words.length];
    const wWidth = measureWordWidthDeterministicScaled(
      g,
      w,
      rowIdx,
      colWord,
      sc,
    );

    if (!params.hardWrap && x + wWidth > R) break;

    let xChar = x;
    for (let i = 0; i < w.length; i++) {
      const r1 = noise(rowIdx * 0.13, colWord * 0.37, i * 0.19);
      const r2 = noise(rowIdx * 0.21, colWord * 0.41, i * 0.29);
      const r3 = noise(rowIdx * 0.31, colWord * 0.17, i * 0.11);
      const rRot =
        (noise(rowIdx * 0.07, colWord * 0.21, i * 0.33) - 0.5) *
        2 *
        params.rotJitter;
      const rSc =
        1.0 +
        (noise(rowIdx * 0.29, colWord * 0.47, i * 0.15) - 0.5) *
          2 *
          params.scaleJitter;

      if (r3 < params.dropProb) {
        const trackAdd = charTrackForScaled(rowIdx, colWord, i, sc);
        xChar += g.textWidth(w[i]) + trackAdd + r1 * params.charChaos * sc;
        continue;
      }

      const applyY = r2 < params.jitterAffect;
      const yJ = applyY ? (r2 - 0.5) * 2 * params.yJitter * sc : 0;

      const baseX = xChar;

      const wave =
        sin((y / sc) * (params.freq * rm.freqMul)) *
        (params.amp * rm.ampMul * sc);
      const n = noise(
        (baseX / sc) * params.noiseFreq,
        (y / sc) * params.noiseFreq,
      );
      const nShift = (n - 0.5) * 2 * params.noiseAmt * sc;

      const xx = baseX + wave + nShift;
      const yy = y + yJ;

      const hole = noise(
        (xx / sc) * params.holeScale,
        (yy / sc) * params.holeScale,
      );
      if (hole < params.holeAmt) {
        const trackAdd = charTrackForScaled(rowIdx, colWord, i, sc);
        xChar += g.textWidth(w[i]) + trackAdd + r1 * params.charChaos * sc;
        continue;
      }

      g.push();
      g.translate(xx, yy);
      g.rotate(radians(rRot));
      g.scale(rSc, rSc);
      g.text(w[i], 0, 0);
      g.pop();

      const trackAdd = charTrackForScaled(rowIdx, colWord, i, sc);
      xChar += g.textWidth(w[i]) + trackAdd + r1 * params.charChaos * sc;
    }

    const xNorm = constrain((x + wWidth - L) / max(1, R - L), 0, 1);
    const chaos =
      (noise(colWord * 0.37, rowIdx * 0.61) - 0.5) * 2 * params.wordChaos * sc;
    const ramp = params.wordRamp * xNorm * params.wordTrack * rm.rampSign * sc;
    const gap = max(0, params.wordTrack * sc + chaos + ramp);

    x += wWidth + gap;
    colWord++;
    wordIdx++;

    if (!params.hardWrap) {
      const nextW = measureWordWidthDeterministicScaled(
        g,
        words[wordIdx % words.length],
        rowIdx,
        colWord,
        sc,
      );
      if (x + nextW > R) break;
    } else {
      if (colWord >= params.wordsPerRow) break;
    }
  }
}

function measureWordWidthDeterministicScaled(g, w, rowIdx, colWord, sc) {
  let sum = 0;
  for (let i = 0; i < w.length; i++) {
    const adv = g.textWidth(w[i]);
    const r1 = noise(rowIdx * 0.13, colWord * 0.37, i * 0.19);
    const extraChaos = i < w.length - 1 ? r1 * params.charChaos * sc : 0;
    const trackAdd =
      i < w.length - 1 ? charTrackForScaled(rowIdx, colWord, i, sc) : 0;
    sum += adv + trackAdd + extraChaos;
  }
  return sum;
}

function charTrackForScaled(rowIdx, colWord, i, sc) {
  const base = params.tracking * sc;
  const uniform = constrain(params.trackRand, 0, 1);
  if (uniform >= 1) return base;

  const chaos = 1 - uniform;

  const n0 = noise(rowIdx * 0.05, (colWord * 7 + i) * 0.07);
  const zeroProb = 0.6 * chaos;
  if (n0 < zeroProb) return 0;

  const nv = noise(rowIdx * 0.09, (colWord * 7 + i) * 0.11);
  const spreadMax = 1 + 7.0 * chaos;
  const factor = 1 + (spreadMax - 1) * nv;

  const out = base * factor;
  return params.tracking >= 0 ? max(0, out) : min(0, out);
}
