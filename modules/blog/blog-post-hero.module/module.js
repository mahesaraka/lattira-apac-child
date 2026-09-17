  document.addEventListener('DOMContentLoaded', () => {
    const banners = document.querySelectorAll('.scalable-banner');
    if (!banners.length) return;
    const threshold = 64; // px from viewport top

    function checkScale() {
      banners.forEach(banner => {
        const mediaDiv = banner.querySelector('.scalable-banner__media');
        const contentDiv = banner.querySelector('.content');
        const bannerOffsetTop = banner.getBoundingClientRect().top + window.scrollY;
        let shouldScale = false;

        if (bannerOffsetTop < 100) {
          shouldScale = window.scrollY > 30;
        } else {
          const top = banner.getBoundingClientRect().top;
          shouldScale = top <= threshold;
        }

        if (shouldScale) {
          if (mediaDiv) mediaDiv.classList.add('scalable-banner__media--scaled');
          if (contentDiv) contentDiv.classList.add('scalable-banner__media--scaled');
        } else {
          if (mediaDiv) mediaDiv.classList.remove('scalable-banner__media--scaled');
          if (contentDiv) contentDiv.classList.remove('scalable-banner__media--scaled');
        }
      });
    }

    window.addEventListener('scroll', checkScale, { passive: true });
    checkScale();
  });