/**
 * @file public/js/auth.js
 * @description Módulo de autenticación y gestión de sesión.
 * Proporciona funciones para manejar la sesión del usuario, verificar roles y proteger rutas.
 */

/**
 * @function getSession
 * @description Obtiene la sesión del usuario guardada en sessionStorage.
 * Devuelve el objeto de sesión guardado en sessionStorage.
 * Si no existe una sesión guardada, devuelve un objeto vacío.
 * @returns {Object} El objeto de sesión guardado en sessionStorage.
 */
export function getSession() {
  const sessionStr = sessionStorage.getItem("session");
  if (!sessionStr) return null;
  return JSON.parse(sessionStr);
}

/**
 * @function requireLogin
 * @description Comprueba si el usuario está logueado.
 * Si no lo está → redirige automáticamente a login.html
 * @returns {boolean} true si el usuario está logueado
 */
export function requireLogin() {
  const session = getSession();

  if (!session || !session.token) {
    window.location.href = "login.html";
    return false;
  }

  return true;
}

/**
 * @function requireAdmin
 * @description Protege una página exclusiva para administradores.
 * Si el rol no es admin → redirige al dashboard.
 */
export function requireAdmin() {
  const session = getSession();

  if (!session || !session.token) {
    window.location.href = "login.html";
    return false;
  }

  if (session.rol !== "admin") {
    alert("No tienes permisos para acceder a esta página");
    window.location.href = "index.html";
    return false;
  }

  return true;
}

/**
 * @function logout
 * @description Cierra la sesión actual del usuario y redirige a login.html
 * Elimina la sesión guardada en sessionStorage.
 */
export function logout() {
  sessionStorage.removeItem("session");
  window.location.href = "login.html";
}

/**
 * @function authFetch
 * @description Realiza una petición a la API con token de autenticación
 * Si no hay token en session, redirige a login.html
 * @param {string} url - URL de la API
 * @param {Object} options - Opciones adicionales para fetch
 * @returns {Promise<Response>} La promesa de la respuesta de fetch
 */
export function authFetch(url, options = {}) {
  const session = getSession();
  if (!session || !session.token) {
    console.warn("No hay token en session → redirigiendo a login");
    window.location.href = "login.html";
    return;
  }

  const headers = options.headers || {};
  headers["Authorization"] = `Bearer ${session.token}`;
  headers["Content-Type"] = headers["Content-Type"] || "application/json";

  return fetch(url, { ...options, headers });
}
