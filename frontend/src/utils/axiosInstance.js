import axios from 'axios';

// 1. Definimos la URL base de la API
const baseURL = 'http://127.0.0.1:8000/api/';

const axiosInstance = axios.create({
    baseURL: baseURL,
});

// 2. Interceptor de SOLICITUD (Request)
// Esto es lo que ya tenías: se ejecuta ANTES de que cada solicitud salga.
axiosInstance.interceptors.request.use(
    config => {
        const tokenString = localStorage.getItem('authTokens');
        if (tokenString) {
            const tokens = JSON.parse(tokenString);
            config.headers['Authorization'] = `Bearer ${tokens.access}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// --- Lógica de Refresco de Token ---

// 3. Estas variables nos ayudan a manejar "race conditions"
// (si 5 solicitudes fallan al mismo tiempo, solo refrescamos una vez)
let isRefreshing = false;
let refreshSubscribers = [];

const processSubscribers = (error, token = null) => {
    refreshSubscribers.forEach(callback => callback(error, token));
    refreshSubscribers = [];
};

// 4. Interceptor de RESPUESTA (Response)
// Se ejecuta DESPUÉS de recibir una respuesta (o un error).
axiosInstance.interceptors.response.use(
    // 4a. Si la respuesta es exitosa (ej: 200)
    response => {
        return response; // Simplemente la dejamos pasar
    },
    // 4b. Si la respuesta es un error
    async error => {
        const originalRequest = error.config;

        // 5. Verificamos si es un error 401 y no es una solicitud de "retry"
        if (error.response?.status === 401 && !originalRequest._retry) {
            
            // Si ya estamos refrescando, ponemos esta solicitud en espera
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    refreshSubscribers.push((error, token) => {
                        if (error) {
                            return reject(error);
                        }
                        originalRequest.headers['Authorization'] = 'Bearer ' + token;
                        resolve(axiosInstance(originalRequest));
                    });
                });
            }

            // 6. Marcamos esta solicitud como "retry" y activamos "isRefreshing"
            originalRequest._retry = true;
            isRefreshing = true;

            const tokenString = localStorage.getItem('authTokens');
            if (!tokenString) {
                // No hay tokens, no podemos refrescar, desloguear
                isRefreshing = false;
                window.location.href = '/login';
                return Promise.reject(error);
            }

            const tokens = JSON.parse(tokenString);
            const refreshToken = tokens.refresh;

            try {
                // 7. Hacemos la solicitud a /api/token/refresh/
                // Usamos "axios" global para esta solicitud, NO "axiosInstance",
                // para evitar un bucle infinito de interceptores.
                const response = await axios.post(baseURL + 'token/refresh/', {
                    refresh: refreshToken
                });

                // 8. Refresco exitoso: Actualizamos nuestros tokens
                const newAccessToken = response.data.access;
                tokens.access = newAccessToken;
                localStorage.setItem('authTokens', JSON.stringify(tokens));

                // 9. Actualizamos el header de la instancia y de la solicitud original
                axiosInstance.defaults.headers.common['Authorization'] = 'Bearer ' + newAccessToken;
                originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;

                // 10. "Resolvemos" las solicitudes en espera con el nuevo token
                processSubscribers(null, newAccessToken);
                
                // 11. Reintentamos la solicitud original (que había fallado)
                return axiosInstance(originalRequest);

            } catch (refreshError) {
                // 12. Refresco fallido (el refresh_token es inválido o expiró)
                console.error("Error al refrescar el token:", refreshError);
                
                // Deslogueamos al usuario
                localStorage.removeItem('authTokens');
                axiosInstance.defaults.headers.common['Authorization'] = null;
                
                // "Rechazamos" las solicitudes en espera
                processSubscribers(refreshError, null);
                
                // Redirigimos al login
                window.location.href = '/login';

                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        // 13. Para cualquier otro error (500, 404, etc.), solo lo retornamos
        return Promise.reject(error);
    }
);

export default axiosInstance;