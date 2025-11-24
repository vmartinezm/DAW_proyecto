/**
 * @file public/js/login.js
 * @description Lógica de la página de login:
 * - Verificación de sesión previa
 * - Envío de credenciales al backend
 * - Almacenamiento de sesión en sessionStorage
 */

// URL de la API de login
const API_login = "http://localhost:3000/auth/login";

// Esperar a que el DOM esté cargado
document.addEventListener("DOMContentLoaded", () => {

  // ================================
  // 🔍 Comprobar sesión previa
  // ================================
  const savedSession = sessionStorage.getItem("session");
  
  if (savedSession) {
    try {
      const parsed = JSON.parse(savedSession);

      /**
       * Si ya hay token en sessionStorage,
       * el usuario ya está autenticado → enviarlo al panel
       */
      if (parsed.token) {
        window.location.href = "index.html";
        return;
      }

    } catch (e) {
      console.warn("Sesión corrupta en sessionStorage, limpiando...");
      sessionStorage.removeItem("session");
    }
  }

  // ================================
  // 💡 Referencias a elementos DOM
  // ================================
  const form = document.getElementById("loginForm");
  const errorMsg = document.getElementById("loginError");

  // ================================
  // 🚪 Envío de formulario login
  // ================================
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Usurio y contraseña procedentes del formulario, sin espacios al inicio/final
    const usuario = document.getElementById("usuario").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
      // Enviar credenciales a la API
      const resp = await fetch(API_login, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario, password }),
      });

      const data = await resp.json();
      console.log(data);

      // ❗ Si la API devuelve error → mostrar mensaje
      if (!resp.ok) {
        errorMsg.textContent = data.error || "Usuario o contraseña incorrectos";
        return;
      }

     // ✅ Login correcto → crear objeto sesión
      const session = {
        token: data.token,
        usuario: data.usuario.usuario,
        rol: data.usuario.rol,
        user_id: data.usuario.user_id,
        nombre: data.usuario.nombre,
      };

      // Guardar la sesión en navegador
      sessionStorage.setItem("session", JSON.stringify(session));

      // Redirigir al panel principal
      window.location.href = "index.html";

    } catch (err) {
      console.error("Error:", err);
      errorMsg.textContent = "No se pudo conectar con el servidor";
    }
  });
});