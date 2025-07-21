
if (typeof window !== 'undefined') {
  window.app = window.app || {};
  window.app.toggleNotification = function(options) {
    const {
      state = true,
      level = 'success',
      message = '',
      title = '',
      html = '',
      timer = 2000,
      customClass = {},
      showCloseButton = false,
      showConfirmButton = false,
    } = options || {};

    if (!state) return;
    if (typeof Swal !== 'undefined') {
      const Swal = window.Swal;

      if (html) {
        Swal.fire({
          title: '',
          html: html,
          timer: timer,
          showConfirmButton: false,
          showCloseButton: false,
          position: 'bottom-end',
          toast: false,
          timerProgressBar: true,
          customClass: customClass,
          backdrop: false,
          didOpen: () => {
            document.getElementById('view-cart-btn')?.addEventListener('click', () => window.location.href = '/gio-hang');
            document.getElementById('continue-btn')?.addEventListener('click', () => Swal.close());
            document.getElementById('swal-close-btn')?.addEventListener('click', () => Swal.close());
          }
        });
      } else {
        Swal.fire({
          icon: level,
          title: title,
          text: message,
          timer: timer,
          showConfirmButton: showConfirmButton,
          showCloseButton: showCloseButton,
          position: 'bottom-end',
          toast: true,
          timerProgressBar: true,
          customClass: customClass,
          backdrop: false,
        });
      }
    } else {
      console.error('SweetAlert2 (Swal) is not loaded!');
    }
  };
}