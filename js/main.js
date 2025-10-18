/**
 * Archivo principal
 */

const userRepository = new UserRepository();
const authService = new AuthService(userRepository);
const uiService = new UIService(authService);

class App {
    constructor() {
        this.authService = authService;
        this.uiService = uiService;
        this.userRepository = userRepository;
    }

    init() {
        this.uiService.init();
        this.setupEventListeners();
        this.checkDownloadPage();
    }

    setupEventListeners() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => this.handleContact(e));
        }

        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }

        const heroDownloadBtn = document.getElementById('heroDownloadBtn');
        if (heroDownloadBtn) {
            heroDownloadBtn.addEventListener('click', () => this.handleHeroDownload());
        }

        const downloadButtons = document.querySelectorAll('.download-btn');
        downloadButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const platform = e.target.closest('.download-btn').dataset.platform;
                this.uiService.downloadFile(platform);
            });
        });
    }

    handleLogin(e) {
        e.preventDefault();

        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        this.uiService.hideError('loginError');

        const result = this.authService.login(email, password);

        if (result.success) {
            this.uiService.showAlert(result.message);
            this.uiService.clearForm('loginForm');
            this.uiService.redirect('index.html', 500);
        } else {
            this.uiService.showError('loginError', result.message);
        }
    }

    handleRegister(e) {
        e.preventDefault();

        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const passwordConfirm = document.getElementById('registerPasswordConfirm').value;

        this.uiService.hideError('registerError');
        this.uiService.hideSuccess('registerSuccess');

        const result = this.authService.register(name, email, password, passwordConfirm);

        if (result.success) {
            this.uiService.showSuccess('registerSuccess', result.message);
            this.uiService.clearForm('registerForm');
            
            setTimeout(() => {
                this.uiService.redirect('login.html');
            }, 2000);
        } else {
            const errorMessage = result.errors.join(', ');
            this.uiService.showError('registerError', errorMessage);
        }
    }

    handleLogout() {
        const result = this.authService.logout();
        
        if (result.success) {
            this.uiService.showAlert(result.message);
            this.uiService.redirect('index.html', 500);
        }
    }

    handleContact(e) {
        e.preventDefault();

        const name = document.getElementById('contactName').value;
        const email = document.getElementById('contactEmail').value;
        const subject = document.getElementById('contactSubject').value;
        const message = document.getElementById('contactMessage').value;

        this.uiService.showSuccess('contactSuccess', '¡Gracias por contactarnos! Responderemos pronto.');
        this.uiService.clearForm('contactForm');

        setTimeout(() => {
            this.uiService.hideSuccess('contactSuccess');
        }, 3000);
    }

    handleHeroDownload() {
        if (this.authService.isLoggedIn()) {
            this.uiService.redirect('descargas.html');
        } else {
            this.uiService.showAlert('Debes iniciar sesión para descargar PrintConnect');
            this.uiService.redirect('login.html', 1000);
        }
    }

    checkDownloadPage() {
        const currentPage = window.location.pathname.split('/').pop();
        
        if (currentPage === 'descargas.html') {
            if (!this.authService.isLoggedIn()) {
                this.uiService.showAlert('Debes iniciar sesión para acceder a las descargas');
                this.uiService.redirect('login.html');
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
    window.app = app;
});