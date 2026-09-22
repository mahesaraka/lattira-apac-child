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

    // Search Modal Handler with Live In-Modal Results
    const searchModal = headerWrapper.querySelector('.search-modal-backdrop') || document.querySelector('.search-modal-backdrop');
    const searchTriggers = headerWrapper.querySelectorAll('.js-open-search-modal, .header-search__toggle, .main-nav-mobile__search-btn');
    const searchCloseBtns = searchModal ? searchModal.querySelectorAll('.search-modal-close, .js-close-search-modal') : [];
    const searchInput = searchModal ? searchModal.querySelector('.search-modal-input') : null;
    const searchForm = searchModal ? searchModal.querySelector('.search-modal-form') : null;
    const searchClearBtn = searchModal ? searchModal.querySelector('.search-modal-clear-btn') : null;
    const searchResultsWrap = searchModal ? searchModal.querySelector('.search-modal-results-wrap') : null;
    const searchLoading = searchModal ? searchModal.querySelector('.search-modal-loading') : null;
    const searchResultsHeader = searchModal ? searchModal.querySelector('.search-modal-results-header') : null;
    const searchResultsCount = searchModal ? searchModal.querySelector('.search-modal-results-count') : null;
    const searchResultsList = searchModal ? searchModal.querySelector('.search-modal-results-list') : null;
    const searchEmpty = searchModal ? searchModal.querySelector('.search-modal-empty') : null;
    const searchFooter = searchModal ? searchModal.querySelector('.search-modal-footer') : null;
    const searchViewAllLink = searchModal ? searchModal.querySelector('.search-modal-view-all-link') : null;
    const searchQuickLinks = searchModal ? searchModal.querySelector('.search-modal-quick-links') : null;

    let searchDebounceTimer = null;
    let currentSearchAbort = null;

    function getSearchDomain() {
      if (searchForm && searchForm.dataset.searchDomain) {
        return searchForm.dataset.searchDomain.trim();
      }
      const host = window.location.hostname;
      if (host && host.indexOf('lattira.com') !== -1) {
        return host;
      }
      return 'www.lattira.com';
    }

    function escapeHtml(str) {
      if (!str) return '';
      return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function sanitizeSnippet(html) {
      if (!html) return '';
      return html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
    }

    function formatTypeBadge(type) {
      if (!type) return { label: 'Page', class: 'badge-page' };
      const t = String(type).toUpperCase();
      if (t === 'BLOG_POST') return { label: 'Blog Post', class: 'badge-post' };
      if (t === 'LISTING_PAGE') return { label: 'Blog', class: 'badge-blog' };
      return { label: 'Page', class: 'badge-page' };
    }

    function resetSearchUI() {
      if (searchResultsWrap) searchResultsWrap.style.display = 'none';
      if (searchLoading) searchLoading.style.display = 'none';
      if (searchResultsHeader) searchResultsHeader.style.display = 'none';
      if (searchResultsList) searchResultsList.innerHTML = '';
      if (searchEmpty) {
        searchEmpty.style.display = 'none';
        searchEmpty.innerHTML = '';
      }
      if (searchFooter) searchFooter.style.display = 'none';
      if (searchClearBtn) searchClearBtn.style.display = 'none';
      if (searchQuickLinks) searchQuickLinks.style.display = '';
    }

    function performSearch(query) {
      const term = (query || '').trim();
      if (searchClearBtn) {
        searchClearBtn.style.display = term.length > 0 ? 'flex' : 'none';
      }

      if (term.length < 2) {
        resetSearchUI();
        return;
      }

      if (currentSearchAbort) {
        try { currentSearchAbort.abort(); } catch(e) {}
      }
      if (window.AbortController) {
        currentSearchAbort = new AbortController();
      }

      if (searchQuickLinks) searchQuickLinks.style.display = 'none';
      if (searchResultsWrap) searchResultsWrap.style.display = 'block';
      if (searchLoading) searchLoading.style.display = 'flex';
      if (searchResultsHeader) searchResultsHeader.style.display = 'none';
      if (searchEmpty) searchEmpty.style.display = 'none';
      if (searchFooter) searchFooter.style.display = 'none';
      if (searchResultsList) searchResultsList.innerHTML = '';

      const domain = getSearchDomain();
      const endpoint = `/_hcms/search?term=${encodeURIComponent(term)}&domain=${encodeURIComponent(domain)}&type=SITE_PAGE&type=BLOG_POST&type=LISTING_PAGE&limit=10`;

      fetch(endpoint, {
        signal: currentSearchAbort ? currentSearchAbort.signal : undefined,
        headers: {
          'Accept': 'application/json'
        }
      })
      .then(function(res) {
        if (!res.ok) throw new Error('Search failed: ' + res.status);
        return res.json();
      })
      .then(function(data) {
        if (searchLoading) searchLoading.style.display = 'none';

        const results = data && Array.isArray(data.results) ? data.results : [];
        const total = typeof data.total === 'number' ? data.total : results.length;

        if (results.length === 0) {
          if (searchResultsHeader) searchResultsHeader.style.display = 'none';
          if (searchResultsList) searchResultsList.innerHTML = '';
          if (searchEmpty) {
            searchEmpty.style.display = 'block';
            searchEmpty.innerHTML = `
              <div class="search-empty-content">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  <line x1="8" y1="11" x2="14" y2="11"></line>
                </svg>
                <p class="search-empty-title">No results found for "${escapeHtml(term)}"</p>
                <p class="search-empty-desc">No content on <strong>${escapeHtml(domain)}</strong> matched your search. Try another keyword or phrase.</p>
              </div>
            `;
          }
          return;
        }

        if (searchResultsHeader && searchResultsCount) {
          searchResultsHeader.style.display = 'flex';
          searchResultsCount.innerHTML = `Found <strong>${total}</strong> result${total === 1 ? '' : 's'} for "<strong>${escapeHtml(term)}</strong>"`;
        }

        let html = '';
        results.forEach(function(item) {
          const badge = formatTypeBadge(item.type);
          const title = sanitizeSnippet(item.title) || 'Untitled Page';
          const desc = sanitizeSnippet(item.description);
          const url = item.url || '#';

          html += `
            <a href="${escapeHtml(url)}" class="search-result-item">
              <div class="search-result-item__top">
                <span class="search-result-item__badge ${badge.class}">${badge.label}</span>
                <span class="search-result-item__url">${escapeHtml(url)}</span>
              </div>
              <h4 class="search-result-item__title">${title}</h4>
              ${desc ? `<p class="search-result-item__desc">${desc}</p>` : ''}
              <div class="search-result-item__action">
                <span>View content</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </div>
            </a>
          `;
        });

        if (searchResultsList) {
          searchResultsList.innerHTML = html;
        }

        const customSearchUrl = searchForm ? searchForm.dataset.searchUrl : null;
        if (customSearchUrl && customSearchUrl.trim().length > 0 && searchFooter && searchViewAllLink) {
          searchFooter.style.display = 'block';
          searchViewAllLink.href = `${customSearchUrl}?term=${encodeURIComponent(term)}`;
          searchViewAllLink.textContent = `View all ${total} results on search page →`;
        }
      })
      .catch(function(err) {
        if (err.name === 'AbortError') return;
        if (searchLoading) searchLoading.style.display = 'none';
        if (searchEmpty) {
          searchEmpty.style.display = 'block';
          searchEmpty.innerHTML = `
            <div class="search-empty-content">
              <p class="search-empty-title">Search Service Unavailable</p>
              <p class="search-empty-desc">Unable to retrieve results. Please try again.</p>
            </div>
          `;
        }
      });
    }

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

    if (searchForm) {
      searchForm.addEventListener('submit', function (e) {
        e.preventDefault();
        if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
        if (searchInput) {
          performSearch(searchInput.value);
        }
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', function () {
        const query = searchInput.value;
        if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
        if (query.trim().length === 0) {
          resetSearchUI();
          return;
        }
        searchDebounceTimer = setTimeout(function () {
          performSearch(query);
        }, 280);
      });
    }

    if (searchClearBtn) {
      searchClearBtn.addEventListener('click', function (e) {
        e.preventDefault();
        if (searchInput) {
          searchInput.value = '';
          searchInput.focus();
        }
        resetSearchUI();
      });
    }

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
              if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
              performSearch(term);
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
