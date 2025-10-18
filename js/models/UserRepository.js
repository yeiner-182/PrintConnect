/**
 * Clase UserRepository
 * Almacena usuarios en un array (memoria)
 */
class UserRepository {
    constructor() {
        this.users = [];
        this.currentUser = null;
    }

    addUser(user) {
        const existe = this.users.find(u => u.email === user.email);
        if (existe) {
            return false;
        }
        this.users.push(user);
        return true;
    }

    findByEmail(email) {
        return this.users.find(u => u.email === email) || null;
    }

    getAllUsers() {
        return this.users;
    }

    countUsers() {
        return this.users.length;
    }

    deleteUser(email) {
        const index = this.users.findIndex(u => u.email === email);
        if (index !== -1) {
            this.users.splice(index, 1);
            return true;
        }
        return false;
    }

    setCurrentUser(user) {
        this.currentUser = user;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    clearCurrentUser() {
        this.currentUser = null;
    }

    isUserLoggedIn() {
        return this.currentUser !== null;
    }

    clearAll() {
        this.users = [];
        this.currentUser = null;
    }
}