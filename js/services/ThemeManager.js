/**
 * ThemeManager - Gestión de Dark Mode + Loading Screen
 * Este archivo maneja el tema y la pantalla de carga
 */

class ThemeManager {
    constructor() {
        this.STORAGE_KEY = 'printconnect_theme';
        this.currentTheme = this.loadTheme();
        this.loadingScreen = null;
        this.loadingMessages = [
            'Conectando impresoras...',
            'Optimizando rendimiento...',
            'Impriendo...',
            'Preparando experiencia...',
            'Casi listo...'
        ];
        this.currentMessageIndex = 0;
    }

    /**
     * Inicializa el sistema de temas y loading
     */
    init() {
        // Crear loading screen
        this.createLoadingScreen();
        
        // Aplicar tema guardado inmediatamente
        this.applyTheme(this.currentTheme, false);
        
        // Crear toggle button
        this.createThemeToggle();
        
        // Simular carga de recursos
        this.simulateLoading();
        
        console.log('✅ ThemeManager inicializado');
    }

    /**
     * Crea la pantalla de carga
     */
    createLoadingScreen() {
        // Verificar si ya existe
        if (document.getElementById('loadingScreen')) {
            this.loadingScreen = document.getElementById('loadingScreen');
            return;
        }

        // Crear elemento
        const loadingHTML = `
            <div id="loadingScreen">
                <img src="img/logo-large-svg.svg" alt="PrintConnect" class="loading-logo">
                <div class="loading-spinner"></div>
                <div class="loading-text" id="loadingText">Iniciando PrintConnect...</div>
                <div class="loading-subtext">Gestor de impresión inteligente</div>
                <div class="loading-progress">
                    <div class="loading-progress-bar"></div>
                </div>
            </div>
        `;

        // Insertar al inicio del body
        document.body.insertAdjacentHTML('afterbegin', loadingHTML);
        this.loadingScreen = document.getElementById('loadingScreen');
    }

    /**
     * Simula la carga de recursos con mensajes dinámicos
     */
    simulateLoading() {
        // Cambiar mensaje cada 400ms
        const messageInterval = setInterval(() => {
            this.currentMessageIndex++;
            if (this.currentMessageIndex < this.loadingMessages.length) {
                const loadingText = document.getElementById('loadingText');
                if (loadingText) {
                    loadingText.textContent = this.loadingMessages[this.currentMessageIndex];
                }
            }
        }, 400);

        // Ocultar loading después de 2 segundos
        setTimeout(() => {
            clearInterval(messageInterval);
            this.hideLoading();
        }, 1500);
    }

    /**
     * Oculta la pantalla de carga
     */
    hideLoading() {
        if (this.loadingScreen) {
            this.loadingScreen.classList.add('hide');
            
            // Remover del DOM después de la animación
            setTimeout(() => {
                if (this.loadingScreen && this.loadingScreen.parentNode) {
                    this.loadingScreen.parentNode.removeChild(this.loadingScreen);
                }
            }, 500);
        }
    }

    /**
     * Crea el botón de toggle del tema
     */
    createThemeToggle() {
        // Verificar si ya existe
        if (document.querySelector('.theme-toggle-container')) {
            this.attachToggleEvents();
            return;
        }

        // Crear elemento
        const toggleHTML = `
            <div class="theme-toggle-container">
                <div class="theme-toggle" id="themeToggle">
                    <i class="fas fa-sun theme-icon sun"></i>
                    <div class="theme-switch"></div>
                    <i class="fas fa-moon theme-icon moon"></i>
                </div>
            </div>
        `;

        // Insertar en el body
        document.body.insertAdjacentHTML('beforeend', toggleHTML);
        
        // Adjuntar eventos
        this.attachToggleEvents();
    }

    /**
     * Adjunta eventos al botón de toggle
     */
    attachToggleEvents() {
        const toggle = document.getElementById('themeToggle');
        if (toggle) {
            toggle.addEventListener('click', () => this.toggleTheme());
        }
    }

    /**
     * Alterna entre light y dark mode
     */
    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme, true);
        this.currentTheme = newTheme;
        this.saveTheme(newTheme);
    }

    /**
     * Aplica el tema al documento
     */
    applyTheme(theme, animate = true) {
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }

        // Animación de transición
        if (animate) {
            this.animateThemeChange();
        }
    }

    /**
     * Animación visual al cambiar de tema
     */
    animateThemeChange() {
        // Efecto de flash sutil
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: ${this.currentTheme === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'};
            pointer-events: none;
            z-index: 99999;
            animation: fadeFlash 0.4s ease;
        `;

        // Agregar keyframe si no existe
        if (!document.getElementById('themeAnimationStyle')) {
            const style = document.createElement('style');
            style.id = 'themeAnimationStyle';
            style.textContent = `
                @keyframes fadeFlash {
                    0% { opacity: 0; }
                    50% { opacity: 1; }
                    100% { opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(overlay);

        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        }, 300);
    }

    /**
     * Guarda el tema en localStorage
     */
    saveTheme(theme) {
        try {
            localStorage.setItem(this.STORAGE_KEY, theme);
        } catch (error) {
            console.error('Error al guardar tema:', error);
        }
    }

    /**
     * Carga el tema desde localStorage
     */
    loadTheme() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            return saved || 'light';
        } catch (error) {
            console.error('Error al cargar tema:', error);
            return 'light';
        }
    }

    /**
     * Obtiene el tema actual
     */
    getCurrentTheme() {
        return this.currentTheme;
    }

    /**
     * Detecta preferencia del sistema operativo
     */
    detectSystemTheme() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    }

    /**
     * Usa la preferencia del sistema si no hay tema guardado
     */
    useSystemTheme() {
        const systemTheme = this.detectSystemTheme();
        this.applyTheme(systemTheme, false);
        this.currentTheme = systemTheme;
        this.saveTheme(systemTheme);
    }
}

// Inicializar INMEDIATAMENTE (antes del DOMContentLoaded)
// Esto previene el flash de contenido sin estilo
const themeManager = new ThemeManager();

// Aplicar tema guardado ANTES de que se muestre contenido
document.addEventListener('DOMContentLoaded', () => {
    themeManager.init();
    
    // Exponer globalmente para debugging
    window.themeManager = themeManager;
    
    console.log('🎨 Tema actual:', themeManager.getCurrentTheme());
});

// También aplicar tema inmediatamente si el script se ejecuta después del DOM
if (document.readyState === 'loading') {
    // DOM aún cargando
} else {
    // DOM ya cargado
    themeManager.applyTheme(themeManager.currentTheme, false);
}