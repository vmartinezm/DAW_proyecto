import connection from "../config/db.js";

export const obtenerClientes = (req, res) => {
    const sql = "SELECT * FROM clientes";
    connection.query(sql, (err, results) => {
        if (err) {
            console.error("Error al obtener clientes:", err);
            return res.status(500).json({ error: "Error al obtener clientes" });
        }
        res.status(200).json(results);
    });
};

export const obtenerClientePorDni = (req, res) => {
    const { dni } = req.params;
    const sql = "SELECT * FROM clientes WHERE dni = ?";
    connection.query(sql, [dni], (err, results) => {
        if (err) {
            console.error("Error al obtener cliente:", err);
            return res.status(500).json({ error: "Error al obtener cliente" });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: "Cliente no encontrado" });
        }
        res.json(results[0]);
    });
}

export const anadirCliente = (req, res) => {
    const { dni, nombre, apellidos, email, telefono, direccion } = req.body;
    const sql = "INSERT INTO clientes (dni, nombre, apellidos, email, telefono, direccion) VALUES (?, ?, ?, ?, ?, ?)";
    connection.query(sql, [dni, nombre, apellidos, email, telefono, direccion], (err, result) => {
        if (err) {
            console.error("Error al añadir cliente:", err);
            return res.status(500).json({ error: "Error al añadir cliente" });
        }
        res.json({ mensaje: "Cliente añadido correctamente" });
    });
}

export const actualizarCliente = (req, res) => {
    const { dni } = req.params;
    const { nombre, apellidos, email, telefono, direccion } = req.body;
    const sql = "UPDATE clientes SET nombre = ?, apellidos = ?, email = ?, telefono = ?, direccion = ? WHERE dni = ?";
    connection.query(sql, [nombre, apellidos, email, telefono, direccion, dni], (err, result) => {
        if (err) {
            console.error("Error al actualizar cliente:", err);
            return res.status(500).json({ error: "Error al actualizar cliente" });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Cliente no encontrado" });
        }
        res.json({ mensaje: "Cliente actualizado correctamente" });
    });
}

export const eliminarCliente = (req, res) => {
    const { dni } = req.params;
    const sql = "DELETE FROM clientes WHERE dni = ?";
    connection.query(sql, [dni], (err, result) => {
        if (err) {
            console.error("Error al eliminar cliente:", err);
            return res.status(500).json({ error: "Error al eliminar cliente" });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Cliente no encontrado" });
        }
        res.json({ mensaje: "Cliente eliminado correctamente" });
    });
}