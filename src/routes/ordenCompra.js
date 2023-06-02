const Router = require("koa-router");
const axios = require("axios");
const router = new Router();
const fs = require("fs");
const csv = require("csv-parser");
const moment = require("moment");
const producirSku = require("./producir.js");
const moveProduct = require("./moveProduct.js");

const {
  getCSVDictionaryProducts,
  getCSVDictionaryFormula,
} = require("./obtenerDiccionarios");

// Se usa el excel de la E2
const Productdictionary = {};
const Formuladictionary = {}; // Declara la variable dictionary fuera de la función

// Llama a la función getCSVDictionary para comenzar la carga del diccionario
getCSVDictionaryProducts(Productdictionary, "./products_E2.csv");
getCSVDictionaryFormula(Formuladictionary, "./formulas_E2.csv");


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
      { headers }
    );

    console.log(response.data);
    if (response.status === 201){
      notificarOrden(response.data, 5)
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
      notificarActualizacion(response.data, 5)
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
    //console.log(requestBody)
    const response = await axios.post(
      `https://dev.api-proyecto.2023-1.tallerdeintegracion.cl/ordenes-compra/ordenes/${idOrden}/estado`,
      requestBody,
      { headers }
    );
    //console.log(response.data);
    return response.data;
  } catch (error) {
    console.log(error.response.data);
  }
};

//notificar al grupo que la orden fue creada
const notificarOrden = async (data, group) => {
  // console.log("notificando orden");
  // console.log(group);
  try {
    const headers = {
      "Content-Type": "application/json", // Ajusta el tipo de contenido si es necesario
    };
    const requestBody = {
      cliente: data.cliente,
      sku: data.sku,
      fechaEntrega: data.vencimiento,
      cantidad: data.cantidad,
      urlNotificacion: "nosequeesesto.cl",
    };
    const response = await axios.post(
      `http://lagarto${group}.ing.puc.cl/ordenes-compra/${data.id}`,
      requestBody,
      { headers }
    );
    //console.log(response.data);
  } catch (error) {
    console.log(error.response.data);
  }
};

//notificar al grupo que la orden fue actualizada
const notificarActualizacion = async (data, group) => {
  try {
    const headers = {
      "Content-Type": "application/json", // Ajusta el tipo de contenido si es necesario
    };
    const requestBody = {
      cliente: data.cliente,
      sku: data.sku,
      fechaEntrega: data.vencimiento,
      cantidad: data.cantidad,
      urlNotificacion: "nosequeesesto.cl",
    };
    const response = await axios.post(
      `http://lagarto${group}.ing.puc.cl/ordenes-compra/${data.id}`,
      requestBody,
      { headers }
    );
    console.log(response.data);
  } catch (error) {
    console.log(error.response.data);
  }
};

async function manejarOrden(pedido) {
  try {
    requestBody = { estado: "aceptada" };
    idOrden = pedido.id;
    try {
      await actualizarOrden(requestBody, idOrden, 5);
      await producir_orden(idOrden);
      await ReceptionToKitchen(idOrden);
    } catch (error) {
      console.log(error);
    }
  } catch (error) {
    console.log(error);
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
        console.log("producto")
        console.log(producto)
        const groups = producto.gruposProductores;
        const qty_burger = producto.loteProduccion;
        // si es una hamburguesa debiera tener una formula que esta en Formulasdictionary
        
        if(producto.produccion === "cocina"){
          const formula = Formuladictionary[sku].ingredientes;
          console.log("voy aproducir")
          console.log(formula)
          for (let ingrediente in formula) {
            const ingredient = Productdictionary[ingrediente];
            const array_groups = JSON.parse(ingredient.gruposProductores)
            if (array_groups.includes(5)) {
              console.log("entro al if")
              if (formula.hasOwnProperty(ingrediente)) {
                const qty = ingredient.loteProduccion
                console.log(qty);
                producirSku(ingrediente, qty)
              }
            }
            else { // ask ingredient to another group
              const length = array_groups.length;
              const value = Math.random() * length;
              const group = array_groups[Math.floor(value)];
              notificarOrden(ingredient, group);
              await wait_ingredient(ingrediente);

            }
        }
      }
  } catch (error) {
    console.log(error);
  }
}

async function ReceptionToKitchen(idOrden) {
  try {
    const token = await getToken();
    const headers = {
      "Content-Type": "application/json", // Adjust the content type if necessary
      Authorization: "Bearer " + token,
    };
    const response = await axios.get(
      `https://dev.api-proyecto.2023-1.tallerdeintegracion.cl/ordenes-compra/ordenes/${idOrden}`,
      { headers }
    );
    sku = response.data.sku;
    const formula = Formuladictionary[sku].ingredientes
    
    // CAMBIAR DE BODEGA DE RECEPCION A COCINA EL INGREDIENTE QUE NECESITAMOS PARA LA HAMBURGUESA
    for (let sku in formula) {
      moveProduct(sku);
    }
    
  } catch (error) {
    console.log(error);
  }
}

async function wait_ingredient(sku){
  try {
      const token = await getToken();
      const headers = {
          "Content-Type": "application/json", // Adjust the content type if necessary
          Authorization: "Bearer " + token,
        };
      let condition = 1;
      while (condition == 1) {
        // iterate over all stores
        const stores = await axios.get(
          `https://dev.api-proyecto.2023-1.tallerdeintegracion.cl/warehouse/stores`,
          {headers});
        const array_stores = stores.data;
        for (let store in array_stores){
        const response = await axios.get(
          `https://dev.api-proyecto.2023-1.tallerdeintegracion.cl/warehouse/stores/${store._id}/inventory`,
          {headers});
        const array_inventory = response.data;
        for (product in array_inventory){
          if (product.sku === sku){
            if (product.cantidad > 0){
              condition = 0;
              break;
            }
          }
        }
      }

      
  }}
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

const leerArchivosXML = require("../SFTP2.js");

function procesarPedidos() {
  leerArchivosXML()
    .then((pedidos) => {
      //console.log(pedidos);
      //for cada pedido, manejar orden
      manejarOrden(pedidos[0]);
      //console.log(Formuladictionary);
      //console.log(Productdictionary);
    })
    .catch((error) => {
      console.error("Error:", error.message);
    });
}

// Llamar a la función inicialmente
procesarPedidos();

// Ejecutar la función cada 15 minutos
setInterval(procesarPedidos, 15 * 60 * 1000); // 15 minutos en milisegundos
