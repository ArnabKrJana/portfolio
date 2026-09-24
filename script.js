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

    // Scroll to Top and Navbar logic
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    const navbar = document.querySelector('.navbar');

    window.addEventListener('scroll', () => {
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
    });

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

    // Initialize WebGL Background
    initWebGLBackground();
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

// WebGL Shader Background (converted from Framer to Vanilla JS)
function initWebGLBackground() {
    const container = document.getElementById('framer-bg-root');
    if (!container || !window.THREE) return;

    // Clear fallback image
    container.innerHTML = '';

    const vertexShader = `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
    }
    `;

    const fragmentShader = `
    uniform float uTime;
    uniform vec2 uResolution;
    uniform vec3 uColor;
    uniform vec3 uBgColor;
    uniform float uAngle;
    uniform int uPattern;
    uniform float uDotSize;
    uniform float uSpacing;
    uniform float uSpeed;

    varying vec2 vUv;

    // Standard 2D Simplex Noise
    vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
    float snoise(vec2 v){
      const vec4 C = vec4(0.211324865405187, 0.366025403784439,
               -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy) );
      vec2 x0 = v -   i + dot(i, C.xx);
      vec2 i1;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod(i, 289.0);
      vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
      + i.x + vec3(0.0, i1.x, 1.0 ));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
        dot(x12.zw,x12.zw)), 0.0);
      m = m*m ;
      m = m*m ;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    mat2 rotate(float a) {
        float s = sin(a);
        float c = cos(a);
        return mat2(c, -s, s, c);
    }

    void main() {
        vec2 p = gl_FragCoord.xy / uResolution.xy;
        vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
        vec2 uv = (p - 0.5) * aspect;
        
        uv = rotate(uAngle * 3.14159 / 180.0) * uv;
        
        float density = uSpacing * 50.0;
        vec2 gridPos = uv * density;
        vec2 cell = fract(gridPos) - 0.5;
        vec2 id = floor(gridPos);
        
        float time = uTime * uSpeed;
        float patternValue = 0.0;
        
        if (uPattern == 0) {
            float wave1 = sin(id.x * 0.1 + time) * 0.5 + 0.5;
            float wave2 = cos(id.y * 0.1 - time * 0.8) * 0.5 + 0.5;
            float wave3 = sin((id.x + id.y) * 0.05 + time * 1.2) * 0.5 + 0.5;
            patternValue = (wave1 + wave2 + wave3) / 3.0;
            patternValue += snoise(id * 0.05 + time * 0.2) * 0.2;
        } 
        else if (uPattern == 1) {
            vec2 npos = id * 0.02;
            float n1 = snoise(npos + time * 0.3);
            float n2 = snoise(npos * 1.5 - time * 0.2 + n1);
            float flow = sin(id.x * 0.05 + n2 * 3.0 + time) * cos(id.y * 0.05 + n1 * 2.0 - time);
            
            patternValue = smoothstep(-0.5, 0.5, flow);
            patternValue = pow(patternValue, 1.5);
        }
        else {
            float t = time * 0.5;
            vec2 q = vec2(
                snoise(id * 0.015 + vec2(t, t)),
                snoise(id * 0.015 + vec2(-t, t))
            );
            vec2 r = vec2(
                snoise(id * 0.02 + q + vec2(t * 1.5, -t)),
                snoise(id * 0.02 + q + vec2(-t, t * 1.2))
            );
            float f = snoise(id * 0.03 + r);
            patternValue = smoothstep(0.1, 0.9, f * 0.5 + 0.5);
            
            patternValue *= mix(0.5, 1.0, sin(id.x * 0.1 + id.y * 0.1 + time * 2.0) * 0.5 + 0.5);
        }
        
        patternValue = clamp(patternValue, 0.0, 1.0);
        float maxRadius = (uDotSize / 100.0) * 0.5;
        float currentRadius = maxRadius * patternValue;
        
        float dist = length(cell);
        float alpha = smoothstep(currentRadius + 0.05, currentRadius - 0.01, dist);
        
        vec3 finalColor = mix(uBgColor, uColor, alpha * patternValue);
        
        gl_FragColor = vec4(finalColor, 1.0);
    }
    `;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    camera.position.z = 1;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: "high-performance" });
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.appendChild(renderer.domElement);

    const geometry = new THREE.PlaneGeometry(2, 2);
    
    // Configuration options getter based on theme
    const getConfig = () => {
        const isLight = document.documentElement.getAttribute('data-theme') === 'light';
        return {
            pattern: "wave", // "wave", "premium", "ethereal"
            dotColor: isLight ? "#000000" : "#ffffff",
            backgroundColor: isLight ? "#ffffff" : "#000000",
            dotSize: 35,
            spacing: 2,
            angle: 45,
            speed: 1
        };
    };
    
    let config = getConfig();

    const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
            uTime: { value: 0 },
            uResolution: { value: new THREE.Vector2() },
            uColor: { value: new THREE.Color(config.dotColor) },
            uBgColor: { value: new THREE.Color(config.backgroundColor) },
            uAngle: { value: config.angle },
            uPattern: { value: config.pattern === "wave" ? 0 : config.pattern === "premium" ? 1 : 2 },
            uDotSize: { value: config.dotSize },
            uSpacing: { value: config.spacing },
            uSpeed: { value: config.speed }
        },
        depthWrite: false,
        depthTest: false,
        transparent: true
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Watch for theme changes
    const themeObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'data-theme') {
                config = getConfig();
                material.uniforms.uColor.value.set(config.dotColor);
                material.uniforms.uBgColor.value.set(config.backgroundColor);
            }
        });
    });
    themeObserver.observe(document.documentElement, { attributes: true });

    const handleResize = () => {
        if (!container) return;
        const width = container.clientWidth;
        const height = container.clientHeight;
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        material.uniforms.uResolution.value.set(width * renderer.getPixelRatio(), height * renderer.getPixelRatio());
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    const clock = new THREE.Clock();
    let frameId;

    const animate = () => {
        frameId = requestAnimationFrame(animate);
        const time = clock.getElapsedTime();
        material.uniforms.uTime.value = time;
        renderer.render(scene, camera);
    };
    
    animate();
}
