// Wait for DOM and SweetAlert2 to be ready
function initializeNotifications() {
  if (typeof window !== 'undefined') {
    window.app = window.app || {};
    
    // Only define toggleNotification if it doesn't already exist
    if (!window.app.toggleNotification) {
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
        
        // Check if Swal is available
        if (typeof window.Swal === 'undefined') {
          console.error('SweetAlert2 is not loaded yet');
          // Fallback to alert
          if (message) {
            alert(message);
          }
          return;
        }

        try {
          if (html) {
            window.Swal.fire({
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
                document.getElementById('continue-btn')?.addEventListener('click', () => window.Swal.close());
                document.getElementById('swal-close-btn')?.addEventListener('click', () => window.Swal.close());
              }
            });
          } else {
            window.Swal.fire({
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
        } catch (error) {
          console.error('Error showing notification:', error);
          // Fallback to alert
          if (message) {
            alert(message);
          }
        }
      };
      
      console.log('Notification system initialized successfully');
    }
  }
}

// Try to initialize immediately
initializeNotifications();

// Also try after DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeNotifications);
} else {
  // DOM is already ready
  initializeNotifications();
}

// Retry initialization after a delay to ensure SweetAlert2 is loaded
setTimeout(initializeNotifications, 100);
setTimeout(initializeNotifications, 500);
setTimeout(initializeNotifications, 1000);