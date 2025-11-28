# PresetPhoto - Zero-Cost Exam Photo Processor

A **100% client-side**, serverless Micro SaaS for processing photos and signatures for government exam applications. Built with Next.js 14+ (App Router) and deployable as a static site on Vercel/Netlify at **zero cost**.

![PresetPhoto Banner](./docs/banner.png)

## 🚀 Key Features

- **🔒 100% Private**: All image processing happens in your browser. Your photos **never leave your device**.
- **💰 Zero Cost**: No server, no database, no backend. Deploy for free on Vercel/Netlify.
- **📱 PWA Support**: Install as an app on mobile/desktop. Works **100% offline**.
- **⚡ WASM-Powered**: Fast client-side processing using WebAssembly-backed libraries.
- **🎯 Precise KB Limiter**: Iterative compression to hit exact file size requirements.
- **📅 Auto Date Stamp**: Adds date band to photos when required by exam portals.

## 🎓 Supported Exams

| Category | Exams |
|----------|-------|
| **Central Govt** | SSC (CGL, CHSL, MTS), UPSC (CSE, CDS, NDA) |
| **Banking** | IBPS (PO, Clerk, SO, RRB), SBI (PO, Clerk, SO) |
| **Railway** | RRB NTPC, Group D |
| **Education** | GATE, NEET UG/PG, JEE Main/Advanced |
| **Documents** | Passport, Visa, Aadhaar Card |
| **Custom** | Any custom dimensions and file size |

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ (App Router) with Static Site Generation (SSG)
- **Processing**: `browser-image-compression` + Canvas API (WebAssembly-backed)
- **Cropping**: `react-easy-crop`
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **PWA**: `next-pwa`
- **Icons**: Lucide React

## 📦 Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Main application page
│   └── globals.css         # Global styles + Tailwind
├── components/
│   ├── FileUpload.tsx      # Drag & drop file uploader
│   ├── PresetSelector.tsx  # Exam preset dropdown
│   ├── ImageCropper.tsx    # Crop interface with zoom/rotate
│   ├── ResultDisplay.tsx   # Processed image preview + download
│   └── ProcessingOverlay.tsx # Progress indicator
├── hooks/
│   └── useStaticProcessor.ts # Core processing engine
├── store/
│   └── useAppStore.ts      # Zustand state management
├── config/
│   └── examPresets.json    # Exam specifications (the only config!)
└── types/
    └── index.ts            # TypeScript definitions
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/preset-photo.git
cd preset-photo

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 🌐 Deployment (Static Site)

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Vercel will auto-detect Next.js and deploy as a static site
4. **Done!** Zero configuration needed.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/preset-photo)

### Deploy to Netlify

1. Push your code to GitHub
2. Go to [netlify.com](https://netlify.com) and create a new site from Git
3. Set build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `out`
4. Deploy!

### Manual Build

```bash
# Build static site
npm run build

# The output will be in the 'out' directory
# Upload contents of 'out' to any static hosting
```

## ⚙️ Configuration

### Adding New Exam Presets

Edit `src/config/examPresets.json` to add new exams:

```json
{
  "id": "your_exam_id",
  "label": "Your Exam Name",
  "category": "Category Name",
  "specs": {
    "photo": {
      "widthPx": 200,
      "heightPx": 230,
      "minSizeKB": 20,
      "maxSizeKB": 50,
      "dateFormat": true
    },
    "signature": {
      "widthPx": 140,
      "heightPx": 60,
      "minSizeKB": 10,
      "maxSizeKB": 20
    }
  }
}
```

### Spec Fields

| Field | Description |
|-------|-------------|
| `widthPx` | Target width in pixels |
| `heightPx` | Target height in pixels |
| `minSizeKB` | Minimum file size in KB |
| `maxSizeKB` | Maximum file size in KB |
| `dateFormat` | If `true`, adds date stamp band to photo |
| `customizable` | If `true`, allows user to modify dimensions |

## 🔒 Security & Privacy

This application is designed with **privacy-first** principles:

1. **No Server Communication**: The app makes ZERO network requests after initial page load
2. **No Analytics/Tracking**: No cookies, no tracking pixels, no data collection
3. **Local Processing**: All image manipulation happens via Canvas API in the browser
4. **No Storage**: Images are not stored anywhere - they exist only in memory during processing

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with ❤️ for exam aspirants
- Inspired by the pain of hitting exact KB limits on government portals
- Thanks to the open-source community for amazing libraries

---

**⭐ Star this repo if you find it helpful!**
