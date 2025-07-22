

declare global {
  interface Window {
    selectedOptions?: Record<string, string>;
  }
}

export class Variants {
  currentProduct: any = null;

  constructor() {
    this.setupEventListeners();
    this.updateVariantsUI();
  }

  async loadProduct(productId: string) {
    try {
      const response = await fetch(`/api/products/${productId}`);
      const json = await response.json();
      this.currentProduct = json.data || null;
      this.updateVariantsUI();
      return this.currentProduct;
    } catch (error) {
      console.error('Error loading product:', error);
      return null;
    }
  }

  setupEventListeners(): void {
    // Close variants popup
    document.getElementById('close-variants')?.addEventListener('click', () => {
      document.getElementById('variants-popup')?.classList.add('hidden');
    });

    // Close variants when clicking outside
    document.getElementById('variants-popup')?.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) {
        document.getElementById('variants-popup')?.classList.add('hidden');
      }
    });
  }

  updateVariantsUI(): void {
    if (!this.currentProduct) return;
    const variantsItems = document.getElementById('variants-items');
    const variantsTotal = document.getElementById('variants-total');
    const variantsCount = document.querySelector('.variants-count');

    // Nếu có currentProduct và variantGroups, render UI chọn biến thể
    if (
      variantsItems &&
      this.currentProduct &&
      this.currentProduct.variantGroups &&
      this.currentProduct.variants
    ) {
      const { variantGroups, variants } = this.currentProduct;
      // Lưu lựa chọn của user vào window để giữ state khi re-render
      let selectedOptions = window.selectedOptions || {};
      window.selectedOptions = selectedOptions;

      // Hàm render các nhóm biến thể (radio ẩn + label)
      const renderGroups = () =>
        variantGroups
          .map(
            (group: any) => `
        <div class="mb-2 font-medium text-neutral">${group.name}</div>
<div class="flex gap-2 mb-4">
  ${(group.options || [])
    .map(
      (option: any, idx: number) => `
    <label class="color-option cursor-pointer">
      <input 
        type="radio" 
        name="variant-group-${group.id}" 
        value="${option.id}" 
        class="sr-only"
        ${selectedOptions[group.id] === option.id ? 'checked' : ''}
      />
      <div class="px-3 py-2 rounded-md border ${
        selectedOptions[group.id] === option.id
                  ? 'border-primary bg-primary text-white'
        : 'border-neutral bg-white text-neutral hover:border-primary'
      } transition-colors">
        ${option.name}
      </div>
    </label>
  `
    )
    .join('')}
</div>
`
          )
          .join('');

      // Hàm tìm biến thể phù hợp với lựa chọn hiện tại
      const findSelectedVariant = () => {
        return variants.find((variant: any) =>
          (!variant.option1Id || variant.option1Id === selectedOptions[variantGroups[0]?.id]) &&
          (!variant.option2Id || variant.option2Id === selectedOptions[variantGroups[1]?.id]) &&
          (!variant.option3Id || variant.option3Id === selectedOptions[variantGroups[2]?.id])
        );
      };

      // Render UI
      const selectedVariant = findSelectedVariant();
      let priceHtml = selectedVariant
        ? `<div class="text-primary font-semibold mb-2">${formatPrice(selectedVariant.listedPrice)}</div>`
        : `<div class="text-semantic mb-2">Vui lòng chọn loại</div>`;

      variantsItems.innerHTML = `
        ${renderGroups()}
        ${priceHtml}
        <div class="flex items-center gap-2 mb-2"> 
          <span class="text-sm font-medium text-neutral mr-3">Số lượng</span> 
          <div class="custom-number-input h-10 w-32"> 
            <div class="flex flex-row h-10 w-full rounded-lg relative bg-transparent"> 
              <button id="qty-decrease" class="quantity-btn bg-neutral text-white hover:bg-neutral h-full w-10 rounded-l cursor-pointer outline-none border border-neutral"> 
                <span class="m-auto text-xl font-medium">−</span> 
              </button> 
              <input type="number" class="outline-none focus:outline-none text-center w-full bg-white font-medium text-neutral border-t border-b border-neutral" id="qty-input" name="quantity" value="1" min="1"> 
              <button id="qty-increase" class="quantity-btn bg-neutral text-white hover:bg-neutral h-full w-10 rounded-r cursor-pointer border border-neutral"> 
                <span class="m-auto text-xl font-medium">+</span> 
              </button> 
            </div> 
          </div> 
        </div>
        <div class="border-t border-neutral pt-4">
          <button 
            id="add-to-cart"
            class="flex-1 w-full bg-primary hover:bg-primary text-white font-medium py-3 px-6 rounded-lg flex items-center justify-center transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
            </svg>
            Thêm vào giỏ
          </button>
        </div>
      `;

      // Sau khi render xong, gắn lại event cho radio
      setTimeout(() => {
        variantsItems.querySelectorAll('input[type="radio"]').forEach(input => {
          input.addEventListener('change', () => {
            // Tìm đúng group id
            const groupId = input.getAttribute('name')?.replace('variant-group-', '');
            if (groupId) {
              selectedOptions[groupId] = (input as HTMLInputElement).value;
              window.selectedOptions = selectedOptions;
              this.updateVariantsUI();
            }
          });
        });
        // Gắn event cho nút thêm vào giỏ
        const addBtn = variantsItems.querySelector('#add-to-cart');
        if (addBtn) {
          addBtn.addEventListener('click', () => {
            // Lấy variant đã chọn
            const selectedVariant = findSelectedVariant();
            // Lấy số lượng
            const qtyInput = variantsItems.querySelector('#qty-input');
            const quantity = qtyInput ? Math.max(1, Number((qtyInput as HTMLInputElement).value)) : 1;

            if (!selectedVariant) {
              if (window.app && typeof window.app.toggleNotification === 'function') {
                window.app.toggleNotification({
                  state: true,
                  level: 'warning',
                  message: 'Vui lòng chọn đầy đủ thông số sản phẩm!',
                  title: '',
                  timer: 8000,
                });
              }
              return;
            }

            // Tạo object sản phẩm để add vào cart
            const product = this.currentProduct;
            const variantGroups = product.variantGroups;
            // Lấy tên các option đã chọn để hiển thị
            const selectedOptionNames = variantGroups.map((group: any) => {
              const opt = (group.options || []).find((o: any) => o.id === window.selectedOptions?.[group.id]);
              return opt ? `${group.name}: ${opt.name}` : '';
            }).filter(Boolean).join(', ');

            // Sử dụng type assertion để tránh lỗi TypeScript
            if (window.cart && typeof (window.cart as any).addItem === 'function') {
              (window.cart as any).addItem({
              id: product.id,
              name: product.title,
              image: product.mainImage || '',
              slug: product.url,
              variant: selectedOptionNames || '',
              variantId: selectedVariant.id,
              price: selectedVariant.listedPrice,
              quantity
            });
            }

            if (window.app && typeof window.app.toggleNotification === 'function') {
              window.app.toggleNotification({
                state: true,
                html: `
                  <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center gap-2">
                      <svg class="w-8 h-8 text-semantic" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="m9 12 2 2 4-4"/>
                      </svg>
                      <span class="text-sm md:text-base text-semantic font-bold">Thêm vào giỏ hàng thành công</span>
                    </div>
                    <button id="swal-close-btn" class="text-neutral hover:text-neutral text-2xl font-bold focus:outline-none">&times;</button>
                  </div>
                  <div class="flex items-center gap-3 mb-4">
                    <img src="${product.mainImage}" alt="Ảnh sản phẩm" class="w-16 h-16 object-cover rounded-lg" />
                    <div>
                      <b>${product.title}</b>
                    </div>
                  </div>
                  <div class="flex gap-4 justify-center">
                    <button id="view-cart-btn" class="flex-1 bg-primary text-white py-3 rounded-lg text-sm md:text-base hover:bg-primary transition">Xem giỏ hàng</button>
                    <button id="continue-btn" class="flex-1 bg-white text-primary border-2 border-primary py-3 rounded-lg text-sm md:text-base hover:bg-primary transition">Tiếp tục mua sắm</button>
                  </div>
                `,
                timer: 8000,
              });
            }
            // Đóng popup hoặc thông báo thành công
            document.getElementById('variants-popup')?.classList.add('hidden');
          });
        }
      }, 0);

      // Xử lý số lượng
      let quantity = 1;
      const qtyInput = variantsItems.querySelector('#qty-input') as HTMLInputElement;
      variantsItems.querySelector('#qty-decrease')?.addEventListener('click', () => {
        quantity = Math.max(1, Number(qtyInput.value) - 1);
        qtyInput.value = quantity.toString();
      });
      variantsItems.querySelector('#qty-increase')?.addEventListener('click', () => {
        quantity = Number(qtyInput.value) + 1;
        qtyInput.value = quantity.toString();
      });
      qtyInput?.addEventListener('input', () => {
        quantity = Math.max(1, Number(qtyInput.value));
        qtyInput.value = quantity.toString();
      });
      return;
    }
  }
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', { 
    style: 'currency', 
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(price);
}; 