# Dithering Studio

A powerful, client-side image dithering tool with pattern editor, color palette support, and real-time preview. Create stunning pixel art and retro-style images directly in your browser.

## ✨ Features

### 🎨 Core Dithering
- **Pixel Size Control**: Adjust the size of dithering blocks
- **Step Control**: Fine-tune the number of intensity levels
- **Color Modes**: 
  - `BW` - Classic black and white dithering
  - `RGB` - Full color dithering with individual channel processing
- **Real-time Preview**: All changes applied instantly with debounced updates
- **Invert Option**: Reverse the dithering effect

### 🧩 Pattern System
- **Pattern Editor**: Create and edit custom dither patterns layer by layer
  - Adjustable grid size (up to 16×16)
  - Multiple layers (up to 32) for complex threshold maps
  - Visual layer locking system
  - Real-time pattern preview
- **Preset Patterns**: 20+ built-in patterns ready to use
- **Custom Pattern Upload**: Import your own pattern images
- **Save Patterns**: Store custom patterns in browser's localStorage

### 🎨 Color Palettes
- **Lospec Integration**: Load palettes directly from [Lospec.com](https://lospec.com)
  - Support for palette URLs and slugs
  - Automatic palette extraction
- **Preset Palettes**: 40+ carefully selected palettes
- **Custom Palette Upload**: Import palette images
- **Real-time Preview**: Color strip shows selected palette

### 🖼️ Image Processing
- **Drag & Drop Upload**: Simple image import
- **Brightness/Contrast**: Pre-dithering adjustments
- **Output Scaling**: Export at 1x, 2x, 3x, or 4x resolution

### 💾 Export Options
- **PNG Download**: Save your dithered images
- **Intelligent Filenames**: Auto-generated based on settings
  - `{pattern}_steps{steps}_{mode}_{palette}.png`
- **Pattern Export**: Download threshold maps as PNG

## 🚀 Getting Started

You can use the [**Dithering Studio** editor online](https://yasinc2.github.io/dithering-studio/)

## 💻 Run on a Local Web Server

### Prerequisites
- Modern web browser (Chrome, Firefox, Edge)
- Local web server (optional, but recommended)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/dithering-studio.git
cd dithering-studio
```

2. **Run the application**
   - Using VS Code Live Server
   - Or any simple HTTP server:
```bash
python3 -m http.server 8000
```
   - Open `http://localhost:8000` in your browser

## 📖 Usage Guide

### Basic Workflow
1. **Upload an image** (drag & drop or click)
2. **Select a dither pattern** from the grid
3. **Adjust pixel size** and steps
4. **Choose color mode** (BW/RGB)
5. **Fine-tune with brightness/contrast**
6. **Download** your dithered image

### Pattern Editor
1. Open the "Pattern Editor" section
2. Adjust width/height/layers
3. Draw on the grid (click and drag)
4. Switch between layers to build complex patterns
5. Use "Add to Presets" to save custom patterns

### Working with Palettes
1. Check "Apply color palette"
2. Select from preset palettes or upload custom
3. Or enter a Lospec URL (e.g., `https://lospec.com/palettes/greyt-bit`)
4. Palette applies after dithering for perfect color mapping

## 🛠️ Technical Details

### How It Works
1. **Downsampling**: Image is divided into blocks based on pixel size
2. **Dithering**: Each block's center pixel is compared with pattern threshold
3. **Upscaling**: Result is scaled back to original size (nearest-neighbor)
4. **Palette Mapping**: Optional gradient map applied to final image

### Pattern Structure
- Patterns are threshold maps (0-255 values)
- Editor uses layered approach for intuitive creation
- Each layer corresponds to a threshold level

### Palette Extraction
- Supports 1x, 8x, and 32x Lospec format
- Automatically detects block size from image height
- Samples from center of each color block

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development
- **No frameworks**: Pure vanilla JavaScript
- **Canvas API**: All rendering done with 2D context
- **Modular design**: Separate files for core and editor logic

## 📝 License

This project is licensed under the GPL-3.0 license - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Lospec](https://lospec.com) for the amazing palette database and API
- All pattern and palette creators
- Pixel art community for inspiration

## 📸 Screenshots

![Dithering Studio Screenshot](screenshot.png)


**Made with 🧡 for pixel art lovers**
