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
        this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
        
        this.settings = {
            mode: 'bw',
            brightness: 0,
            contrast: 0,
            steps: 2.3,
            pixelSize: 5,
            patternSrc: 'patterns/dither-pattern-1.png',
            outputQuality: 2
        };
    }

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
                matrix.push(data[i]);
            }

            const pattern = { matrix, size: img.width };
            DitherEngine.patternCache.set(src, pattern);
            return pattern;
        } catch (error) {
            console.error('Error loading pattern:', error);
            // Return default pattern
            return this.loadPattern('patterns/dither-pattern-1.png');
        }
    }

    applyBrightnessContrast(data, brightness, contrast) {
        const b = brightness * 2.55;
        const c = (contrast + 100) / 100;
        const factor = c * c;

        // ایجاد یک کپی جدید از آرایه داده
        const newData = new Uint8ClampedArray(data.length);
        
        for (let i = 0; i < data.length; i += 4) {
            for (let j = 0; j < 3; j++) {
                let v = data[i + j];
                v = (v - 128) * factor + 128 + b;
                newData[i + j] = Math.max(0, Math.min(255, v));
            }
            // کپی آلفا کانال
            newData[i + 3] = data[i + 3];
        }
        return newData;
    }

    applyDitherBW(imageData, pattern, steps, pixelSize) {
        const { width, height } = imageData;
        const data = imageData.data;
        
        // ایجاد یک آرایه جدید برای داده‌های پردازش شده
        const newData = new Uint8ClampedArray(data.length);

        for (let y = 0; y < height; y += pixelSize) {
            for (let x = 0; x < width; x += pixelSize) {
                const blockW = Math.min(pixelSize, width - x);
                const blockH = Math.min(pixelSize, height - y);

                let sum = 0;
                let count = 0;

                // محاسبه میانگین روشنایی در بلوک
                for (let py = 0; py < blockH; py++) {
                    for (let px = 0; px < blockW; px++) {
                        const i = ((y + py) * width + (x + px)) * 4;
                        sum += (data[i] + data[i + 1] + data[i + 2]) / 3;
                        count++;
                    }
                }

                const brightness = sum / count;
                const level = quantize(brightness, steps);

                const pIndex = ((y / pixelSize) % pattern.size) * pattern.size +
                             ((x / pixelSize) % pattern.size);
                const threshold = pattern.matrix[pIndex];
                const value = brightness >= threshold ? level : Math.max(0, level - 255 / (steps - 1));

                // اعمال مقدار به تمام پیکسل‌های بلوک
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

    applyDitherRGB(imageData, pattern, steps, pixelSize) {
        const { width, height } = imageData;
        const data = imageData.data;
        
        // ایجاد یک آرایه جدید برای داده‌های پردازش شده
        const newData = new Uint8ClampedArray(data.length);

        for (let y = 0; y < height; y += pixelSize) {
            for (let x = 0; x < width; x += pixelSize) {
                const blockW = Math.min(pixelSize, width - x);
                const blockH = Math.min(pixelSize, height - y);

                let r = 0, g = 0, b = 0, count = 0;

                // محاسبه میانگین مقادیر RGB در بلوک
                for (let py = 0; py < blockH; py++) {
                    for (let px = 0; px < blockW; px++) {
                        const i = ((y + py) * width + (x + px)) * 4;
                        r += data[i];
                        g += data[i + 1];
                        b += data[i + 2];
                        count++;
                    }
                }

                r = quantize(r / count, steps);
                g = quantize(g / count, steps);
                b = quantize(b / count, steps);

                const pIndex = ((y / pixelSize) % pattern.size) * pattern.size +
                             ((x / pixelSize) % pattern.size);
                const threshold = pattern.matrix[pIndex];

                const rr = r >= threshold ? r : Math.max(0, r - 255 / (steps - 1));
                const gg = g >= threshold ? g : Math.max(0, g - 255 / (steps - 1));
                const bb = b >= threshold ? b : Math.max(0, b - 255 / (steps - 1));

                // اعمال مقادیر RGB به تمام پیکسل‌های بلوک
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

    async processImage() {
        if (!this.originalImage) return;

        const quality = this.settings.outputQuality;
        const pattern = await this.loadPattern(this.settings.patternSrc);
        
        // محاسبه سایز بر اساس کیفیت
        const width = Math.floor(this.originalImage.width * quality);
        const height = Math.floor(this.originalImage.height * quality);
        
        // تنظیم سایز Canvas
        this.canvas.width = width;
        this.canvas.height = height;
        this.canvas.style.maxWidth = `${this.originalImage.width}px`;
        this.canvas.style.maxHeight = `${this.originalImage.height}px`;
        
        // کشیدن تصویر با سایز بزرگتر برای کیفیت بهتر
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.drawImage(this.originalImage, 0, 0, width, height);
        
        // گرفتن ImageData
        let imageData = this.ctx.getImageData(0, 0, width, height);
        
        // اعمال تنظیمات brightness و contrast
        const processedData = this.applyBrightnessContrast(
            imageData.data, 
            this.settings.brightness, 
            this.settings.contrast
        );
        
        // ایجاد ImageData جدید با داده‌های پردازش شده
        imageData = new ImageData(processedData, width, height);
        
        // اعمال Dithering
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
        
        // قرار دادن ImageData پردازش شده
        this.ctx.putImageData(imageData, 0, 0);
        
        // نمایش Canvas
        this.canvas.style.display = 'block';
        
        // بروزرسانی اطلاعات تصویر
        this.updateImageInfo();
    }

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

    async loadPatternFromFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    this.patternImage = img;
                    // پاک کردن کش برای این پترن
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

    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        this.processImage();
    }

    updateImageInfo() {
        const info = document.getElementById('image-info');
        const dimensions = document.getElementById('image-dimensions');
        const format = document.getElementById('image-format');
        
        if (this.originalImage) {
            dimensions.textContent = `${this.originalImage.width} × ${this.originalImage.height}`;
            format.textContent = 'PNG';
        }
    }

    saveImage() {
        if (!this.originalImage) return;
        
        const quality = this.settings.outputQuality;
        const link = document.createElement('a');
        
        // ایجاد Canvas با کیفیت اصلی
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        tempCanvas.width = this.originalImage.width * quality;
        tempCanvas.height = this.originalImage.height * quality;
        
        // کپی Canvas اصلی
        tempCtx.drawImage(this.canvas, 0, 0);
        
        // دانلود
        link.download = `dither-${Date.now()}.png`;
        link.href = tempCanvas.toDataURL('image/png');
        link.click();
    }

    getPresetPatterns() {
        return DitherEngine.presets;
    }
}