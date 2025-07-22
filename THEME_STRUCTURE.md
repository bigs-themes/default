# Theme File Structure Guidelines

## ✅ Files that SHOULD be in theme:

### UI Components (Theme-specific display)
- `src/components/` - All UI components
- `src/layouts/` - Theme layouts
- `src/pages/` - Theme-specific pages

### Styling & Assets
- `src/assets/` - Theme assets (CSS, images, etc.)
- `tailwind.config.mjs` - Theme-specific Tailwind config

## ❌ Files that should NOT be in theme (Core/Backend):

### Business Logic (Core)
- `add-to-cart.ts` → Core logic
- `filter-products.ts` → Backend/API
- `useCart.ts`, `cart-store.ts` → Core store
- `checkout.ts` → Backend payment

### API & Services (Core)
- `ApiService.ts` → Core API
- `ProductService.ts` → Core business logic
- `ShopConfigService.ts` → Core config
- `ShopStyleService.ts` → Core style service
- `SectionService.ts` → Core section service
- `variants.ts` → Core product logic
- `uiComponents.ts` → Core UI logic

### Database & Data Access (Core)
- `database.ts` → Core database service
- `db.ts` → Core database connection
- `ProductGrid.astro` → Core product logic
- `FilterForm.astro` → Core filter logic
- `Footer.astro` → Core footer logic
- `cam-on.astro` → Core order logic
- `api/` → Core API handlers

### Utils & Helpers (Core)
- `notify.ts` → Core notification system
- `price.ts` → Core price calculation
- `cart.ts` → Core cart logic

### API Handlers (Backend)
- `api/` (REST handlers) → `storefront/src/api/` or separate server

## Theme Responsibilities:
1. **Display Logic** - How things look
2. **Theme-specific Styling** - Colors, fonts, layouts
3. **UI Components** - Buttons, cards, grids
4. **Theme Assets** - Images, CSS, configs

## Core Responsibilities:
1. **Business Logic** - Cart, checkout, products
2. **API Communication** - Data fetching, mutations
3. **State Management** - Global stores, hooks
4. **Backend Logic** - Payment, orders, users
5. **Database Access** - Data queries, connections
6. **Services** - Business services, data access
7. **Utils** - Helper functions, calculations

## Current Theme Structure (After Complete Cleanup):

```
src/
├── assets/css/              # Theme-specific styles ✅
├── components/              # UI components only ✅
│   ├── Header.astro
│   ├── AnnouncementBar.astro
│   ├── LivePreviewManager.astro
│   ├── MenuFooter.astro
│   ├── cart/               # Theme cart UI
│   ├── home/               # Theme home components
│   ├── product/            # Theme product components
│   ├── ui/                 # Theme UI components
│   └── subcomponents/      # Theme subcomponents
├── layouts/                # Theme layouts ✅
├── pages/                  # Theme-specific pages ✅
├── blocks/                 # Theme content blocks
├── config/                 # Theme configuration
└── lib/                    # Theme libraries (empty)
```

## Files Removed (Business Logic):
- ❌ `src/lib/database.ts` - Database service
- ❌ `src/lib/db.ts` - Database connection
- ❌ `src/components/Footer.astro` - Core footer logic
- ❌ `src/components/home/ProductGrid.astro` - Core product logic
- ❌ `src/components/home/FilterForm.astro` - Core filter logic
- ❌ `src/pages/cam-on.astro` - Core order logic
- ❌ `src/pages/api/` - Core API handlers
- ❌ `src/services/` - Core services (entire directory)
- ❌ `src/services/ApiService.ts` - Core API service
- ❌ `src/services/ProductService.ts` - Core product service
- ❌ `src/services/ShopConfigService.ts` - Core config service
- ❌ `src/services/ShopStyleService.ts` - Core style service
- ❌ `src/services/SectionService.ts` - Core section service
- ❌ `src/utils/` - Core utils (entire directory)
- ❌ `src/utils/cart.ts` - Core cart logic
- ❌ `src/utils/variants.ts` - Core variants logic
- ❌ `src/utils/uiComponents.ts` - Core UI logic
- ❌ `src/utils/notify.ts` - Core notification system
- ❌ `src/utils/price.ts` - Core price calculation

## Theme Now Contains Only:
- ✅ **UI Components** - Visual components only
- ✅ **Layouts** - Theme layouts
- ✅ **Pages** - Theme-specific pages
- ✅ **Assets** - CSS, images, configs
- ✅ **Blocks** - Content blocks
- ✅ **Config** - Theme configuration
