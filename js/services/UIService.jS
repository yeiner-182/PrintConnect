/**
 * Clase UIService
 * Maneja toda la interfaz de usuario incluyendo notificaciones modernas
 */
class UIService {
    constructor(authService) {
        this.authService = authService;
        this.notificationContainer = null;
        this.initNotificationSystem();
    }

    /**
     * Inicializa el sistema de notificaciones
     */
    initNotificationSystem() {
        // Crear contenedor de notificaciones si no existe
        if (!document.getElementById('notificationContainer')) {
            const container = document.createElement('div');
            container.id = 'notificationContainer';
            document.body.appendChild(container);
            this.notificationContainer = container;
        } else {
            this.notificationContainer = document.getElementById('notificationContainer');
        }
    }

    /**
     * Inicializa la UI
     */
    init() {
        this.updateNavbar();
        console.log('✅ UIService inicializado');
    }

    /**
     * Actualiza el navbar según el estado de autenticación
     */
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

    /**
     * Muestra una notificación moderna
     * @param {string} message - Mensaje a mostrar
     * @param {string} type - Tipo: 'success', 'error', 'warning', 'info'
     * @param {number} duration - Duración en ms (0 = no cierra automáticamente)
     */
    showNotification(message, type = 'info', duration = 5000) {
        // Asegurar que el contenedor existe
        if (!this.notificationContainer) {
            this.initNotificationSystem();
        }

        // Crear la notificación
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        // Iconos según el tipo
        const icons = {
            success: '<i class="fas fa-check-circle"></i>',
            error: '<i class="fas fa-times-circle"></i>',
            warning: '<i class="fas fa-exclamation-triangle"></i>',
            info: '<i class="fas fa-info-circle"></i>'
        };

        // Títulos según el tipo
        const titles = {
            success: '¡Éxito!',
            error: 'Error',
            warning: 'Advertencia',
            info: 'Información'
        };

        notification.innerHTML = `
            <div class="notification-icon">
                ${icons[type]}
            </div>
            <div class="notification-content">
                <div class="notification-title">${titles[type]}</div>
                <p class="notification-message">${message}</p>
            </div>
            <button class="notification-close">×</button>
            ${duration > 0 ? '<div class="notification-progress"></div>' : ''}
        `;

        // Añadir al contenedor
        this.notificationContainer.appendChild(notification);

        // Animación de entrada
        setTimeout(() => notification.classList.add('show'), 10);

        // Botón de cerrar
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            this.closeNotification(notification);
        });

        // Cerrar automáticamente si duration > 0
        if (duration > 0) {
            setTimeout(() => {
                this.closeNotification(notification);
            }, duration);
        }

        return notification;
    }

    /**
     * Cierra una notificación
     */
    closeNotification(notification) {
        notification.classList.remove('show');
        notification.classList.add('hide');
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 400);
    }

    /**
     * Muestra error en elemento específico (para formularios)
     */
    showError(elementId, message) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = message;
            element.classList.remove('hidden');
        }
    }

    /**
     * Oculta error de elemento específico
     */
    hideError(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.add('hidden');
        }
    }

    /**
     * Muestra mensaje de éxito en elemento específico
     */
    showSuccess(elementId, message) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = message;
            element.classList.remove('hidden');
        }
    }

    /**
     * Oculta mensaje de éxito
     */
    hideSuccess(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.add('hidden');
        }
    }

    /**
     * Limpia un formulario
     */
    clearForm(formId) {
        const form = document.getElementById(formId);
        if (form) {
            form.reset();
        }
    }

    /**
     * Muestra alerta usando el sistema de notificaciones
     * Compatible con el código anterior pero usa notificaciones modernas
     */
    showAlert(message, type = 'info') {
        this.showNotification(message, type, 5000);
    }

    /**
     * Redirige a una URL con delay opcional
     */
    redirect(url, delay = 0) {
        setTimeout(() => {
            window.location.href = url;
        }, delay);
    }

    /**
     * Requiere autenticación, redirige si no está logueado
     */
    requireAuth(redirectUrl = 'login.html') {
        if (!this.authService.isLoggedIn()) {
            this.showNotification('Debes iniciar sesión para acceder a esta página', 'warning', 3000);
            setTimeout(() => {
                this.redirect(redirectUrl);
            }, 1000);
            return false;
        }
        return true;
    }

    /**
     * Simula la descarga de un archivo
     */
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

        this.showNotification(
            `Iniciando descarga de PrintConnect para ${platformName}... (PrintConnect_v1.5.2${fileExt})`,
            'success',
            4000
        );
    }

    /**
     * Muestra un diálogo de confirmación moderno
     */
    showConfirm(message, onConfirm, onCancel) {
        // Por ahora usamos confirm nativo, pero podríamos crear uno personalizado
        if (confirm(message)) {
            if (onConfirm) onConfirm();
        } else {
            if (onCancel) onCancel();
        }
    }

    /**
     * Muestra loading/spinner (para futuras implementaciones)
     */
    showLoading(message = 'Cargando...') {
        // TODO: Implementar spinner personalizado
        console.log('Loading:', message);
    }

    /**
     * Oculta loading
     */
    hideLoading() {
        // TODO: Implementar
        console.log('Loading finished');
    }
}