import connection from "../config/db.js";
import bcrypt from "bcryptjs";

// Obtener usuarios
export const obtenerUsuarios = (req, res) => {
    const sql = 'SELECT user_id, nombre, apellidos, usuario, rol, email, creado_at, actualizado_at FROM usuarios';
    // ❗ No devolvemos password_hash nunca
    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Error al obtener usuarios:', err);
            return res.status(500).json({ error: 'Error al obtener usuarios' });
        }
        res.status(200).json(results);
    });
};

// Obtener usuario por ID
export const obtenerUsuarioPorId = (req, res) => {
    const { user_id } = req.params;
    const sql = 'SELECT user_id, nombre, apellidos, usuario, rol, email, creado_at, actualizado_at FROM usuarios WHERE user_id = ?';

    connection.query(sql, [user_id], (err, results) => {
        if (err) {
            console.error('Error al obtener usuario:', err);
            return res.status(500).json({ error: 'Error al obtener usuario' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.json(results[0]);
    });
};

// Añadir usuario
export const anadirUsuario = async (req, res) => {
    const { nombre, apellidos, usuario, password, rol, email } = req.body;

    try {
        // Hash seguro
        const password_hash = await bcrypt.hash(password, 10);

        const sql = `
            INSERT INTO usuarios (nombre, apellidos, usuario, password_hash, rol, email)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        connection.query(sql, [nombre, apellidos, usuario, password_hash, rol, email], (err, result) => {
            if (err) {
                console.error('Error al añadir usuario:', err);

                if (err.code === "ER_DUP_ENTRY") {
                    return res.status(400).json({ error: "El usuario o mail ya existe" });
                }

                return res.status(500).json({ error: 'Error al añadir usuario' });
            }

            res.status(201).json({ mensaje: 'Usuario añadido correctamente' });
        });

    } catch (err) {
        console.error("Error al hashear contraseña:", err);
        return res.status(500).json({ error: "Error interno en el servidor" });
    }
};

// Actualizar usuario
export const actualizarUsuario = async (req, res) => {
    const { user_id } = req.params;
    const { nombre, apellidos, usuario, password, rol, email } = req.body;

    try {
        let sql;
        let params;

        if (password && password.trim() !== "") {
            // Si el usuario cambia la contraseña → se re-hashea
            const password_hash = await bcrypt.hash(password, 10);

            sql = `
                UPDATE usuarios
                SET nombre = ?, apellidos = ?, usuario = ?, password_hash = ?, rol = ?, email = ?
                WHERE user_id = ?
            `;
            params = [nombre, apellidos, usuario, password_hash, rol, email, user_id];

        } else {
            // Si NO cambia la contraseña → mantenemos la anterior
            sql = `
                UPDATE usuarios
                SET nombre = ?, apellidos = ?, usuario = ?, rol = ?, email = ?
                WHERE user_id = ?
            `;
            params = [nombre, apellidos, usuario, rol, email, user_id];
        }

        connection.query(sql, params, (err, result) => {
            if (err) {
                if (err.code === "ER_DUP_ENTRY") {
                    return res.status(400).json({ error: "El usuario o mail ya existe" });
                }
                console.error('Error al actualizar usuario:', err);
                return res.status(500).json({ error: 'Error al actualizar usuario' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }

            res.json({ mensaje: 'Usuario actualizado correctamente' });
        });

    } catch (err) {
        console.error("Error al actualizar contraseña:", err);
        return res.status(500).json({ error: "Error interno en el servidor" });
    }
};

// Eliminar usuario
export const eliminarUsuario = (req, res) => {
    const { user_id } = req.params;

    const sql = 'DELETE FROM usuarios WHERE user_id = ?';

    connection.query(sql, [user_id], (err, result) => {
        if (err) {
            console.error('Error al eliminar usuario:', err);
            return res.status(500).json({ error: 'Error al eliminar usuario' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.json({ mensaje: 'Usuario eliminado correctamente' });
    });
};
