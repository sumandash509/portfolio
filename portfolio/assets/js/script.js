// Portfolio Website JavaScript
// Three.js 3D Background, GSAP Animations, Typed.js, Custom Cursor

class PortfolioApp {
    constructor() {
        this.init();
    }

    init() {
        this.setupThreeJS();
        this.setupGSAP();
        this.setupTypedJS();
        this.setupCustomCursor();
        this.setupScrollProgress();
        this.setupMobileMenu();
        this.setupContactForm();
        this.setupProjectModal();
        this.setupPreloader();
        
        // Initialize Intersection Observer for scroll animations
        this.initIntersectionObserver();
        
        // Add event listeners
        window.addEventListener('resize', () => this.onResize());
        window.addEventListener('scroll', () => this.onScroll());
    }

    // 1. Three.js 3D Background Setup
    setupThreeJS() {
        const container = document.getElementById('canvas-container');
        const scene = new THREE.Scene();
        
        // Camera setup
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 20;
        
        // Renderer setup
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);

        // Create floating spheres
        const spheres = [];
        const geometry = new THREE.SphereGeometry(1, 32, 32);
        
        // Main floating sphere material
        const mainMaterial = new THREE.MeshPhongMaterial({
            color: 0x0066cc,
            emissive: 0x003366,
            specular: 0xffffff,
            shininess: 100,
            transparent: true,
            opacity: 0.8
        });

        // Small floating balls material
        const ballMaterial = new THREE.MeshBasicMaterial({
            color: 0xffcc00,
            transparent: true,
            opacity: 0.6
        });

        // Create main sphere
        const mainSphere = new THREE.Mesh(geometry, mainMaterial);
        mainSphere.position.set(0, 0, 0);
        mainSphere.scale.set(2, 2, 2);
        scene.add(mainSphere);

        // Create floating balls
        for (let i = 0; i < 20; i++) {
            const ball = new THREE.Mesh(geometry, ballMaterial);
            ball.position.set(
                (Math.random() - 0.5) * 50,
                (Math.random() - 0.5) * 50,
                (Math.random() - 0.5) * 50
            );
            ball.scale.setScalar(Math.random() * 0.5 + 0.2);
            ball.userData = {
                speed: Math.random() * 0.02 + 0.01,
                rotationSpeed: Math.random() * 0.02 + 0.01,
                direction: new THREE.Vector3(
                    Math.random() - 0.5,
                    Math.random() - 0.5,
                    Math.random() - 0.5
                ).normalize()
            };
            scene.add(ball);
            spheres.push(ball);
        }

        // Add ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        // Add point light
        const pointLight = new THREE.PointLight(0xffcc00, 1, 100);
        pointLight.position.set(10, 10, 10);
        scene.add(pointLight);

        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate);

            // Rotate main sphere
            mainSphere.rotation.x += 0.005;
            mainSphere.rotation.y += 0.01;

            // Animate floating balls
            spheres.forEach(ball => {
                ball.position.add(ball.userData.direction.clone().multiplyScalar(ball.userData.speed));
                ball.rotation.y += ball.userData.rotationSpeed;
                
                // Bounce back if going too far
                if (Math.abs(ball.position.x) > 25) ball.userData.direction.x *= -1;
                if (Math.abs(ball.position.y) > 25) ball.userData.direction.y *= -1;
                if (Math.abs(ball.position.z) > 25) ball.userData.direction.z *= -1;
            });

            renderer.render(scene, camera);
        };

        animate();

        // Handle window resize
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        this.threeData = { scene, camera, renderer, mainSphere, spheres };
    }

    // 2. GSAP Scroll Animations Setup
    setupGSAP() {
        gsap.registerPlugin(ScrollTrigger);

        // Hero section animations
        gsap.from('.hero-title', {
            opacity: 0,
            y: 50,
            duration: 1,
            delay: 0.5
        });

        gsap.from('.hero-subtitle', {
            opacity: 0,
            y: 30,
            duration: 1,
            delay: 0.8
        });

        gsap.from('.hero-description', {
            opacity: 0,
            y: 30,
            duration: 1,
            delay: 1.1
        });

        gsap.from('.hero-buttons', {
            opacity: 0,
            y: 30,
            duration: 1,
            delay: 1.4
        });

        // Floating sphere animation
        gsap.from('.floating-sphere', {
            opacity: 0,
            scale: 0.5,
            duration: 1.5,
            delay: 0.5,
            ease: 'power3.out'
        });

        // Section animations
        gsap.utils.toArray('.section').forEach((section, index) => {
            gsap.from(section, {
                opacity: 0,
                y: 50,
                duration: 1,
                scrollTrigger: {
                    trigger: section,
                    start: 'top 80%',
                    end: 'bottom 20%',
                    toggleActions: 'play none none reverse'
                }
            });
        });

        // Skills progress bars
        gsap.utils.toArray('.skill-progress').forEach((bar, index) => {
            gsap.fromTo(bar, 
                { width: '0%' },
                { 
                    width: bar.style.width,
                    duration: 1.5,
                    scrollTrigger: {
                        trigger: bar.parentElement.parentElement,
                        start: 'top 80%',
                        toggleActions: 'play none none reverse'
                    }
                }
            );
        });

        // Timeline animations
        gsap.utils.toArray('.timeline-content').forEach((item, index) => {
            gsap.from(item, {
                opacity: 0,
                x: index % 2 === 0 ? -50 : 50,
                duration: 1,
                scrollTrigger: {
                    trigger: item,
                    start: 'top 80%',
                    toggleActions: 'play none none reverse'
                }
            });
        });

        // Project cards 3D tilt effect
        gsap.utils.toArray('.project-card').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = (y - centerY) / 10;
                const rotateY = (centerX - x) / 10;
                
                gsap.to(card, {
                    rotateX: rotateX,
                    rotateY: rotateY,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            });

            card.addEventListener('mouseleave', () => {
                gsap.to(card, {
                    rotateX: 0,
                    rotateY: 0,
                    duration: 0.5,
                    ease: 'power2.out'
                });
            });
        });
    }

    // 3. Typed.js Setup
    setupTypedJS() {
        const typed = new Typed('#typed-text', {
            strings: [
                'BTech Student',
                'Java & Python Developer',
                'AI/ML Enthusiast',
                'Problem Solver',
                'Tech Explorer'
            ],
            typeSpeed: 100,
            backSpeed: 50,
            backDelay: 1500,
            loop: true,
            showCursor: true,
            cursorChar: '|',
            autoInsertCss: true
        });
    }

    // 4. Custom Cursor Setup
    setupCustomCursor() {
        const cursor = document.getElementById('cursor');
        const cursorFollower = document.getElementById('cursor-follower');
        const hoverElements = document.querySelectorAll('a, button, .project-card, .cert-card, .skill-card, .experience-card, .social-link');

        // Hide default cursor
        document.body.style.cursor = 'none';

        // Mouse move event
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
            
            // Add delay to follower
            gsap.to(cursorFollower, {
                x: e.clientX - 20,
                y: e.clientY - 20,
                duration: 0.3,
                ease: 'power2.out'
            });
        });

        // Hover effects
        hoverElements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                document.body.classList.add('cursor-hover');
            });

            element.addEventListener('mouseleave', () => {
                document.body.classList.remove('cursor-hover');
            });
        });

        // Click animation
        document.addEventListener('mousedown', () => {
            gsap.to(cursor, {
                scale: 0.5,
                duration: 0.1
            });
        });

        document.addEventListener('mouseup', () => {
            gsap.to(cursor, {
                scale: 1,
                duration: 0.1
            });
        });
    }

    // 5. Scroll Progress Indicator
    setupScrollProgress() {
        const progressBar = document.getElementById('progress-bar');
        
        window.addEventListener('scroll', () => {
            const scrolled = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
            progressBar.style.width = scrolled + '%';
        });
    }

    // 6. Mobile Menu Toggle
    setupMobileMenu() {
        const menuToggle = document.getElementById('mobile-menu');
        const navMenu = document.querySelector('.nav-menu');

        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close menu when clicking on a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }

    // 7. Contact Form
    setupContactForm() {
        const form = document.getElementById('contactForm');
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Get form data
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const subject = document.getElementById('subject').value;
            const message = document.getElementById('message').value;

            // Simple validation
            if (!name || !email || !subject || !message) {
                alert('Please fill in all fields.');
                return;
            }

            // Create mailto link
            const mailtoLink = `mailto:sumandash509@gmail.com?subject=${encodeURIComponent(subject)}&body=Name: ${encodeURIComponent(name)}%0D%0AEmail: ${encodeURIComponent(email)}%0D%0AMessage: ${encodeURIComponent(message)}`;
            
            // Open email client
            window.location.href = mailtoLink;
            
            // Reset form
            form.reset();
            
            // Show success message (in a real app, you'd send this to a server)
            alert('Message prepared! Please send the email from your email client.');
        });
    }

    // 8. Project Modal
    setupProjectModal() {
        const modal = document.getElementById('project-modal');
        const closeBtn = document.querySelector('.close-btn');
        const modalTitle = document.getElementById('modal-title');
        const modalDesc = document.getElementById('modal-description');
        const modalTech = document.getElementById('modal-tech');

        // Project data
        const projectData = {
            'quick-chef': {
                title: 'Quick Chef',
                description: 'Smart cooking assistant providing step-by-step recipe guidance with AI-powered recommendations. The application helps users find recipes based on available ingredients and provides detailed cooking instructions.',
                tech: ['Python', 'AI/ML', 'GUI Development', 'Recipe Database']
            },
            'agrovision': {
                title: 'AgroVision',
                description: 'AI/ML-based web application for detecting crop diseases through image analysis. Farmers can upload images of their crops and receive instant disease detection with treatment recommendations.',
                tech: ['Python', 'Machine Learning', 'Web Application', 'Image Processing']
            }
        };

        // Open modal
        document.querySelectorAll('.project-card').forEach(card => {
            card.addEventListener('click', () => {
                const projectId = card.dataset.project;
                const data = projectData[projectId];
                
                if (data) {
                    modalTitle.textContent = data.title;
                    modalDesc.textContent = data.description;
                    modalTech.innerHTML = data.tech.map(tech => `<span>${tech}</span>`).join('');
                    
                    modal.style.display = 'block';
                    
                    // Add animation
                    gsap.fromTo('.modal-content', 
                        { opacity: 0, y: -50 },
                        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
                    );
                }
            });
        });

        // Close modal
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    // 9. Preloader
    setupPreloader() {
        const preloader = document.getElementById('preloader');
        
        // Simulate loading time
        setTimeout(() => {
            preloader.style.opacity = '0';
            setTimeout(() => {
                preloader.style.display = 'none';
            }, 500);
        }, 2000);
    }

    // 10. Intersection Observer for Scroll Animations
    initIntersectionObserver() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // Observe elements
        document.querySelectorAll('.skill-card, .cert-card, .experience-card').forEach(el => {
            observer.observe(el);
        });
    }

    // Utility methods
    onResize() {
        if (this.threeData) {
            const { camera, renderer } = this.threeData;
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }
    }

    onScroll() {
        // Add parallax effect to floating sphere
        const floatingSphere = document.querySelector('.floating-sphere');
        if (floatingSphere) {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            floatingSphere.style.transform = `translateY(${rate}px) rotateY(${scrolled * 0.01}deg)`;
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PortfolioApp();
});

// Add some additional utility functions
window.addEventListener('load', () => {
    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add floating animation to decorative elements
    const floatingElements = document.querySelectorAll('.floating-element');
    floatingElements.forEach((el, index) => {
        gsap.from(el, {
            y: 20,
            opacity: 0,
            duration: 1,
            delay: index * 0.1,
            ease: 'power2.out'
        });
    });
});