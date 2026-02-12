function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.decoding = "async";
        img.loading = "eager";
        img.src = src;
        img.onload = () => resolve(img);
        img.onerror = reject;
    });
}

function quantize(value, steps) {
    if (steps <= 1) return 0;
    const step = 255 / (steps - 1);
    return Math.round(value / step) * step;
}

class DitherEngine {
    static patternCache = new Map();
    static presets = [
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
        { name: "Pattern 19", url: "patterns/dither-pattern-19.png", preview: "patterns/dither-pattern-19-preview.png" },
    ];

    constructor() {
        this.originalImage = null;
        this.patternImage = null;
        this.canvas = document.getElementById('main-canvas');
        this.ctx = this.canvas.getContext('2d', {
            willReadFrequently: true,
            alpha: true
        });

        this.settings = {
            mode: 'bw',
            brightness: 0,
            contrast: 0,
            steps: 2,
            pixelSize: 2,
            patternSrc: 'patterns/dither-pattern-1.png',
            outputQuality: 2
        };
    }

    // ============ تابع کمکی luminance ============
    getLuminance(r, g, b) {
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }

    // ============ بهبود Brightness/Contrast با LUT ============
    applyBrightnessContrast(data, brightness, contrast) {
        const b = brightness;
        const c = contrast / 100;

        const newData = new Uint8ClampedArray(data.length);
        const lut = new Uint8ClampedArray(256);

        for (let i = 0; i < 256; i++) {
            let v = i;

            if (c >= 0) {
                v = 128 + (v - 128) / (1 - c);
            } else {
                v = 128 + (v - 128) * (1 + c);
            }

            v = v + b;
            v = 255 / (1 + Math.exp(-(v - 128) / 32));

            lut[i] = Math.max(0, Math.min(255, v));
        }

        for (let i = 0; i < data.length; i += 4) {
            newData[i] = lut[data[i]];
            newData[i + 1] = lut[data[i + 1]];
            newData[i + 2] = lut[data[i + 2]];
            newData[i + 3] = data[i + 3];
        }

        return newData;
    }

    // ============ دایترینگ سیاه سفید (بهبود یافته) ============
    applyDitherBW(imageData, pattern, steps, pixelSize) {
        const { width, height } = imageData;
        const data = imageData.data;
        const newData = new Uint8ClampedArray(data.length);

        const patternSize = pattern.size;
        const step = 255 / (steps - 1);

        // نرمالایز کردن ماتریس پترن
        const maxPattern = Math.max(...pattern.matrix);
        const normalizedPattern = pattern.matrix.map(v => v / maxPattern);

        for (let y = 0; y < height; y += pixelSize) {
            for (let x = 0; x < width; x += pixelSize) {
                const blockW = Math.min(pixelSize, width - x);
                const blockH = Math.min(pixelSize, height - y);

                let sum = 0;
                let count = 0;

                // محاسبه میانگین روشنایی بلوک
                for (let py = 0; py < blockH; py++) {
                    for (let px = 0; px < blockW; px++) {
                        const i = ((y + py) * width + (x + px)) * 4;
                        sum += this.getLuminance(data[i], data[i + 1], data[i + 2]);
                        count++;
                    }
                }

                const brightness = sum / count;

                // محاسبه آستانه از پترن
                const px = Math.floor(x / pixelSize) % patternSize;
                const py = Math.floor(y / pixelSize) % patternSize;
                const pIndex = py * patternSize + px;
                const threshold = normalizedPattern[pIndex] * 255;

                // کوانتایز کردن
                let value;
                if (brightness > threshold) {
                    value = Math.min(255, Math.ceil(brightness / step) * step);
                } else {
                    value = Math.max(0, Math.floor(brightness / step) * step);
                }

                // اعمال به تمام پیکسل‌های بلوک
                for (let py = 0; py < blockH; py++) {
                    for (let px = 0; px < blockW; px++) {
                        const i = ((y + py) * width + (x + px)) * 4;
                        newData[i] = newData[i + 1] = newData[i + 2] = value;
                        newData[i + 3] = data[i + 3];
                    }
                }
            }
        }

        return new ImageData(newData, width, height);
    }

    // ============ دایترینگ RGB (بهبود یافته) ============
    applyDitherRGB(imageData, pattern, steps, pixelSize) {
        const { width, height } = imageData;
        const data = imageData.data;
        const newData = new Uint8ClampedArray(data.length);

        const patternSize = pattern.size;
        const step = 255 / (steps - 1);

        const maxPattern = Math.max(...pattern.matrix);
        const normalizedPattern = pattern.matrix.map(v => v / maxPattern);

        for (let y = 0; y < height; y += pixelSize) {
            for (let x = 0; x < width; x += pixelSize) {
                const blockW = Math.min(pixelSize, width - x);
                const blockH = Math.min(pixelSize, height - y);

                let r = 0, g = 0, b = 0, count = 0;

                for (let py = 0; py < blockH; py++) {
                    for (let px = 0; px < blockW; px++) {
                        const i = ((y + py) * width + (x + px)) * 4;
                        r += data[i];
                        g += data[i + 1];
                        b += data[i + 2];
                        count++;
                    }
                }

                r = Math.round(r / count);
                g = Math.round(g / count);
                b = Math.round(b / count);

                const px = Math.floor(x / pixelSize) % patternSize;
                const py = Math.floor(y / pixelSize) % patternSize;
                const pIndex = py * patternSize + px;
                const threshold = normalizedPattern[pIndex] * 255;

                const rr = r > threshold ? Math.min(255, Math.ceil(r / step) * step) : Math.max(0, Math.floor(r / step) * step);
                const gg = g > threshold ? Math.min(255, Math.ceil(g / step) * step) : Math.max(0, Math.floor(g / step) * step);
                const bb = b > threshold ? Math.min(255, Math.ceil(b / step) * step) : Math.max(0, Math.floor(b / step) * step);

                for (let py = 0; py < blockH; py++) {
                    for (let px = 0; px < blockW; px++) {
                        const i = ((y + py) * width + (x + px)) * 4;
                        newData[i] = rr;
                        newData[i + 1] = gg;
                        newData[i + 2] = bb;
                        newData[i + 3] = data[i + 3];
                    }
                }
            }
        }

        return new ImageData(newData, width, height);
    }

    // ============ تابع اصلی پردازش ============
    async processImage() {
        if (!this.originalImage) return;

        const quality = this.settings.outputQuality;
        const pattern = await this.loadPattern(this.settings.patternSrc);

        const width = Math.floor(this.originalImage.width * quality);
        const height = Math.floor(this.originalImage.height * quality);

        this.canvas.width = width;
        this.canvas.height = height;
        this.canvas.style.maxWidth = `${this.originalImage.width}px`;
        this.canvas.style.maxHeight = `${this.originalImage.height}px`;

        this.ctx.imageSmoothingEnabled = false;
        this.ctx.drawImage(this.originalImage, 0, 0, width, height);

        let imageData = this.ctx.getImageData(0, 0, width, height);

        const processedData = this.applyBrightnessContrast(
            imageData.data,
            this.settings.brightness,
            this.settings.contrast
        );

        imageData = new ImageData(processedData, width, height);

        // ✅ استفاده از توابع دایترینگ اصلی
        if (this.settings.mode === 'rgb') {
            imageData = this.applyDitherRGB(
                imageData,
                pattern,
                this.settings.steps,
                this.settings.pixelSize * quality
            );
        } else {
            imageData = this.applyDitherBW(
                imageData,
                pattern,
                this.settings.steps,
                this.settings.pixelSize * quality
            );
        }

        this.ctx.putImageData(imageData, 0, 0);
        this.canvas.style.display = 'block';
        this.updateImageInfo();
    }

    // ============ بارگذاری پترن ============
    async loadPattern(src) {
        if (DitherEngine.patternCache.has(src)) {
            return DitherEngine.patternCache.get(src);
        }

        try {
            const img = await loadImage(src);
            const c = document.createElement('canvas');
            c.width = img.width;
            c.height = img.height;
            const ctx = c.getContext('2d');
            ctx.drawImage(img, 0, 0);

            const { data } = ctx.getImageData(0, 0, c.width, c.height);
            const matrix = [];

            for (let i = 0; i < data.length; i += 4) {
                const luminance = this.getLuminance(data[i], data[i + 1], data[i + 2]);
                matrix.push(luminance);
            }

            const pattern = { matrix, size: img.width };
            DitherEngine.patternCache.set(src, pattern);
            return pattern;
        } catch (error) {
            console.error('Error loading pattern:', error);
            return this.loadPattern('patterns/dither-pattern-1.png');
        }
    }

    // ============ بارگذاری تصویر از فایل ============
    async loadImageFromFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    this.originalImage = img;
                    resolve(img);
                };
                img.onerror = reject;
                img.src = e.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // ============ بارگذاری پترن از فایل ============
    async loadPatternFromFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    this.patternImage = img;
                    DitherEngine.patternCache.delete(this.settings.patternSrc);
                    this.settings.patternSrc = e.target.result;
                    resolve(img);
                };
                img.onerror = reject;
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    // ============ بروزرسانی تنظیمات ============
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        this.processImage();
    }

    // ============ بروزرسانی اطلاعات تصویر ============
    updateImageInfo() {
        const dimensions = document.getElementById('image-dimensions');
        const format = document.getElementById('image-format');

        if (this.originalImage) {
            dimensions.textContent = `${this.originalImage.width} × ${this.originalImage.height}`;
            format.textContent = 'PNG';
        }
    }

    // ============ دریافت پترن‌های پیشفرض ============
    getPresetPatterns() {
        return DitherEngine.presets;
    }

    // ============ ذخیره تصویر ============
    saveImage() {
        if (!this.originalImage) return;

        const link = document.createElement('a');
        link.download = `dither-${Date.now()}.png`;
        link.href = this.canvas.toDataURL('image/png');
        link.click();
    }
}