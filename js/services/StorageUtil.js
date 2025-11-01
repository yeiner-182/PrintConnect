/**
 * Clase StorageUtils
 * Proporciona utilidades adicionales para gestión de datos y localStorage
 */
class StorageUtils {
    /**
     * Verifica si localStorage está disponible y funcional
     * Algunos navegadores en modo privado pueden bloquear localStorage
     */
    static isLocalStorageAvailable() {
        try {
            const testKey = '__storage_test__';
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
            return true;
        } catch (e) {
            console.warn('localStorage no está disponible:', e);
            return false;
        }
    }

    /**
     * Obtiene el tamaño aproximado usado en localStorage
     * Útil para monitorear cuánto espacio estamos usando
     */
    static getStorageSize() {
        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += localStorage[key].length + key.length;
            }
        }
        return {
            bytes: total,
            kilobytes: (total / 1024).toFixed(2),
            megabytes: (total / 1024 / 1024).toFixed(4)
        };
    }

    /**
     * Lista todas las claves relacionadas con PrintConnect
     */
    static getPrintConnectKeys() {
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('printconnect_')) {
                keys.push(key);
            }
        }
        return keys;
    }

    /**
     * Limpia todos los datos de PrintConnect del localStorage
     * Útil para "borrar todos los datos de la aplicación"
     */
    static clearAllPrintConnectData() {
        const keys = this.getPrintConnectKeys();
        keys.forEach(key => {
            localStorage.removeItem(key);
        });
        return keys.length;
    }

    /**
     * Crea un backup de todos los datos de PrintConnect
     * Retorna un objeto JSON que puede guardarse como archivo
     */
    static createBackup() {
        const backup = {
            version: '1.0',
            timestamp: new Date().toISOString(),
            data: {}
        };

        const keys = this.getPrintConnectKeys();
        keys.forEach(key => {
            try {
                backup.data[key] = localStorage.getItem(key);
            } catch (e) {
                console.error(`Error al hacer backup de ${key}:`, e);
            }
        });

        return backup;
    }

    /**
     * Restaura datos desde un backup
     */
    static restoreBackup(backup) {
        if (!backup || !backup.data) {
            return { success: false, message: 'Backup inválido' };
        }

        let restored = 0;
        let errors = 0;

        for (let key in backup.data) {
            try {
                localStorage.setItem(key, backup.data[key]);
                restored++;
            } catch (e) {
                console.error(`Error al restaurar ${key}:`, e);
                errors++;
            }
        }

        return {
            success: errors === 0,
            message: `Restaurados ${restored} elementos, ${errors} errores`,
            restored,
            errors
        };
    }

    /**
     * Descarga los datos como archivo JSON
     */
    static downloadBackup() {
        const backup = this.createBackup();
        const dataStr = JSON.stringify(backup, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `printconnect_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    /**
     * Valida la integridad de los datos almacenados
     * Verifica que los JSON sean válidos y estén correctamente formateados
     */
    static validateStorageIntegrity() {
        const keys = this.getPrintConnectKeys();
        const results = {
            total: keys.length,
            valid: 0,
            invalid: [],
            details: []
        };

        keys.forEach(key => {
            try {
                const value = localStorage.getItem(key);
                // Intentamos parsear si parece ser JSON
                if (value && (value.startsWith('{') || value.startsWith('['))) {
                    JSON.parse(value);
                }
                results.valid++;
                results.details.push({ key, status: 'valid' });
            } catch (e) {
                results.invalid.push(key);
                results.details.push({ key, status: 'invalid', error: e.message });
            }
        });

        return results;
    }

    /**
     * Obtiene información detallada sobre el almacenamiento
     */
    static getStorageInfo() {
        return {
            available: this.isLocalStorageAvailable(),
            size: this.getStorageSize(),
            printConnectKeys: this.getPrintConnectKeys().length,
            totalKeys: localStorage.length,
            integrity: this.validateStorageIntegrity()
        };
    }

    /**
     * Limpia datos antiguos o corruptos
     * Útil para mantenimiento automático
     */
    static cleanupStorage() {
        const validation = this.validateStorageIntegrity();
        let cleaned = 0;

        validation.invalid.forEach(key => {
            try {
                localStorage.removeItem(key);
                cleaned++;
            } catch (e) {
                console.error(`Error al limpiar ${key}:`, e);
            }
        });

        return {
            success: true,
            cleaned,
            message: `Se limpiaron ${cleaned} elementos corruptos`
        };
    }

    /**
     * Muestra información de debug en consola
     */
    static debugInfo() {
        console.group('🔍 PrintConnect Storage Debug Info');
        console.log('Storage disponible:', this.isLocalStorageAvailable());
        console.log('Tamaño usado:', this.getStorageSize());
        console.log('Claves de PrintConnect:', this.getPrintConnectKeys());
        console.log('Información completa:', this.getStorageInfo());
        console.groupEnd();
    }
}

/**
 * Clase SessionManager
 * Gestiona aspectos avanzados de la sesión del usuario
 */
class SessionManager {
    constructor(authService) {
        this.authService = authService;
        this.activityTimer = null;
        this.warningShown = false;
    }

    /**
     * Inicia el monitoreo de actividad del usuario
     * Actualiza la sesión cuando el usuario interactúa
     */
    startActivityMonitoring() {
        // Eventos que consideramos "actividad del usuario"
        const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
        
        const handleActivity = () => {
            if (this.authService.isLoggedIn()) {
                this.authService.refreshSession();
                this.warningShown = false;
            }
        };

        // Añadimos los listeners con throttling para evitar demasiadas actualizaciones
        let throttleTimer;
        const throttledHandler = () => {
            if (!throttleTimer) {
                throttleTimer = setTimeout(() => {
                    handleActivity();
                    throttleTimer = null;
                }, 60000); // Actualizamos máximo cada minuto
            }
        };

        events.forEach(event => {
            document.addEventListener(event, throttledHandler, { passive: true });
        });
    }

    /**
     * Verifica periódicamente si la sesión está por expirar
     * Muestra advertencias al usuario
     */
    startExpirationCheck() {
        // Verificamos cada 5 minutos
        setInterval(() => {
            if (!this.authService.isLoggedIn()) {
                return;
            }

            const loginTime = localStorage.getItem('printconnect_login_time');
            if (!loginTime) return;

            const elapsed = Date.now() - parseInt(loginTime);
            const duration = this.authService.SESSION_DURATION;
            const remaining = duration - elapsed;

            // Si quedan menos de 10 minutos y no hemos mostrado advertencia
            if (remaining < 10 * 60 * 1000 && !this.warningShown) {
                this.showExpirationWarning(Math.floor(remaining / 60000));
                this.warningShown = true;
            }

            // Si la sesión expiró
            if (remaining <= 0) {
                this.handleSessionExpired();
            }
        }, 5 * 60 * 1000); // Cada 5 minutos
    }

    /**
     * Muestra advertencia de expiración de sesión
     */
    showExpirationWarning(minutesRemaining) {
        console.warn(`⚠️ Tu sesión expirará en ${minutesRemaining} minutos`);
        // Aquí podrías mostrar una notificación en la UI
    }

    /**
     * Maneja cuando la sesión ha expirado
     */
    handleSessionExpired() {
        console.log('Sesión expirada. Cerrando sesión...');
        this.authService.logout();
        
        // Podrías redirigir al login o mostrar un mensaje
        if (typeof window !== 'undefined') {
            alert('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
            window.location.href = 'login.html';
        }
    }

    /**
     * Inicializa el gestor de sesiones completo
     */
    init() {
        if (StorageUtils.isLocalStorageAvailable()) {
            this.startActivityMonitoring();
            this.startExpirationCheck();
            console.log('✅ SessionManager inicializado');
        } else {
            console.warn('⚠️ localStorage no disponible, algunas funciones estarán limitadas');
        }
    }
}