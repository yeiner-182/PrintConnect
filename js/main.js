/**
 * Archivo principal - PrintConnect
 * Versión con localStorage funcional
 */

// Esperamos a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Inicializando PrintConnect...');

    // Verificamos localStorage
    if (!StorageUtils.isLocalStorageAvailable()) {
        console.error('❌ localStorage no está disponible');
        alert('Tu navegador no permite almacenamiento local. Algunas funciones estarán limitadas.');
    }

    // Inicializamos servicios
    const userRepository = new UserRepository();
    const authService = new AuthService(userRepository);
    const uiService = new UIService(authService);
    const sessionManager = new SessionManager(authService);

    // Clase principal de la aplicación
    class App {
        constructor() {
            this.authService = authService;
            this.uiService = uiService;
            this.userRepository = userRepository;
            this.sessionManager = sessionManager;
        }

        init() {
            console.log('⚙️ Inicializando aplicación...');

            // Inicializamos la UI
            this.uiService.init();
            
            // Configuramos event listeners
            this.setupEventListeners();
            
            // Verificamos página de descargas
            this.checkDownloadPage();
            
            // Iniciamos gestor de sesiones
            this.sessionManager.init();
            
            // Verificación de integridad
            this.startIntegrityCheck();

            console.log('✅ Aplicación inicializada correctamente');
            
            // Modo desarrollo
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                console.log('🔧 Modo desarrollo activado');
                StorageUtils.debugInfo();
            }
        }

        setupEventListeners() {
            // Formulario de login
            const loginForm = document.getElementById('loginForm');
            if (loginForm) {
                loginForm.addEventListener('submit', (e) => this.handleLogin(e));
                console.log('✓ Event listener: loginForm');
            }

            // Formulario de registro
            const registerForm = document.getElementById('registerForm');
            if (registerForm) {
                registerForm.addEventListener('submit', (e) => this.handleRegister(e));
                console.log('✓ Event listener: registerForm');
            }

            // Formulario de contacto
            const contactForm = document.getElementById('contactForm');
            if (contactForm) {
                contactForm.addEventListener('submit', (e) => this.handleContact(e));
                console.log('✓ Event listener: contactForm');
            }

            // Botón de logout
            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', () => this.handleLogout());
                console.log('✓ Event listener: logoutBtn');
            }

            // Botón de descarga del hero (IMPORTANTE)
            const heroDownloadBtn = document.getElementById('heroDownloadBtn');
            if (heroDownloadBtn) {
                heroDownloadBtn.addEventListener('click', () => this.handleHeroDownload());
                console.log('✓ Event listener: heroDownloadBtn');
            }

            // Botones de descarga por plataforma
            const downloadButtons = document.querySelectorAll('.download-btn');
            if (downloadButtons.length > 0) {
                downloadButtons.forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const platform = e.target.closest('.download-btn').dataset.platform;
                        this.uiService.downloadFile(platform);
                    });
                });
                console.log(`✓ Event listeners: ${downloadButtons.length} botones de descarga`);
            }

            // Botón de backup (opcional)
            const backupBtn = document.getElementById('backupBtn');
            if (backupBtn) {
                backupBtn.addEventListener('click', () => this.handleBackup());
            }

            // Botón de limpiar datos (opcional)
            const clearDataBtn = document.getElementById('clearDataBtn');
            if (clearDataBtn) {
                clearDataBtn.addEventListener('click', () => this.handleClearData());
            }
        }

        handleLogin(e) {
            e.preventDefault();
            console.log('📝 Intento de login...');

            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            // Limpiamos errores previos
            this.uiService.hideError('loginError');

            // Validación básica
            if (!email || !password) {
                this.uiService.showError('loginError', 'Por favor completa todos los campos');
                return;
            }

            // Intentamos login
            const result = this.authService.login(email, password);

            if (result.success) {
                console.log('✅ Login exitoso:', result.user.name);
                
                // Guardamos preferencia de recordar
                const rememberMe = document.getElementById('rememberMe');
                if (rememberMe && rememberMe.checked) {
                    localStorage.setItem('printconnect_remember', 'true');
                }
                
                // Mostramos notificación
                this.uiService.showNotification(result.message, 'success', 2000);
                
                // Limpiamos formulario
                this.uiService.clearForm('loginForm');
                
                // Redirigimos
                setTimeout(() => {
                    this.uiService.redirect('index.html');
                }, 1000);
            } else {
                console.log('❌ Error en login:', result.message);
                this.uiService.showError('loginError', result.message);
                this.uiService.showNotification(result.message, 'error', 3000);
            }
        }

        handleRegister(e) {
            e.preventDefault();
            console.log('📝 Intento de registro...');

            const name = document.getElementById('registerName').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const passwordConfirm = document.getElementById('registerPasswordConfirm').value;

            // Limpiamos mensajes previos
            this.uiService.hideError('registerError');
            this.uiService.hideSuccess('registerSuccess');

            // Validación básica
            if (!name || !email || !password || !passwordConfirm) {
                this.uiService.showError('registerError', 'Por favor completa todos los campos');
                this.uiService.showNotification('Por favor completa todos los campos', 'warning', 3000);
                return;
            }

            // Intentamos registrar
            const result = this.authService.register(name, email, password, passwordConfirm);

            if (result.success) {
                console.log('✅ Registro exitoso:', email);
                console.log('📊 Total usuarios:', this.userRepository.countUsers());
                
                // Mostramos éxito
                this.uiService.showSuccess('registerSuccess', result.message);
                this.uiService.showNotification(result.message, 'success', 3000);
                
                // Limpiamos formulario
                this.uiService.clearForm('registerForm');
                
                // Redirigimos a login
                setTimeout(() => {
                    this.uiService.redirect('login.html');
                }, 2000);
            } else {
                console.log('❌ Error en registro:', result.errors);
                const errorMessage = result.errors.join(', ');
                this.uiService.showError('registerError', errorMessage);
                this.uiService.showNotification(errorMessage, 'error', 4000);
            }
        }

        handleLogout() {
            console.log('👋 Cerrando sesión...');
            
            const result = this.authService.logout();
            
            if (result.success) {
                // Limpiamos preferencia de recordar
                localStorage.removeItem('printconnect_remember');
                
                // Mostramos notificación
                this.uiService.showNotification(result.message, 'success', 2000);
                
                // Redirigimos
                setTimeout(() => {
                    this.uiService.redirect('index.html');
                }, 1000);
            }
        }

        handleContact(e) {
            e.preventDefault();
            console.log('📧 Enviando mensaje de contacto...');

            const name = document.getElementById('contactName').value;
            const email = document.getElementById('contactEmail').value;
            const subject = document.getElementById('contactSubject').value;
            const message = document.getElementById('contactMessage').value;

            // Validación
            if (!name || !email || !subject || !message) {
                this.uiService.showNotification('Por favor completa todos los campos', 'warning', 3000);
                return;
            }

            // Guardamos en historial
            this.saveContactMessage({ name, email, subject, message });

            // Mostramos éxito
            this.uiService.showSuccess('contactSuccess', '¡Gracias por contactarnos! Responderemos pronto.');
            this.uiService.showNotification('¡Mensaje enviado exitosamente!', 'success', 3000);
            this.uiService.clearForm('contactForm');

            setTimeout(() => {
                this.uiService.hideSuccess('contactSuccess');
            }, 5000);
        }

        handleHeroDownload() {
            console.log('🔽 Click en botón de descarga (hero)');
            
            if (this.authService.isLoggedIn()) {
                console.log('✅ Usuario autenticado, redirigiendo a descargas');
                this.uiService.redirect('descargas.html');
            } else {
                console.log('⚠️ Usuario NO autenticado');
                this.uiService.showNotification(
                    'Debes iniciar sesión para descargar PrintConnect', 
                    'warning', 
                    3000
                );
                setTimeout(() => {
                    this.uiService.redirect('login.html');
                }, 2000);
            }
        }

        checkDownloadPage() {
            const currentPage = window.location.pathname.split('/').pop();
            
            if (currentPage === 'descargas.html') {
                console.log('📄 Página de descargas detectada');
                
                if (!this.authService.isLoggedIn()) {
                    console.log('❌ Sin autenticación, redirigiendo...');
                    this.uiService.showNotification(
                        'Debes iniciar sesión para acceder a las descargas',
                        'warning',
                        3000
                    );
                    setTimeout(() => {
                        this.uiService.redirect('login.html');
                    }, 1500);
                } else {
                    console.log('✅ Usuario autenticado en página de descargas');
                    this.logPageAccess('descargas');
                }
            }
        }

        saveContactMessage(data) {
            try {
                const messages = JSON.parse(localStorage.getItem('printconnect_contact_history') || '[]');
                messages.push({
                    ...data,
                    timestamp: new Date().toISOString(),
                    id: Date.now()
                });
                
                // Límite de 50 mensajes
                if (messages.length > 50) {
                    messages.shift();
                }
                
                localStorage.setItem('printconnect_contact_history', JSON.stringify(messages));
                console.log('💾 Mensaje de contacto guardado');
            } catch (error) {
                console.error('Error al guardar mensaje:', error);
            }
        }

        logPageAccess(pageName) {
            try {
                const logs = JSON.parse(localStorage.getItem('printconnect_page_logs') || '[]');
                const user = this.authService.getCurrentUser();
                
                logs.push({
                    page: pageName,
                    user: user ? user.email : 'anonymous',
                    timestamp: new Date().toISOString()
                });
                
                // Límite de 100 registros
                if (logs.length > 100) {
                    logs.shift();
                }
                
                localStorage.setItem('printconnect_page_logs', JSON.stringify(logs));
            } catch (error) {
                console.error('Error al registrar acceso:', error);
            }
        }

        handleBackup() {
            try {
                StorageUtils.downloadBackup();
                this.uiService.showNotification('Backup descargado exitosamente', 'success', 3000);
            } catch (error) {
                console.error('Error al crear backup:', error);
                this.uiService.showNotification('Error al crear el backup', 'error', 3000);
            }
        }

        handleClearData() {
            const confirmation = confirm(
                '⚠️ ADVERTENCIA ⚠️\n\n' +
                'Esto eliminará TODOS los datos de PrintConnect incluyendo:\n' +
                '- Usuarios registrados\n' +
                '- Sesión actual\n' +
                '- Historial de contacto\n' +
                '- Logs de acceso\n\n' +
                '¿Estás seguro?'
            );

            if (confirmation) {
                const doubleCheck = confirm('¿Realmente seguro? Esta acción NO se puede deshacer.');
                
                if (doubleCheck) {
                    const items = StorageUtils.clearAllPrintConnectData();
                    this.uiService.showNotification(
                        `Se eliminaron ${items} elementos. Recargando...`,
                        'info',
                        2000
                    );
                    setTimeout(() => window.location.reload(), 2000);
                }
            }
        }

        startIntegrityCheck() {
            // Verificamos cada hora
            setInterval(() => {
                const integrity = StorageUtils.validateStorageIntegrity();
                
                if (integrity.invalid.length > 0) {
                    console.warn('⚠️ Datos corruptos detectados:', integrity.invalid);
                    const cleanup = StorageUtils.cleanupStorage();
                    console.log('🧹 Limpieza:', cleanup);
                }
            }, 60 * 60 * 1000);
        }

        getAppStats() {
            return {
                auth: this.authService.getStats(),
                storage: StorageUtils.getStorageInfo(),
                users: {
                    total: this.userRepository.countUsers(),
                    list: this.userRepository.getAllUsers().map(u => ({
                        name: u.name,
                        email: u.email,
                        createdAt: u.createdAt
                    }))
                }
            };
        }

        devInfo() {
            console.group('🔧 PrintConnect - Información de Desarrollo');
            console.log('📊 Estadísticas:', this.getAppStats());
            console.log('👤 Usuario actual:', this.authService.getCurrentUser());
            console.log('🔐 Sesión activa:', this.authService.isLoggedIn());
            StorageUtils.debugInfo();
            console.groupEnd();
        }
    }

    // Inicializamos la aplicación
    const app = new App();
    app.init();
    
    // Exponemos globalmente para debugging
    window.app = app;
    window.StorageUtils = StorageUtils;
    window.printConnectDevInfo = () => app.devInfo();
    
    // Mensaje de bienvenida
    console.log(
        '%c🖨️ PrintConnect %cv1.5.2',
        'font-size: 20px; font-weight: bold; color: #1B7FA8;',
        'font-size: 12px; color: #666;'
    );
    console.log(
        '%cComandos disponibles:\n' +
        '- printConnectDevInfo() - Información de desarrollo\n' +
        '- StorageUtils.debugInfo() - Info de almacenamiento\n' +
        '- app.getAppStats() - Estadísticas',
        'color: #888; font-family: monospace;'
    );
});