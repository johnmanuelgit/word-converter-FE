# PDF to Word Converter - Frontend

Modern Next.js frontend for PDF to DOCX conversion with stunning UI.

## 🎨 Features

- ✨ **Beautiful Dark Theme**: Premium glassmorphic design
- 📤 **Drag & Drop Upload**: Intuitive file upload experience
- 📊 **Real-time Progress**: Live upload and conversion tracking
- 🔄 **Status Polling**: Automatic updates every 2 seconds
- 💾 **One-Click Download**: Instant DOCX file download
- 🎭 **Smooth Animations**: Framer Motion powered transitions
- 📱 **Fully Responsive**: Works on all devices
- ♿ **Accessible**: WCAG 2.1 compliant

## 🚀 Installation

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment

```bash
# Create .env.local file
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
```

### 3. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🏗️ Project Structure

```
frontend/
├── app/
│   ├── layout.tsx         # Root layout with SEO
│   ├── page.tsx           # Main converter page
│   └── globals.css        # Global styles & theme
├── components/
│   ├── FileUpload.tsx     # Drag & drop upload
│   └── ConversionProgress.tsx  # Status display
├── lib/
│   ├── api.ts             # API service layer
│   └── utils.ts           # Utility functions
├── types/
│   └── conversion.ts      # TypeScript types
├── tailwind.config.js     # TailwindCSS config
├── tsconfig.json          # TypeScript config
└── package.json
```

## 🎨 Design System

### Color Palette

```css
--primary: hsl(263, 70%, 60%)      /* Purple */
--accent: hsl(263, 70%, 70%)       /* Light Purple */
--background: hsl(240, 10%, 3.9%)  /* Dark */
--foreground: hsl(0, 0%, 98%)      /* Light Text */
```

### Components

- **FileUpload**: Drag & drop zone with file validation
- **ConversionProgress**: Status tracker with animations
- **Glass Effects**: Backdrop blur with subtle borders
- **Gradient Text**: Dynamic gradient animations

## 📡 API Integration

The frontend communicates with the FastAPI backend:

```typescript
// Upload PDF
const conversion = await conversionApi.uploadPDF(file, onProgress)

// Poll status
const status = await conversionApi.getConversion(conversionId)

// Download DOCX
await conversionApi.downloadConversion(conversionId, filename)
```

## 🔄 Status Polling

Automatic polling every 2 seconds:

```typescript
const pollConversionStatus = async (id: string) => {
  const conversion = await conversionApi.getConversion(id)
  
  // Stop polling when complete
  if (conversion.status === 'COMPLETED' || conversion.status === 'FAILED') {
    clearInterval(pollingInterval)
  }
}
```

## 🎭 Animations

Built with TailwindCSS custom animations:

- **slide-up**: Entry animation for components
- **fade-in**: Subtle fade-in effects
- **pulse**: Background glow effects
- **shimmer**: Loading state animations

## 📱 Responsive Design

- Desktop: Full-width cards with side-by-side layout
- Tablet: Stacked layout with optimized spacing
- Mobile: Single column with touch-optimized buttons

## 🔧 Configuration

### API URL

Edit `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

For production:

```bash
NEXT_PUBLIC_API_URL=https://api.yourdomai n.com
```

### Tailwind Theme

Edit `tailwind.config.js` to customize:

- Colors
- Spacing
- Typography
- Animations

## 🚀 Production Build

```bash
# Build for production
npm run build

# Start production server
npm start

# Or deploy to Vercel
vercel deploy
```

## 🧪 Testing

```bash
# Test file upload
# 1. Start dev server
npm run dev

# 2. Open http://localhost:3000
# 3. Upload a PDF file
# 4. Watch conversion progress
# 5. Download converted DOCX
```

## 🌐 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
NEXT_PUBLIC_API_URL=https://your-backend-api.com
```

### Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

## 🔒 Security

- **File Validation**: Client-side PDF validation
- **Size Limits**: 50MB enforced
- **CORS**: Configured for specific origins
- **XSS Protection**: React automatic escaping
- **CSP**: Content Security Policy ready

## ♿ Accessibility

- Semantic HTML structure
- ARIA labels on interactive elements
- Keyboard navigation support
- Screen reader friendly
- High contrast ratios

## 📄 License

MIT

## 🤝 Contributing

Contributions welcome! Please follow:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For issues or questions:
- Create an issue on GitHub
- Contact support team

---

Built with ❤️ using Next.js, TypeScript, and TailwindCSS
"# word-converter-FE" 
