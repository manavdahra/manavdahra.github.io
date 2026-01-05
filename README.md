# My portfolio

https://manavdahra.github.io/

## Development

This project uses Vite for fast development and optimized production builds.

### Prerequisites

- Node.js (v14 or higher recommended)
- npm

### Installation

```bash
npm install
```

### Usage

#### Development Server

Start the development server with hot module replacement:

```bash
npm run dev
```

This will start a local development server, typically at `http://localhost:5173`. The page will automatically reload when you make changes.

#### Build for Production

Create an optimized production build:

```bash
npm run build
```

This compiles and bundles the application into the `docs` directory, which is used for GitHub Pages deployment.

#### Preview Production Build

Preview the production build locally:

```bash
npm run preview
```

This serves the built files from the `docs` directory to test the production build before deployment.

## Project Structure

- `src/` - Source code
  - `index.js` - Main entry point
  - `style.css` - Global styles
  - `objects/` - 3D objects (snake, plane)
  - `assets/` - Static assets (fonts, icons)
- `docs/` - Production build output (GitHub Pages)
- `index.html` - Entry HTML file
- `vite.config.js` - Vite configuration

## Technologies

- **Vite** - Build tool and dev server
- **Three.js** - 3D graphics library
- **Cannon-es** - Physics engine
