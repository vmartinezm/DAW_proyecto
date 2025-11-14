import connection from "../config/db.js";

export const obtenerUsuarios = (req, res) => {
    const sql = 'SELECT * FROM usuarios';
    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Error al obtener usuarios:', err);
            return res.status(500).json({ error: 'Error al obtener usuarios' });
        }
        res.status(200).json(results);
    });
};

export const obtenerUsuarioPorId = (req, res) => {
    const { user_id } = req.params;
    const sql = 'SELECT * FROM usuarios WHERE user_id = ?';
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

export const anadirUsuario = (req, res) => {
    const { nombre, apellidos, usuario, password_hash, rol, email } = req.body;
    const sql = 'INSERT INTO usuarios (nombre, apellidos, usuario, password_hash, rol, email) VALUES (?, ?, ?, ?, ?, ?)';
    connection.query(sql, [nombre, apellidos, usuario, password_hash, rol, email], (err, result) => {
        if (err) {
            console.error('Error al añadir usuario:', err);
            return res.status(500).json({ error: 'Error al añadir usuario' });
        }
        res.status(201).json({ mensaje: 'Usuario añadido correctamente' });
    });
};

export const actualizarUsuario = (req, res) => {
    const { user_id } = req.params;
    const { nombre, apellidos, usuario, password_hash, rol, email } = req.body;
    const sql = 'UPDATE usuarios SET nombre = ?, apellidos = ?, usuario = ?, password_hash = ?, rol = ?, email = ? WHERE user_id = ?';
    connection.query(sql, [nombre, apellidos, usuario, password_hash, rol, email, user_id], (err, result) => {
        if (err) {
            console.error('Error al actualizar usuario:', err);
            return res.status(500).json({ error: 'Error al actualizar usuario' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.json({ mensaje: 'Usuario actualizado correctamente' });
    });
};

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