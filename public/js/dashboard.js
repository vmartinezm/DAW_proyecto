/* =====================================================
   dashboard.js — Gestión del menú principal
   Responsable de:
   ✔ mostrar saludo al usuario
   ✔ navegación entre módulos
   ✔ control visual del botón Usuarios según rol
   ✔ cierre de sesión
===================================================== */

import { requireLogin, getSession, logout } from "./auth.js";

/**
 * Evento principal — se ejecuta cuando el DOM está cargado.
 * Primero se valida que el usuario tenga sesión activa.
 * Si la sesión no es válida → requireLogin() redirige a login.
 */
document.addEventListener("DOMContentLoaded", () => {
  if (!requireLogin()) return; // Seguridad frontend

  inicializarDashboard();
});

/**
 * Inicializa el panel del dashboard:
 * - Obtiene datos del usuario actual
 * - Muestra mensaje de bienvenida
 * - Configura navegación entre módulos
 * - Muestra u oculta opciones según rol
 */
function inicializarDashboard() {
  const session = getSession();
  mostrarAlerta(`Has iniciado sesión como ${session.usuario}`);

  // Botones de navegación
  const dashboardBtnVehiculos = document.getElementById("dashBtnVehiculos");
  const dashboardBtnUsuarios = document.getElementById("dashBtnUsuarios");
  const dashboardBtnClientes = document.getElementById("dashBtnClientes");
  const dashboardBtnMantenimientos = document.getElementById("dashBtnMantenimientos");
  const dashboardBtnVentas = document.getElementById("dashBtnVentas");
  const dashboardBtnLogout = document.getElementById("dashBtnLogout");

  /**
   * Si el usuario no es admin:
   * - Ocultamos visualmente el botón Usuarios
   * Esta es protección VISUAL — no REAL
   */
  if (session.rol !== "admin") {
    document.querySelector(".admin-only").style.display = "none";
  }

  // Navegación entre páginas
  dashboardBtnVehiculos.addEventListener("click", () => window.location.href = "vehiculos.html");
  dashboardBtnMantenimientos.addEventListener("click", () => window.location.href = "mantenimientos.html");
  dashboardBtnVentas.addEventListener("click", () => window.location.href = "ventas.html");
  dashboardBtnClientes.addEventListener("click", () => window.location.href = "clientes.html");
  dashboardBtnUsuarios.addEventListener("click", () => window.location.href = "usuarios.html");

  // Logout
  dashboardBtnLogout.addEventListener("click", () => logout());
}

/**
 * Muestra un mensaje temporal en la parte superior de la pantalla.
 * @param {string} mensaje - texto a mostrar
 * @param {number} duracion - milisegundos hasta que desaparece
 */
function mostrarAlerta(mensaje, duracion = 3000) {
  const alerta = document.getElementById("alertaBienvenida");
  alerta.textContent = mensaje;
  alerta.style.opacity = "1";

  setTimeout(() => {
    alerta.style.opacity = "0";
  }, duracion);
}