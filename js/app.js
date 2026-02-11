document.addEventListener('DOMContentLoaded', () => {
    const engine = new DitherEngine();

    // DOM Elements
    const imageUpload = document.getElementById('image-upload');
    const imageInput = document.getElementById('image-input');
    const patternUpload = document.getElementById('pattern-upload');
    const patternInput = document.getElementById('pattern-input');
    const patternGrid = document.getElementById('pattern-grid');
    const saveBtn = document.getElementById('save-btn');
    const emptyState = document.getElementById('empty-state');

    // Controls
    const modeSelect = document.getElementById('mode');
    const brightnessSlider = document.getElementById('brightness');
    const contrastSlider = document.getElementById('contrast');
    const stepsSlider = document.getElementById('steps');
    const pixelSlider = document.getElementById('pixel-size');
    const qualitySelect = document.getElementById('output-quality');

    // Value displays
    const brightnessValue = document.getElementById('brightness-value');
    const contrastValue = document.getElementById('contrast-value');
    const stepsValue = document.getElementById('steps-value');
    const pixelValue = document.getElementById('pixel-value');

    // Initialize values
    brightnessValue.textContent = brightnessSlider.value;
    contrastValue.textContent = contrastSlider.value;
    stepsValue.textContent = stepsSlider.value;
    pixelValue.textContent = pixelSlider.value;

    // Image upload event
    // imageUpload.addEventListener('click', () => imageInput.click());
    imageInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            await engine.loadImageFromFile(file);
            emptyState.style.display = 'none';
            engine.processImage();
        } catch (error) {
            alert('Error loading image');
            console.error(error);
        }
    });

    // Pattern upload event
    patternUpload.addEventListener('click', () => patternInput.click());
    patternInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            await engine.loadPatternFromFile(file);
            engine.processImage();
        } catch (error) {
            alert('Error loading pattern');
            console.error(error);
        }
    });

    // Load preset patterns
    function loadPresetPatterns() {
        const presets = engine.getPresetPatterns();
        patternGrid.innerHTML = '';

        presets.forEach((preset, index) => {
            const patternItem = document.createElement('div');
            patternItem.className = 'pattern-item';
            patternItem.dataset.src = preset.url;

            if (index === 0) {
                patternItem.classList.add('active');
            }

            const img = document.createElement('img');
            img.src = preset.preview;
            img.alt = preset.name;
            img.onerror = () => {
                img.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="%231e293b"/></svg>';
            };

            patternItem.appendChild(img);
            patternItem.addEventListener('click', () => {
                document.querySelectorAll('.pattern-item').forEach(item => {
                    item.classList.remove('active');
                });
                patternItem.classList.add('active');
                engine.updateSettings({ patternSrc: preset.url });
            });

            patternGrid.appendChild(patternItem);
        });
    }

    // Update settings
    function updateSetting(key, value) {
        engine.updateSettings({ [key]: value });
    }

    // Control events
    modeSelect.addEventListener('change', (e) => {
        updateSetting('mode', e.target.value);
    });

    brightnessSlider.addEventListener('input', (e) => {
        brightnessValue.textContent = e.target.value;
        updateSetting('brightness', parseFloat(e.target.value));
    });

    contrastSlider.addEventListener('input', (e) => {
        contrastValue.textContent = e.target.value;
        updateSetting('contrast', parseFloat(e.target.value));
    });

    stepsSlider.addEventListener('input', (e) => {
        stepsValue.textContent = e.target.value;
        updateSetting('steps', parseFloat(e.target.value));
    });

    pixelSlider.addEventListener('input', (e) => {
        pixelValue.textContent = e.target.value;
        updateSetting('pixelSize', parseInt(e.target.value));
    });

    qualitySelect.addEventListener('change', (e) => {
        updateSetting('outputQuality', parseInt(e.target.value));
    });

    // Save image
    saveBtn.addEventListener('click', () => {
        engine.saveImage();
    });

    // Initialization
    loadPresetPatterns();

    // Apply initial settings
    engine.updateSettings({
        mode: modeSelect.value,
        brightness: parseFloat(brightnessSlider.value),
        contrast: parseFloat(contrastSlider.value),
        steps: parseFloat(stepsSlider.value),
        pixelSize: parseInt(pixelSlider.value),
        outputQuality: parseInt(qualitySelect.value)
    });

    // Load sample image on startup
    window.addEventListener('load', () => {
        const sampleImage = new Image();
        sampleImage.crossOrigin = "anonymous";
        sampleImage.onload = () => {
            engine.originalImage = sampleImage;
            emptyState.style.display = 'none';
            engine.processImage();
        };
        sampleImage.onerror = () => {
            console.log('Sample image could not be loaded');
        };
        
        sampleImage.src = 'images/sample.jpg';
    });


});