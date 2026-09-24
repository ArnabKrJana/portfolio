document.addEventListener('DOMContentLoaded', () => {

    // Scroll reveal animation using Intersection Observer
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('appear');
                observer.unobserve(entry.target); // Stop observing once it has appeared
            }
        });
    }, observerOptions);

    const elementsToAnimate = document.querySelectorAll('.fade-in');
    elementsToAnimate.forEach((el, index) => {
        // Add a slight delay based on the index if elements are close together
        // For lists, we might want staggered animation
        if (el.classList.contains('list-item')) {
            el.style.transitionDelay = `${(index % 5) * 0.1}s`;
        }
        observer.observe(el);
    });

    // Custom Cursor Logic
    const cursor = document.querySelector('.custom-cursor');

    // Update only when the pointer moves instead of rendering a permanent animation loop.
    if (cursor && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        let cursorFrame;
        let mouseX = 0;
        let mouseY = 0;

        document.addEventListener('pointermove', (event) => {
            mouseX = event.clientX;
            mouseY = event.clientY;
            if (cursorFrame) return;
            cursorFrame = requestAnimationFrame(() => {
                cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
                cursorFrame = undefined;
            });
        }, { passive: true });
    }

    // Add hover effect to interactive elements
    const interactiveElements = document.querySelectorAll('a, button, .list-item, .menu-toggle');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => cursor?.classList.add('hover'));
        el.addEventListener('mouseleave', () => cursor?.classList.remove('hover'));
    });

    // Mobile Menu Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            // Close mobile menu if open
            if (navLinks && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                if (menuToggle) menuToggle.classList.remove('active');
            }

            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // ScrollSpy for navigation links
    const navItemsList = document.querySelectorAll('.nav-links a');

    let scrollSpyFrame;
    const updateScrollSpy = () => {
        let current = '';
        navItemsList.forEach(a => {
            const id = a.getAttribute('href');
            if (id === '#') return;
            const target = document.querySelector(id);
            if (target) {
                const rect = target.getBoundingClientRect();
                if (rect.top <= 300) {
                    current = id;
                }
            }
        });

        // If at the very bottom, force the last item to be active
        if ((window.innerHeight + Math.round(window.scrollY)) >= document.body.offsetHeight - 100) {
            const lastItem = navItemsList[navItemsList.length - 1];
            if (lastItem) {
                current = lastItem.getAttribute('href');
            }
        }

        navItemsList.forEach(a => {
            a.classList.remove('active');
            if (current && a.getAttribute('href') === current) {
                a.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', () => {
        if (scrollSpyFrame) return;
        scrollSpyFrame = requestAnimationFrame(() => {
            updateScrollSpy();
            scrollSpyFrame = undefined;
        });
    }, { passive: true });

    // Scroll to Top and Navbar logic
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    const navbar = document.querySelector('.navbar');

    let chromeFrame;
    const updatePageChrome = () => {
        if (window.scrollY > 400) {
            scrollTopBtn.classList.add('visible');
        } else {
            scrollTopBtn.classList.remove('visible');
        }

        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    };

    window.addEventListener('scroll', () => {
        if (chromeFrame) return;
        chromeFrame = requestAnimationFrame(() => {
            updatePageChrome();
            chromeFrame = undefined;
        });
    }, { passive: true });

    updateScrollSpy();
    updatePageChrome();

    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // Theme Toggle Logic
    const themeToggle = document.getElementById('theme-toggle');
    const rootElement = document.documentElement; // html tag

    // Check for saved theme preference, otherwise check system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        rootElement.setAttribute('data-theme', 'light');
    } else if (savedTheme === 'dark') {
        rootElement.removeAttribute('data-theme');
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        rootElement.setAttribute('data-theme', 'light');
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            if (rootElement.getAttribute('data-theme') === 'light') {
                rootElement.removeAttribute('data-theme');
                localStorage.setItem('theme', 'dark');
            } else {
                rootElement.setAttribute('data-theme', 'light');
                localStorage.setItem('theme', 'light');
            }
        });
    }

});

// Copy Email logic
const copyEmailBtn = document.getElementById('copyEmailBtn');
if (copyEmailBtn) {
    copyEmailBtn.addEventListener('click', () => {
        navigator.clipboard.writeText('arnabkrjana2004@gmail.com').then(() => {
            const originalHTML = copyEmailBtn.innerHTML;
            copyEmailBtn.innerHTML = 'Copied!';
            copyEmailBtn.style.borderRadius = '30px';
            copyEmailBtn.style.fontSize = '0.9rem';
            setTimeout(() => {
                copyEmailBtn.innerHTML = originalHTML;
                copyEmailBtn.style.borderRadius = '50%';
                copyEmailBtn.style.fontSize = '';
            }, 2000);
        });
    });
}

