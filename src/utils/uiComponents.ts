// UI Components for Client-Side Rendering
// These functions return HTML strings that match our design system

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  type?: 'button' | 'submit' | 'reset';
  class?: string;
  onclick?: string;
  children: string;
  dataAttributes?: Record<string, string>;
}

export interface BadgeProps {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  class?: string;
  children: string;
}

export interface CardProps {
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  class?: string;
  children: string;
}

// Base classes for UI components
const baseClasses = {
  button: 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
  badge: 'inline-flex items-center font-medium rounded-full',
  card: 'bg-white rounded-lg transition-all duration-200'
};

// Variant classes
const variantClasses = {
  button: {
    primary: 'bg-primary text-white hover:bg-primary/90 focus:ring-primary/50',
    secondary: 'bg-secondary text-white hover:bg-secondary/90 focus:ring-secondary/50',
    outline: 'border border-neutral/20 text-neutral hover:bg-neutral/5 focus:ring-neutral/50',
    ghost: 'text-neutral hover:bg-neutral/5 focus:ring-neutral/50'
  },
  badge: {
    primary: 'bg-primary text-white',
    secondary: 'bg-secondary text-white',
    success: 'bg-green-500 text-white',
    warning: 'bg-yellow-500 text-white',
    error: 'bg-semantic text-white',
    info: 'bg-blue-500 text-white'
  },
  card: {
    default: 'border border-neutral/20',
    elevated: 'shadow-md hover:shadow-lg',
    outlined: 'border-2 border-neutral/20'
  }
};

// Size classes
const sizeClasses = {
  button: {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  },
  badge: {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm'
  },
  card: {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  }
};

// Button component
export function renderButton({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  type = 'button',
  class: className = '',
  onclick = '',
  children,
  dataAttributes = {}
}: ButtonProps): string {
  const widthClasses = fullWidth ? 'w-full' : '';
  const buttonClasses = `${baseClasses.button} ${variantClasses.button[variant]} ${sizeClasses.button[size]} ${widthClasses} ${className}`;
  
  // Generate data attributes
  const dataAttrs = Object.entries(dataAttributes)
    .map(([key, value]) => `data-${key}="${value}"`)
    .join(' ');
  
  return `
    <button 
      type="${type}"
      ${disabled || loading ? 'disabled' : ''}
      class="${buttonClasses}"
      ${onclick ? `onclick="${onclick}"` : ''}
      ${dataAttrs}
    >
      ${loading ? `
        <svg class="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ` : ''}
      ${children}
    </button>
  `;
}

// Badge component
export function renderBadge({
  variant = 'secondary',
  size = 'md',
  class: className = '',
  children
}: BadgeProps): string {
  const badgeClasses = `${baseClasses.badge} ${variantClasses.badge[variant]} ${sizeClasses.badge[size]} ${className}`;
  
  return `
    <span class="${badgeClasses}">
      ${children}
    </span>
  `;
}

// Card component
export function renderCard({
  variant = 'default',
  padding = 'none',
  class: className = '',
  children
}: CardProps): string {
  const cardClasses = `${baseClasses.card} ${variantClasses.card[variant]} ${sizeClasses.card[padding]} ${className}`;
  
  return `
    <div class="${cardClasses}">
      ${children}
    </div>
  `;
}

// Product Card component (combines multiple UI components)
export interface ProductCardProps {
  product: {
    id: string;
    title: string;
    url: string;
    mainImage: string;
    price: number;
    calculatedDiscount?: number;
  };
  formatPrice: (price: number) => string;
  getDiscountedPrice: (price: number, discount: number) => number;
}

export function renderProductCard({
  product,
  formatPrice,
  getDiscountedPrice
}: ProductCardProps): string {
  const cardContent = `
    <a href="/san-pham/${product.url}" class="block relative">
      <div class="relative h-48 sm:h-56 overflow-hidden">
        <img
          src="${product.mainImage}"
          alt="${product.title}"
          class="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        ${product.calculatedDiscount ? `
          <div class="absolute top-2 left-2">
            ${renderBadge({
              variant: 'error',
              size: 'sm',
              children: `-${product.calculatedDiscount}%`
            })}
          </div>
        ` : ''}
        <button 
          class="absolute bottom-2 right-2 bg-white/80 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white"
          aria-label="Thêm vào danh sách yêu thích"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-accent-500">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </button>
      </div>
    </a>
    
    <div class="p-4">
      <a href="/san-pham/${product.url}" class="block">
        <h3 class="text-gray-800 font-medium text-sm sm:text-base line-clamp-2 mb-2 min-h-[2.5rem] group-hover:text-primary-600 transition-colors">
          ${product.title}
        </h3>
        <div class="flex flex-wrap items-center mb-1 md:space-x-2">
          <span class="text-gray-900 font-semibold">
            ${formatPrice(product.price)}
          </span>
          ${product.calculatedDiscount ? `
            <span class="text-gray-500 line-through text-sm">
              ${formatPrice(getDiscountedPrice(product.price, product.calculatedDiscount))}
            </span>
          ` : ''}
        </div>
        <div class="flex items-center text-yellow-500 text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4">
            <path fill-rule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clip-rule="evenodd" />
          </svg>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4">
            <path fill-rule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clip-rule="evenodd" />
          </svg>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4">
            <path fill-rule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clip-rule="evenodd" />
          </svg>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4">
            <path fill-rule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clip-rule="evenodd" />
          </svg>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 text-gray-300">
            <path fill-rule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clip-rule="evenodd" />
          </svg>
          <span class="text-gray-500 ml-1">(45)</span>
        </div>
      </a>
      
      <div class="mt-4">
        ${renderButton({
          variant: 'outline',
          fullWidth: true,
          class: 'add-to-variant',
          dataAttributes: {
            'product-id': product.id,
            'product-name': product.title,
            'product-image': product.mainImage,
            'product-slug': product.url,
            'product-price': product.price.toString()
          },
          children: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-1"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" /></svg>Thêm vào giỏ`
        })}
      </div>
    </div>
  `;

  return renderCard({
    variant: 'elevated',
    class: 'overflow-hidden group',
    children: cardContent
  });
} 