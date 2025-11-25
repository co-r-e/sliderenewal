# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SlideRenewal is an AI-powered slide redesign tool that uses Google Gemini to transform PDF presentations. Users upload PDF files, and the app converts each page to images, then sends them to Gemini 3 Pro for redesign based on user prompts.

## Development Commands

```bash
npm run dev    # Start development server (Next.js)
npm run build  # Production build
npm run start  # Start production server
npm run lint   # Run ESLint
```

## Architecture

### Tech Stack
- Next.js 16 with App Router and Turbopack
- React 19 with TypeScript
- Tailwind CSS 4
- Google Generative AI SDK (`@google/generative-ai`)
- PDF.js for client-side PDF rendering

### Key Directories
- `src/app/[lang]/` - Internationalized routes (en/ja)
- `src/app/api/` - API routes (redesign endpoint, settings)
- `src/components/` - React components
- `src/dictionaries/` - i18n JSON files and loader
- `src/lib/` - Utilities (PDF converter)

### Core Flow
1. **PDF Upload** → `pdf-converter.ts` renders PDF pages to JPEG images on client
2. **Redesign Request** → `home-page.tsx` sends images sequentially to `/api/redesign`
3. **AI Generation** → `api/redesign/route.ts` calls Gemini with image + prompt
4. **Consistency** → Each page uses previous generated image as reference for visual consistency

### Key Implementation Details

**PDF to Image Conversion** (`src/lib/pdf-converter.ts`):
- Uses PDF.js with scale 3.0 for high-quality output
- Returns base64 JPEG data URLs

**API Route** (`src/app/api/redesign/route.ts`):
- Model: `gemini-3-pro-image-preview`
- Supports reference images and aspect ratio options
- Returns base64 image data from Gemini response

**State Management** (`src/components/home-page.tsx`):
- Sequential page processing with abort support
- Per-page prompts and reference images
- Progress tracking during generation

## Environment Variables

Required in `.env.local`:
```
GEMINI_API_KEY=your_google_ai_studio_key
```

## Notes

- Server actions body size limit is set to 100MB in `next.config.ts`
- i18n uses static params generation for `en` and `ja` locales
- Framer Motion handles animations
