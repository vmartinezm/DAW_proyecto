import connection from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = "supersecreto123"; // luego lo pasamos a .env

export const login = (req, res) => {
  const { usuario, password } = req.body;

  if (!usuario || !password) {
    return res.status(400).json({ error: "Usuario y contraseña requeridos" });
  }

  const sql = "SELECT * FROM usuarios WHERE usuario = ?";
  connection.query(sql, [usuario], async (err, results) => {
    if (err) {
      console.error("Error en login:", err);
      return res.status(500).json({ error: "Error en el servidor" });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    const user = results[0];

    // comparar contraseña
    const esValida = await bcrypt.compare(password, user.password_hash);
    if (!esValida) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    // generar token
    const token = jwt.sign(
      {
        user_id: user.user_id,
        usuario: user.usuario,
        rol: user.rol,
      },
      JWT_SECRET,
      { expiresIn: "8h" }
    );

    // Devolver usuario como objeto
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
