window.addEventListener('load', function () {
  const headerWrapper = document.querySelector('.header-wrapper');
  const mainContent   = document.querySelector('#main-content');

  // initial measurements
  let initialHeaderHeight = headerWrapper.offsetHeight;
  let fixedHeaderHeight   = initialHeaderHeight;
  // thresholds
  const scrollUpThreshold = 5;       // px upward to remove “scrolled”
  let headerHeightThresh  = initialHeaderHeight; // now let so we can update it

  // track last scroll
  let lastScrollPos = 0;

  function handleScroll() {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;

    // 1) ANY scroll > 0 → position-fixed + padding
    if (scrollY > 0) {
      if (!headerWrapper.classList.contains('position-fixed')) {
        headerWrapper.classList.add('position-fixed');
        fixedHeaderHeight = headerWrapper.offsetHeight;
        mainContent.style.paddingTop = fixedHeaderHeight + 'px';
      }
    } else {
      // back to very top → remove everything
      headerWrapper.classList.remove('position-fixed', 'scrolled');
      mainContent.style.paddingTop = '0';
    }

    // 2) Once past headerHeight → add “scrolled” when scrolling down
    if (scrollY > headerHeightThresh && scrollY > lastScrollPos) {
      headerWrapper.classList.add('scrolled');
    }

    // 3) If already “scrolled” and user scrolls up by at least scrollUpThreshold → remove it
    if (headerWrapper.classList.contains('scrolled') && scrollY < lastScrollPos - scrollUpThreshold) {
      headerWrapper.classList.remove('scrolled');
    }

    lastScrollPos = scrollY;
  }

  window.addEventListener('scroll', handleScroll);

  // ——— rest of your script unchanged ———

  // **NEW**: Recompute header heights on resize
  window.addEventListener('resize', function () {
    // re-measure the header in its natural (static) state
    // temporarily remove fixed positioning to get true height
    const wasFixed = headerWrapper.classList.contains('position-fixed');
    if (wasFixed) headerWrapper.classList.remove('position-fixed');
    
    initialHeaderHeight = headerWrapper.offsetHeight;
    headerHeightThresh  = initialHeaderHeight;

    // restore fixed if needed and reapply padding
    if (wasFixed) {
      headerWrapper.classList.add('position-fixed');
      fixedHeaderHeight = headerWrapper.offsetHeight;
      mainContent.style.paddingTop = fixedHeaderHeight + 'px';
    }

    // if we're scrolled past the new threshold, immediately apply/remove "scrolled"
    handleScroll();
  });

  // Desktop nav hover menus
  const navItems = document.querySelectorAll('.nav-li');
  let delay = 1000, removeTimeout;
  navItems.forEach(navItem => {
    const child = navItem.querySelector('.nav-child-ul');
    if (!child) return;
    child.classList.remove('visible');

    navItem.addEventListener('mouseenter', () => {
      clearTimeout(removeTimeout);
      navItems.forEach(i => {
        const o = i.querySelector('.nav-child-ul');
        if (o && o !== child) o.classList.remove('visible');
      });
      child.classList.add('visible');
    });
    navItem.addEventListener('mouseleave', () => {
      removeTimeout = setTimeout(() => child.classList.remove('visible'), delay);
    });
    child.addEventListener('mouseenter', () => clearTimeout(removeTimeout));
    child.addEventListener('mouseleave', () => {
      removeTimeout = setTimeout(() => child.classList.remove('visible'), delay);
    });
  });

  // Hamburger toggle for mobile
  const hamburger = document.querySelector('.hamburger');
  const mobileMenuContent = document.querySelector('.mobile-menu-content');
  
  hamburger.addEventListener('click', function () {
    this.classList.toggle('is-active');
    mobileMenuContent.classList.toggle('hidden');
  
    if (!mobileMenuContent.classList.contains('hidden') &&
        !headerWrapper.classList.contains('position-fixed')) {
      headerWrapper.classList.add('position-fixed');
      fixedHeaderHeight = headerWrapper.offsetHeight;
      mainContent.style.paddingTop = fixedHeaderHeight + 'px';
    }
  });
  
  // NEW: Close menu if anything inside is clicked
  mobileMenuContent.addEventListener('click', function () {
    mobileMenuContent.classList.add('hidden');
    hamburger.classList.remove('is-active');
  
    if (headerWrapper.classList.contains('position-fixed')) {
      headerWrapper.classList.remove('position-fixed');
      mainContent.style.paddingTop = '0';
    }
  });

  // Accordion for mobile
  const accordionItems = document.querySelectorAll('.mobile-menu-content nav .nav-li.nav-accordion');
  accordionItems.forEach(item => {
    item.addEventListener('click', function (e) {
      const link = e.target.closest('.nav-link.has-child');
      if (!link) return;
      e.preventDefault();
      const content = item.querySelector('.accordion-content');
      accordionItems.forEach(i => {
        const c = i.querySelector('.accordion-content');
        if (c !== content) c.classList.remove('open-accordion');
      });
      content.classList.toggle('open-accordion');
    });
  });

  // Desktop deeper submenu hover
  const desktopNav = document.querySelector('.header-column.navigation nav');
  desktopNav.querySelectorAll('.nav-child-li.has-child').forEach(link => {
    link.addEventListener('mouseenter', () => link.querySelector('ul').classList.add('open'));
    link.addEventListener('mouseleave', () => link.querySelector('ul').classList.remove('open'));
  });

  // Mobile deeper submenu toggle
  const mobileNavChild = document.querySelector('.mobile-menu-content');
  if (mobileNavChild) {
    mobileNavChild.querySelectorAll('.nav-child-li.has-child').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        link.querySelector('ul').classList.toggle('open');
      });
    });
  }

  // Pill toggle click handler & sync
  document.querySelectorAll('.header-pill-toggle').forEach(toggle => {
    toggle.addEventListener('click', function (e) {
      e.stopPropagation(); // prevent closing mobile menu when clicking inside
      const item = e.target.closest('.header-pill-toggle__item');
      if (!item) return;
      const href = item.getAttribute('href');
      if (!href || href === '#' || href === 'javascript:void(0)') {
        e.preventDefault();
        toggle.querySelectorAll('.header-pill-toggle__item').forEach(el => el.classList.remove('is-active'));
        item.classList.add('is-active');

        // Sync other toggles (desktop vs mobile)
        const pillIndex = item.getAttribute('data-pill');
        document.querySelectorAll('.header-pill-toggle').forEach(otherToggle => {
          if (otherToggle !== toggle) {
            otherToggle.querySelectorAll('.header-pill-toggle__item').forEach(otherItem => {
              if (otherItem.getAttribute('data-pill') === pillIndex) {
                otherItem.classList.add('is-active');
              } else {
                otherItem.classList.remove('is-active');
              }
            });
          }
        });
      }
    });
  });

  // Auto-detect active pill based on current browser URL if in auto mode
  const currentPath = window.location.pathname.toLowerCase();
  
  const matchPillKeyword = (path, keyword) => {
    if (!keyword) return false;
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp('(^|[^a-z0-9])' + escaped + '([^a-z0-9]|$)', 'i');
    return regex.test(path);
  };

  document.querySelectorAll('.header-pill-toggle-wrapper[data-detection="auto"]').forEach(wrapper => {
    const k1 = (wrapper.getAttribute('data-p1-keyword') || 'spec').toLowerCase();
    const k2 = (wrapper.getAttribute('data-p2-keyword') || 'source').toLowerCase();

    const m1 = matchPillKeyword(currentPath, k1);
    const m2 = matchPillKeyword(currentPath, k2);

    let activePill = null;
    if (m1 && !m2) {
      activePill = '1';
    } else if (m2 && !m1) {
      activePill = '2';
    } else if (m1 && m2) {
      // Both match: prioritize "lattira-[keyword]"
      if (matchPillKeyword(currentPath, 'lattira-' + k1)) {
        activePill = '1';
      } else if (matchPillKeyword(currentPath, 'lattira-' + k2)) {
        activePill = '2';
      } else {
        activePill = '1';
      }
    }

    if (activePill) {
      wrapper.querySelectorAll('.header-pill-toggle__item').forEach(item => {
        if (item.getAttribute('data-pill') === activePill) {
          item.classList.add('is-active');
        } else {
          item.classList.remove('is-active');
        }
      });
    } else {
      // Neither matches (e.g. /au/about-us): Neither pill is active!
      wrapper.querySelectorAll('.header-pill-toggle__item').forEach(item => {
        item.classList.remove('is-active');
      });
    }
  });
});



