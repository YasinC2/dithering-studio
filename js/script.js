import { PatternEditor, initPatternEditor } from './pattern-editor.js';

/* -------------------------------
   DEFAULT STATE & CONSTANTS
--------------------------------- */
const DEFAULT = {
    pixelSize: 4,
    steps: 2,
    mode: 'BW',
    invert: false,
    brightness: 0,
    contrast: 100,
    outputScale: 1
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Preset patterns (matching your file list)
const PRESET_PATTERNS = [
    { name: "Pattern", url: "patterns/dither-pattern-1.png" },
    { name: "Pattern", url: "patterns/dither-pattern-2.png" },
    { name: "Pattern", url: "patterns/dither-pattern-3.png" },
    { name: "Pattern", url: "patterns/dither-pattern-20_.png" },
    { name: "Pattern", url: "patterns/dither-pattern-23.png" },
    { name: "Pattern", url: "patterns/dither-pattern-8_.png" },
    { name: "Pattern", url: "patterns/dither-pattern-4.png" },
    { name: "Pattern", url: "patterns/dither-pattern-4-r.png" },
    { name: "Pattern", url: "patterns/dither-pattern-5.png" },
    { name: "Pattern", url: "patterns/dither-pattern-5-r.png" },
    { name: "Pattern", url: "patterns/dither-pattern-8.png" },
    { name: "Pattern", url: "patterns/dither-pattern-8-r.png" },
    { name: "Pattern", url: "patterns/dither-pattern-6.png" },
    { name: "Pattern", url: "patterns/dither-pattern-6-r.png" },
    { name: "Pattern", url: "patterns/dither-pattern-7.png" },
    { name: "Pattern", url: "patterns/dither-pattern-7-r.png" },
    { name: "Pattern", url: "patterns/dither-pattern-9.png" },
    { name: "Pattern", url: "patterns/dither-pattern-9-r.png" },
    { name: "Pattern", url: "patterns/dither-pattern-10.png" },
    { name: "Pattern", url: "patterns/dither-pattern-10-r.png" },
    { name: "Pattern", url: "patterns/dither-pattern-11.png" },
    { name: "Pattern", url: "patterns/dither-pattern-11-r.png" },
    { name: "Pattern", url: "patterns/dither-pattern-12.png" },
    { name: "Pattern", url: "patterns/dither-pattern-12-r.png" },
    { name: "Pattern", url: "patterns/dither-pattern-13.png" },
    { name: "Pattern", url: "patterns/dither-pattern-13-r.png" },
    { name: "Pattern", url: "patterns/dither-pattern-13_.png" },
    { name: "Pattern", url: "patterns/dither-pattern-13-r_.png" },
    { name: "Pattern", url: "patterns/dither-pattern-14.png" },
    { name: "Pattern", url: "patterns/dither-pattern-14-r.png" },
    { name: "Pattern", url: "patterns/dither-pattern-15.png" },
    { name: "Pattern", url: "patterns/dither-pattern-15-r.png" },
    { name: "Pattern", url: "patterns/dither-pattern-16.png" },
    { name: "Pattern", url: "patterns/dither-pattern-16-r.png" },
    { name: "Pattern", url: "patterns/dither-pattern-17.png" },
    { name: "Pattern", url: "patterns/dither-pattern-17-r.png" },
    { name: "Pattern", url: "patterns/dither-pattern-18.png" },
    { name: "Pattern", url: "patterns/dither-pattern-18-r.png" },
    { name: "Pattern", url: "patterns/dither-pattern-19.png" },
    { name: "Pattern", url: "patterns/dither-pattern-19-r.png" },
    { name: "Pattern", url: "patterns/dither-pattern-20.png" },
    { name: "Pattern", url: "patterns/dither-pattern-20-r.png" },
    { name: "Pattern", url: "patterns/dither-pattern-21.png" },
    { name: "Pattern", url: "patterns/dither-pattern-21-r.png" },
    { name: "Pattern", url: "patterns/dither-pattern-22.png" },
    { name: "Pattern", url: "patterns/dither-pattern-22-r.png" },
    { name: "Pattern", url: "patterns/dither-pattern-26.png" },
    { name: "Pattern", url: "patterns/dither-pattern-27.png" },
    { name: "Pattern", url: "patterns/dither-pattern-12_.png" },
];

// Preset palettes from Lospec
const PRESET_PALETTES = [
    {
        name: "Pastelito2",
        url: "palettes/pastelito2-1x.png",
        colors: 2,
    },
    {
        name: "1-bit Chill",
        url: "palettes/1-bit-chill-1x.png",
        colors: 2,
    },
    {
        name: "Calccurate Game",
        url: "palettes/calccurate-game-boy-1x.png",
        colors: 4,
    },
    {
        name: "Original Gameboy",
        url: "palettes/original-gameboy-1x.png",
        colors: 4,
    },
    {
        name: "Astro Boy",
        url: "palettes/astro-boy-1x.png",
        colors: 4,
    },
    {
        name: "Snooker GB",
        url: "palettes/snooker-gb-1x.png",
        colors: 4,
    },
    {
        name: "Lava GB",
        url: "palettes/lava-gb-1x.png",
        colors: 4,
    },
    {
        name: "Ice Cream GB",
        url: "palettes/ice-cream-gb-1x.png",
        colors: 4,
    },
    {
        name: "Hollow",
        url: "palettes/hollow-1x.png",
        colors: 4,
    },
    {
        name: "Moonlight",
        url: "palettes/moonlight-gb-1x.png",
        colors: 4,
    },
    {
        name: "Kid Icarus (SGB)",
        url: "palettes/kid-icarus-sgb-1x.png",
        colors: 4,
    },
    {
        name: "AYY4",
        url: "palettes/ayy4-1x.png",
        colors: 4,
    },
    {
        name: "EB GB Banana Flavour",
        url: "palettes/eb-gb-banana-flavour-1x.png",
        colors: 4,
    },
    {
        name: "2bit demichrome",
        url: "palettes/2bit-demichrome-1x.png",
        colors: 4,
    },
    {
        name: "minty fresh",
        url: "palettes/minty-fresh-1x.png",
        colors: 4,
    },
    {
        name: "M-GB",
        url: "palettes/m-gb-1x.png",
        colors: 4,
    },
    {
        name: "Calico 4",
        url: "palettes/calico-4-1x.png",
        colors: 4,
    },
    {
        name: "Tea GB",
        url: "palettes/tea-gb-1x.png",
        colors: 4,
    },
    {
        name: "Blues GB",
        url: "palettes/blues-gb-1x.png",
        colors: 4,
    },
    {
        name: "Vireo 4",
        url: "palettes/vireo-4-1x.png",
        colors: 4,
    },
    {
        name: "Twilight 5",
        url: "palettes/twilight-5-1x.png",
        colors: 5,
    },
    {
        name: "Ink",
        url: "palettes/ink-1x.png",
        colors: 5,
    },
    {
        name: "Blessing",
        url: "palettes/blessing-1x.png",
        colors: 5,
    },
    {
        name: "Late Night Bath",
        url: "palettes/late-night-bath-1x.png",
        colors: 5,
    },
    {
        name: "Oil 6",
        url: "palettes/oil-6-1x.png",
        colors: 6,
    },
    {
        name: "Curiosities",
        url: "palettes/curiosities-1x.png",
        colors: 6,
    },
    {
        name: "INKPINK",
        url: "palettes/inkpink-1x.png",
        colors: 6,
    },
    {
        name: "Cryptic Ocean",
        url: "palettes/cryptic-ocean-1x.png",
        colors: 6,
    },
    {
        name: "Bluberry-6",
        url: "palettes/bluberry-6-1x.png",
        colors: 6,
    },
    {
        name: "Cursed Turkey",
        url: "palettes/cursed-turkey-1x.png",
        colors: 6,
    },
    {
        name: "Divination",
        url: "palettes/divination-1x.png",
        colors: 7,
    },
    {
        name: "Gold Masks",
        url: "palettes/gold-masks-1x.png",
        colors: 7,
    },
    {
        name: "Midnight ablaze",
        url: "palettes/midnight-ablaze-1x.png",
        colors: 7,
    },
    {
        name: "Eulbink",
        url: "palettes/eulbink-1x.png",
        colors: 7,
    },
    {
        name: "SLSO8",
        url: "palettes/slso8-1x.png",
        colors: 8,
    },
    {
        name: "Nyx8",
        url: "palettes/nyx8-1x.png",
        colors: 8,
    },
    {
        name: "Ammo-8",
        url: "palettes/ammo-8-1x.png",
        colors: 8,
    },
    {
        name: "CL8UDS",
        url: "palettes/cl8uds-1x.png",
        colors: 8,
    },
    {
        name: "JustParchment8",
        url: "palettes/justparchment8-1x.png",
        colors: 8,
    },
    {
        name: "Berry Nebula",
        url: "palettes/berry-nebula-1x.png",
        colors: 8,
    },
    {
        name: "Citrink",
        url: "palettes/citrink-1x.png",
        colors: 8,
    },
    {
        name: "Bastille-8",
        url: "palettes/bastille-8-1x.png",
        colors: 8,
    },
    // {
    //     name: "",
    //     url: "palettes/.png",
    //     colors: ,
    // },
    // {
    //     name: "",
    //     url: "palettes/.png",
    //     colors: ,
    // },
];


/* -------------------------------
   GLOBAL STATE
--------------------------------- */
const state = {
    originalImage: null,
    originalWidth: 0,
    originalHeight: 0,
    patternImageData: null,   // ImageData of active pattern (threshold map)
    patternWidth: 0,
    patternHeight: 0,
    settings: { ...DEFAULT },
    processedCanvas: null,    // Dithered output at original size
    processing: false,
    debounceTimer: null,
    currentPatternUrl: null,  // For filename generation
    isCustomPattern: false,   // Is custom pattern active?
    // Palette state
    paletteEnabled: false,
    paletteColors: null,      // Array of {r, g, b} colors
    paletteName: null,
    customPaletteData: null,
};

let patternEditor = null;

/* -------------------------------
   DOM ELEMENTS
--------------------------------- */
const elements = {
    dropzone: document.getElementById('dropzone'),
    fileInput: document.getElementById('fileInput'),
    errorMsg: document.getElementById('errorMessage'),
    previewCanvas: document.getElementById('previewCanvas'),
    stats: document.getElementById('stats'),
    pixelSizeSlider: document.getElementById('pixelSize'),
    pixelSizeValue: document.getElementById('pixelSizeValue'),
    stepsSlider: document.getElementById('steps'),
    stepsValue: document.getElementById('stepsValue'),
    modeRadios: document.getElementsByName('mode'),
    invertCheck: document.getElementById('invert'),
    brightnessSlider: document.getElementById('brightness'),
    brightnessValue: document.getElementById('brightnessValue'),
    contrastSlider: document.getElementById('contrast'),
    contrastValue: document.getElementById('contrastValue'),
    patternGrid: document.getElementById('patternGrid'),
    patternUpload: document.getElementById('patternUpload'),
    outputScaleSelect: document.getElementById('outputScale'),
    downloadBtn: document.getElementById('downloadBtn'),
    resetBtn: document.getElementById('resetBtn'),
    // Palette elements
    paletteEnable: document.getElementById('paletteEnable'),
    palettePresetsContainer: document.getElementById('palettePresetsContainer'),
    paletteGrid: document.getElementById('paletteGrid'),
    paletteUploadContainer: document.getElementById('paletteUploadContainer'),
    paletteUpload: document.getElementById('paletteUpload'),
    customPaletteInfo: document.getElementById('customPaletteInfo'),
    customPaletteStrip: document.getElementById('customPaletteStrip'),
    lospecPaletteUrl: document.getElementById('lospecPaletteUrl'),
    loadLospecPaletteBtn: document.getElementById('loadLospecPaletteBtn'),
    lospecPaletteError: document.getElementById('lospecPaletteError'),
};

/* -------------------------------
   UTILITIES
--------------------------------- */
function debounce(fn, delay) {
    return function (...args) {
        clearTimeout(state.debounceTimer);
        state.debounceTimer = setTimeout(() => fn.apply(this, args), delay);
    };
}

function showError(msg) {
    elements.errorMsg.textContent = msg;
    elements.errorMsg.classList.remove('hidden');
    setTimeout(() => elements.errorMsg.classList.add('hidden'), 5000);
}

// Image to ImageData
function imageToImageData(img, width, height, smooth = true) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = smooth;
    ctx.drawImage(img, 0, 0, width, height);
    return ctx.getImageData(0, 0, width, height);
}

// Nearest-neighbor upscale (sharp)
function scaleCanvasNearest(srcCanvas, targetWidth, targetHeight) {
    const scaled = document.createElement('canvas');
    scaled.width = targetWidth;
    scaled.height = targetHeight;
    const ctx = scaled.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(srcCanvas, 0, 0, targetWidth, targetHeight);
    return scaled;
}

/* -------------------------------
   BRIGHTNESS & CONTRAST
--------------------------------- */
function applyBrightnessContrast(imageData, brightness, contrast) {
    const data = imageData.data;
    const factor = contrast / 100;   // 0..2, 1 = neutral
    const bright = brightness;      // -100..100

    for (let i = 0; i < data.length; i += 4) {
        for (let c = 0; c < 3; c++) {
            let val = data[i + c];
            // Contrast: (val - 128) * factor + 128
            val = (val - 128) * factor + 128 + bright;
            val = Math.min(255, Math.max(0, Math.round(val)));
            data[i + c] = val;
        }
    }
    return imageData;
}

/* -------------------------------
   PATTERN LOADING
--------------------------------- */
async function loadPatternFromFile(file) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const w = img.naturalWidth;
            const h = img.naturalHeight;
            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            const imgData = ctx.getImageData(0, 0, w, h);
            // Convert to grayscale (weighted average)
            const grayData = new Uint8ClampedArray(w * h * 4);
            for (let i = 0; i < w * h; i++) {
                const r = imgData.data[i * 4];
                const g = imgData.data[i * 4 + 1];
                const b = imgData.data[i * 4 + 2];
                const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
                grayData[i * 4] = grayData[i * 4 + 1] = grayData[i * 4 + 2] = gray;
                grayData[i * 4 + 3] = 255;
            }
            resolve(new ImageData(grayData, w, h));
        };
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
    });
}

async function loadPatternFromUrl(url) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = url;
    });
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const imgData = ctx.getImageData(0, 0, w, h);
    // Convert to grayscale
    const grayData = new Uint8ClampedArray(w * h * 4);
    for (let i = 0; i < w * h; i++) {
        const r = imgData.data[i * 4];
        const g = imgData.data[i * 4 + 1];
        const b = imgData.data[i * 4 + 2];
        const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
        grayData[i * 4] = grayData[i * 4 + 1] = grayData[i * 4 + 2] = gray;
        grayData[i * 4 + 3] = 255;
    }
    return new ImageData(grayData, w, h);
}

/* -------------------------------
   PALETTE FUNCTIONS
--------------------------------- */

// استخراج رنگ‌ها از تصویر پالت
async function extractPaletteFromImage(imgData) {
    const { width, height, data } = imgData;

    // تشخیص اندازه بلوک بر اساس ارتفاع
    let blockSize = 1;
    if (height >= 32) blockSize = 32;
    else if (height >= 16) blockSize = 16;
    else if (height >= 8) blockSize = 8;

    const numColors = Math.floor(width / blockSize);
    const palette = [];

    for (let c = 0; c < numColors; c++) {
        // نمونه‌برداری از مرکز بلوک برای اطمینان
        const centerX = c * blockSize + Math.floor(blockSize / 2);
        const centerY = Math.floor(height / 2);
        const idx = (centerY * width + centerX) * 4;

        palette.push({
            r: data[idx],
            g: data[idx + 1],
            b: data[idx + 2]
        });
    }

    return palette;
}

// ایجاد نوار رنگی برای پیش‌نمایش پالت
function createPaletteStrip(paletteColors, container) {
    if (!container || !paletteColors || paletteColors.length === 0) return;

    container.innerHTML = '';

    for (const color of paletteColors) {
        const div = document.createElement('div');
        div.className = 'palette-strip-color';
        div.style.backgroundColor = `rgb(${color.r}, ${color.g}, ${color.b})`;
        container.appendChild(div);
    }
}

// لود پالت از URL
async function loadPaletteFromUrl(url) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = url;
    });

    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const imgData = ctx.getImageData(0, 0, img.naturalWidth, img.naturalHeight);

    return await extractPaletteFromImage(imgData);
}

// لود پالت از فایل
async function loadPaletteFromFile(file) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            const imgData = ctx.getImageData(0, 0, img.naturalWidth, img.naturalHeight);

            extractPaletteFromImage(imgData).then(resolve);
        };
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
    });
}

// ساختن گرید پالت‌ها
async function buildPaletteGrid() {
    const grid = elements.paletteGrid;
    if (!grid) return;

    grid.innerHTML = '';

    for (const palette of PRESET_PALETTES) {
        const item = document.createElement('div');
        item.className = 'palette-item';
        item.dataset.url = palette.url;
        item.dataset.name = palette.name;
        item.dataset.colors = palette.colors;

        const img = document.createElement('img');
        img.className = 'palette-preview';
        img.src = palette.url;
        img.alt = palette.name;
        img.loading = 'lazy';

        const nameSpan = document.createElement('span');
        nameSpan.className = 'palette-name';
        nameSpan.textContent = palette.name;

        const colorsSpan = document.createElement('span');
        colorsSpan.className = 'palette-colors hidden';
        colorsSpan.textContent = `${palette.colors} colors`;

        item.appendChild(img);
        item.appendChild(nameSpan);
        item.appendChild(colorsSpan);

        item.addEventListener('click', async (e) => {
            e.stopPropagation();
            document.querySelectorAll('.palette-item').forEach(el => el.classList.remove('selected'));
            item.classList.add('selected');

            try {
                const paletteColors = await loadPaletteFromUrl(palette.url);

                state.paletteColors = paletteColors;
                state.paletteName = palette.name;
                state.customPaletteData = null;

                // نمایش نوار رنگی
                if (elements.customPaletteStrip) {
                    createPaletteStrip(paletteColors, elements.customPaletteStrip);
                }
                if (elements.customPaletteInfo) {
                    elements.customPaletteInfo.textContent = `${palette.name} (${paletteColors.length} colors)`;
                }

                // اعمال روی تصویر اگر پالت فعال است
                if (state.paletteEnabled) {
                    processImage();
                }
            } catch (err) {
                showError(`Failed to load palette: ${palette.name}`);
            }
        });

        grid.appendChild(item);
    }
}

function extractSlugFromLospecUrl(url) {
    console.log(url);

    // اگر فقط اسلاگ وارد شده باشه (مثلاً "greyt-bit")
    if (!url.includes('/')) {
        return url.trim().toLowerCase();
    }

    // اگر URL کامل باشه
    try {
        const urlObj = new URL(url);
        console.log("URL: ", urlObj);

        if (urlObj.hostname === 'lospec.com' && urlObj.pathname.startsWith('/palette-list/')) {
            const slug = urlObj.pathname.split('/').pop();
            console.log("---> ", slug);

            return slug.toLowerCase();
        }
    } catch (e) {
        // اگر URL معتبر نباشه
        return null;
    }
    return null;
}

async function loadPaletteFromLospec(slug) {
    const url = `https://lospec.com/palette-list/${slug}.json`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Palette not found');
            }
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();

        // تبدیل رنگ‌های هگز به RGB
        const paletteColors = data.colors.map(hex => hexToRgb(hex));

        return {
            name: data.name,
            author: data.author,
            colors: paletteColors
        };
    } catch (error) {
        throw new Error(`Failed to load palette: ${error.message}`);
    }
}

function hexToRgb(hex) {
    // حذف # اگر وجود داشته باشه
    hex = hex.replace(/^#/, '');

    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);

    return { r, g, b };
}

// اعمال پالت روی تصویر dither شده
function applyPaletteToDitheredImage(imageData, paletteColors, mode) {
    const { width, height, data } = imageData;
    const output = new ImageData(width, height);

    const steps = paletteColors.length - 1;

    for (let i = 0; i < data.length; i += 4) {
        let grayValue;

        if (mode === 'BW') {
            grayValue = data[i];
        } else {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            grayValue = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
        }

        const exactIndex = (grayValue / 255) * steps;
        const index1 = Math.floor(exactIndex);
        const index2 = Math.min(index1 + 1, steps);
        const t = exactIndex - index1;

        const color1 = paletteColors[index1];
        const color2 = paletteColors[index2];

        output.data[i] = Math.round(color1.r * (1 - t) + color2.r * t);
        output.data[i + 1] = Math.round(color1.g * (1 - t) + color2.g * t);
        output.data[i + 2] = Math.round(color1.b * (1 - t) + color2.b * t);
        output.data[i + 3] = 255;
    }

    return output;
}

/* -------------------------------
   PATTERN GRID
--------------------------------- */
async function buildPatternGrid() {
    const grid = elements.patternGrid;
    grid.innerHTML = '';

    for (const pattern of PRESET_PATTERNS) {
        const item = document.createElement('div');
        item.className = 'pattern-item';
        item.dataset.url = pattern.url;
        item.dataset.name = pattern.name;

        const img = document.createElement('img');
        img.className = 'pattern-preview';
        img.src = pattern.url;
        img.alt = pattern.name;
        img.loading = 'lazy';

        const nameSpan = document.createElement('span');
        nameSpan.className = 'pattern-name';
        nameSpan.textContent = pattern.name;

        item.appendChild(img);
        item.appendChild(nameSpan);

        item.addEventListener('click', async (e) => {
            e.stopPropagation();
            document.querySelectorAll('.pattern-item').forEach(el => el.classList.remove('selected'));
            item.classList.add('selected');

            try {
                const imgData = await loadPatternFromUrl(pattern.url);

                // ===== لود در ادیتور =====
                if (window.patternEditor) {
                    const w = imgData.width;
                    const h = imgData.height;
                    const thresholdMap = Array(h).fill().map(() => Array(w).fill(0));

                    for (let y = 0; y < h; y++) {
                        for (let x = 0; x < w; x++) {
                            const idx = (y * w + x) * 4;
                            thresholdMap[y][x] = imgData.data[idx];
                        }
                    }

                    const uniqueValues = new Set(thresholdMap.flat().filter(v => v > 0));
                    let layers = uniqueValues.size;

                    if (layers > 32) layers = 32;
                    if (layers < 2) layers = 2;

                    window.patternEditor.loadPatternFromThresholdMap(thresholdMap, w, h, layers);

                    document.getElementById('editor-width').value = w;
                    document.getElementById('editor-height').value = h;
                    document.getElementById('editor-layers').value = layers;

                    window.patternEditor.layerRangeInput.max = layers - 1;
                    window.patternEditor.layerNumberInput.max = layers - 1;
                    window.patternEditor.layerRangeInput.value = 0;
                    window.patternEditor.layerNumberInput.value = 0;
                }

                state.patternImageData = imgData;
                state.patternWidth = imgData.width;
                state.patternHeight = imgData.height;
                state.currentPatternUrl = pattern.url;
                state.isCustomPattern = false;
                elements.patternUpload.value = '';
                processImage();
            } catch (err) {
                showError(`Failed to load pattern: ${pattern.name}`);
            }
        });

        grid.appendChild(item);
    }

    // بعد پترن‌های ذخیره‌شده در localStorage
    const saved = localStorage.getItem('custom-dither-patterns');
    if (saved) {
        const customPatterns = JSON.parse(saved);

        customPatterns.forEach((pattern) => {
            const item = document.createElement('div');
            item.className = 'pattern-item custom';
            item.dataset.customId = pattern.id;

            const img = document.createElement('img');
            img.className = 'pattern-preview';
            img.src = pattern.thumbnail;
            img.alt = pattern.name;

            const nameSpan = document.createElement('span');
            nameSpan.className = 'pattern-name';
            nameSpan.textContent = pattern.name;

            const deleteIcon = document.createElement('span');
            deleteIcon.className = 'delete-pattern';
            deleteIcon.innerHTML = '×';
            deleteIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm(`Delete "${pattern.name}"?`)) {
                    const saved = localStorage.getItem('custom-dither-patterns');
                    const patterns = saved ? JSON.parse(saved) : [];
                    const newPatterns = patterns.filter(p => p.id !== pattern.id);
                    localStorage.setItem('custom-dither-patterns', JSON.stringify(newPatterns));
                    buildPatternGrid();
                }
            });

            item.appendChild(img);
            item.appendChild(nameSpan);
            item.appendChild(deleteIcon);

            item.addEventListener('click', async () => {
                document.querySelectorAll('.pattern-item').forEach(el => el.classList.remove('selected'));
                item.classList.add('selected');

                if (window.patternEditor) {
                    const pixels = pattern.data.map(layer =>
                        layer.map(row =>
                            row.map(cell => cell === 1)
                        )
                    );

                    window.patternEditor.options.width = pattern.width;
                    window.patternEditor.options.height = pattern.height;
                    window.patternEditor.options.layers = pattern.layers;
                    window.patternEditor.pixels = pixels;
                    window.patternEditor.options.currentLayer = 0;

                    document.getElementById('editor-width').value = pattern.width;
                    document.getElementById('editor-height').value = pattern.height;
                    document.getElementById('editor-layers').value = pattern.layers;

                    window.patternEditor.layerRangeInput.max = pattern.layers - 1;
                    window.patternEditor.layerNumberInput.max = pattern.layers - 1;
                    window.patternEditor.layerRangeInput.value = 0;
                    window.patternEditor.layerNumberInput.value = 0;

                    window.patternEditor.render();

                    const { width, height, layers } = window.patternEditor.options;
                    const step = 255 / layers;
                    const thresholdMap = Array(height).fill().map(() => Array(width).fill(0));

                    for (let y = 0; y < height; y++) {
                        for (let x = 0; x < width; x++) {
                            let maxLayer = -1;
                            for (let l = 0; l < layers; l++) {
                                if (pixels[l][y][x]) maxLayer = l;
                            }
                            if (maxLayer >= 0) {
                                thresholdMap[y][x] = Math.min(255, Math.floor((maxLayer + 1) * step));
                            }
                        }
                    }

                    const canvas = document.createElement('canvas');
                    canvas.width = pattern.width;
                    canvas.height = pattern.height;
                    const ctx = canvas.getContext('2d');

                    for (let y = 0; y < pattern.height; y++) {
                        for (let x = 0; x < pattern.width; x++) {
                            const val = thresholdMap[y][x];
                            ctx.fillStyle = `rgb(${val}, ${val}, ${val})`;
                            ctx.fillRect(x, y, 1, 1);
                        }
                    }

                    const imgData = ctx.getImageData(0, 0, pattern.width, pattern.height);

                    const grayData = new Uint8ClampedArray(pattern.width * pattern.height * 4);
                    for (let i = 0; i < pattern.width * pattern.height; i++) {
                        const r = imgData.data[i * 4];
                        const g = imgData.data[i * 4 + 1];
                        const b = imgData.data[i * 4 + 2];
                        const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
                        grayData[i * 4] = grayData[i * 4 + 1] = grayData[i * 4 + 2] = gray;
                        grayData[i * 4 + 3] = 255;
                    }

                    state.patternImageData = new ImageData(grayData, pattern.width, pattern.height);
                    state.patternWidth = pattern.width;
                    state.patternHeight = pattern.height;
                    state.isCustomPattern = true;
                    state.currentPatternUrl = null;

                    processImage();
                }
            });

            grid.appendChild(item);
        });
    }

    // Select first pattern by default
    if (PRESET_PATTERNS.length > 0 && grid.children.length > 0) {
        const firstItem = grid.children[0];
        firstItem.classList.add('selected');
        try {
            const imgData = await loadPatternFromUrl(PRESET_PATTERNS[0].url);
            state.patternImageData = imgData;
            state.patternWidth = imgData.width;
            state.patternHeight = imgData.height;
            state.currentPatternUrl = PRESET_PATTERNS[0].url;
            state.isCustomPattern = false;
        } catch (err) {
            showError('Failed to load default pattern');
        }
    }
}

/* -------------------------------
   DITHERING CORE
--------------------------------- */
function ditherImage(imgData, patternData, pW, pH, steps, mode, invert) {
    const w = imgData.width;
    const h = imgData.height;
    const output = new ImageData(w, h);
    const src = imgData.data;
    const dst = output.data;
    const pat = patternData.data;

    const levels = steps - 1;
    const interval = 255 / levels;

    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const srcIdx = (y * w + x) * 4;
            const patX = x % pW;
            const patY = y % pH;
            const patIdx = (patY * pW + patX) * 4;
            const threshold = pat[patIdx];

            const r = src[srcIdx];
            const g = src[srcIdx + 1];
            const b = src[srcIdx + 2];

            if (mode === 'BW') {
                let gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
                let outVal;
                if (levels === 1) {
                    outVal = gray < threshold ? 0 : 255;
                } else {
                    const q = Math.floor((gray * levels + threshold) / 255);
                    outVal = Math.min(255, Math.round(q * interval));
                }
                if (invert) outVal = 255 - outVal;
                dst[srcIdx] = dst[srcIdx + 1] = dst[srcIdx + 2] = outVal;
                dst[srcIdx + 3] = 255;
            } else {
                for (let c = 0; c < 3; c++) {
                    let val = src[srcIdx + c];
                    let outVal;
                    if (levels === 1) {
                        outVal = val < threshold ? 0 : 255;
                    } else {
                        const q = Math.floor((val * levels + threshold) / 255);
                        outVal = Math.min(255, Math.round(q * interval));
                    }
                    if (invert) outVal = 255 - outVal;
                    dst[srcIdx + c] = outVal;
                }
                dst[srcIdx + 3] = 255;
            }
        }
    }
    return output;
}

/* -------------------------------
   MAIN PROCESSING PIPELINE
--------------------------------- */
async function processImage() {
    if (!state.originalImage || !state.patternImageData) return;
    if (state.processing) return;
    state.processing = true;

    const { pixelSize, steps, mode, invert, brightness, contrast } = state.settings;
    const W = state.originalWidth;
    const H = state.originalHeight;

    // 1. Downsample to grid size
    const gridW = Math.ceil(W / pixelSize);
    const gridH = Math.ceil(H / pixelSize);
    const gridCanvas = document.createElement('canvas');
    gridCanvas.width = gridW;
    gridCanvas.height = gridH;
    const gridCtx = gridCanvas.getContext('2d');
    gridCtx.imageSmoothingEnabled = true;
    gridCtx.drawImage(state.originalImage, 0, 0, gridW, gridH);
    let gridImgData = gridCtx.getImageData(0, 0, gridW, gridH);

    // 2. Apply brightness & contrast
    if (brightness !== 0 || contrast !== 100) {
        gridImgData = applyBrightnessContrast(gridImgData, brightness, contrast);
    }

    // 3. Dither with selected mode (BW or RGB)
    const ditheredGrid = ditherImage(
        gridImgData,
        state.patternImageData,
        state.patternWidth,
        state.patternHeight,
        steps,
        mode,
        invert
    );

    let finalGridData = ditheredGrid;

    // 4. Apply palette if enabled
    if (state.paletteEnabled && state.paletteColors && state.paletteColors.length > 0) {
        finalGridData = applyPaletteToDitheredImage(
            ditheredGrid,
            state.paletteColors,
            mode
        );
    }

    gridCtx.putImageData(finalGridData, 0, 0);

    // 5. Upscale to original size (nearest neighbor)
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = W;
    outputCanvas.height = H;
    const outCtx = outputCanvas.getContext('2d');
    outCtx.imageSmoothingEnabled = false;
    outCtx.drawImage(gridCanvas, 0, 0, gridW, gridH, 0, 0, W, H);

    state.processedCanvas = outputCanvas;

    // 6. Render preview
    renderPreview();

    // 7. Update stats
    let statsText = `Output: ${W}×${H} · Pixel Size: ${pixelSize} · Steps: ${steps} · Mode: ${mode}`;
    if (state.paletteEnabled && state.paletteName) {
        statsText += ` · Palette: ${state.paletteName}`;
    }
    elements.stats.innerText = statsText;

    state.processing = false;
}

/* -------------------------------
   PREVIEW RENDERING
--------------------------------- */
function renderPreview() {
    if (!state.processedCanvas) return;

    const canvas = elements.previewCanvas;
    const ctx = canvas.getContext('2d');

    if (canvas.width !== state.processedCanvas.width || canvas.height !== state.processedCanvas.height) {
        canvas.width = state.processedCanvas.width;
        canvas.height = state.processedCanvas.height;
    }

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(state.processedCanvas, 0, 0);
}

/* -------------------------------
   EXPORT (with Output Scale)
--------------------------------- */
function downloadPNG() {
    if (!state.processedCanvas) {
        showError('No image to export');
        return;
    }

    const scale = parseInt(state.settings.outputScale, 10);
    const base = state.processedCanvas;
    const w = base.width * scale;
    const h = base.height * scale;

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = w;
    exportCanvas.height = h;
    const ctx = exportCanvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(base, 0, 0, w, h);

    // Generate filename
    let patternName = 'custom';
    if (!state.isCustomPattern && state.currentPatternUrl) {
        const match = state.currentPatternUrl.match(/dither-pattern-(\d+)/);
        if (match) patternName = `pattern${match[1]}`;
    }

    const steps = state.settings.steps;
    const mode = state.settings.mode.toLowerCase();
    let filename = `${patternName}_steps${steps}_${mode}`;

    if (state.paletteEnabled && state.paletteName) {
        filename += `_${state.paletteName.replace(/\s+/g, '-')}`;
    }
    filename += '.png';

    exportCanvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    });
}

/* -------------------------------
   LOAD SAMPLE IMAGE (sample.jpg)
--------------------------------- */
async function loadSampleImage() {
    try {
        const img = new Image();
        img.src = './images/sample.jpg';
        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
        });

        state.originalImage = img;
        state.originalWidth = img.naturalWidth;
        state.originalHeight = img.naturalHeight;
        processImage();
    } catch (err) {
        console.warn('sample.jpg not found. Please upload an image.');
    }
}

/* -------------------------------
   RESET SETTINGS ONLY
--------------------------------- */
function resetSettingsOnly() {
    elements.pixelSizeSlider.value = DEFAULT.pixelSize;
    elements.pixelSizeValue.textContent = DEFAULT.pixelSize;
    elements.stepsSlider.value = DEFAULT.steps;
    elements.stepsValue.textContent = DEFAULT.steps;
    elements.modeRadios[0].checked = true;
    elements.invertCheck.checked = DEFAULT.invert;
    elements.brightnessSlider.value = DEFAULT.brightness;
    elements.brightnessValue.textContent = DEFAULT.brightness;
    elements.contrastSlider.value = DEFAULT.contrast;
    elements.contrastValue.textContent = DEFAULT.contrast;
    elements.outputScaleSelect.value = DEFAULT.outputScale;

    // Reset palette
    elements.paletteEnable.checked = false;
    state.paletteEnabled = false;
    elements.palettePresetsContainer.style.display = 'none';
    elements.paletteUploadContainer.style.display = 'none';

    state.settings = { ...DEFAULT };

    if (state.originalImage) {
        processImage();
    }
}

/* -------------------------------
   EVENT BINDINGS
--------------------------------- */
function bindEvents() {
    const fileInput = elements.fileInput;

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) handleImageFile(e.target.files[0]);
    });

    async function handleImageFile(file) {
        if (file.size > MAX_FILE_SIZE) {
            showError(`File too large (max 10MB): ${(file.size / 1024 / 1024).toFixed(2)}MB`);
            return;
        }
        const img = new Image();
        img.onload = () => {
            state.originalImage = img;
            state.originalWidth = img.naturalWidth;
            state.originalHeight = img.naturalHeight;
            processImage();
        };
        img.src = URL.createObjectURL(file);
    }

    const debouncedProcess = debounce(processImage, 200);

    elements.pixelSizeSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        elements.pixelSizeValue.textContent = val;
        state.settings.pixelSize = val;
        debouncedProcess();
    });

    elements.stepsSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        elements.stepsValue.textContent = val;
        state.settings.steps = val;
        debouncedProcess();
    });

    for (let radio of elements.modeRadios) {
        radio.addEventListener('change', (e) => {
            state.settings.mode = e.target.value;
            debouncedProcess();
        });
    }

    elements.invertCheck.addEventListener('change', (e) => {
        state.settings.invert = e.target.checked;
        debouncedProcess();
    });

    elements.brightnessSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        elements.brightnessValue.textContent = val;
        state.settings.brightness = val;
        debouncedProcess();
    });

    elements.contrastSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        elements.contrastValue.textContent = val;
        state.settings.contrast = val;
        debouncedProcess();
    });

    // Custom pattern upload
    elements.patternUpload.addEventListener('change', async (e) => {
        if (e.target.files.length) {
            const confirmed = await validatePatternImage(e.target.files[0]);
            if (!confirmed) {
                elements.patternUpload.value = '';
                return;
            }

            try {
                const img = new Image();
                img.src = URL.createObjectURL(e.target.files[0]);
                await new Promise((resolve) => { img.onload = resolve; });

                if (img.width > 16 || img.height > 16) {
                    if (!confirm(`Image size is ${img.width}×${img.height}, which is quite large for a dither pattern.\n\nDo you still want to use it as a pattern?`)) {
                        elements.patternUpload.value = '';
                        return;
                    }
                }

                const imgData = await loadPatternFromFile(e.target.files[0]);

                if (window.patternEditor) {
                    const w = imgData.width;
                    const h = imgData.height;
                    const thresholdMap = Array(h).fill().map(() => Array(w).fill(0));

                    for (let y = 0; y < h; y++) {
                        for (let x = 0; x < w; x++) {
                            const idx = (y * w + x) * 4;
                            thresholdMap[y][x] = imgData.data[idx];
                        }
                    }

                    const uniqueValues = new Set(thresholdMap.flat().filter(v => v > 0));
                    let layers = uniqueValues.size;

                    if (layers > 32) layers = 32;
                    if (layers < 2) layers = 2;

                    window.patternEditor.loadPatternFromThresholdMap(thresholdMap, w, h, layers);

                    document.getElementById('editor-width').value = w;
                    document.getElementById('editor-height').value = h;
                    document.getElementById('editor-layers').value = layers;

                    window.patternEditor.layerRangeInput.max = layers - 1;
                    window.patternEditor.layerNumberInput.max = layers - 1;
                    window.patternEditor.layerRangeInput.value = 0;
                    window.patternEditor.layerNumberInput.value = 0;
                }

                state.patternImageData = imgData;
                state.patternWidth = imgData.width;
                state.patternHeight = imgData.height;
                state.isCustomPattern = true;
                state.currentPatternUrl = null;
                document.querySelectorAll('.pattern-item').forEach(el => el.classList.remove('selected'));
                processImage();
            } catch (err) {
                showError('Failed to load custom pattern');
            }
        }
    });

    // Palette events
    if (elements.paletteEnable) {
        elements.paletteEnable.addEventListener('change', (e) => {
            const enabled = e.target.checked;
            state.paletteEnabled = enabled;

            elements.palettePresetsContainer.style.display = enabled ? 'block' : 'none';
            elements.paletteUploadContainer.style.display = enabled ? 'block' : 'none';

            if (enabled && state.paletteColors && state.paletteColors.length > 0) {
                processImage();
            } else if (!enabled) {
                processImage();
            }
        });
    }

    if (elements.paletteUpload) {
        elements.paletteUpload.addEventListener('change', async (e) => {
            if (e.target.files.length) {
                try {
                    const img = new Image();
                    img.src = URL.createObjectURL(e.target.files[0]);
                    await new Promise((resolve) => { img.onload = resolve; });

                    // if (img.width < 4 || img.height < 1) {
                    if (img.width < 2 || img.height < 1) {
                        showError('Invalid palette image');
                        return;
                    }

                    const paletteColors = await loadPaletteFromFile(e.target.files[0]);

                    state.paletteColors = paletteColors;
                    state.paletteName = 'Custom Palette';

                    if (elements.customPaletteStrip) {
                        createPaletteStrip(paletteColors, elements.customPaletteStrip);
                    }
                    if (elements.customPaletteInfo) {
                        elements.customPaletteInfo.textContent = `Custom Palette (${paletteColors.length} colors)`;
                    }

                    document.querySelectorAll('.palette-item').forEach(el => el.classList.remove('selected'));

                    if (state.paletteEnabled) {
                        processImage();
                    }
                } catch (err) {
                    showError('Failed to load custom palette');
                }
            }
        });
    }

    elements.outputScaleSelect.addEventListener('change', (e) => {
        state.settings.outputScale = parseInt(e.target.value, 10);
    });

    elements.downloadBtn.addEventListener('click', downloadPNG);
    elements.resetBtn.addEventListener('click', resetSettingsOnly);

    // در تابع bindEvents، اضافه کنید:
    if (elements.loadLospecPaletteBtn) {
        elements.loadLospecPaletteBtn.addEventListener('click', async () => {
            const input = elements.lospecPaletteUrl.value.trim();
            if (!input) {
                showLospecError('Please enter a palette name or URL');
                return;
            }

            const slug = extractSlugFromLospecUrl(input);
            console.log("SLUG: ", slug);

            if (!slug) {
                showLospecError('Invalid Lospec palette URL');
                return;
            }

            // نمایش حالت لودینگ
            elements.loadLospecPaletteBtn.disabled = true;
            elements.loadLospecPaletteBtn.textContent = 'Loading...';
            hideLospecError();

            try {
                const palette = await loadPaletteFromLospec(slug);

                state.paletteColors = palette.colors;
                state.paletteName = palette.name;

                // نمایش نوار رنگی
                if (elements.customPaletteStrip) {
                    createPaletteStrip(palette.colors, elements.customPaletteStrip);
                }
                if (elements.customPaletteInfo) {
                    elements.customPaletteInfo.textContent = `${palette.name} by ${palette.author} (${palette.colors.length} colors)`;
                }

                // حذف selected از پالت‌های آماده
                document.querySelectorAll('.palette-item').forEach(el => el.classList.remove('selected'));

                if (state.paletteEnabled) {
                    processImage();
                }

                // پاک کردن ورودی
                elements.lospecPaletteUrl.value = '';

            } catch (error) {
                showLospecError(error.message);
            } finally {
                elements.loadLospecPaletteBtn.disabled = false;
                elements.loadLospecPaletteBtn.textContent = 'Load';
            }
        });
    }

    // توابع کمکی برای نمایش/پنهان کردن خطا
    function showLospecError(message) {
        if (elements.lospecPaletteError) {
            elements.lospecPaletteError.textContent = message;
            elements.lospecPaletteError.classList.remove('hidden');
        }
    }

    function hideLospecError() {
        if (elements.lospecPaletteError) {
            elements.lospecPaletteError.classList.add('hidden');
        }
    }

    window.addEventListener('resize', () => {
        if (state.processedCanvas) {
            const ctx = elements.previewCanvas.getContext('2d');
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(state.processedCanvas, 0, 0);
        }
    });
}

function setupPatternEditor() {
    window.patternEditor = initPatternEditor((thresholdMap, width, height) => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const val = thresholdMap[y][x];
                ctx.fillStyle = `rgb(${val}, ${val}, ${val})`;
                ctx.fillRect(x, y, 1, 1);
            }
        }

        const imgData = ctx.getImageData(0, 0, width, height);

        const grayData = new Uint8ClampedArray(width * height * 4);
        for (let i = 0; i < width * height; i++) {
            const r = imgData.data[i * 4];
            const g = imgData.data[i * 4 + 1];
            const b = imgData.data[i * 4 + 2];
            const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
            grayData[i * 4] = grayData[i * 4 + 1] = grayData[i * 4 + 2] = gray;
            grayData[i * 4 + 3] = 255;
        }

        state.patternImageData = new ImageData(grayData, width, height);
        state.patternWidth = width;
        state.patternHeight = height;
        state.isCustomPattern = true;
        state.currentPatternUrl = null;

        document.querySelectorAll('.pattern-item').forEach(el => el.classList.remove('selected'));

        processImage();
    });
}

async function validatePatternImage(file) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            if (img.width > 16 || img.height > 16) {
                const result = confirm(
                    `⚠️ Pattern image size: ${img.width}×${img.height}\n\n` +
                    `This is larger than recommended (max 16×16).\n` +
                    `Large patterns may:\n` +
                    `• Slow down processing\n` +
                    `• Produce unexpected dithering results\n\n` +
                    `Do you still want to use it as a pattern?`
                );
                resolve(result);
            } else {
                resolve(true);
            }
            URL.revokeObjectURL(img.src);
        };
        img.src = URL.createObjectURL(file);
    });
}

/* -------------------------------
   INITIALIZATION
--------------------------------- */
async function init() {
    bindEvents();

    await buildPatternGrid();
    setupPatternEditor();
    await buildPaletteGrid();

    window.addEventListener('pattern-added', () => {
        buildPatternGrid();
    });

    elements.brightnessValue.textContent = DEFAULT.brightness;
    elements.contrastValue.textContent = DEFAULT.contrast;

    await loadSampleImage();
}

// Start the application
init();