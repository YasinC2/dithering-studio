// =============================================
//  Pattern Editor - لایه‌به‌لایه طراحی پترن دایترینگ
//  مستقل از کد اصلی، با قابلیت ادغام
// =============================================

class PatternEditor {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) throw Error(`Container ${containerId} not found`);

        // تنظیمات پیش‌فرض
        this.options = {
            width: 8,
            height: 8,
            layers: 4,
            currentLayer: 0,
            onchange: null,      // کال‌بک برای اعمال تغییرات روی تصویر
            ...options
        };

        // داده‌های پترن (3 بعدی: layers × height × width)
        this.pixels = [];
        this.initPixels();

        // متغیرهای رسم
        this.isDrawing = false;
        this.lastX = -1;
        this.lastY = -1;

        // localStorage key
        this.STORAGE_KEY = 'custom-dither-patterns';

        // ساخت DOM
        this.createDOM();
        this.attachEvents();
        this.render();
    }

    // ==================== مقداردهی اولیه ====================
    initPixels() {
        const { width, height, layers } = this.options;
        this.pixels = Array(layers).fill().map(() =>
            Array(height).fill().map(() =>
                Array(width).fill(false)
            )
        );
    }

    // ==================== ساخت DOM ====================
    createDOM() {
        const wrapper = document.createElement('div');
        wrapper.className = 'pattern-editor';

        // === بخش کنترل‌ها ===
        const controls = document.createElement('div');
        controls.className = 'editor-controls';

        // عرض
        const widthGroup = this.createInputGroup('width', 'Width:', this.options.width, 1, 16, 1);
        // ارتفاع
        const heightGroup = this.createInputGroup('height', 'Height:', this.options.height, 1, 16, 1);
        // تعداد لایه‌ها
        const layersGroup = this.createInputGroup('layers', 'Layers:', this.options.layers, 2, 32, 1);
        // لایه فعلی
        const layerGroup = this.createLayerControl();

        controls.appendChild(widthGroup);
        controls.appendChild(heightGroup);
        controls.appendChild(layersGroup);
        controls.appendChild(layerGroup);

        // === بخش پیش‌نمایش پترن نهایی ===
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

        // === بخش گرید اصلی ===
        const gridContainer = document.createElement('div');
        gridContainer.className = 'pattern-grid-container';

        this.gridCanvas = document.createElement('canvas');
        this.gridCanvas.className = 'pattern-grid-canvas';
        this.gridCanvas.style.imageRendering = 'pixelated';

        gridContainer.appendChild(this.gridCanvas);

        // === بخش دکمه‌ها ===
        const buttons = document.createElement('div');
        buttons.className = 'editor-buttons';

        this.downloadBtn = document.createElement('button');
        this.downloadBtn.type = 'button';
        this.downloadBtn.className = 'btn small primary';
        // this.downloadBtn.textContent = 'Download Pattern Image';
        this.downloadBtn.innerHTML = '<svg class="icon"><use href="#icon-download"></use></svg> Download Pattern';
        this.downloadBtn.addEventListener('click', () => this.downloadPattern());

        this.addToPresetsBtn = document.createElement('button');
        this.addToPresetsBtn.type = 'button';
        this.addToPresetsBtn.className = 'btn small primary';
        // this.addToPresetsBtn.textContent = 'Add to Presets';
        this.addToPresetsBtn.innerHTML = '<svg class="icon"><use href="#icon-grid-add"></use></svg> Add to Presets';
        this.addToPresetsBtn.addEventListener('click', () => this.addToPresets());

        this.clearAllBtn = document.createElement('button');
        this.clearAllBtn.type = 'button';
        this.clearAllBtn.className = 'btn small warning';
        // this.clearAllBtn.textContent = 'Clear All Layers';
        this.clearAllBtn.innerHTML = '<svg class="icon"><use href="#icon-trash"></use></svg> Clear All Layers';
        this.clearAllBtn.addEventListener('click', () => this.clearAll());

        buttons.appendChild(this.addToPresetsBtn);
        buttons.appendChild(this.downloadBtn);
        buttons.appendChild(this.clearAllBtn);

        // === چیدمان نهایی ===
        wrapper.appendChild(controls);
        wrapper.appendChild(previewSection);
        wrapper.appendChild(gridContainer);
        wrapper.appendChild(buttons);

        this.container.innerHTML = '';
        this.container.appendChild(wrapper);

        // ذخیره ارجاع به المان‌های عددی برای به‌روزرسانی
        this.layerNumberInput = document.getElementById('editor-layer-number');
        this.layerRangeInput = document.getElementById('editor-layer-range');
    }

    createInputGroup(id, label, value, min, max, step) {
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

        // هماهنگ‌سازی دو input
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

    // ==================== تغییر اندازه ====================
    resizeWidth(newWidth) {
        const oldWidth = this.options.width;
        if (newWidth === oldWidth) return;

        // برای هر لایه و هر سطر، عرض را تنظیم کن
        for (let l = 0; l < this.options.layers; l++) {
            for (let y = 0; y < this.options.height; y++) {
                const row = this.pixels[l][y];
                if (newWidth > oldWidth) {
                    // اضافه کردن سلول‌های خالی (false) به انتها
                    row.push(...Array(newWidth - oldWidth).fill(false));
                } else {
                    // برش از انتها
                    this.pixels[l][y] = row.slice(0, newWidth);
                }
            }
        }

        this.options.width = newWidth;
        this.render();
        this.triggerChange();
    }

    resizeHeight(newHeight) {
        const oldHeight = this.options.height;
        if (newHeight === oldHeight) return;

        for (let l = 0; l < this.options.layers; l++) {
            if (newHeight > oldHeight) {
                // اضافه کردن سطرهای جدید (پر از false)
                const newRows = Array(newHeight - oldHeight).fill().map(() =>
                    Array(this.options.width).fill(false)
                );
                this.pixels[l].push(...newRows);
            } else {
                // برش از انتها
                this.pixels[l] = this.pixels[l].slice(0, newHeight);
            }
        }

        this.options.height = newHeight;
        this.render();
        this.triggerChange();
    }

    resizeLayers(newLayers) {
        const oldLayers = this.options.layers;
        if (newLayers === oldLayers) return;

        if (newLayers > oldLayers) {
            // اضافه کردن لایه‌های جدید (همه false)
            const newLayersArray = Array(newLayers - oldLayers).fill().map(() =>
                Array(this.options.height).fill().map(() =>
                    Array(this.options.width).fill(false)
                )
            );
            this.pixels.push(...newLayersArray);
        } else {
            // حذف لایه‌های بالایی (آخرین لایه‌ها)
            this.pixels = this.pixels.slice(0, newLayers);
        }

        this.options.layers = newLayers;

        // آپدیت محدوده اسلایدر لایه
        this.layerRangeInput.max = newLayers - 1;
        this.layerNumberInput.max = newLayers - 1;

        // اگر لایه فعلی از محدوده خارج شده، تصحیح کن
        if (this.options.currentLayer >= newLayers) {
            this.options.currentLayer = newLayers - 1;
            this.layerRangeInput.value = this.options.currentLayer;
            this.layerNumberInput.value = this.options.currentLayer;
        }

        this.render();
        this.triggerChange();
    }

    // ==================== لود پترن از preset ====================
    loadPatternFromThresholdMap(thresholdMap, width, height, layers) { // thresholdMap: آرایه دو بعدی 0-255
        if (layers === null) {
            layers = this.detectLayersFromThresholdMap(thresholdMap);
        }

        // تبدیل به لایه‌ها
        this.options.width = width;
        this.options.height = height;
        this.options.layers = layers;

        this.initPixels(); // ریست

        const step = 255 / layers;
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const val = thresholdMap[y][x];
                if (val === 0) continue;

                // محاسبه بالاترین لایه‌ای که باید فعال باشد
                const layerIndex = Math.min(Math.floor(val / step), layers - 1);
                for (let l = 0; l <= layerIndex; l++) {
                    this.pixels[l][y][x] = true;
                }
            }
        }

        // آپدیت UI
        if (this.layerRangeInput) {
            this.layerRangeInput.max = layers - 1;
            this.layerNumberInput.max = layers - 1;
        }

        // ریست لایه فعلی
        this.options.currentLayer = 0;
        if (this.layerRangeInput) {
            this.layerRangeInput.value = 0;
            this.layerNumberInput.value = 0;
        }

        this.render();
        this.triggerChange();
    }

    // ==================== گرفتن threshold map برای دایترینگ ====================
    getThresholdMap() {
        const { width, height, layers } = this.options;
        const map = Array(height).fill().map(() => Array(width).fill(0));

        const step = 255 / layers;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                // پیدا کردن بالاترین لایه فعال
                let maxLayer = -1;
                for (let l = 0; l < layers; l++) {
                    if (this.pixels[l][y][x]) maxLayer = l;
                }

                if (maxLayer >= 0) {
                    // مقدار threshold: (maxLayer + 1) * step - 1
                    map[y][x] = Math.min(255, Math.floor((maxLayer + 1) * step));
                } else {
                    map[y][x] = 0;
                }
            }
        }

        return map;
    }

    // ==================== بررسی قفل بودن پیکسل ====================
    isPixelLocked(x, y, upToLayer) {
        for (let l = 0; l < upToLayer; l++) {
            if (this.pixels[l][y][x]) return true;
        }
        return false;
    }

    // ==================== رسم روی گرید ====================
    attachEvents() {
        // کلیک و درگ
        this.gridCanvas.addEventListener('mousedown', (e) => {
            e.preventDefault();
            const { x, y } = this.getGridCoords(e);
            if (x >= 0 && x < this.options.width && y >= 0 && y < this.options.height) {
                this.isDrawing = true;
                this.lastX = x;
                this.lastY = y;

                // کلیک اول: تغییر وضعیت
                this.togglePixel(x, y);
            }
        });

        window.addEventListener('mousemove', (e) => {
            if (!this.isDrawing) return;

            const { x, y } = this.getGridCoords(e);
            if (x >= 0 && x < this.options.width && y >= 0 && y < this.options.height) {
                // اگر سلول تغییر کرده، وضعیت را برابر سلول اولیه کن
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

        // جلوگیری از منوی راست کلیک
        this.gridCanvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    getGridCoords(event) {
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

    togglePixel(x, y) {
        const currentLayer = this.options.currentLayer;

        // بررسی قفل بودن
        if (this.isPixelLocked(x, y, currentLayer)) return;

        // تغییر وضعیت
        this.pixels[currentLayer][y][x] = !this.pixels[currentLayer][y][x];

        this.render();
        this.triggerChange();
    }

    // ==================== رندر ====================
    render() {
        this.renderGrid();
        this.renderPreview();
    }

    renderGrid() {
        const { width, height, currentLayer } = this.options;

        // تنظیم سایز کانواس (برای crisp rendering)
        const containerWidth = this.gridCanvas.parentElement.clientWidth;
        const cellSize = Math.min(40, Math.floor(containerWidth / width));
        this.gridCanvas.width = width * cellSize;
        this.gridCanvas.height = height * cellSize;

        const ctx = this.gridCanvas.getContext('2d');
        ctx.clearRect(0, 0, this.gridCanvas.width, this.gridCanvas.height);

        // رسم سلول‌ها
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const xPos = x * cellSize;
                const yPos = y * cellSize;

                // پس‌زمینه
                if (this.isPixelLocked(x, y, currentLayer)) {
                    ctx.fillStyle = '#444'; // خاکستری تیره برای قفل
                } else {
                    ctx.fillStyle = '#222'; // زمینه
                }
                ctx.fillRect(xPos, yPos, cellSize, cellSize);

                // رسم پیکسل اگر در لایه فعلی فعال باشد
                if (this.pixels[currentLayer][y][x]) {
                    ctx.fillStyle = '#8b5cf6'; // رنگ بنفش برای لایه فعلی
                    ctx.fillRect(xPos + 2, yPos + 2, cellSize - 4, cellSize - 4);
                }

                // اگر در لایه‌های پایین‌تر فعال باشد، یک دایره کوچک نشان بده
                if (this.isPixelLocked(x, y, currentLayer)) {
                    ctx.fillStyle = '#666';
                    ctx.beginPath();
                    ctx.arc(xPos + cellSize / 2, yPos + cellSize / 2, cellSize / 6, 0, Math.PI * 2);
                    ctx.fill();
                }

                // خطوط گرید
                ctx.strokeStyle = '#333';
                ctx.lineWidth = 1;
                ctx.strokeRect(xPos, yPos, cellSize, cellSize);
            }
        }
    }

    renderPreview() {
        const map = this.getThresholdMap();
        const { width, height } = this.options;

        const ctx = this.previewCanvas.getContext('2d');
        ctx.clearRect(0, 0, 64, 64);

        // رسم threshold map (مقیاس‌دهی به 64×64)
        for (let y = 0; y < 64; y++) {
            for (let x = 0; x < 64; x++) {
                const srcX = Math.floor(x * width / 64);
                const srcY = Math.floor(y * height / 64);
                const val = map[srcY][srcX];

                ctx.fillStyle = `rgb(${val}, ${val}, ${val})`;
                ctx.fillRect(x, y, 1, 1);
            }
        }
    }

    // ==================== ذخیره و دانلود ====================
    downloadPattern() {
        const map = this.getThresholdMap();
        const { width, height } = this.options;

        // ساخت canvas برای ذخیره
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

        // دانلود
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
        const map = this.getThresholdMap();
        const { width, height, layers } = this.options;

        // ساخت آیکون پیش‌نمایش (thumbnail 32×32)
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

        // ساخت آبجکت پترن
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

        // ذخیره در localStorage
        const saved = localStorage.getItem(this.STORAGE_KEY);
        const patterns = saved ? JSON.parse(saved) : [];
        patterns.push(pattern);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(patterns));

        // دیسپچ رویداد برای به‌روزرسانی لیست پترن‌ها
        window.dispatchEvent(new CustomEvent('pattern-added', { detail: pattern }));

        alert('Pattern added to presets!');
    }

    // ==================== متدهای عمومی ====================
    triggerChange() {
        if (this.options.onchange) {
            const map = this.getThresholdMap();
            this.options.onchange(map, this.options.width, this.options.height);
        }
    }

    // پاک کردن همه
    clear() {
        this.initPixels();
        this.render();
        this.triggerChange();
    }

    // در کلاس PatternEditor، بعد از متد clear
    clearAll() {
        if (confirm('Are you sure? This will clear ALL layers.')) {
            // ریست کردن همه پیکسل‌ها به false
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

    detectLayersFromThresholdMap(thresholdMap) {
        // جمع‌آوری همه مقادیر منحصر‌به‌فرد
        const values = new Set(thresholdMap.flat());
        const uniqueValues = Array.from(values).filter(v => v > 0).sort((a, b) => a - b);

        if (uniqueValues.length === 0) return 2; // حداقل 2 لایه

        // محاسبه تعداد لایه‌های مورد نیاز
        // اگر فاصله بین مقادیر بیشتر از 8 باشه، احتمالاً لایه‌های مجزا هستند
        let layerCount = 1;
        for (let i = 1; i < uniqueValues.length; i++) {
            if (uniqueValues[i] - uniqueValues[i - 1] > 8) {
                layerCount++;
            }
        }

        return Math.min(32, Math.max(2, layerCount));
    }
}

// ==================== ادغام با کد اصلی ====================
// این تابع در script.js فراخوانی می‌شود
function initPatternEditor(onPatternChange) {
    const container = document.getElementById('pattern-editor-container');
    if (!container) return null;

    const editor = new PatternEditor('pattern-editor-container', {
        width: 4,
        height: 4,
        layers: 4,
        onchange: (map, w, h) => {
            // تبدیل map به ImageData برای استفاده در دایترینگ
            // اینجا کال‌بک را به کد اصلی می‌فرستیم
            if (onPatternChange) onPatternChange(map, w, h);
        }
    });

    return editor;
}

export { PatternEditor, initPatternEditor };