// Importar los módulos necesarios
const express = require('express');
const app = express();
const { Pool } = require('pg');

// Configurar la conexión a la base de datos
const pool = new Pool({
    user: 'postgres',
    password: '12345678',
    host: 'localhost',
    database: 'entrega_3',
    port: 5432,
});


async function alterarEstado(id, nuevoEstado) {
    let client;

    try {
        client = await pool.connect();

        await client.query(
            `UPDATE ordenes_creadas
            SET estado = $1
            WHERE id = $2`,
            [nuevoEstado, id]
        );

        console.log('El estado ha sido actualizado exitosamente.');
    } catch (error) {
        console.error('Error al actualizar el estado:', error);
    } finally {
        if (client) {
            client.release();
        }
    }
}

module.exports = alterarEstado;