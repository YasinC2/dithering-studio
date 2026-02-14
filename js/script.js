// =============================================
//  Pixel Dither – Final Version
//  Pattern-based image dithering tool
//  Language: English | Canvas: CSS-only scaling
// =============================================

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
    { name: "Pattern 1", url: "patterns/dither-pattern-1.png", preview: "patterns/dither-pattern-1-preview.png" },
    { name: "Pattern 4", url: "patterns/dither-pattern-4.png", preview: "patterns/dither-pattern-4-preview.png" },
    { name: "Pattern 7", url: "patterns/dither-pattern-7.png", preview: "patterns/dither-pattern-7-preview.png" },
    { name: "Pattern 3", url: "patterns/dither-pattern-3.png", preview: "patterns/dither-pattern-3-preview.png" },
    { name: "Pattern 2", url: "patterns/dither-pattern-2.png", preview: "patterns/dither-pattern-2-preview.png" },
    { name: "Pattern 5", url: "patterns/dither-pattern-5.png", preview: "patterns/dither-pattern-5-preview.png" },
    { name: "Pattern 16", url: "patterns/dither-pattern-16.png", preview: "patterns/dither-pattern-16-preview.png" },
    { name: "Pattern 6", url: "patterns/dither-pattern-6.png", preview: "patterns/dither-pattern-6-preview.png" },
    { name: "Pattern 8", url: "patterns/dither-pattern-8.png", preview: "patterns/dither-pattern-8-preview.png" },
    { name: "Pattern 9", url: "patterns/dither-pattern-9.png", preview: "patterns/dither-pattern-9-preview.png" },
    { name: "Pattern 10", url: "patterns/dither-pattern-10.png", preview: "patterns/dither-pattern-10-preview.png" },
    { name: "Pattern 15", url: "patterns/dither-pattern-15.png", preview: "patterns/dither-pattern-15-preview.png" },
    { name: "Pattern 11", url: "patterns/dither-pattern-11.png", preview: "patterns/dither-pattern-11-preview.png" },
    { name: "Pattern 12", url: "patterns/dither-pattern-12.png", preview: "patterns/dither-pattern-12-preview.png" },
    { name: "Pattern 13", url: "patterns/dither-pattern-13.png", preview: "patterns/dither-pattern-13-preview.png" },
    { name: "Pattern 14", url: "patterns/dither-pattern-14.png", preview: "patterns/dither-pattern-14-preview.png" },
    { name: "Pattern 17", url: "patterns/dither-pattern-17.png", preview: "patterns/dither-pattern-17-preview.png" },
    { name: "Pattern 18", url: "patterns/dither-pattern-18.png", preview: "patterns/dither-pattern-18-preview.png" },
    { name: "Pattern 19", url: "patterns/dither-pattern-19.png", preview: "patterns/dither-pattern-19-preview.png" }
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
    isCustomPattern: false    // Is custom pattern active?
};

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
    resetBtn: document.getElementById('resetBtn')
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
        img.src = pattern.preview;
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
                state.patternImageData = imgData;
                state.patternWidth = imgData.width;
                state.patternHeight = imgData.height;
                state.currentPatternUrl = pattern.url;
                state.isCustomPattern = false;
                elements.patternUpload.value = ''; // Clear custom upload
                processImage();
            } catch (err) {
                showError(`Failed to load pattern: ${pattern.name}`);
            }
        });

        grid.appendChild(item);
    }

    // Select first pattern by default
    if (PRESET_PATTERNS.length > 0) {
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

    // 3. Dither
    const ditheredGrid = ditherImage(
        gridImgData,
        state.patternImageData,
        state.patternWidth,
        state.patternHeight,
        steps,
        mode,
        invert
    );
    gridCtx.putImageData(ditheredGrid, 0, 0);

    // 4. Upscale to original size (nearest neighbor)
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = W;
    outputCanvas.height = H;
    const outCtx = outputCanvas.getContext('2d');
    outCtx.imageSmoothingEnabled = false;
    outCtx.drawImage(gridCanvas, 0, 0, gridW, gridH, 0, 0, W, H);

    state.processedCanvas = outputCanvas;

    // 5. Render preview (CSS scaling only - we don't change canvas dimensions!)
    renderPreview();

    // 6. Update stats
    elements.stats.innerText = `Output: ${W}×${H} · Pixel Size: ${pixelSize} · Steps: ${steps} · Mode: ${mode}`;

    state.processing = false;
}

/* -------------------------------
   PREVIEW RENDERING
   CRITICAL: We NEVER change canvas.width/height
   Only use CSS for scaling to preserve pixel sharpness
--------------------------------- */
function renderPreview() {
    if (!state.processedCanvas) return;

    const canvas = elements.previewCanvas;
    const ctx = canvas.getContext('2d');

    // IMPORTANT: Set canvas dimensions to match the processed image ONCE
    // This is done only when the image changes, not for scaling
    if (canvas.width !== state.processedCanvas.width || canvas.height !== state.processedCanvas.height) {
        canvas.width = state.processedCanvas.width;
        canvas.height = state.processedCanvas.height;
    }

    // Draw the image at 1:1 pixel ratio
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(state.processedCanvas, 0, 0);

    // DO NOT change canvas.width/height here!
    // CSS handles the display size via .preview-canvas { width: 100%; max-width: 700px; }
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
    const filename = `${patternName}_steps${steps}_${mode}.png`;

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
   Does NOT clear image or pattern
--------------------------------- */
function resetSettingsOnly() {
    // Reset UI controls to default values
    elements.pixelSizeSlider.value = DEFAULT.pixelSize;
    elements.pixelSizeValue.textContent = DEFAULT.pixelSize;
    elements.stepsSlider.value = DEFAULT.steps;
    elements.stepsValue.textContent = DEFAULT.steps;
    elements.modeRadios[0].checked = true; // BW
    elements.invertCheck.checked = DEFAULT.invert;
    elements.brightnessSlider.value = DEFAULT.brightness;
    elements.brightnessValue.textContent = DEFAULT.brightness;
    elements.contrastSlider.value = DEFAULT.contrast;
    elements.contrastValue.textContent = DEFAULT.contrast;
    elements.outputScaleSelect.value = DEFAULT.outputScale;

    // Update state
    state.settings = { ...DEFAULT };

    // Reprocess if image exists
    if (state.originalImage) {
        processImage();
    }
}

/* -------------------------------
   EVENT BINDINGS
--------------------------------- */
function bindEvents() {
    // Image upload (dropzone)
    const dropzone = elements.dropzone;
    const fileInput = elements.fileInput;

    dropzone.addEventListener('click', () => fileInput.click());

    // dropzone.addEventListener('dragover', (e) => {
    //     e.preventDefault();
    //     dropzone.classList.add('drag-over');
    // });
    // dropzone.addEventListener('dragleave', () => dropzone.classList.remove('drag-over'));
    // dropzone.addEventListener('drop', (e) => {
    //     e.preventDefault();
    //     dropzone.classList.remove('drag-over');
    //     if (e.dataTransfer.files.length) handleImageFile(e.dataTransfer.files[0]);
    // });

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

    // Sliders with debounce
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
            try {
                const imgData = await loadPatternFromFile(e.target.files[0]);
                state.patternImageData = imgData;
                state.patternWidth = imgData.width;
                state.patternHeight = imgData.height;
                state.isCustomPattern = true;
                state.currentPatternUrl = null;
                // Remove selected class from grid items
                document.querySelectorAll('.pattern-item').forEach(el => el.classList.remove('selected'));
                processImage();
            } catch (err) {
                showError('Failed to load custom pattern');
            }
        }
    });

    // Output scale
    elements.outputScaleSelect.addEventListener('change', (e) => {
        state.settings.outputScale = parseInt(e.target.value, 10);
    });

    // Download button
    elements.downloadBtn.addEventListener('click', downloadPNG);

    // Reset button (settings only)
    elements.resetBtn.addEventListener('click', resetSettingsOnly);

    // Window resize - NO canvas dimension changes, just trigger repaint?
    // Actually we don't need to do anything, CSS handles it
    // But we should ensure the canvas content is still there (it is)
    window.addEventListener('resize', () => {
        // Just force a small redraw if needed (rare)
        if (state.processedCanvas) {
            const ctx = elements.previewCanvas.getContext('2d');
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(state.processedCanvas, 0, 0);
        }
    });
}

/* -------------------------------
   INITIALIZATION
--------------------------------- */
async function init() {
    bindEvents();

    // Build pattern grid and load first pattern
    await buildPatternGrid();

    // Display initial slider values
    elements.brightnessValue.textContent = DEFAULT.brightness;
    elements.contrastValue.textContent = DEFAULT.contrast;

    // Auto-load sample.jpg
    await loadSampleImage();
}

// Start the application
init();