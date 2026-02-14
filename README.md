# Subham's Portfolio

A modern, production-level React + TypeScript portfolio website built with Vite.

## Project Structure

```
src/
├── components/        # Reusable React components
├── pages/            # Page components
├── hooks/            # Custom React hooks
├── types/            # TypeScript type definitions
├── utils/            # Utility functions
├── styles/           # Global and component styles
└── main.tsx          # Entry point
```

## Features

- ✨ Modern React 18 with TypeScript
- ⚡ Vite for fast development and optimized builds
- 🎨 Responsive design with CSS modules ready
- 🧩 Scalable component architecture
- 🛣️ React Router for navigation
- 📝 Path aliases for clean imports
- ✅ ESLint configuration

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

## Project Architecture

### Folder Organization

- **components/** - Reusable UI components (Header, Hero, etc.)
- **pages/** - Full page components that use multiple components
- **hooks/** - Custom React hooks for shared logic
- **types/** - Shared TypeScript interfaces and types
- **utils/** - Utility functions and helpers
- **styles/** - Global styles and CSS variables

### Path Aliases

Use these aliases for cleaner imports:

- `@` - src directory
- `@components` - src/components
- `@pages` - src/pages
- `@hooks` - src/hooks
- `@utils` - src/utils
- `@types` - src/types
- `@styles` - src/styles

Example:
```tsx
import Header from '@components/Header'
import { useCustomHook } from '@hooks/useCustomHook'
```

## Scaling the Project

As your portfolio grows, this structure supports:

1. **Adding new pages** - Create in `pages/` folder
2. **Creating sections** - Add components in `components/`
3. **Sharing logic** - Extract to `hooks/` or `utils/`
4. **Type safety** - Add types in `types/` folder
5. **Styling** - Keep styles co-located with components

## Next Steps

- [ ] Customize the Hero section
- [ ] Add About section
- [ ] Create Projects showcase
- [ ] Add Contact form
- [ ] Configure deployment
