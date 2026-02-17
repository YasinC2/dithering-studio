// =============================================
//  Pattern Editor - نسخه نهایی با تفکیک رنگ صحیح
// =============================================

class PatternEditor {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) throw Error(`Container ${containerId} not found`);

        this.options = {
            width: 8,
            height: 8,
            layers: 4,
            currentLayer: 0,
            onchange: null,
            ...options
        };

        this.pixels = [];
        this.uniqueThresholds = null; // جدید: برای حفظ val دقیق هنگام لود
        this.initPixels();

        this.isDrawing = false;
        this.lastX = -1;
        this.lastY = -1;
        this.STORAGE_KEY = 'custom-dither-patterns';

        this.createDOM();
        this.attachEvents();
        this.render();
    }

    initPixels() {
        const { width, height, layers } = this.options;
        this.pixels = Array(layers).fill().map(() =>
            Array(height).fill().map(() =>
                Array(width).fill(false)
            )
        );
    }

    createDOM() {
        // بدون تغییر (همان کد اصلی)
        const wrapper = document.createElement('div');
        wrapper.className = 'pattern-editor';

        const controls = document.createElement('div');
        controls.className = 'editor-controls';

        const widthGroup = this.createInputGroup('width', 'Width:', this.options.width, 1, 16, 1);
        const heightGroup = this.createInputGroup('height', 'Height:', this.options.height, 1, 16, 1);
        const layersGroup = this.createInputGroup('layers', 'Layers:', this.options.layers, 2, 32, 1);
        const layerGroup = this.createLayerControl();

        controls.appendChild(widthGroup);
        controls.appendChild(heightGroup);
        controls.appendChild(layersGroup);
        controls.appendChild(layerGroup);

        const previewSection = document.createElement('div');
        previewSection.className = 'pattern-preview-section';

        const previewLabel = document.createElement('label');
        previewLabel.textContent = 'Final Pattern Preview:';

        this.previewCanvas = document.createElement('canvas');
        this.previewCanvas.className = 'pattern-preview-canvas';
        this.previewCanvas.width = 64;
        this.previewCanvas.height = 64;
        this.previewCanvas.style.imageRendering = 'pixelated';

        previewSection.appendChild(previewLabel);
        previewSection.appendChild(this.previewCanvas);

        const gridContainer = document.createElement('div');
        gridContainer.className = 'pattern-grid-container';

        this.gridCanvas = document.createElement('canvas');
        this.gridCanvas.className = 'pattern-grid-canvas';
        this.gridCanvas.style.imageRendering = 'pixelated';

        gridContainer.appendChild(this.gridCanvas);

        const buttons = document.createElement('div');
        buttons.className = 'editor-buttons';

        this.downloadBtn = document.createElement('button');
        this.downloadBtn.type = 'button';
        this.downloadBtn.className = 'btn small primary';
        this.downloadBtn.innerHTML = '<svg class="icon"><use href="#icon-download"></use></svg> Download Pattern';
        this.downloadBtn.addEventListener('click', () => this.downloadPattern());

        this.addToPresetsBtn = document.createElement('button');
        this.addToPresetsBtn.type = 'button';
        this.addToPresetsBtn.className = 'btn small primary';
        this.addToPresetsBtn.innerHTML = '<svg class="icon"><use href="#icon-grid-add"></use></svg> Add to Presets';
        this.addToPresetsBtn.addEventListener('click', () => this.addToPresets());

        this.clearAllBtn = document.createElement('button');
        this.clearAllBtn.type = 'button';
        this.clearAllBtn.className = 'btn small warning';
        this.clearAllBtn.innerHTML = '<svg class="icon"><use href="#icon-trash"></use></svg> Clear All Layers';
        this.clearAllBtn.addEventListener('click', () => this.clearAll());

        buttons.appendChild(this.addToPresetsBtn);
        buttons.appendChild(this.downloadBtn);
        buttons.appendChild(this.clearAllBtn);

        wrapper.appendChild(controls);
        wrapper.appendChild(previewSection);
        wrapper.appendChild(gridContainer);
        wrapper.appendChild(buttons);

        this.container.innerHTML = '';
        this.container.appendChild(wrapper);

        this.layerNumberInput = document.getElementById('editor-layer-number');
        this.layerRangeInput = document.getElementById('editor-layer-range');
    }

    createInputGroup(id, label, value, min, max, step) {
        // بدون تغییر
        const group = document.createElement('div');
        group.className = 'editor-input-group';

        const lbl = document.createElement('label');
        lbl.htmlFor = `editor-${id}`;
        lbl.textContent = label;

        const input = document.createElement('input');
        input.type = 'number';
        input.id = `editor-${id}`;
        input.min = min;
        input.max = max;
        input.step = step;
        input.value = value;

        input.addEventListener('change', () => {
            const newValue = parseInt(input.value, 10);
            if (id === 'width' && newValue !== this.options.width) {
                this.resizeWidth(newValue);
            } else if (id === 'height' && newValue !== this.options.height) {
                this.resizeHeight(newValue);
            } else if (id === 'layers' && newValue !== this.options.layers) {
                this.resizeLayers(newValue);
            }
        });

        group.appendChild(lbl);
        group.appendChild(input);
        return group;
    }

    createLayerControl() {
        // بدون تغییر
        const group = document.createElement('div');
        group.className = 'editor-layer-control';

        const lbl = document.createElement('label');
        lbl.textContent = 'Current Layer:';

        const rangeDiv = document.createElement('div');
        rangeDiv.className = 'range';

        this.layerRangeInput = document.createElement('input');
        this.layerRangeInput.type = 'range';
        this.layerRangeInput.id = 'editor-layer-range';
        this.layerRangeInput.min = 0;
        this.layerRangeInput.max = this.options.layers - 1;
        this.layerRangeInput.step = 1;
        this.layerRangeInput.value = this.options.currentLayer;

        this.layerNumberInput = document.createElement('input');
        this.layerNumberInput.type = 'number';
        this.layerNumberInput.id = 'editor-layer-number';
        this.layerNumberInput.min = 0;
        this.layerNumberInput.max = this.options.layers - 1;
        this.layerNumberInput.step = 1;
        this.layerNumberInput.value = this.options.currentLayer;

        const updateLayer = (value) => {
            value = parseInt(value, 10);
            if (value !== this.options.currentLayer) {
                this.options.currentLayer = value;
                this.layerRangeInput.value = value;
                this.layerNumberInput.value = value;
                this.render();
            }
        };

        this.layerRangeInput.addEventListener('input', (e) => updateLayer(e.target.value));
        this.layerNumberInput.addEventListener('input', (e) => updateLayer(e.target.value));

        rangeDiv.appendChild(this.layerRangeInput);
        rangeDiv.appendChild(this.layerNumberInput);

        group.appendChild(lbl);
        group.appendChild(rangeDiv);
        return group;
    }

    resizeWidth(newWidth) {
        // اضافه: وقتی resize, uniqueThresholds رو null کن
        this.uniqueThresholds = null;
        const oldWidth = this.options.width;
        if (newWidth === oldWidth) return;

        for (let l = 0; l < this.options.layers; l++) {
            for (let y = 0; y < this.options.height; y++) {
                const row = this.pixels[l][y];
                if (newWidth > oldWidth) {
                    row.push(...Array(newWidth - oldWidth).fill(false));
                } else {
                    this.pixels[l][y] = row.slice(0, newWidth);
                }
            }
        }

        this.options.width = newWidth;
        this.render();
        this.triggerChange();
    }

    resizeHeight(newHeight) {
        // اضافه: وقتی resize, uniqueThresholds رو null کن
        this.uniqueThresholds = null;
        const oldHeight = this.options.height;
        if (newHeight === oldHeight) return;

        for (let l = 0; l < this.options.layers; l++) {
            if (newHeight > oldHeight) {
                const newRows = Array(newHeight - oldHeight).fill().map(() =>
                    Array(this.options.width).fill(false)
                );
                this.pixels[l].push(...newRows);
            } else {
                this.pixels[l] = this.pixels[l].slice(0, newHeight);
            }
        }

        this.options.height = newHeight;
        this.render();
        this.triggerChange();
    }

    resizeLayers(newLayers) {
        // اضافه: وقتی resize, uniqueThresholds رو null کن
        this.uniqueThresholds = null;
        const oldLayers = this.options.layers;
        if (newLayers === oldLayers) return;

        if (newLayers > oldLayers) {
            const newLayersArray = Array(newLayers - oldLayers).fill().map(() =>
                Array(this.options.height).fill().map(() =>
                    Array(this.options.width).fill(false)
                )
            );
            this.pixels.push(...newLayersArray);
        } else {
            this.pixels = this.pixels.slice(0, newLayers);
        }

        this.options.layers = newLayers;

        this.layerRangeInput.max = newLayers - 1;
        this.layerNumberInput.max = newLayers - 1;

        if (this.options.currentLayer >= newLayers) {
            this.options.currentLayer = newLayers - 1;
            this.layerRangeInput.value = this.options.currentLayer;
            this.layerNumberInput.value = this.options.currentLayer;
        }

        this.render();
        this.triggerChange();
    }

    // ==================== اصلاح: تشخیص لایه‌ها بدون چک diff ====================
    detectLayersFromThresholdMap(thresholdMap) {
        const values = new Set(thresholdMap.flat());
        const uniqueValues = Array.from(values).filter(v => v > 0).sort((a, b) => a - b);
        let layers = uniqueValues.length;

        // اگر بیش از 32, cluster به 32 (ساده: میانگین گروه‌ها)
        if (layers > 32) {
            const clusterSize = Math.ceil(layers / 32);
            const clustered = [];
            for (let i = 0; i < layers; i += clusterSize) {
                const group = uniqueValues.slice(i, i + clusterSize);
                const avg = Math.floor(group.reduce((a, b) => a + b, 0) / group.length);
                clustered.push(avg);
            }
            return clustered.length; // max 32
        }

        return Math.max(2, layers); // حداقل 2
    }

    // ==================== اصلاح: لود با حفظ val دقیق ====================
    loadPatternFromThresholdMap(thresholdMap, width, height, layers = null) {
        this.uniqueThresholds = null; // ریست اول

        const uniqueValues = Array.from(new Set(thresholdMap.flat().filter(v => v > 0))).sort((a, b) => a - b);

        if (layers === null) {
            layers = this.detectLayersFromThresholdMap(thresholdMap);
        }

        // اگر unique > layers (به خاطر cluster), uniqueValues رو adjust کن
        if (uniqueValues.length > layers) {
            const clusterSize = Math.ceil(uniqueValues.length / layers);
            const clustered = [];
            for (let i = 0; i < uniqueValues.length; i += clusterSize) {
                const group = uniqueValues.slice(i, i + clusterSize);
                const avg = Math.floor(group.reduce((a, b) => a + b, 0) / group.length);
                clustered.push(avg);
            }
            this.uniqueThresholds = clustered;
        } else {
            this.uniqueThresholds = uniqueValues;
        }

        this.options.width = width;
        this.options.height = height;
        this.options.layers = layers;

        this.initPixels();

        // layerIndex بر اساس index در uniqueValues (دقیق)
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const val = thresholdMap[y][x];
                if (val === 0) continue;

                // پیدا کردن نزدیک‌ترین index (برای cluster)
                let layerIndex = this.uniqueThresholds.findIndex(threshold => val <= threshold + (256 / layers / 2));
                if (layerIndex === -1) layerIndex = this.uniqueThresholds.length - 1;

                this.pixels[layerIndex][y][x] = true;
            }
        }

        if (this.layerRangeInput) {
            this.layerRangeInput.max = layers - 1;
            this.layerNumberInput.max = layers - 1;
        }

        this.options.currentLayer = 0;
        if (this.layerRangeInput) {
            this.layerRangeInput.value = 0;
            this.layerNumberInput.value = 0;
        }

        this.render();
        this.triggerChange();
    }

    // ==================== اصلاح: گرفتن threshold map با val دقیق ====================
    getThresholdMap() {
        const { width, height, layers } = this.options;
        const map = Array(height).fill().map(() => Array(width).fill(0));

        const layerSize = 256 / layers;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let activeLayer = -1;
                for (let l = 0; l < layers; l++) {
                    if (this.pixels[l][y][x]) {
                        activeLayer = l;
                        break;
                    }
                }

                if (activeLayer >= 0) {
                    if (this.uniqueThresholds) {
                        // استفاده از val دقیق اگر لود شده باشه
                        map[y][x] = this.uniqueThresholds[activeLayer] || 0;
                    } else {
                        // fallback به میانه
                        const minVal = activeLayer * layerSize;
                        map[y][x] = Math.floor(minVal + (layerSize / 2));
                    }
                }
            }
        }

        return map;
    }

    isPixelLocked(x, y, upToLayer) {
        // بدون تغییر
        for (let l = 0; l < upToLayer; l++) {
            if (this.pixels[l][y][x]) return true;
        }
        return false;
    }

    attachEvents() {
        // بدون تغییر
        this.gridCanvas.addEventListener('mousedown', (e) => {
            e.preventDefault();
            const { x, y } = this.getGridCoords(e);
            if (x >= 0 && x < this.options.width && y >= 0 && y < this.options.height) {
                this.isDrawing = true;
                this.lastX = x;
                this.lastY = y;
                this.togglePixel(x, y);
            }
        });

        window.addEventListener('mousemove', (e) => {
            if (!this.isDrawing) return;

            const { x, y } = this.getGridCoords(e);
            if (x >= 0 && x < this.options.width && y >= 0 && y < this.options.height) {
                if (x !== this.lastX || y !== this.lastY) {
                    const currentValue = this.pixels[this.options.currentLayer][y][x];
                    const initialValue = this.pixels[this.options.currentLayer][this.lastY][this.lastX];

                    if (currentValue !== initialValue && !this.isPixelLocked(x, y, this.options.currentLayer)) {
                        this.pixels[this.options.currentLayer][y][x] = initialValue;
                        this.render();
                        this.triggerChange();
                    }

                    this.lastX = x;
                    this.lastY = y;
                }
            }
        });

        window.addEventListener('mouseup', () => {
            this.isDrawing = false;
        });

        this.gridCanvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    getGridCoords(event) {
        // بدون تغییر
        const rect = this.gridCanvas.getBoundingClientRect();
        const scaleX = this.gridCanvas.width / rect.width;
        const scaleY = this.gridCanvas.height / rect.height;

        const canvasX = (event.clientX - rect.left) * scaleX;
        const canvasY = (event.clientY - rect.top) * scaleY;

        const cellSize = this.gridCanvas.width / this.options.width;

        const x = Math.floor(canvasX / cellSize);
        const y = Math.floor(canvasY / cellSize);

        return { x, y };
    }

    // ==================== اصلاح: toggle با ریست uniqueThresholds ====================
    togglePixel(x, y) {
        this.uniqueThresholds = null; // وقتی ادیت, val دقیق رو invalidate کن
        const currentLayer = this.options.currentLayer;

        if (this.isPixelLocked(x, y, currentLayer)) return;

        // اگر پیکسل در لایه فعلی فعال نیست
        if (!this.pixels[currentLayer][y][x]) {
            // پاک کردن پیکسل از همه لایه‌ها
            for (let l = 0; l < this.options.layers; l++) {
                this.pixels[l][y][x] = false;
            }
            // فعال کردن در لایه فعلی
            this.pixels[currentLayer][y][x] = true;
        } else {
            // اگر فعاله، غیرفعالش کن
            this.pixels[currentLayer][y][x] = false;
        }

        this.render();
        this.triggerChange();
    }

    // ==================== اصلاح: رندر گرید با opacity بهتر برای تفکیک ====================
    render() {
        this.renderGrid();
        this.renderPreview();
    }

    renderGrid() {
        const { width, height, currentLayer, layers } = this.options;

        const containerWidth = this.gridCanvas.parentElement.clientWidth;
        const cellSize = Math.min(40, Math.floor(containerWidth / width));
        this.gridCanvas.width = width * cellSize;
        this.gridCanvas.height = height * cellSize;

        const ctx = this.gridCanvas.getContext('2d');
        ctx.clearRect(0, 0, this.gridCanvas.width, this.gridCanvas.height);

        // پالت رنگی برای لایه‌های مختلف (بدون تغییر)
        const layerColors = [
            '#8b5cf6', // بنفش - لایه 0
            '#ec4899', // صورتی - لایه 1
            '#3b82f6', // آبی - لایه 2
            '#10b981', // سبز - لایه 3
            '#f59e0b', // نارنجی - لایه 4
            '#ef4444', // قرمز - لایه 5
            '#6366f1', // نیلی - لایه 6
            '#14b8a6', // فیروزه‌ای - لایه 7
        ];

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const xPos = x * cellSize;
                const yPos = y * cellSize;

                // پیدا کردن لایه فعال
                let activeLayer = -1;
                for (let l = 0; l < layers; l++) {
                    if (this.pixels[l][y][x]) {
                        activeLayer = l;
                        break;
                    }
                }

                // پس‌زمینه
                if (activeLayer >= 0 && activeLayer < currentLayer) {
                    ctx.fillStyle = '#444'; // قفل (فعال در لایه پایین‌تر)
                } else {
                    ctx.fillStyle = '#222'; // زمینه
                }
                ctx.fillRect(xPos, yPos, cellSize, cellSize);

                // رسم پیکسل با رنگ مخصوص لایه خودش
                if (activeLayer >= 0) {
                    let color = layerColors[activeLayer % layerColors.length];
                    if (activeLayer === currentLayer) {
                        ctx.fillStyle = '#6366f1';
                        ctx.fillRect(xPos + 2, yPos + 2, cellSize - 4, cellSize - 4);
                    } else if (activeLayer < currentLayer) {
                        // پیکسل لایه پایین‌تر - opacity کمتر برای تفکیک بهتر
                        ctx.fillStyle = '#666'; // 40% opacity (کمتر از 50% برای تمایز بیشتر)
                        ctx.fillRect(xPos + 2, yPos + 2, cellSize - 4, cellSize - 4);
                        
                        // علامت قفل کوچک
                        ctx.fillStyle = '#fff';
                        ctx.font = `${Math.floor(cellSize/3)}px monospace`;
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText('🔒', xPos + cellSize/2, yPos + cellSize/2);
                    }
                }

                // خطوط گرید
                ctx.strokeStyle = '#333';
                ctx.lineWidth = 1;
                ctx.strokeRect(xPos, yPos, cellSize, cellSize);
            }
        }
    }

    // ==================== بدون تغییر: رندر پیش‌نمایش ====================
    renderPreview() {
        const map = this.getThresholdMap();
        const { width, height } = this.options;

        const ctx = this.previewCanvas.getContext('2d');
        ctx.clearRect(0, 0, 64, 64);

        for (let y = 0; y < 64; y++) {
            for (let x = 0; x < 64; x++) {
                const srcX = Math.floor(x * width / 64);
                const srcY = Math.floor(y * height / 64);
                const val = map[srcY][srcX];
                
                if (val === 0) {
                    ctx.fillStyle = '#000000';
                } else {
                    ctx.fillStyle = `rgb(${val}, ${val}, ${val})`;
                }
                ctx.fillRect(x, y, 1, 1);
            }
        }
    }

    downloadPattern() {
        // بدون تغییر
        const map = this.getThresholdMap();
        const { width, height } = this.options;

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const val = map[y][x];
                ctx.fillStyle = `rgb(${val}, ${val}, ${val})`;
                ctx.fillRect(x, y, 1, 1);
            }
        }

        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `pattern_${width}x${height}.png`;
            a.click();
            URL.revokeObjectURL(url);
        });
    }

    addToPresets() {
        // بدون تغییر
        const map = this.getThresholdMap();
        const { width, height, layers } = this.options;

        const thumbCanvas = document.createElement('canvas');
        thumbCanvas.width = 32;
        thumbCanvas.height = 32;
        const thumbCtx = thumbCanvas.getContext('2d');

        for (let y = 0; y < 32; y++) {
            for (let x = 0; x < 32; x++) {
                const srcX = Math.floor(x * width / 32);
                const srcY = Math.floor(y * height / 32);
                const val = map[srcY][srcX];
                thumbCtx.fillStyle = `rgb(${val}, ${val}, ${val})`;
                thumbCtx.fillRect(x, y, 1, 1);
            }
        }

        const thumbnail = thumbCanvas.toDataURL();

        const pattern = {
            id: Date.now().toString(),
            name: `Custom Pattern ${new Date().toLocaleTimeString()}`,
            width,
            height,
            layers,
            data: this.pixels.map(layer =>
                layer.map(row =>
                    row.map(cell => cell ? 1 : 0)
                )
            ),
            thumbnail
        };

        const saved = localStorage.getItem(this.STORAGE_KEY);
        const patterns = saved ? JSON.parse(saved) : [];
        patterns.push(pattern);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(patterns));

        window.dispatchEvent(new CustomEvent('pattern-added', { detail: pattern }));

        alert('Pattern added to presets!');
    }

    triggerChange() {
        if (this.options.onchange) {
            const map = this.getThresholdMap();
            this.options.onchange(map, this.options.width, this.options.height);
        }
    }

    clear() {
        this.uniqueThresholds = null;
        this.initPixels();
        this.render();
        this.triggerChange();
    }

    clearAll() {
        this.uniqueThresholds = null;
        if (confirm('Are you sure? This will clear ALL layers.')) {
            for (let l = 0; l < this.options.layers; l++) {
                for (let y = 0; y < this.options.height; y++) {
                    for (let x = 0; x < this.options.width; x++) {
                        this.pixels[l][y][x] = false;
                    }
                }
            }

            this.render();
            this.triggerChange();
        }
    }
}

function initPatternEditor(onPatternChange) {
    const container = document.getElementById('pattern-editor-container');
    if (!container) return null;

    const editor = new PatternEditor('pattern-editor-container', {
        width: 4,
        height: 4,
        layers: 4,
        onchange: (map, w, h) => {
            if (onPatternChange) onPatternChange(map, w, h);
        }
    });

    return editor;
}

export { PatternEditor, initPatternEditor };