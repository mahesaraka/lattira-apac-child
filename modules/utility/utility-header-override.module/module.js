(function () {
  function initHeader() {
    const headerWrapper = document.querySelector('.header-wrapper.header-override') || document.querySelector('.header-wrapper');
    if (!headerWrapper) return;
    if (headerWrapper.dataset.jsInitialized === 'true') return;
    headerWrapper.dataset.jsInitialized = 'true';

    const mainContent = document.querySelector('#main-content');
    if (mainContent) {
      mainContent.style.removeProperty('padding-top');
    }

    function updateHeaderOffset() {
      // Disabled padding-top offset to avoid pushing main-content down
    }

    headerWrapper.classList.add('position-fixed');

    function handleScroll() {
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      if (scrollY > 15) {
        headerWrapper.classList.add('scrolled', 'position-fixed');
      } else {
        headerWrapper.classList.remove('scrolled');
        headerWrapper.classList.add('position-fixed');
      }
    }

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', updateHeaderOffset);
    handleScroll();

    // Search Modal Handler
    const searchModal = headerWrapper.querySelector('.search-modal-backdrop') || document.querySelector('.search-modal-backdrop');
    const searchTriggers = headerWrapper.querySelectorAll('.js-open-search-modal, .header-search__toggle, .main-nav-mobile__search-btn');
    const searchCloseBtns = searchModal ? searchModal.querySelectorAll('.search-modal-close, .js-close-search-modal') : [];
    const searchInput = searchModal ? searchModal.querySelector('.search-modal-input') : null;

    function openSearchModal() {
      if (!searchModal) return;
      searchModal.classList.add('is-open');
      searchModal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('search-open');
      if (searchInput) {
        setTimeout(function () {
          searchInput.focus();
        }, 100);
      }
    }

    function closeSearchModal() {
      if (!searchModal) return;
      searchModal.classList.remove('is-open');
      searchModal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('search-open');
    }

    searchTriggers.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        openSearchModal();
      });
    });

    searchCloseBtns.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        closeSearchModal();
      });
    });

    if (searchModal) {
      searchModal.addEventListener('click', function (e) {
        if (e.target === searchModal || e.target.classList.contains('search-modal-container')) {
          closeSearchModal();
        }
      });
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closeSearchModal();
      }
    });

    // Quick link search tag click helper
    if (searchModal) {
      searchModal.querySelectorAll('.search-modal-tag').forEach(function (tag) {
        tag.addEventListener('click', function (e) {
          const href = tag.getAttribute('href');
          if (!href || href === '#' || href === 'javascript:void(0)') {
            e.preventDefault();
            const term = tag.textContent.trim();
            if (searchInput) {
              searchInput.value = term;
              const form = tag.closest('.search-modal-card') ? tag.closest('.search-modal-card').querySelector('.search-modal-form') : null;
              if (form) form.submit();
            }
          }
        });
      });
    }

    // Desktop nav hover menus (supports mega-cards, mega-columns, and nav-child-ul)
    const navItems = headerWrapper.querySelectorAll('.header-column.navigation .nav-li');
    let removeTimeout;
    const delay = 400;

    navItems.forEach(function (navItem) {
      const dropdown = navItem.querySelector('.main-nav__mega-dropdown') || navItem.querySelector('.nav-child-ul');
      if (!dropdown) return;
      dropdown.classList.remove('visible');

      function openMenu() {
        clearTimeout(removeTimeout);
        navItems.forEach(function (i) {
          if (i !== navItem) {
            const o = i.querySelector('.main-nav__mega-dropdown') || i.querySelector('.nav-child-ul');
            if (o) o.classList.remove('visible');
          }
        });
        dropdown.classList.add('visible');
      }

      function closeMenuWithDelay() {
        clearTimeout(removeTimeout);
        removeTimeout = setTimeout(function () {
          dropdown.classList.remove('visible');
        }, delay);
      }

      navItem.addEventListener('mouseenter', openMenu);
      navItem.addEventListener('mouseleave', closeMenuWithDelay);

      dropdown.addEventListener('mouseenter', function () {
        clearTimeout(removeTimeout);
      });
      dropdown.addEventListener('mouseleave', closeMenuWithDelay);
    });

    // Hamburger toggle for mobile
    const hamburger = headerWrapper.querySelector('.hamburger');
    const mobileMenuContent = headerWrapper.querySelector('.mobile-menu-content');

    if (hamburger && mobileMenuContent) {
      hamburger.addEventListener('click', function () {
        this.classList.toggle('is-active');
        mobileMenuContent.classList.toggle('hidden');
      });

      // Close menu when clicking link (not accordion trigger)
      mobileMenuContent.querySelectorAll('a:not(.has-child)').forEach(function (link) {
        link.addEventListener('click', function () {
          mobileMenuContent.classList.add('hidden');
          hamburger.classList.remove('is-active');
        });
      });
    }

    // Accordion for mobile
    const accordionItems = headerWrapper.querySelectorAll('.mobile-menu-content nav .nav-li.nav-accordion');
    accordionItems.forEach(function (item) {
      item.addEventListener('click', function (e) {
        const link = e.target.closest('.nav-link.has-child');
        if (!link) return;
        e.preventDefault();
        const content = item.querySelector('.accordion-content');
        accordionItems.forEach(function (i) {
          const c = i.querySelector('.accordion-content');
          if (c !== content && c) c.classList.remove('open-accordion');
        });
        if (content) content.classList.toggle('open-accordion');
      });
    });

    // Desktop deeper submenu hover (classic list)
    const desktopNav = headerWrapper.querySelector('.header-column.navigation nav');
    if (desktopNav) {
      desktopNav.querySelectorAll('.nav-child-li.has-child').forEach(function (link) {
        link.addEventListener('mouseenter', function () {
          const ul = link.querySelector('ul');
          if (ul) ul.classList.add('open');
        });
        link.addEventListener('mouseleave', function () {
          const ul = link.querySelector('ul');
          if (ul) ul.classList.remove('open');
        });
      });
    }

    // Mobile deeper submenu toggle
    if (mobileMenuContent) {
      mobileMenuContent.querySelectorAll('.nav-child-li.has-child').forEach(function (link) {
        link.addEventListener('click', function (e) {
          e.preventDefault();
          const ul = link.querySelector('ul');
          if (ul) ul.classList.toggle('open');
        });
      });
    }

    // Pill toggle click handler & sync
    headerWrapper.querySelectorAll('.header-pill-toggle').forEach(function (toggle) {
      toggle.addEventListener('click', function (e) {
        e.stopPropagation();
        const item = e.target.closest('.header-pill-toggle__item');
        if (!item) return;
        const href = item.getAttribute('href');
        if (!href || href === '#' || href === 'javascript:void(0)') {
          e.preventDefault();
          toggle.querySelectorAll('.header-pill-toggle__item').forEach(function (el) {
            el.classList.remove('is-active');
          });
          item.classList.add('is-active');
        }
      });
    });

    // Pill Toggle: Automatic Segment URL Matching Fallback
    headerWrapper.querySelectorAll('.header-pill-toggle-wrapper').forEach(function (wrapper) {
      const mode = wrapper.getAttribute('data-detection') || 'auto';
      if (mode !== 'auto') return;

      const path = (window.location.pathname || '').toLowerCase();
      const p1Key = (wrapper.getAttribute('data-p1-keyword') || 'spec').toLowerCase();
      const p2Key = (wrapper.getAttribute('data-p2-keyword') || 'source').toLowerCase();

      const segs = path.split(/[\/\-_.]+/).filter(Boolean);
      const p1Match = segs.indexOf(p1Key) !== -1;
      const p2Match = segs.indexOf(p2Key) !== -1;

      let activePill = null;
      if (p1Match && !p2Match) {
        activePill = '1';
      } else if (p2Match && !p1Match) {
        activePill = '2';
      } else if (p1Match && p2Match) {
        if (path.indexOf('lattira-' + p1Key) !== -1) {
          activePill = '1';
        } else if (path.indexOf('lattira-' + p2Key) !== -1) {
          activePill = '2';
        } else {
          activePill = '1';
        }
      }

      if (activePill) {
        wrapper.querySelectorAll('.header-pill-toggle__item').forEach(function (item) {
          if (item.getAttribute('data-pill') === activePill) {
            item.classList.add('is-active');
          } else {
            item.classList.remove('is-active');
          }
        });
      } else {
        wrapper.querySelectorAll('.header-pill-toggle__item').forEach(function (item) {
          item.classList.remove('is-active');
        });
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeader);
  } else {
    initHeader();
  }
  window.addEventListener('load', initHeader);
})();
