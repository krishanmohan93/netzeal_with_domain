// Enhanced Mobile Navigation Toggle
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
    
    // Add body scroll lock when menu is open
    if (navMenu.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = 'auto';
    }
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = 'auto';
    });
});

// Smooth scrolling for navigation links
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

// Enhanced navbar scroll effects
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    const scrolled = window.scrollY;
    
    if (scrolled > 50) {
        navbar.classList.add('scrolled');
        navbar.style.background = '#2C2C2C';
        navbar.style.backdropFilter = 'none';
        navbar.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.35)';
    } else {
        navbar.classList.remove('scrolled');
        navbar.style.background = '#2C2C2C';
        navbar.style.backdropFilter = 'none';
        navbar.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3)';
    }
    
    // Add subtle logo animation on scroll
    const logo = document.querySelector('.logo-img');
    if (logo) {
        const scale = Math.max(0.9, 1 - scrolled * 0.0001);
        logo.style.transform = `scale(${scale})`;
    }
});

// Form submission handling
const contactForm = document.querySelector('.contact-form form');
if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const nameInput = this.querySelector('#name');
        const emailInput = this.querySelector('#email');
        const phoneInput = this.querySelector('#phone');
        const subjectInput = this.querySelector('#subject');
        const messageInput = this.querySelector('#message');
        
        const name = nameInput?.value?.trim();
        const email = emailInput?.value?.trim();
        const phone = phoneInput?.value?.trim();
        const subject = subjectInput?.value?.trim();
        const message = messageInput?.value?.trim();
        
        // Basic validation
        if (!name || !email || !phone || !subject || !message) {
            showNotification('Please fill in all fields', 'error');
            return;
        }
        
        if (!isValidEmail(email)) {
            showNotification('Please enter a valid email address', 'error');
            return;
        }
        
        // Optional: basic phone validation (digits and + - space)
        const phoneRegex = /^[+\d][\d\s\-()]{5,}$/;
        if (!phoneRegex.test(phone)) {
            showNotification('Please enter a valid phone number', 'error');
            return;
        }
        
        // Disable button to prevent double submit
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn ? submitBtn.textContent : '';
        if (submitBtn) {
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.7';
        }
        
        try {
            // SheetDB expects a JSON body with data key; but it also
            // accepts direct array of objects at /bulk. We'll send single row.
            const response = await fetch('https://sheetdb.io/api/v1/vbos2kns25xob', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    data: [{ name, email, phone, subject, message }]
                })
            });
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
            const result = await response.json();
            // Success condition per SheetDB is created/updated count
            if (result && (result.created || result.updated || result.success)) {
                showNotification('Thank you! Your message has been sent. We\'ll get back to you within 24 hours.', 'success');
                this.reset();
            } else {
                showNotification('Something went wrong. Please try again later.', 'error');
            }
        } catch (err) {
            showNotification('Failed to send. Please check your connection and try again.', 'error');
        } finally {
            if (submitBtn) {
                submitBtn.textContent = originalBtnText;
                submitBtn.disabled = false;
                submitBtn.style.opacity = '1';
            }
        }
    });
}

// Email validation function
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        max-width: 400px;
        animation: slideInRight 0.3s ease-out;
    `;
    
    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        .notification-content {
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .notification-close {
            background: none;
            border: none;
            color: white;
            font-size: 1.5rem;
            cursor: pointer;
            margin-left: 1rem;
            padding: 0;
            line-height: 1;
        }
        .notification-close:hover {
            opacity: 0.8;
        }
    `;
    document.head.appendChild(style);
    
    // Add to page
    document.body.appendChild(notification);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.remove();
    });
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.service-card, .portfolio-item, .client-card, .about-content, .contact-content');
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Portfolio item click handling
document.querySelectorAll('.portfolio-item').forEach(item => {
    item.addEventListener('click', () => {
        const title = item.querySelector('h3').textContent;
        const description = item.querySelector('p').textContent;
        
        // Create modal (you can enhance this with actual project details)
        showProjectModal(title, description);
    });
});

// Project modal function
function showProjectModal(title, description) {
    // Remove existing modal
    const existingModal = document.querySelector('.project-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'project-modal';
    modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <p>${description}</p>
                <div class="modal-actions">
                    <button class="btn btn-primary">View Project</button>
                    <button class="btn btn-secondary">Close</button>
                </div>
            </div>
        </div>
    `;
    
    // Add modal styles
    const style = document.createElement('style');
    style.textContent = `
        .project-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.3s ease-out;
        }
        .modal-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
        }
        .modal-content {
            background: white;
            border-radius: 20px;
            padding: 2rem;
            max-width: 500px;
            width: 90%;
            position: relative;
            z-index: 1;
            box-shadow: 0 20px 40px rgba(0,0,0,0.2);
        }
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
        }
        .modal-header h3 {
            color: var(--text-dark);
            margin: 0;
        }
        .modal-close {
            background: none;
            border: none;
            font-size: 2rem;
            cursor: pointer;
            color: var(--text-light);
            padding: 0;
            line-height: 1;
        }
        .modal-close:hover {
            color: var(--text-dark);
        }
        .modal-body p {
            color: var(--text-light);
            margin-bottom: 2rem;
            line-height: 1.6;
        }
        .modal-actions {
            display: flex;
            gap: 1rem;
            justify-content: flex-end;
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    // Add to page
    document.body.appendChild(modal);
    
    // Close modal functionality
    const closeBtn = modal.querySelector('.modal-close');
    const closeSecondaryBtn = modal.querySelector('.btn-secondary');
    const overlay = modal.querySelector('.modal-overlay');
    
    [closeBtn, closeSecondaryBtn, overlay].forEach(element => {
        element.addEventListener('click', () => {
            modal.remove();
        });
    });
    
    // Close on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            modal.remove();
        }
    });
}

// Add loading animation to buttons
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', function(e) {
        if (this.classList.contains('btn-primary') || this.classList.contains('btn-secondary')) {
            // Add loading state
            const originalText = this.textContent;
            this.textContent = 'Loading...';
            this.style.pointerEvents = 'none';
            
            // Simulate loading (remove this in production)
            setTimeout(() => {
                this.textContent = originalText;
                this.style.pointerEvents = 'auto';
            }, 1000);
        }
    });
});

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroGraphic = document.querySelector('.hero-graphic');
    if (heroGraphic) {
        heroGraphic.style.transform = `translateY(${scrolled * 0.1}px)`;
    }
});

// Counter animation for stats
function animateCounters() {
    const counters = document.querySelectorAll('.stat h3');
    const speed = 200;
    
    counters.forEach(counter => {
        const target = parseInt(counter.textContent);
        const increment = target / speed;
        let current = 0;
        
        const updateCounter = () => {
            if (current < target) {
                current += increment;
                counter.textContent = Math.ceil(current) + '+';
                setTimeout(updateCounter, 1);
            } else {
                counter.textContent = target + '+';
            }
        };
        
        updateCounter();
    });
}

// Trigger counter animation when about section is visible
const aboutSection = document.querySelector('.about');
if (aboutSection) {
    const aboutObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounters();
                aboutObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    aboutObserver.observe(aboutSection);
}

// Add active state to navigation links based on scroll position
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// Enhanced Portfolio Filter Functionality
document.addEventListener('DOMContentLoaded', () => {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const portfolioCards = document.querySelectorAll('.portfolio-card');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');
            
            const filterValue = btn.getAttribute('data-filter');
            
            portfolioCards.forEach((card, index) => {
                const itemCategory = card.getAttribute('data-category');
                const shouldShow = filterValue === 'all' || itemCategory === filterValue;
                
                if (shouldShow) {
                    // Show with staggered animation
                    card.style.display = 'block';
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px) scale(0.95)';
                    
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0) scale(1)';
                    }, index * 100);
                } else {
                    // Hide with animation
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(-20px) scale(0.95)';
                    
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
});

// Enhanced Portfolio Card Interactions
document.addEventListener('DOMContentLoaded', () => {
    const portfolioCards = document.querySelectorAll('.portfolio-card');
    
    portfolioCards.forEach(card => {
        // Add smooth transitions
        card.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease, transform 0.3s ease';
        
        // Enhanced click handling for view project buttons
        const viewBtn = card.querySelector('.view-project');
        if (viewBtn) {
            viewBtn.addEventListener('click', (e) => {
                // If it's an anchor link to external repo, just let it navigate
                if (viewBtn.tagName.toLowerCase() === 'a' && viewBtn.getAttribute('href')?.startsWith('http')) {
                    e.stopPropagation();
                    return;
                }
                e.stopPropagation();
                const projectTitle = card.querySelector('h3').textContent;
                const projectCategory = card.querySelector('.category').textContent;
                const projectDescription = card.querySelector('p').textContent;
                const techTags = Array.from(card.querySelectorAll('.tech-stack span')).map(tag => tag.textContent);
                showEnhancedProjectModal(projectTitle, projectCategory, projectDescription, techTags);
            });
        }
        
        // Add subtle hover effects
        card.addEventListener('mouseenter', () => {
            // Subtle vibration effect for supported devices
            if ('vibrate' in navigator) {
                navigator.vibrate(8);
            }
        });
        
        // Card click handling
        card.addEventListener('click', () => {
            const projectTitle = card.querySelector('h3').textContent;
            const projectCategory = card.querySelector('.category').textContent;
            const projectDescription = card.querySelector('p').textContent;
            const techTags = Array.from(card.querySelectorAll('.tech-stack span')).map(tag => tag.textContent);
            
            showEnhancedProjectModal(projectTitle, projectCategory, projectDescription, techTags);
        });
    });
});

// Enhanced Project Modal
function showEnhancedProjectModal(title, category, description, technologies) {
    // Remove existing modal
    const existingModal = document.querySelector('.project-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Create enhanced modal
    const modal = document.createElement('div');
    modal.className = 'project-modal enhanced';
    modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content enhanced">
            <div class="modal-header">
                <div class="project-info">
                    <span class="project-category-modal">${category}</span>
                    <h3>${title}</h3>
                </div>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="project-description">
                    <p>${description}</p>
                </div>
                <div class="project-technologies">
                    <h4>Technologies Used:</h4>
                    <div class="tech-tags-modal">
                        ${technologies.map(tech => `<span class="tech-tag-modal">${tech}</span>`).join('')}
                    </div>
                </div>
                <div class="project-features">
                    <h4>Key Features:</h4>
                    <ul>
                        <li>Responsive design across all devices</li>
                        <li>Optimized performance and loading times</li>
                        <li>Modern UI/UX principles</li>
                        <li>Cross-browser compatibility</li>
                    </ul>
                </div>
                <div class="modal-actions">
                    <button class="btn btn-primary modal-btn">View Live Demo</button>
                    <button class="btn btn-secondary modal-btn">View Code</button>
                    <button class="btn btn-outline modal-btn">Close</button>
                </div>
            </div>
        </div>
    `;
    
    // Enhanced modal styles
    const style = document.createElement('style');
    style.textContent = `
        .project-modal.enhanced {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: modalFadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .modal-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.6);
            backdrop-filter: blur(5px);
        }
        .modal-content.enhanced {
            background: white;
            border-radius: 24px;
            padding: 2.5rem;
            max-width: 700px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            position: relative;
            z-index: 1;
            box-shadow: 0 25px 50px rgba(0,0,0,0.25);
            border: 2px solid var(--primary-light);
        }
        .modal-header .project-info {
            flex: 1;
        }
        .project-category-modal {
            color: var(--primary-color);
            font-size: 0.85rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
            display: block;
            margin-bottom: 0.5rem;
        }
        .modal-header h3 {
            color: var(--text-dark);
            margin: 0;
            font-size: 1.8rem;
            font-weight: 700;
        }
        .modal-close {
            background: none;
            border: none;
            font-size: 2rem;
            cursor: pointer;
            color: var(--text-light);
            padding: 0;
            line-height: 1;
            transition: all 0.3s ease;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .modal-close:hover {
            color: var(--text-dark);
            background: var(--gray-light);
        }
        .project-description p {
            color: var(--text-light);
            margin-bottom: 2rem;
            line-height: 1.7;
            font-size: 1.05rem;
        }
        .project-technologies,
        .project-features {
            margin-bottom: 2rem;
        }
        .project-technologies h4,
        .project-features h4 {
            color: var(--text-dark);
            font-size: 1.1rem;
            font-weight: 600;
            margin-bottom: 1rem;
        }
        .tech-tags-modal {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
        }
        .tech-tag-modal {
            padding: 6px 14px;
            background: var(--primary-light);
            color: var(--text-dark);
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 500;
            border: 1px solid var(--primary-color);
        }
        .project-features ul {
            list-style: none;
            padding: 0;
        }
        .project-features li {
            padding: 0.5rem 0;
            padding-left: 1.5rem;
            position: relative;
            color: var(--text-light);
        }
        .project-features li::before {
            content: "✓";
            position: absolute;
            left: 0;
            color: var(--primary-color);
            font-weight: bold;
        }
        .modal-actions {
            display: flex;
            gap: 1rem;
            justify-content: flex-end;
            flex-wrap: wrap;
        }
        .btn.btn-outline {
            background: transparent;
            color: var(--text-light);
            border: 2px solid var(--gray-medium);
        }
        .btn.btn-outline:hover {
            background: var(--gray-light);
            color: var(--text-dark);
        }
        @keyframes modalFadeIn {
            from { 
                opacity: 0; 
                transform: scale(0.9);
            }
            to { 
                opacity: 1; 
                transform: scale(1);
            }
        }
        @media (max-width: 768px) {
            .modal-content.enhanced {
                padding: 2rem;
                margin: 1rem;
                max-height: 90vh;
            }
            .modal-actions {
                justify-content: center;
            }
            .modal-actions .btn {
                flex: 1;
                min-width: 120px;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Add to page
    document.body.appendChild(modal);
    
    // Close modal functionality
    const closeBtn = modal.querySelector('.modal-close');
    const closeOutlineBtn = modal.querySelector('.btn-outline');
    const overlay = modal.querySelector('.modal-overlay');
    
    [closeBtn, closeOutlineBtn, overlay].forEach(element => {
        element.addEventListener('click', () => {
            modal.style.animation = 'modalFadeOut 0.3s ease-out';
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.remove();
                }
            }, 300);
        });
    });
    
    // Add fade out animation
    const fadeOutStyle = document.createElement('style');
    fadeOutStyle.textContent = `
        @keyframes modalFadeOut {
            from { 
                opacity: 1; 
                transform: scale(1);
            }
            to { 
                opacity: 0; 
                transform: scale(0.9);
            }
        }
    `;
    document.head.appendChild(fadeOutStyle);
    
    // Close on escape key
    const escapeHandler = (e) => {
        if (e.key === 'Escape') {
            modal.style.animation = 'modalFadeOut 0.3s ease-out';
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.remove();
                }
            }, 300);
            document.removeEventListener('keydown', escapeHandler);
        }
    };
    document.addEventListener('keydown', escapeHandler);
}

// Brochure Download Tracking
document.addEventListener('DOMContentLoaded', () => {
    const brochureLinks = document.querySelectorAll('a[href*="Netzeal_Brochure.pdf"]');
    
    brochureLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // Add download tracking
            const linkType = link.classList.contains('btn-brochure') ? 'hero' : 
                            link.classList.contains('brochure-btn') ? 'about' : 
                            link.classList.contains('contact-brochure-btn') ? 'contact' : 'unknown';
            
            // Show download notification
            showNotification(`Brochure download started from ${linkType} section`, 'success');
            
            // Add download animation
            const icon = link.querySelector('i');
            if (icon) {
                icon.style.animation = 'downloadBounce 0.6s ease-out';
                setTimeout(() => {
                    icon.style.animation = '';
                }, 600);
            }
            
            // Optional: Track with analytics (replace with your tracking code)
            if (typeof gtag !== 'undefined') {
                gtag('event', 'download', {
                    'event_category': 'engagement',
                    'event_label': 'brochure_download',
                    'value': linkType
                });
            }
        });
        
        // Add hover effects
        link.addEventListener('mouseenter', () => {
            const icon = link.querySelector('i');
            if (icon) {
                icon.style.transform = 'scale(1.1) rotate(-5deg)';
            }
        });
        
        link.addEventListener('mouseleave', () => {
            const icon = link.querySelector('i');
            if (icon) {
                icon.style.transform = '';
            }
        });
    });
});

// Add download animation keyframes
const downloadAnimationStyle = document.createElement('style');
downloadAnimationStyle.textContent = `
    @keyframes downloadBounce {
        0%, 100% { transform: translateY(0) scale(1); }
        25% { transform: translateY(-8px) scale(1.1); }
        50% { transform: translateY(-4px) scale(1.05); }
        75% { transform: translateY(-2px) scale(1.02); }
    }
    
    /* Enhanced brochure hover effects */
    .brochure-card:hover .brochure-icon i {
        animation: pdfPulse 1s ease-in-out infinite;
    }
    
    @keyframes pdfPulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
    }
`;
document.head.appendChild(downloadAnimationStyle);

// Add active state styles
const activeLinkStyle = document.createElement('style');
activeLinkStyle.textContent = `
    .nav-link.active {
        color: var(--primary-color) !important;
    }
    .nav-link.active::after {
        width: 100% !important;
    }
`;
document.head.appendChild(activeLinkStyle);

// Scroll to Top Functionality
document.addEventListener('DOMContentLoaded', () => {
    const scrollBtn = document.getElementById("scrollToTop");
    
    if (scrollBtn) {
        // Show button when scrolled down 200px
        window.addEventListener("scroll", () => {
            if (window.scrollY > 200) {
                scrollBtn.classList.add('show');
                scrollBtn.style.display = "block";
            } else {
                scrollBtn.classList.remove('show');
                scrollBtn.style.display = "none";
            }
        });

        // Smooth scroll to top on click
        scrollBtn.addEventListener("click", () => {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
            
            // Add click animation
            scrollBtn.style.transform = 'scale(0.9)';
            setTimeout(() => {
                scrollBtn.style.transform = '';
            }, 150);
        });
    }
});
