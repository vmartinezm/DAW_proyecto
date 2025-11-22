// login.js
const API_login = "http://localhost:3000/auth/login";

document.addEventListener("DOMContentLoaded", () => {

  // Si ya existe una sesión → ir a dashboard
  const savedSession = sessionStorage.getItem("session");
  
  if (savedSession) {
        try {
            const parsed = JSON.parse(savedSession);

            // Verificamos que realmente hay un token
            if (parsed.token) {
                window.location.href = "index.html";
                return;
            }

        } catch (e) {
            console.warn("Sesión corrupta en sessionStorage, limpiando...");
            sessionStorage.removeItem("session");
        }
    }

  const form = document.getElementById("loginForm");
  const errorMsg = document.getElementById("loginError");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const usuario = document.getElementById("usuario").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
      const resp = await fetch(API_login, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario, password }),
      });

      const data = await resp.json();
      console.log(data);

      if (!resp.ok) {
        errorMsg.textContent = data.error || "Usuario o contraseña incorrectos";
        return;
      }

      // Guardar la sesión completa
      const session = {
        token: data.token,
        usuario: data.usuario.usuario,
        rol: data.usuario.rol,
        user_id: data.usuario.user_id,
        nombre: data.usuario.nombre,
      };

      sessionStorage.setItem("session", JSON.stringify(session));
      window.location.href = "index.html";

    } catch (err) {
      console.error("Error:", err);
      errorMsg.textContent = "No se pudo conectar con el servidor";
    }
  });
});
