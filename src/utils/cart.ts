declare global {
  interface Window {
    cart?: any[];
  }
}

export class Cart {
  items: any[];

  constructor() {
    this.items = this.loadCart();
    this.setupEventListeners();
    // Don't call updateCartUI in constructor as DOM might not be ready
    // updateCartUI will be called when needed
  }

  // Method to initialize UI when DOM is ready
  initializeUI() {
    this.updateCartUI();
  }

  loadCart() {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  }

  saveCart() {
    localStorage.setItem('cart', JSON.stringify(this.items));
    this.updateCartUI();
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('cartUpdated'));
  }

  addItem(product) {
    const existingItem = this.items.find(item => 
      item.id === product.id && 
      item.variant === product.variant
    );

    if (existingItem) {
      existingItem.quantity += product.quantity;
    } else {
      this.items.push(product);
    }

    this.saveCart();
  }

  removeItem(productId: string, variant) {
    this.items = this.items.filter(item => !(item.id === productId && String(item.variant) === String(variant)));
    this.saveCart();
  }

  updateQuantity(productId, variant, quantity) {
    const item = this.items.find(item => 
      item.id === productId && 
      item.variant === variant
    );
    
    if (item) {
      item.quantity = quantity;
      if (quantity <= 0) {
        this.removeItem(productId, variant);
      } else {
        this.saveCart();
      }
    }
  }

  getTotal() {
    return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  setupEventListeners() {
    // Close cart popup
    document.getElementById('close-cart')?.addEventListener('click', () => {
      document.getElementById('cart-popup')?.classList.add('hidden');
    });

    // Close cart when clicking outside
    document.getElementById('cart-popup')?.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) {
        document.getElementById('cart-popup')?.classList.add('hidden');
      }
    });
  }

  updateCartUI() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const cartCount = document.querySelector('.cart-count');
    
    if (cartItems) {
      cartItems.innerHTML = this.items.map(item => `
        <div class="flex py-4" data-product-id="${item.id}" data-variant="${item.variant}">
          <div class="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
            <img
              src="${item.image}"
              alt="${item.name}"
              class="h-full w-full object-cover object-center"
            />
          </div>
          <div class="ml-4 flex flex-1 flex-col">
            <div>
              <div class="flex justify-between text-base font-medium text-gray-900">
                <h3>${item.name}</h3>
                <p class="ml-4">${formatPrice(item.price * item.quantity)}</p>
              </div>
              <p class="mt-1 text-sm text-gray-500">${item.variant || ''}</p>
            </div>
            <div class="flex flex-1 items-end justify-between text-sm">
              <div class="flex items-center">
                <button 
                  class="quantity-btn" 
                  data-action="decrease"
                  data-product-id="${item.id}"
                  data-variant="${item.variant}"
                >-</button>
                <span class="mx-2">${item.quantity}</span>
                <button 
                  class="quantity-btn" 
                  data-action="increase"
                  data-product-id="${item.id}"
                  data-variant="${item.variant}"
                >+</button>
              </div>
              <button 
                type="button" 
                class="font-medium text-primary-600 hover:text-primary-500 remove-item"
                data-product-id="${item.id}"
                data-variant="${item.variant}"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      `).join('');

      // Add event listeners for quantity buttons and remove buttons
      cartItems.querySelectorAll('.quantity-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const btnEl = btn as HTMLButtonElement;
          const productId = btnEl.dataset.productId;
          const variant = btnEl.dataset.variant;
          const action = btnEl.dataset.action;
          const item = this.items.find(i => i.id === productId && i.variant === variant);
          
          if (item) {
            if (action === 'increase') {
              this.updateQuantity(productId, variant, item.quantity + 1);
            } else {
              this.updateQuantity(productId, variant, item.quantity - 1);
            }
          }
        });
      });

      cartItems.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const btnEl = btn as HTMLElement;
          const productId = btnEl.dataset.productId;
          const variant = btnEl.dataset.variant;
          this.removeItem(productId, variant);
          // console.log(productId);
        });
      });
    }
    
    if (cartTotal) {
      cartTotal.textContent = formatPrice(this.getTotal());
    }
    
    if (cartCount) {
      const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
      cartCount.textContent = totalItems;
      cartCount.classList.toggle('hidden', totalItems === 0);
    }
  }
}
const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', { 
    style: 'currency', 
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(price);
};