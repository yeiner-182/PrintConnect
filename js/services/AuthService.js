/**
 * Clase AuthService
 * Maneja la autenticación
 */
class AuthService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    register(name, email, password, passwordConfirm) {
        if (password !== passwordConfirm) {
            return {
                success: false,
                message: 'Las contraseñas no coinciden',
                errors: ['Las contraseñas no coinciden']
            };
        }

        const user = new User(name, email, password);

        const validation = user.validate();
        if (!validation.valid) {
            return {
                success: false,
                message: 'Datos inválidos',
                errors: validation.errors
            };
        }

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

    login(email, password) {
        const user = this.userRepository.findByEmail(email);

        if (!user) {
            return {
                success: false,
                message: 'Correo o contraseña incorrectos',
                user: null
            };
        }

        if (!user.checkPassword(password)) {
            return {
                success: false,
                message: 'Correo o contraseña incorrectos',
                user: null
            };
        }

        this.userRepository.setCurrentUser(user);

        return {
            success: true,
            message: `¡Bienvenido ${user.name}!`,
            user: user
        };
    }

    logout() {
        if (!this.userRepository.isUserLoggedIn()) {
            return {
                success: false,
                message: 'No hay sesión activa'
            };
        }

        this.userRepository.clearCurrentUser();

        return {
            success: true,
            message: 'Sesión cerrada exitosamente'
        };
    }

    getCurrentUser() {
        return this.userRepository.getCurrentUser();
    }

    isLoggedIn() {
        return this.userRepository.isUserLoggedIn();
    }
}