// Importar los módulos necesarios
const { Pool } = require('pg');

// Configurar la conexión a la base de datos
const pool = new Pool({
  user: 'postgres',
  password: '12345678',
  host: 'localhost',
  database: 'entrega_3',
  port: 5432,
});

// Definir una función para poblar la tabla "ordenes" a partir de diccionarios
async function poblarTabla(id, estado, sku, cantidad, grupo) {
  let client; // Variable para almacenar el cliente de conexión

  try {
    client = await pool.connect(); // Obtener una instancia de cliente de conexión

    await client.query(
      `INSERT INTO ordenes_creadas (id, estado, sku, cantidad, grupo)
       VALUES ($1, $2, $3, $4, $5)`,
      [id, estado, sku, cantidad, grupo]
    );

    console.log('La tabla "ordenes" ha sido poblada exitosamente.');
  } catch (error) {
    console.error('Error al poblar la tabla "ordenes":', error);
  } finally {
    if (client) {
      client.release(); // Liberar el cliente de conexión
    }
  }
}

// Ejecutar la función para poblar la tabla al iniciar el servidor
poblarTabla();

module.exports = poblarTabla;
