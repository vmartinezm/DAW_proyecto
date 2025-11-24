/**
 * @file public/js/dashboard.js
 * @description Maneja la lógica de la página de dashboard, 
 * incluyendo la inicialización de la interfaz y la navegación basada en el rol del usuario.
 * @module dashboard
 */

// Importar funciones de autenticación
import { requireLogin, getSession, logout } from "./auth.js";

// Esperar a que el DOM esté completamente cargado
document.addEventListener("DOMContentLoaded", () => {
  // Verificar si el usuario está autenticado. Si no lo está, redirigir al login.
  if (!requireLogin()) return;
  // Inicializar la página de dashboard
  inicializarDashboard();
});

/**
 * @function inicializarDashboard
 * @description Inicializa la página de dashboard, mostrando una alerta con el nombre del usuario que ha iniciado sesión, y configurando la navegación según el rol del usuario.
 * Si el usuario no es administrador, elimina el botón de usuarios del DOM.
 * Agrega listeners a los botones de navegación, y al botón de logout.
 */
function inicializarDashboard() {
  // Obtener la sesión del usuario
  const session = getSession();
  mostrarAlerta(`Has iniciado sesión como ${session.usuario}`);

  // Determinar si el usuario es administrador
  const isAdmin = session.rol === "admin";

  // Obtener referencias a los botones del dashboard
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
  btnVehiculos.addEventListener(
    "click",
    () => (window.location.href = "vehiculos.html")
  );
  btnMantenimientos.addEventListener(
    "click",
    () => (window.location.href = "mantenimientos.html")
  );
  btnVentas.addEventListener(
    "click",
    () => (window.location.href = "ventas.html")
  );
  btnClientes.addEventListener(
    "click",
    () => (window.location.href = "clientes.html")
  );

  // Si es admin, agregar listener al botón de usuarios
  if (isAdmin) {
    btnUsuarios.addEventListener(
      "click",
      () => (window.location.href = "usuarios.html")
    );
  }

  // Listener para el botón de logout
  btnLogout.addEventListener("click", () => logout());
}

/**
 * @function mostrarAlerta
 * @description Muestra un mensaje de alerta en la pantalla durante un tiempo determinado.
 * @param {string} mensaje - El mensaje a mostrar.
 * @param {number} [duracion=3000] - El tiempo en milisegundos para mostrar el mensaje.
 */
function mostrarAlerta(mensaje, duracion = 3000) {
  const alerta = document.getElementById("alertaBienvenida");
  alerta.textContent = mensaje;
  alerta.style.opacity = "1";
  setTimeout(() => (alerta.style.opacity = "0"), duracion);
}
