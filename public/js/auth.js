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
