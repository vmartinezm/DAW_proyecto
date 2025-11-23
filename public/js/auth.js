/* ---------------------------------------------------
   auth.js — Módulo de protección universal
---------------------------------------------------- */

/**
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
 * Comprueba si el usuario está logueado.
 * Si no lo está → redirige automáticamente a login.html
 *
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
 * Protege una página exclusiva para administradores.
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
 * Cierra la sesión actual y redirige a login.html.
 */
export function logout() {
  sessionStorage.removeItem("session");
  window.location.href = "login.html";
}

/**
 * Realiza una petición a la API con token de autenticación
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