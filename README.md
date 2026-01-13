# GSAP Scroll Demo

A split-screen scroll animation demo inspired by [Rise at Seven](https://riseatseven.com/), featuring pinned sections, scroll-linked content, and dynamic title centering.

## Features
- **Pinned Layout**: The left column (titles) remains pinned while the right column (content) scrolls.
- **Grouped Content**: Multiple content items map to a single active title.
- **Dynamic Centering**: The active title automatically animates to the center of the viewport ("clock picker" style).
- **GSAP ScrollTrigger**: Powered by GreenSock Animation Platform for smooth, performance-optimized animations.

## Tech Stack
- Vanilla JavaScript
- GSAP (ScrollTrigger)
- Vite
- HTML/CSS

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

## Project Structure
- `index.html`: Main structure with grouped content items (`data-title-index`).
- `src/main.js`: Core logic for ScrollTrigger and title animation.
- `src/style.css`: Styling for the dark theme and layout.
