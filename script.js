document.addEventListener('DOMContentLoaded', () => {
    // Manage Vanta Halo Background based on visibility to improve performance
    let vantaEffect;
    const initVanta = () => {
        if (typeof VANTA !== 'undefined' && VANTA.HALO && !vantaEffect) {
            vantaEffect = VANTA.HALO({
                el: "#vanta-bg",
                mouseControls: true,
                touchControls: true,
                gyroControls: false,
                minHeight: 200.00,
                minWidth: 200.00,
                baseColor: 0xe5383b, // Strawberry Red
                backgroundColor: 0x0b090a, // Onyx
                size: 2.50
            });
        }
    };

    const destroyVanta = () => {
        if (vantaEffect) {
            vantaEffect.destroy();
            vantaEffect = null;
        }
    };

    const heroSection = document.getElementById('hero');
    if (heroSection) {
        const vantaObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    initVanta();
                } else {
                    destroyVanta();
                }
            });
        }, { threshold: 0 });

        vantaObserver.observe(heroSection);
    }

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

    // Use requestAnimationFrame for smoother cursor updates
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animateCursor() {
        if (cursor) {
            // Immediate tracking for zero lag
            cursorX = mouseX;
            cursorY = mouseY;
            cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
            requestAnimationFrame(animateCursor);
        }
    }

    if (cursor) {
        animateCursor();
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

    window.addEventListener('scroll', () => {
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
    });

    // Scroll to Top logic
    const scrollTopBtn = document.getElementById('scrollTopBtn');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 400) {
            scrollTopBtn.classList.add('visible');
        } else {
            scrollTopBtn.classList.remove('visible');
        }
    });

    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
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
