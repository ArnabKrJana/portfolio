document.addEventListener('DOMContentLoaded', () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Scroll reveal animation using Intersection Observer
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, activeObserver) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const target = entry.target;
            target.classList.add('appear');

            // Clear stagger delay once the reveal completes so hover transitions respond immediately.
            if (target.style.transitionDelay) {
                const clearDelay = (e) => {
                    if (e.target === target && e.propertyName === 'opacity') {
                        target.style.transitionDelay = '';
                        target.removeEventListener('transitionend', clearDelay);
                    }
                };
                target.addEventListener('transitionend', clearDelay);
            }

            activeObserver.unobserve(target);
        });
    }, observerOptions);

    const elementsToAnimate = document.querySelectorAll('.fade-in');
    elementsToAnimate.forEach((el, index) => {
        if (!prefersReducedMotion && el.classList.contains('list-item')) {
            el.style.transitionDelay = `${(index % 5) * 0.1}s`;
        }
        observer.observe(el);
    });

    // Custom Cursor Logic (only active on fine-pointer hover devices)
    const cursor = document.querySelector('.custom-cursor');
    if (cursor && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        let cursorFrame;
        let mouseX = 0;
        let mouseY = 0;
        let isCursorVisible = false;
        const interactiveSelector = 'a, button, .list-item, .menu-toggle';

        document.addEventListener('pointermove', (event) => {
            mouseX = event.clientX;
            mouseY = event.clientY;
            if (!isCursorVisible) {
                isCursorVisible = true;
                cursor.classList.add('visible');
            }
            if (cursorFrame) return;
            cursorFrame = requestAnimationFrame(() => {
                cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
                cursorFrame = undefined;
            });
        }, { passive: true });

        document.addEventListener('pointerleave', () => {
            isCursorVisible = false;
            cursor.classList.remove('visible', 'hover');
        });

        document.addEventListener('pointerover', (event) => {
            if (event.target.closest?.(interactiveSelector)) {
                cursor.classList.add('hover');
            }
        }, { passive: true });

        document.addEventListener('pointerout', (event) => {
            if (!event.target.closest?.(interactiveSelector)) return;
            if (!event.relatedTarget?.closest?.(interactiveSelector)) {
                cursor.classList.remove('hover');
            }
        }, { passive: true });
    }

    // Mobile Menu Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            if (navLinks && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                menuToggle?.classList.remove('active');
            }

            const targetId = this.getAttribute('href');
            if (!targetId || targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: prefersReducedMotion ? 'auto' : 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Unified Scroll Handler: Navbar Top App Bar, Scroll-to-Top button, and ScrollSpy
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    const navbar = document.querySelector('.navbar');
    const navSectionEntries = Array.from(document.querySelectorAll('.nav-links a'))
        .map((link) => {
            const href = link.getAttribute('href');
            if (!href || href === '#') return null;
            const target = document.querySelector(href);
            return target ? { link, href, target, top: 0 } : null;
        })
        .filter(Boolean);

    const getDocumentTop = (el) => {
        let top = 0;
        let node = el;
        while (node) {
            top += node.offsetTop;
            node = node.offsetParent;
        }
        return top;
    };

    let viewportHeight = window.innerHeight;
    let bodyHeight = document.body.offsetHeight;

    const measureLayout = () => {
        viewportHeight = window.innerHeight;
        bodyHeight = document.body.offsetHeight;
        for (let i = 0; i < navSectionEntries.length; i++) {
            navSectionEntries[i].top = getDocumentTop(navSectionEntries[i].target);
        }
    };

    let lastActiveHref = null;
    let isScrollTopVisible = null;
    let isNavbarScrolled = null;

    const updateOnScroll = () => {
        const scrollY = window.scrollY;

        const nextScrollTopVisible = scrollY > 400;
        if (nextScrollTopVisible !== isScrollTopVisible) {
            isScrollTopVisible = nextScrollTopVisible;
            scrollTopBtn?.classList.toggle('visible', nextScrollTopVisible);
        }

        const nextNavbarScrolled = scrollY > 50;
        if (nextNavbarScrolled !== isNavbarScrolled) {
            isNavbarScrolled = nextNavbarScrolled;
            navbar?.classList.toggle('scrolled', nextNavbarScrolled);
        }

        let current = '';
        const spyThreshold = scrollY + 300;
        for (let i = 0; i < navSectionEntries.length; i++) {
            if (navSectionEntries[i].top <= spyThreshold) {
                current = navSectionEntries[i].href;
            }
        }

        if (navSectionEntries.length > 0 && (viewportHeight + Math.round(scrollY)) >= bodyHeight - 100) {
            current = navSectionEntries[navSectionEntries.length - 1].href;
        }

        if (current !== lastActiveHref) {
            lastActiveHref = current;
            for (let i = 0; i < navSectionEntries.length; i++) {
                const entry = navSectionEntries[i];
                entry.link.classList.toggle('active', entry.href === current);
            }
        }
    };

    let scrollFrame;
    const scheduleScrollUpdate = () => {
        if (scrollFrame) return;
        scrollFrame = requestAnimationFrame(() => {
            scrollFrame = undefined;
            updateOnScroll();
        });
    };

    let measureFrame;
    const scheduleLayoutMeasure = () => {
        if (measureFrame) return;
        measureFrame = requestAnimationFrame(() => {
            measureFrame = undefined;
            measureLayout();
            updateOnScroll();
        });
    };

    window.addEventListener('scroll', scheduleScrollUpdate, { passive: true });
    window.addEventListener('resize', scheduleLayoutMeasure, { passive: true });
    window.addEventListener('load', scheduleLayoutMeasure, { once: true });

    if (typeof ResizeObserver !== 'undefined') {
        const resizeObserver = new ResizeObserver(scheduleLayoutMeasure);
        resizeObserver.observe(document.body);
    }

    measureLayout();
    updateOnScroll();

    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: prefersReducedMotion ? 'auto' : 'smooth'
            });
        });
    }

    // Theme Toggle & LeetCode Card Sync Logic
    const themeToggle = document.getElementById('theme-toggle');
    const rootElement = document.documentElement;
    const leetCardImg = document.getElementById('leetcode-card-img');
    const leetCardFrame = leetCardImg?.closest('.leetcode-card-frame');
    const profileTabs = document.querySelectorAll('.profile-tab');
    let activeLeetExt = 'activity';

    const buildLeetCodeCardUrl = (theme, ext) =>
        `https://leetcard.jacoblin.cool/Arnab_Kumar_Jana?theme=${theme}&font=Poppins&border=0&radius=12&ext=${ext}`;

    const syncLeetCodeCard = () => {
        if (!leetCardImg || !leetCardFrame) return;
        const theme = rootElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
        const nextUrl = buildLeetCodeCardUrl(theme, activeLeetExt);
        if (leetCardImg.getAttribute('src') === nextUrl && !leetCardFrame.classList.contains('is-error')) {
            return;
        }
        leetCardFrame.classList.remove('is-error');
        leetCardFrame.classList.add('is-loading');
        leetCardImg.src = nextUrl;
    };

    if (leetCardImg && leetCardFrame) {
        leetCardImg.addEventListener('load', () => {
            leetCardFrame.classList.remove('is-loading', 'is-error');
        });
        leetCardImg.addEventListener('error', () => {
            leetCardFrame.classList.remove('is-loading');
            leetCardFrame.classList.add('is-error');
        });
        if (leetCardImg.complete && leetCardImg.naturalWidth > 0) {
            leetCardFrame.classList.remove('is-loading', 'is-error');
        }
    }

    profileTabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            const nextExt = tab.dataset.ext;
            if (!nextExt || nextExt === activeLeetExt) return;
            activeLeetExt = nextExt;
            profileTabs.forEach((btn) => {
                const isActive = btn === tab;
                btn.classList.toggle('is-active', isActive);
                btn.setAttribute('aria-pressed', String(isActive));
            });
            syncLeetCodeCard();
        });
    });

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        rootElement.setAttribute('data-theme', 'light');
    } else if (savedTheme === 'dark') {
        rootElement.removeAttribute('data-theme');
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        rootElement.setAttribute('data-theme', 'light');
    }

    syncLeetCodeCard();

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            if (rootElement.getAttribute('data-theme') === 'light') {
                rootElement.removeAttribute('data-theme');
                localStorage.setItem('theme', 'dark');
            } else {
                rootElement.setAttribute('data-theme', 'light');
                localStorage.setItem('theme', 'light');
            }
            syncLeetCodeCard();
        });
    }

    // Copy Email logic
    const copyEmailBtn = document.getElementById('copyEmailBtn');
    if (copyEmailBtn) {
        const originalHTML = copyEmailBtn.innerHTML;
        let copyResetTimer;

        copyEmailBtn.addEventListener('click', () => {
            navigator.clipboard.writeText('arnabkrjana2004@gmail.com').then(() => {
                clearTimeout(copyResetTimer);
                copyEmailBtn.textContent = 'Copied!';
                copyEmailBtn.style.borderRadius = '30px';
                copyEmailBtn.style.fontSize = '0.9rem';
                copyResetTimer = setTimeout(() => {
                    copyEmailBtn.innerHTML = originalHTML;
                    copyEmailBtn.style.borderRadius = '50%';
                    copyEmailBtn.style.fontSize = '';
                }, 2000);
            });
        });
    }
});
