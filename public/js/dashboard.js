/* -----------------------------------------
   dashboard.js — Página principal
------------------------------------------ */

import { requireLogin, getSession, logout } from "./auth.js";

// 1) Se ejecuta al cargar el DOM
document.addEventListener("DOMContentLoaded", () => {
  if (!requireLogin()) return; // Si falla, ya redirige

  inicializarDashboard();
});

// 2) Inicialización del panel
function inicializarDashboard() {
  const session = getSession();
  mostrarAlerta(`Has iniciado sesión como ${session.usuario}`);

  //Botones
  const dashboardBtnVehiculos = document.getElementById("dashBtnVehiculos");
  const dashboardBtnUsuarios = document.getElementById("dashBtnUsuarios");
  const dashboardBtnClientes = document.getElementById("dashBtnClientes");
  const dashboardBtnMantenimientos = document.getElementById("dashBtnMantenimientos");
  const dashboardBtnVentas = document.getElementById("dashBtnVentas");
  const dashboardBtnLogout = document.getElementById("dashBtnLogout");

  // Mostrar/ocultar botón de usuarios según rol
  if (session.rol !== "admin") {
    document.querySelector(".admin-only").style.display = "none";
  }

  // Navegación
  dashboardBtnVehiculos.addEventListener("click", () => {
    window.location.href = "vehiculos.html";
  });

  dashboardBtnMantenimientos.addEventListener("click", () => {
    window.location.href = "mantenimientos.html";
  });

  dashboardBtnVentas.addEventListener("click", () => {
    window.location.href = "ventas.html";
  });

  dashboardBtnClientes.addEventListener("click", () => {
    window.location.href = "clientes.html";
  });

  dashboardBtnUsuarios.addEventListener("click", () => {
    window.location.href = "usuarios.html";
  });

  // Botón cerrar sesión
  dashboardBtnLogout.addEventListener("click", () => {
    logout();
  });
}

function mostrarAlerta(mensaje, duracion = 3000) {
  const alerta = document.getElementById("alertaBienvenida");
  alerta.textContent = mensaje;
  alerta.style.opacity = "1";

  setTimeout(() => {
    alerta.style.opacity = "0";
  }, duracion);
}

