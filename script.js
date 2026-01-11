// ============================================
// GIF ANIMATA - Le GIF si riproducono automaticamente in loop
// Nessun codice JavaScript necessario
// ============================================

// ============================================
// NAVIGAZIONE E MENU MOBILE
// ============================================

const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-menu a');
const header = document.querySelector('header');

// Toggle menu mobile
if (hamburger) {
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    });
}

// Gestione dropdown menu
const dropdowns = document.querySelectorAll('.dropdown');
dropdowns.forEach(dropdown => {
    const toggle = dropdown.querySelector('.dropdown-toggle');
    if (toggle) {
        toggle.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                dropdown.classList.toggle('active');
            }
        });
    }
});

// Chiudi menu quando si clicca su un link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
        document.body.style.overflow = '';
        // Chiudi anche i dropdown
        dropdowns.forEach(dropdown => {
            dropdown.classList.remove('active');
        });
    });
});

// Chiudi menu quando si clicca fuori
document.addEventListener('click', (e) => {
    if (hamburger && navMenu && !hamburger.contains(e.target) && !navMenu.contains(e.target)) {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// ============================================
// SMOOTH SCROLL
// ============================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const target = document.querySelector(targetId);
        
        if (target && header) {
            const headerHeight = header.offsetHeight;
            const targetPosition = target.offsetTop - headerHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ============================================
// HEADER SCROLL EFFECT
// ============================================

let lastScroll = 0;
const scrollThreshold = 50;

window.addEventListener('scroll', () => {
    if (!header) return;
    
    const currentScroll = window.pageYOffset;
    
    // Aggiungi ombra quando si scrolla
    if (currentScroll > scrollThreshold) {
        header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
        header.style.backgroundColor = 'rgba(255, 255, 255, 0.98)';
        header.style.backdropFilter = 'blur(10px)';
    } else {
        header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        header.style.backgroundColor = '#ffffff';
        header.style.backdropFilter = 'none';
    }
    
    lastScroll = currentScroll;
});

// ============================================
// ANIMAZIONI AL SCROLL (Intersection Observer)
// ============================================

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

// Osserva gli elementi da animare
document.addEventListener('DOMContentLoaded', () => {
    const animateElements = document.querySelectorAll('.service-card, .about-text, .contact-form');
    
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// ============================================
// VALIDAZIONE FORM AVANZATA
// ============================================

const contactForm = document.querySelector('.contact-form');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const messageInput = document.getElementById('message');

if (contactForm && nameInput && emailInput && messageInput) {
    // Validazione in tempo reale
    nameInput.addEventListener('input', () => {
        validateField(nameInput, nameInput.value.trim().length >= 2, 'Il nome deve contenere almeno 2 caratteri');
    });

    emailInput.addEventListener('input', () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        validateField(emailInput, emailRegex.test(emailInput.value), 'Inserisci un indirizzo email valido');
    });

    messageInput.addEventListener('input', () => {
        validateField(messageInput, messageInput.value.trim().length >= 10, 'Il messaggio deve contenere almeno 10 caratteri');
    });

    function validateField(field, isValid, errorMessage) {
        const formGroup = field.closest('.form-group');
        let errorElement = formGroup.querySelector('.error-message');
        
        if (!isValid && field.value.length > 0) {
            if (!errorElement) {
                errorElement = document.createElement('span');
                errorElement.className = 'error-message';
                formGroup.appendChild(errorElement);
            }
            errorElement.textContent = errorMessage;
            field.style.borderColor = '#e74c3c';
        } else {
            if (errorElement) {
                errorElement.remove();
            }
            field.style.borderColor = field.value.length > 0 ? '#4a90e2' : '#e0e0e0';
        }
    }

    // Submit form
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Validazione finale
        const nameValid = nameInput.value.trim().length >= 2;
        const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value);
        const messageValid = messageInput.value.trim().length >= 10;
        
        if (nameValid && emailValid && messageValid) {
            // Simula invio
            const submitButton = contactForm.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            
            submitButton.textContent = 'Invio in corso...';
            submitButton.disabled = true;
            
            // Simula chiamata API
            setTimeout(() => {
                showNotification('Messaggio inviato con successo!', 'success');
                contactForm.reset();
                submitButton.textContent = originalText;
                submitButton.disabled = false;
                
                // Reset stili dei campi
                [nameInput, emailInput, messageInput].forEach(field => {
                    field.style.borderColor = '#e0e0e0';
                });
            }, 1500);
        } else {
            showNotification('Per favore, compila tutti i campi correttamente.', 'error');
        }
    });
}

// ============================================
// NOTIFICHE
// ============================================

function showNotification(message, type = 'success') {
    // Rimuovi notifiche esistenti
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Crea notifica
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Mostra notifica
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Rimuovi notifica dopo 3 secondi
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// ============================================
// EFFETTO PARALLAX SULL'HERO
// ============================================

const hero = document.querySelector('.hero');
if (hero) {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const heroContent = hero.querySelector('.container');
        if (heroContent && scrolled < hero.offsetHeight) {
            heroContent.style.transform = `translateY(${scrolled * 0.5}px)`;
            heroContent.style.opacity = 1 - (scrolled / hero.offsetHeight);
        }
    });
}

// ============================================
// HIGHLIGHT NAVIGAZIONE ATTIVA
// ============================================

function updateActiveNav() {
    if (!header) return;
    
    const sections = document.querySelectorAll('section[id]');
    const scrollPosition = window.pageYOffset + header.offsetHeight + 100;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        const navLink = document.querySelector(`.nav-menu a[href="#${sectionId}"]`);
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            navLinks.forEach(link => link.classList.remove('active'));
            if (navLink) {
                navLink.classList.add('active');
            }
        }
    });
}

window.addEventListener('scroll', updateActiveNav);
updateActiveNav(); // Chiamata iniziale

// ============================================
// ANIMAZIONE CARDS AL HOVER
// ============================================

const serviceCards = document.querySelectorAll('.service-card');
serviceCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// ============================================
// PREVENZIONE SCROLL QUANDO MENU È APERTO
// ============================================

window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && navMenu && hamburger) {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// ============================================
// LAZY LOADING PER IMMAGINI (se aggiunte in futuro)
// ============================================

if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            }
        });
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// ============================================
// BACK TO TOP BUTTON (opzionale)
// ============================================

// Crea il pulsante "torna su"
const backToTopButton = document.createElement('button');
backToTopButton.innerHTML = '↑';
backToTopButton.className = 'back-to-top';
backToTopButton.setAttribute('aria-label', 'Torna su');
document.body.appendChild(backToTopButton);

// Mostra/nascondi il pulsante
window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        backToTopButton.classList.add('show');
    } else {
        backToTopButton.classList.remove('show');
    }
});

// Scroll to top
backToTopButton.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});
