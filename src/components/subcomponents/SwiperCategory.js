// import Swiper JS
import Swiper from 'swiper';
// import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css/navigation';
import 'swiper/css/scrollbar';

// document.addEventListener('DOMContentLoaded', function() {
  window.onload = function() {
  var swiper = new Swiper('.swiper_category_related', {
    initialSlide: 0,
    // clickable: true,
    // grabCursor: true,
    centeredSlides: false,
    // loop: true,
    effect: 'fade',
    fadeEffect: {
      crossFade: true,
    },
    slidesPerView: "auto",
    allowSlideNext: true,
    allowSlidePrev: true,
    // slidesPerGroup: 4,
    loopFillGroupWithBlank: true,
    modules: [Navigation, Pagination],
    spaceBetween: 10,
    navigation: {
      nextEl: '.swiper-button-next-related',
      prevEl: '.swiper-button-prev-related',
    },
    pagination: {
      el: '.swiper-pagination-related',
      // type: 'bullets',
      clickable: true,
      
    },
    scrollbar: {
      el: '.swiper-scrollbar',
    },
    breakpoints: {
      320: {
        spaceBetween: 1,
      },
      640: {
        spaceBetween: 6,
      },
      1024: {
        slidesPerView: "auto",
      },
    },
  });
}
// });