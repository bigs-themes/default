# BigS Default Theme

Default theme for BigS StoreFront - A modern e-commerce platform.

## 🎯 Theme Focus

This theme focuses on **display logic** and **UI components** only. Business logic is handled by the core system.

### ✅ Theme Responsibilities:
- **UI Components** - Buttons, cards, grids, layouts
- **Theme-specific Styling** - Colors, fonts, visual design
- **Display Logic** - How things look and behave visually
- **Theme Assets** - CSS, images, configuration files

### ❌ NOT Theme Responsibilities:
- **Business Logic** - Cart, checkout, product management
- **API Communication** - Data fetching, mutations
- **State Management** - Global stores, hooks
- **Backend Logic** - Payment, orders, users
- **Services** - Business services, data access
- **Utils** - Helper functions, calculations

## Features

- 🎨 **Dynamic Styling**: Real-time style updates with CSS variables
- 📱 **Responsive Design**: Mobile-first approach with Tailwind CSS
- ⚡ **Fast Performance**: Optimized with Astro framework
- 🎯 **SEO Friendly**: Built-in SEO optimization
- 🔧 **Easy Customization**: Modular component system
- 🏗️ **Clean Architecture**: Separation of concerns (UI vs Business Logic)

## Tech Stack

- **Framework**: Astro 5.x
- **Styling**: Tailwind CSS 3.x
- **Icons**: Swiper for carousels
- **Build**: Vite

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Build for production**:
   ```bash
   npm run build
   ```

## Project Structure

```
src/
├── assets/
│   └── css/
│       ├── card-styles.css      # Theme-specific card styles
│       └── button-styles.css    # Theme-specific button styles
├── components/
│   ├── Header.astro            # Theme header component
│   ├── AnnouncementBar.astro   # Theme announcement bar
│   ├── LivePreviewManager.astro # Theme preview manager
│   ├── MenuFooter.astro        # Theme footer menu
│   ├── cart/                   # Theme-specific cart UI
│   ├── home/                   # Theme home components
│   ├── product/                # Theme product components
│   ├── ui/                     # Theme UI components
│   └── subcomponents/          # Theme subcomponents
├── layouts/
│   └── Layout.astro            # Main theme layout
├── pages/                      # Theme-specific pages
├── blocks/                     # Theme content blocks
├── config/                     # Theme configuration
└── lib/                        # Theme libraries (empty)
```

## File Structure Guidelines

### ✅ Files that SHOULD be in theme:
- **UI Components**: `src/components/`, `src/layouts/`, `src/pages/`
- **Styling**: `src/assets/`, `tailwind.config.mjs`
- **Content**: `src/blocks/`, `src/config/`

### ❌ Files that should NOT be in theme (Core/Backend):
- **Business Logic**: `add-to-cart.ts`, `filter-products.ts`, `checkout.ts`
- **API Services**: `ApiService.ts`, `ProductService.ts`, `ShopStyleService.ts`
- **Core Stores**: `useCart.ts`, `cart-store.ts`
- **Utils**: `notify.ts`, `price.ts`, `cart.ts`
- **API Handlers**: `api/` (REST handlers)
- **Database**: `database.ts`, `db.ts`

## Customization

### Colors
The theme uses CSS variables for dynamic color management:
- `--color-primary`: Primary brand color
- `--color-secondary`: Secondary brand color
- `--color-neutral`: Neutral colors
- `--color-semantic`: Semantic colors (success, warning, error)

### Typography
Font families are configurable via CSS variables:
- `--font-heading`: Heading font family
- `--font-body`: Body text font family

### Components
All components support dynamic styling through CSS variables and can be customized via the BigS ShopManager.

## Development Guidelines

1. **Keep it Visual**: Focus on how things look, not business logic
2. **Use CSS Variables**: For dynamic styling that can be changed via ShopManager
3. **Component-based**: Create reusable UI components
4. **Theme-specific**: Don't include business logic that should be in core
5. **No Services**: Don't include services or utils in theme
6. **No Database**: Don't include database access in theme

## What's Removed (Business Logic):

### Services (Core):
- ❌ `ShopStyleService.ts` - Core style service
- ❌ `SectionService.ts` - Core section service
- ❌ `ApiService.ts` - Core API service
- ❌ `ProductService.ts` - Core product service

### Utils (Core):
- ❌ `notify.ts` - Core notification system
- ❌ `price.ts` - Core price calculation
- ❌ `cart.ts` - Core cart logic

### Database (Core):
- ❌ `database.ts` - Database service
- ❌ `db.ts` - Database connection

### Components (Core):
- ❌ `ProductGrid.astro` - Core product logic
- ❌ `FilterForm.astro` - Core filter logic
- ❌ `Footer.astro` - Core footer logic

### Pages (Core):
- ❌ `cam-on.astro` - Core order logic
- ❌ `api/` - Core API handlers

## License

MIT License - see LICENSE file for details.