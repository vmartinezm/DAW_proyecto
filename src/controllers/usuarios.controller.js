import connection from "../config/db.js";
import bcrypt from "bcryptjs";

/**
 * Obtiene la lista de usuarios del sistema.
 * ⚠️ No devuelve password_hash por seguridad.
 * @route GET /usuarios
 * @returns {Object[]} Lista de usuarios sin contraseña
 */
export const obtenerUsuarios = (req, res) => {
    const sql = 'SELECT user_id, nombre, apellidos, usuario, rol, email, creado_at, actualizado_at FROM usuarios';

    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Error al obtener usuarios:', err);
            return res.status(500).json({ error: 'Error al obtener usuarios' });
        }
        res.status(200).json(results);
    });
};

/**
 * Obtiene un usuario por su ID.
 * ⚠️ No devuelve contraseña.
 * @route GET /usuarios/:user_id
 * @param {number} user_id
 * @returns {Object} información pública del usuario
 */
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

/**
 * Crea un nuevo usuario en el sistema.
 * Aplica hash seguro bcrypt a la contraseña.
 * @route POST /usuarios
 * @param {string} nombre
 * @param {string} apellidos
 * @param {string} usuario (único)
 * @param {string} password
 * @param {string="admin"|"empleado"} rol
 * @param {string} email (único)
 */
export const anadirUsuario = async (req, res) => {
    const { nombre, apellidos, usuario, password, rol, email } = req.body;

    try {
        // Hash seguro de contraseña
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

/**
 * Actualiza un usuario existente.
 * Si se recibe un campo `password` válido, se vuelve a hashear.
 * Si no, se mantiene la contraseña existente.
 * @route PUT /usuarios/:user_id
 * @param {string} password — opcional
 * @returns {JSON}
 */
export const actualizarUsuario = async (req, res) => {
    const { user_id } = req.params;
    const { nombre, apellidos, usuario, password, rol, email } = req.body;

    try {
        let sql;
        let params;

        if (password && password.trim() !== "") {
            // Nueva contraseña — rehash
            const password_hash = await bcrypt.hash(password, 10);

            sql = `
                UPDATE usuarios
                SET nombre = ?, apellidos = ?, usuario = ?, password_hash = ?, rol = ?, email = ?
                WHERE user_id = ?
            `;
            params = [nombre, apellidos, usuario, password_hash, rol, email, user_id];

        } else {
            // Mantener contraseña anterior
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

/**
 * Elimina un usuario según su ID.
 * @route DELETE /usuarios/:user_id
 */
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