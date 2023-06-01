const Router = require("koa-router");
const axios = require("axios");
const router = new Router();
const fs = require("fs");
const csv = require("csv-parser");
const moment = require("moment");
const producirSku = require("./producir.js")


// Se usa el excel de la E2
const Productdictionary = {};
const Formuladictionary = {}; // Declara la variable dictionary fuera de la función

async function getCSVDictionary(dictionary, filePath) {
  console.log("get CSV file...");

  try {
    await readCSVFile(filePath, dictionary); // Espera a que se complete la lectura del archivo y se llene el diccionario
    //console.log(dictionary); // Ahora puedes usar dictionary fuera de la función
    // Continúa con el resto del código que depende del diccionario
  } catch (error) {
    console.error(error);
  }
}

function readCSVFile(filePath, dictionary) {
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        const keys = Object.keys(row);
        const key = row[keys[0]];

        const values = keys.slice(1).map((column) => row[column]);

        dictionary[key] = values;
      })
      .on("end", () => {
        resolve();
      })
      .on("error", (error) => {
        reject(error);
      });
  });
}

// Llama a la función getCSVDictionary para comenzar la carga del diccionario
getCSVDictionary(Productdictionary, "./products_E2.csv");
getCSVDictionary(Formuladictionary, "./formulas_E2.csv");

// Esta es una funcion para obtener el token, la usamos para hacer los llamados a la API (necesitan el token como autorizacion)
async function getToken() {
  try {
    const headers = {
      "Content-Type": "application/json",
    };
    const response = await axios.post(
        "https://dev.api-proyecto.2023-1.tallerdeintegracion.cl/ordenes-compra/autenticar",
        { group: 5, secret: "p=HjsR<8qUDZ9kSEdv" },
        {
          headers,
        }
    );
    return response.data.token;
  } catch (error) {
    console.error(error);
    return null;
  }
}

//crear orden
const crearOrden = async (requestBody) => {
  try {
    const token = await getToken();
    const headers = {
      "Content-Type": "application/json", // Ajusta el tipo de contenido si es necesario
      Authorization: "Bearer " + token,
    };
    const response = await axios.post(
      `https://dev.api-proyecto.2023-1.tallerdeintegracion.cl/ordenes-compra/ordenes`,
      requestBody,
      {headers}
    );
    console.log(response.data);
    if (response.status === 201){
      notificarOrden(response.data)
    }
  } catch (error) {
    console.log(error.response.data);
  }
};


//obtener orden de compra
const obtenerOrden = async (idOrden) => {
  try {
    const token = await getToken();
    const headers = {
      "Content-Type": "application/json", // Ajusta el tipo de contenido si es necesario
      Authorization: "Bearer " + token,
    };
    const response = await axios.get(
      `https://dev.api-proyecto.2023-1.tallerdeintegracion.cl/ordenes-compra/ordenes/${idOrden}`,
      {
        headers,
      }
    );
    console.log(response.data);
    if (response.status === 201){
      notificarActualizacion(response.data)
    }
  } catch (error) {
    console.log(error.response.data);
  }
};

//crear orden
const actualizarOrden = async (requestBody, idOrden) => {
  try {
    const token = await getToken();
    const headers = {
      "Content-Type": "application/json", // Ajusta el tipo de contenido si es necesario
      Authorization: "Bearer " + token,
    };
    console.log(requestBody)
    const response = await axios.post(
      `https://dev.api-proyecto.2023-1.tallerdeintegracion.cl/ordenes-compra/ordenes/${idOrden}/estado`,
      requestBody,
      {headers}
    );
    console.log(response.data);
    return response.data
  } catch (error) {
    console.log(error.response.data);
  }
};

//notificar al grupo que la orden fue creada
const notificarOrden = async (data) => {
  try {
    const headers = {
      "Content-Type": "application/json", // Ajusta el tipo de contenido si es necesario
    };
    const requestBody = {
      "cliente": data.cliente,
      "sku": data.sku,
      "fechaEntrega": data.vencimiento,
      "cantidad": data.cantidad,
      "urlNotificacion": "nosequeesesto.cl"
   }
    const response = await axios.post(
      `http://lagarto5.ing.puc.cl/ordenes-compra/${data.id}`,
      requestBody,
      {headers}
    );
    console.log(response.data);
  } catch (error) {
    console.log(error.response.data);
  }
};

//notificar al grupo que la orden fue actualizada
const notificarActualizacion = async (data) => {
  try {
    const headers = {
      "Content-Type": "application/json", // Ajusta el tipo de contenido si es necesario
    };
    const requestBody = {
      "cliente": data.cliente,
      "sku": data.sku,
      "fechaEntrega": data.vencimiento,
      "cantidad": data.cantidad,
      "urlNotificacion": "nosequeesesto.cl"
   }
    const response = await axios.post(
      `http://lagarto5.ing.puc.cl/ordenes-compra/${data.id}`,
      requestBody,
      {headers}
    );
    console.log(response.data);
  } catch (error) {
    console.log(error.response.data);
  }
};

async function manejarOrden(pedido){
  try {
    requestBody = {"estado": "aceptada"}
    idOrden = pedido.id
    try {
      await actualizarOrden(requestBody, idOrden);
      await producir_orden(idOrden);
    } catch (error) {
      console.log(error);
    }
    
  } catch (error) {
    console.log(error)
  }
}


async function producir_orden(idOrden){
    try {
        const token = await getToken();
        const headers = {
            "Content-Type": "application/json", // Adjust the content type if necessary
            Authorization: "Bearer " + token,
          };
          const response = await axios.get(
            `https://dev.api-proyecto.2023-1.tallerdeintegracion.cl/ordenes-compra/ordenes/${idOrden}`,
            {headers})
        sku = response.data.sku
        console.log(sku)
        const producto = Productdictionary[sku];
        //console.log(producto)
        // si es una hamburguesa debiera tener una formula que esta en Formulasdictionary
        
        if(producto[9] === "cocina"){
          ingredientes = []
          Object.keys(Formuladictionary).forEach(key => {
            if (key === sku) {
              ingredientes.push({
                llave: key,
                valor: Formuladictionary[key]
              });
            }
          });
          console.log("voy aproducir")
          console.log(ingredientes)
          //falta hacer que la cantidad calce con el lote de manera automatica
          producirSku(ingredientes[0].valor[1], 6)

        } 

    }
        catch (error) {
        console.log(error)
    }
}

//producir_orden("6470ffd12abc3cdd7509ff9d")

module.exports = router;

//prueba crear orden
// const fechaActualUtc = moment.utc();
// const fechaHoraUtc4 = fechaActualUtc.add(4, "hours").format("YYYY-MM-DD HH:mm:ss");
// const requestBody = {
//   "cliente":"5",
//   "proveedor":"7",
//   "sku":"22993410e2",
//   "cantidad":4,
//   "vencimiento":fechaHoraUtc4
// }
// crearOrden(requestBody)

// prueba obtener orden
// idOrden = "6477d6983a956b399c778e0b"
// obtenerOrden(idOrden)


//prueba Actualizar estado de Orden de Compra
// requestBody = {
//   "estado": "aceptada"
// }
// idOrden = "6477d6983a956b399c778e0b"
// actualizarOrden(requestBody, idOrden)

const leerArchivosXML = require('../SFTP2.js');

function procesarPedidos() {
  leerArchivosXML()
    .then(pedidos => {
      
      console.log(pedidos);
      //for cada pedido, manejar orden
      manejarOrden(pedidos[0])
      
    })
    .catch(error => {
      console.log(Formuladictionary)
      console.error('Error:', error.message);
    });
}

// Llamar a la función inicialmente
procesarPedidos();

// Ejecutar la función cada 15 minutos
setInterval(procesarPedidos, 15 * 60 * 1000); // 15 minutos en milisegundos