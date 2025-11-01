/**
 * Clase UserRepository
 * Almacena usuarios usando localStorage para persistencia
 */
class UserRepository {
    constructor() {
        // Claves para localStorage - usamos constantes para evitar errores de tipeo
        this.STORAGE_KEYS = {
            USERS: 'printconnect_users',
            CURRENT_USER: 'printconnect_current_user',
            SESSION_TOKEN: 'printconnect_session'
        };
        
        // Inicializamos cargando datos del localStorage
        this.users = this.loadUsers();
        this.currentUser = this.loadCurrentUser();
    }

    /**
     * Carga todos los usuarios desde localStorage
     * Si no hay datos guardados, retorna un array vacío
     */
    loadUsers() {
        try {
            const usersData = localStorage.getItem(this.STORAGE_KEYS.USERS);
            if (!usersData) {
                return [];
            }
            
            // Convertimos el JSON guardado de vuelta a objetos User
            const usersArray = JSON.parse(usersData);
            return usersArray.map(userData => User.fromJSON(userData));
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
            return [];
        }
    }

    /**
     * Guarda todos los usuarios en localStorage
     * Convertimos los objetos User a JSON para poder almacenarlos
     */
    saveUsers() {
        try {
            const usersData = this.users.map(user => user.toJSON());
            localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(usersData));
            return true;
        } catch (error) {
            console.error('Error al guardar usuarios:', error);
            return false;
        }
    }

    /**
     * Carga el usuario actual desde localStorage
     */
    loadCurrentUser() {
        try {
            const userData = localStorage.getItem(this.STORAGE_KEYS.CURRENT_USER);
            const sessionToken = localStorage.getItem(this.STORAGE_KEYS.SESSION_TOKEN);
            
            // Verificamos que exista una sesión válida
            if (!userData || !sessionToken) {
                return null;
            }
            
            const userObj = JSON.parse(userData);
            return User.fromJSON(userObj);
        } catch (error) {
            console.error('Error al cargar usuario actual:', error);
            return null;
        }
    }

    /**
     * Guarda el usuario actual en localStorage
     * Incluye un token de sesión simple para validación
     */
    saveCurrentUser(user) {
        try {
            if (user) {
                localStorage.setItem(this.STORAGE_KEYS.CURRENT_USER, JSON.stringify(user.toJSON()));
                // Generamos un token de sesión básico (timestamp + random)
                const sessionToken = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                localStorage.setItem(this.STORAGE_KEYS.SESSION_TOKEN, sessionToken);
            } else {
                localStorage.removeItem(this.STORAGE_KEYS.CURRENT_USER);
                localStorage.removeItem(this.STORAGE_KEYS.SESSION_TOKEN);
            }
            return true;
        } catch (error) {
            console.error('Error al guardar usuario actual:', error);
            return false;
        }
    }

    /**
     * Añade un nuevo usuario al sistema
     * Verifica que no exista otro con el mismo email
     */
    addUser(user) {
        const existe = this.users.find(u => u.email === user.email);
        if (existe) {
            return false;
        }
        
        this.users.push(user);
        this.saveUsers(); // Guardamos en localStorage
        return true;
    }

    /**
     * Busca un usuario por su email
     */
    findByEmail(email) {
        return this.users.find(u => u.email === email) || null;
    }

    /**
     * Retorna todos los usuarios registrados
     */
    getAllUsers() {
        return this.users;
    }

    /**
     * Cuenta cuántos usuarios hay registrados
     */
    countUsers() {
        return this.users.length;
    }

    /**
     * Elimina un usuario del sistema
     */
    deleteUser(email) {
        const index = this.users.findIndex(u => u.email === email);
        if (index !== -1) {
            this.users.splice(index, 1);
            this.saveUsers(); // Actualizamos localStorage
            return true;
        }
        return false;
    }

    /**
     * Establece el usuario actual (login)
     */
    setCurrentUser(user) {
        this.currentUser = user;
        this.saveCurrentUser(user);
    }

    /**
     * Obtiene el usuario actualmente logueado
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * Limpia el usuario actual (logout)
     */
    clearCurrentUser() {
        this.currentUser = null;
        this.saveCurrentUser(null);
    }

    /**
     * Verifica si hay un usuario logueado
     */
    isUserLoggedIn() {
        return this.currentUser !== null;
    }

    /**
     * Limpia todos los datos (útil para testing o reset)
     */
    clearAll() {
        this.users = [];
        this.currentUser = null;
        localStorage.removeItem(this.STORAGE_KEYS.USERS);
        localStorage.removeItem(this.STORAGE_KEYS.CURRENT_USER);
        localStorage.removeItem(this.STORAGE_KEYS.SESSION_TOKEN);
    }

    /**
     * Actualiza los datos de un usuario existente
     * Útil para cambios de perfil o contraseña
     */
    updateUser(email, updatedData) {
        const user = this.findByEmail(email);
        if (!user) {
            return false;
        }

        // Actualizamos los campos permitidos
        if (updatedData.name) user.name = updatedData.name;
        if (updatedData.password) user.password = updatedData.password;
        
        this.saveUsers();
        
        // Si es el usuario actual, actualizamos también la sesión
        if (this.currentUser && this.currentUser.email === email) {
            this.setCurrentUser(user);
        }
        
        return true;
    }

    /**
     * Exporta todos los datos a JSON (útil para backup)
     */
    exportData() {
        return {
            users: this.users.map(u => u.toJSON()),
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Importa datos desde JSON (útil para restaurar backup)
     */
    importData(data) {
        try {
            if (data.users && Array.isArray(data.users)) {
                this.users = data.users.map(userData => User.fromJSON(userData));
                this.saveUsers();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error al importar datos:', error);
            return false;
        }
    }
}