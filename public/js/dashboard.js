/* -----------------------------------------
   dashboard.js — Página principal
------------------------------------------ */

import { requireLogin, getSession, logout } from "./auth.js";

document.addEventListener("DOMContentLoaded", () => {
  if (!requireLogin()) return;
  inicializarDashboard();
});

/**
 * Inicializa la página de dashboard, mostrando un mensaje de bienvenida con el usuario actual y configurando los botones de navegación según el rol del usuario.
 * Si el usuario no es administrador, se elimina el botón correspondiente a la gestión de usuarios del DOM.
 */
function inicializarDashboard() {
  const session = getSession();
  mostrarAlerta(`Has iniciado sesión como ${session.usuario}`);

  const isAdmin = session.rol === "admin";

  const btnVehiculos = document.getElementById("dashBtnVehiculos");
  const btnMantenimientos = document.getElementById("dashBtnMantenimientos");
  const btnVentas = document.getElementById("dashBtnVentas");
  const btnClientes = document.getElementById("dashBtnClientes");
  const btnUsuarios = document.getElementById("dashBtnUsuarios");
  const btnLogout = document.getElementById("dashBtnLogout");

  // 🔥 Seguridad visual → si NO es admin, ELIMINAR el botón del DOM
  if (!isAdmin && btnUsuarios) {
    btnUsuarios.remove();
  }

  // Navegación
  btnVehiculos.addEventListener("click", () => window.location.href = "vehiculos.html");
  btnMantenimientos.addEventListener("click", () => window.location.href = "mantenimientos.html");
  btnVentas.addEventListener("click", () => window.location.href = "ventas.html");
  btnClientes.addEventListener("click", () => window.location.href = "clientes.html");

  if (isAdmin) {
    btnUsuarios.addEventListener("click", () => window.location.href = "usuarios.html");
  }

  btnLogout.addEventListener("click", () => logout());
}

/**
 * Muestra un mensaje de alerta en la pantalla durante un tiempo determinado.
 * @param {string} mensaje - El mensaje a mostrar.
 * @param {number} [duracion=3000] - El tiempo en milisegundos para mostrar el mensaje.
 */
function mostrarAlerta(mensaje, duracion = 3000) {
  const alerta = document.getElementById("alertaBienvenida");
  alerta.textContent = mensaje;
  alerta.style.opacity = "1";
  setTimeout(() => alerta.style.opacity = "0", duracion);
}
