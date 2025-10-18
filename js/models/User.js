/**
 * Clase User
 * Representa un usuario del sistema
 */
class User {
    constructor(name, email, password) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.createdAt = new Date();
    }

    isValidEmail() {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(this.email);
    }

    isValidPassword() {
        return this.password && this.password.length >= 6;
    }

    validate() {
        const errors = [];

        if (!this.name || this.name.trim() === '') {
            errors.push('El nombre es requerido');
        }

        if (!this.isValidEmail()) {
            errors.push('El email no es válido');
        }

        if (!this.isValidPassword()) {
            errors.push('La contraseña debe tener al menos 6 caracteres');
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    checkPassword(password) {
        return this.password === password;
    }

    toJSON() {
        return {
            name: this.name,
            email: this.email,
            password: this.password,
            createdAt: this.createdAt
        };
    }

    static fromJSON(json) {
        const user = new User(json.name, json.email, json.password);
        if (json.createdAt) {
            user.createdAt = new Date(json.createdAt);
        }
        return user;
    }
}