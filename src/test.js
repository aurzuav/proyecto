const poblarServidor = require('./bdd_server');

async function test() {
  try {
    console.log('Iniciando proceso de población del servidor...');
    await poblarServidor();
    console.log('Proceso de población del servidor completado.');
  } catch (error) {
    console.error('Error en el proceso de población del servidor:', error);
  }
}

test();
