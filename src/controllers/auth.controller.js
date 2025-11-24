/**
 * @file src/controllers/auth.controller.js
 * @description Controlador para autenticación de usuarios.
 * @module controllers/auth.controller
 */

// Importar dependencias
import connection from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Obtiene el secreto JWT desde variables de entorno o usa uno por defecto
const JWT_SECRET = process.env.JWT_SECRET || "desarrollo_super_secreto";

/**
 * @function login
 * @description Autentica a un usuario mediante usuario + contraseña. Si las credenciales son correctas, responde con un token JWT.
 * @route POST /auth/login
 * @param {Object} req - objeto Request de Express
 * @param {Object} res - objeto Response de Express
 * @param {string} usuario - nombre único de usuario
 * @param {string} password - contraseña sin hash
 * @returns JSON con token JWT y datos públicos del usuario
 * @throws {400} Si faltan parámetros
 * @throws {401} Si las credenciales son incorrectas
 * @throws {500} Si hay un error en el servidor
 */
export const login = (req, res) => {
  const { usuario, password } = req.body;

  // 🛑 Validación básica
  if (!usuario || !password) {
    return res.status(400).json({ error: "Usuario y contraseña requeridos" });
  }

  // 🔍 Buscar usuario por nombre
  const sql = "SELECT * FROM usuarios WHERE usuario = ?";
  connection.query(sql, [usuario], async (err, results) => {
    if (err) {
      console.error("Error en login:", err);
      return res.status(500).json({ error: "Error en el servidor" });
    }

    // ❗ Si usuario no existe
    if (results.length === 0) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    const user = results[0];

    // 🔑 Verificar contraseña
    const esValida = await bcrypt.compare(password, user.password_hash);
    if (!esValida) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    // 🎟️ Generar token JWT
    const token = jwt.sign(
      {
        user_id: user.user_id,
        usuario: user.usuario,
        rol: user.rol,
      },
      JWT_SECRET,
      { expiresIn: "8h" } // válido 8 horas
    );

    // 🔐 Devolver objeto usuario sin password_hash
    res.json({
      mensaje: "Login correcto",
      token,
      usuario: {
        usuario: user.usuario,
        rol: user.rol,
        user_id: user.user_id,
        nombre: user.nombre,
      },
    });
  });
};
