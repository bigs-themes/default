# UI Components Library - Bigs StoreFront

Thư viện UI components có thể tái sử dụng cho dự án Bigs-StoreFront, sử dụng hệ thống 4 màu chính: Primary, Secondary, Neutral, Semantic.

## 🎨 Hệ thống màu sắc

- **Primary**: Button chính, Link chính, CTA, Logo
- **Secondary**: Button phụ, Badge, Icon phụ, Text phụ
- **Neutral**: Background, Text chính, Border, Input field
- **Semantic**: Success, Warning, Error, Info

## 📦 Components

### 1. Button

Component button với nhiều variants và sizes khác nhau.

```astro
---
import { Button } from '@/components/ui';
---

<!-- Button chính -->
<Button variant="primary" size="md">
  Thêm vào giỏ
</Button>

<!-- Button phụ -->
<Button variant="secondary" size="sm">
  Xem thêm
</Button>

<!-- Button outline -->
<Button variant="outline" size="lg">
  Hủy
</Button>

<!-- Button với loading -->
<Button variant="primary" loading={true}>
  Đang xử lý...
</Button>

<!-- Button full width -->
<Button variant="primary" fullWidth={true}>
  Thanh toán
</Button>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'outline' | 'ghost'
- `size`: 'sm' | 'md' | 'lg'
- `disabled`: boolean
- `loading`: boolean
- `fullWidth`: boolean
- `type`: 'button' | 'submit' | 'reset'

### 2. Input

Component input với validation states.

```astro
---
import { Input } from '@/components/ui';
---

<!-- Input cơ bản -->
<Input 
  type="text" 
  placeholder="Tìm kiếm sản phẩm..."
  size="md"
/>

<!-- Input với validation -->
<Input 
  type="email" 
  placeholder="Email của bạn"
  variant="error"
  required={true}
/>

<!-- Input thành công -->
<Input 
  type="text" 
  placeholder="Mã khuyến mãi"
  variant="success"
/>
```

**Props:**
- `type`: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search'
- `placeholder`: string
- `variant`: 'default' | 'error' | 'success'
- `size`: 'sm' | 'md' | 'lg'
- `disabled`: boolean
- `required`: boolean
- `fullWidth`: boolean

### 3. Badge

Component badge cho tags, labels, và status.

```astro
---
import { Badge } from '@/components/ui';
---

<!-- Badge giảm giá -->
<Badge variant="secondary" size="md">
  -20%
</Badge>

<!-- Badge thành công -->
<Badge variant="success" size="sm">
  Đã giao hàng
</Badge>

<!-- Badge cảnh báo -->
<Badge variant="warning" size="lg">
  Sắp hết hàng
</Badge>

<!-- Badge lỗi -->
<Badge variant="error">
  Hết hàng
</Badge>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'
- `size`: 'sm' | 'md' | 'lg'

### 4. Card

Component card cho layout và content containers.

```astro
---
import { Card } from '@/components/ui';
---

<!-- Card cơ bản -->
<Card variant="default" padding="md">
  <h3>Tiêu đề card</h3>
  <p>Nội dung card...</p>
</Card>

<!-- Card với shadow -->
<Card variant="elevated" padding="lg">
  <h3>Card nổi bật</h3>
  <p>Nội dung với shadow...</p>
</Card>

<!-- Card outline -->
<Card variant="outlined" padding="sm">
  <h3>Card viền</h3>
  <p>Nội dung với viền...</p>
</Card>
```

**Props:**
- `variant`: 'default' | 'elevated' | 'outlined'
- `padding`: 'none' | 'sm' | 'md' | 'lg'

### 5. Alert

Component alert cho thông báo và messages.

```astro
---
import { Alert } from '@/components/ui';
---

<!-- Alert thành công -->
<Alert variant="success" title="Thành công">
  Đơn hàng đã được đặt thành công!
</Alert>

<!-- Alert cảnh báo -->
<Alert variant="warning" title="Cảnh báo" dismissible={true}>
  Sản phẩm sắp hết hàng, hãy đặt hàng sớm.
</Alert>

<!-- Alert lỗi -->
<Alert variant="error" title="Lỗi">
  Không thể kết nối đến máy chủ.
</Alert>

<!-- Alert thông tin -->
<Alert variant="info" title="Thông tin">
  Khuyến mãi mới đã bắt đầu!
</Alert>
```

**Props:**
- `variant`: 'success' | 'warning' | 'error' | 'info'
- `title`: string
- `dismissible`: boolean

### 6. Modal

Component modal cho popup và dialogs.

```astro
---
import { Modal, Button } from '@/components/ui';
---

<!-- Modal cơ bản -->
<Modal id="example-modal" title="Tiêu đề Modal" size="md">
  <p>Nội dung modal...</p>
  
  <Fragment slot="footer">
    <Button variant="secondary" onclick="closeModal('example-modal')">
      Hủy
    </Button>
    <Button variant="primary">
      Xác nhận
    </Button>
  </Fragment>
</Modal>

<!-- Button để mở modal -->
<Button variant="primary" onclick="openModal('example-modal')">
  Mở Modal
</Button>
```

**Props:**
- `id`: string (required)
- `title`: string
- `size`: 'sm' | 'md' | 'lg' | 'xl'

**JavaScript Functions:**
- `openModal(id)`: Mở modal
- `closeModal(id)`: Đóng modal

## 🚀 Cách sử dụng

### Import components

```astro
---
import { Button, Input, Badge, Card, Alert, Modal } from '@/components/ui';
---
```

### Sử dụng trong components

```astro
---
import { Button, Badge } from '@/components/ui';
---

<div class="product-card">
  <Badge variant="secondary">-15%</Badge>
  <h3>Sản phẩm mẫu</h3>
  <p>Mô tả sản phẩm...</p>
  <Button variant="primary" fullWidth={true}>
    Thêm vào giỏ
  </Button>
</div>
```

## 🎯 Best Practices

1. **Sử dụng đúng màu**: Tuân thủ hệ thống 4 màu chính
2. **Consistent sizing**: Sử dụng size phù hợp với context
3. **Accessibility**: Tất cả components đều hỗ trợ accessibility
4. **Responsive**: Components tự động responsive
5. **Performance**: Components được tối ưu cho performance

## 🔧 Customization

Các components sử dụng CSS variables từ `Layout.astro`:

```css
:root {
  --color-primary: #2563eb;
  --color-secondary: #f59e0b;
  --color-neutral: #6b7280;
  --color-semantic: #ef4444;
}
```

Thay đổi màu sắc bằng cách cập nhật CSS variables hoặc sử dụng LivePreviewManager. 