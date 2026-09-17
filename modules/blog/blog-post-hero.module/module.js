  document.addEventListener('DOMContentLoaded', () => {
    const banner    = document.querySelector('.scalable-banner');
    const mediaDiv  = banner.querySelector('.scalable-banner__media');
    const contentDiv  = banner.querySelector('.scalable-banner .content');
    const threshold = 64; // px from viewport top

    function checkScale() {
      const top = banner.getBoundingClientRect().top;
      if (top <= threshold) {
        mediaDiv.classList.add('scalable-banner__media--scaled');
        contentDiv.classList.add('scalable-banner__media--scaled');
      } else {
        mediaDiv.classList.remove('scalable-banner__media--scaled');
        contentDiv.classList.remove('scalable-banner__media--scaled');
      }
    }

    window.addEventListener('scroll', checkScale);
    // initial check in case banner is already scrolled into view
    checkScale();
  });