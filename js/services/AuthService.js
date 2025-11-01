/**
 * Clase AuthService
 * Maneja la autenticación con mejoras de seguridad
 */
class AuthService {
    constructor(userRepository) {
        this.userRepository = userRepository;
        // Configuración de sesión
        this.SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 horas en milisegundos
    }

    /**
     * Registra un nuevo usuario en el sistema
     * Valida que las contraseñas coincidan y que los datos sean correctos
     */
    register(name, email, password, passwordConfirm) {
        // Validación de coincidencia de contraseñas
        if (password !== passwordConfirm) {
            return {
                success: false,
                message: 'Las contraseñas no coinciden',
                errors: ['Las contraseñas no coinciden']
            };
        }

        // Creamos el objeto usuario
        const user = new User(name, email, password);

        // Validamos los datos del usuario
        const validation = user.validate();
        if (!validation.valid) {
            return {
                success: false,
                message: 'Datos inválidos',
                errors: validation.errors
            };
        }

        // Intentamos agregar el usuario al repositorio
        const added = this.userRepository.addUser(user);
        if (!added) {
            return {
                success: false,
                message: 'El correo ya está registrado',
                errors: ['El correo ya está registrado']
            };
        }

        return {
            success: true,
            message: '¡Cuenta creada exitosamente!',
            errors: []
        };
    }

    /**
     * Inicia sesión de un usuario
     * Verifica credenciales y establece la sesión
     */
    login(email, password) {
        // Buscamos el usuario por email
        const user = this.userRepository.findByEmail(email);

        if (!user) {
            return {
                success: false,
                message: 'Correo o contraseña incorrectos',
                user: null
            };
        }

        // Verificamos la contraseña
        if (!user.checkPassword(password)) {
            return {
                success: false,
                message: 'Correo o contraseña incorrectos',
                user: null
            };
        }

        // Establecemos el usuario actual (esto guarda en localStorage)
        this.userRepository.setCurrentUser(user);

        // Guardamos timestamp del login para control de sesión
        this.saveLoginTime();

        return {
            success: true,
            message: `¡Bienvenido ${user.name}!`,
            user: user
        };
    }

    /**
     * Cierra la sesión del usuario actual
     */
    logout() {
        if (!this.userRepository.isUserLoggedIn()) {
            return {
                success: false,
                message: 'No hay sesión activa'
            };
        }

        // Limpiamos el usuario actual (esto limpia el localStorage)
        this.userRepository.clearCurrentUser();
        this.clearLoginTime();

        return {
            success: true,
            message: 'Sesión cerrada exitosamente'
        };
    }

    /**
     * Obtiene el usuario actualmente logueado
     * Verifica que la sesión no haya expirado
     */
    getCurrentUser() {
        // Verificamos si la sesión sigue válida
        if (this.isSessionExpired()) {
            this.logout();
            return null;
        }
        return this.userRepository.getCurrentUser();
    }

    /**
     * Verifica si hay un usuario logueado con sesión válida
     */
    isLoggedIn() {
        if (this.isSessionExpired()) {
            this.logout();
            return false;
        }
        return this.userRepository.isUserLoggedIn();
    }

    /**
     * Guarda el tiempo de inicio de sesión
     */
    saveLoginTime() {
        try {
            localStorage.setItem('printconnect_login_time', Date.now().toString());
        } catch (error) {
            console.error('Error al guardar tiempo de login:', error);
        }
    }

    /**
     * Limpia el tiempo de inicio de sesión
     */
    clearLoginTime() {
        try {
            localStorage.removeItem('printconnect_login_time');
        } catch (error) {
            console.error('Error al limpiar tiempo de login:', error);
        }
    }

    /**
     * Verifica si la sesión ha expirado
     * Las sesiones expiran después de 24 horas de inactividad
     */
    isSessionExpired() {
        try {
            const loginTime = localStorage.getItem('printconnect_login_time');
            if (!loginTime) {
                return false; // Si no hay tiempo guardado, no aplicamos expiración
            }

            const currentTime = Date.now();
            const elapsed = currentTime - parseInt(loginTime);

            return elapsed > this.SESSION_DURATION;
        } catch (error) {
            console.error('Error al verificar expiración de sesión:', error);
            return false;
        }
    }

    /**
     * Actualiza el tiempo de actividad (para mantener sesión viva)
     */
    refreshSession() {
        if (this.isLoggedIn()) {
            this.saveLoginTime();
        }
    }

    /**
     * Cambia la contraseña del usuario actual
     */
    changePassword(currentPassword, newPassword, newPasswordConfirm) {
        const user = this.getCurrentUser();
        
        if (!user) {
            return {
                success: false,
                message: 'Debes estar logueado para cambiar la contraseña'
            };
        }

        if (!user.checkPassword(currentPassword)) {
            return {
                success: false,
                message: 'La contraseña actual es incorrecta'
            };
        }

        if (newPassword !== newPasswordConfirm) {
            return {
                success: false,
                message: 'Las contraseñas nuevas no coinciden'
            };
        }

        if (newPassword.length < 6) {
            return {
                success: false,
                message: 'La contraseña debe tener al menos 6 caracteres'
            };
        }

        // Actualizamos la contraseña
        const updated = this.userRepository.updateUser(user.email, { 
            password: newPassword 
        });

        if (updated) {
            return {
                success: true,
                message: 'Contraseña actualizada exitosamente'
            };
        } else {
            return {
                success: false,
                message: 'Error al actualizar la contraseña'
            };
        }
    }

    /**
     * Obtiene estadísticas del sistema
     */
    getStats() {
        return {
            totalUsers: this.userRepository.countUsers(),
            isLoggedIn: this.isLoggedIn(),
            currentUser: this.getCurrentUser()?.name || null
        };
    }
}