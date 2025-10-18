/**
 * Clase UIService
 * Maneja la interfaz de usuario
 */
class UIService {
    constructor(authService) {
        this.authService = authService;
    }

    init() {
        this.updateNavbar();
    }

    updateNavbar() {
        const authButtons = document.getElementById('authButtons');
        const userSection = document.getElementById('userSection');
        const userName = document.getElementById('userName');
        const downloadNavItem = document.getElementById('downloadNavItem');

        if (!authButtons || !userSection) return;

        if (this.authService.isLoggedIn()) {
            const currentUser = this.authService.getCurrentUser();
            
            authButtons.classList.add('hidden');
            userSection.classList.remove('hidden');
            
            if (userName) {
                userName.textContent = `Hola, ${currentUser.name}`;
            }

            if (downloadNavItem) {
                downloadNavItem.style.display = 'block';
            }
        } else {
            authButtons.classList.remove('hidden');
            userSection.classList.add('hidden');

            if (downloadNavItem) {
                downloadNavItem.style.display = 'none';
            }
        }
    }

    showError(elementId, message) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = message;
            element.classList.remove('hidden');
        }
    }

    hideError(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.add('hidden');
        }
    }

    showSuccess(elementId, message) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = message;
            element.classList.remove('hidden');
        }
    }

    hideSuccess(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.add('hidden');
        }
    }

    clearForm(formId) {
        const form = document.getElementById(formId);
        if (form) {
            form.reset();
        }
    }

    showAlert(message) {
        alert(message);
    }

    redirect(url, delay = 0) {
        setTimeout(() => {
            window.location.href = url;
        }, delay);
    }

    requireAuth(redirectUrl = 'login.html') {
        if (!this.authService.isLoggedIn()) {
            this.showAlert('Debes iniciar sesión para acceder a esta página');
            this.redirect(redirectUrl);
            return false;
        }
        return true;
    }

    downloadFile(platform) {
        const platformNames = {
            'windows': 'Windows',
            'macos': 'macOS',
            'linux': 'Linux'
        };

        const fileExtensions = {
            'windows': '.exe',
            'macos': '.dmg',
            'linux': '.deb'
        };

        const platformName = platformNames[platform] || platform;
        const fileExt = fileExtensions[platform] || '';

        this.showAlert(
            `Iniciando descarga de PrintConnect para ${platformName}...\n\n` +
            `Archivo: PrintConnect_v1.5.2${fileExt}\n` +
            `Esta es una simulación.`
        );
    }
}