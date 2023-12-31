

const Koa = require("koa");
const KoaLogger = require("koa-logger");
const koaBody = require("koa-body");
const axios = require("axios");
const Router = require("koa-router");
const fs = require("fs");
const csv = require("csv-parser");
const bodyParser = require("koa-bodyparser");
const manejarOrden = require("./routes/manejarOrden.js");
const getInvoice = require("./routes/getInvoice.js");

const { Pool } = require('pg');

const app = new Koa();
const router = new Router();
const port = 3000;

app.use(KoaLogger());
app.use(router.routes());
app.use(router.allowedMethods());
app.use(bodyParser());

app.use(async (ctx, next) => {
  await next();
  ctx.set("Access-Control-Allow-Origin", "*");
  ctx.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  ctx.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
});

let productDictionary = {};

// gets token
router.get("/", async (ctx) => {
  try {
    const headers = {
      "Content-Type": "application/json", // Adjust the content type if necessary
    };
    const response = await axios.post(
      "https://dev.api-proyecto.2023-1.tallerdeintegracion.cl/warehouse/auth",
            //{ group: 5, secret: "J6RyeTrwNgX.Z+*MKh4EaBuLn" },
            { group: 5, secret: "p=HjsR<8qUDZ9kSEdv" },
      {
        headers,
      }
    ); // Replace with the API endpoint URL
    ctx.body = response.data.token;
    const token = response.data.token;
    //console.log(response.data);
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: error.message };
  }
});

// Configurar la conexión a la base de datos
const pool = new Pool({
  user: 'postgres',
  password: '12345678',
  host: 'localhost',
  database: 'entrega_3',
  port: 5432,
});


// Definir la ruta para obtener los datos de la tabla "ordenes_creadas"
router.get('/ordenes', async (ctx, next) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM ordenes_creadas');
    const rows = result.rows.filter(row => {
      // Filtrar las filas que contengan valores nulos
      return Object.values(row).every(value => value !== null);
    });
    ctx.body = rows;
  } catch (error) {
    console.error('Error al obtener los datos de la tabla "ordenes_creadas":', error);
    ctx.status = 500;
    ctx.body = 'Error al obtener los datos';
  }
  await next();
});

// Definir la ruta para obtener los datos de la tabla "ordenes_creadas"
router.get('/ordenes2', async (ctx, next) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM ordenes_recibidas');
    const rows = result.rows.filter(row => {
      // Filtrar las filas que contengan valores nulos
      return Object.values(row).every(value => value !== null);
    });
    ctx.body = rows;
  } catch (error) {
    console.error('Error al obtener los datos de la tabla "ordenes_recibidas":', error);
    ctx.status = 500;
    ctx.body = 'Error al obtener los datos';
  }
  await next();
});




// Esta es una funcion para obtener el token, la usamos para hacer los llamados a la API (necesitan el token como autorizacion)
async function getToken() {
  try {
    const headers = {
      "Content-Type": "application/json",
    };
    const response = await axios.post(
      "https://dev.api-proyecto.2023-1.tallerdeintegracion.cl/warehouse/auth",
      //{ group: 5, secret: "J6RyeTrwNgX.Z+*MKh4EaBuLn" },
      { group: 5, secret: "p=HjsR<8qUDZ9kSEdv" },
      { headers }
    );
    return response.data.token;
  } catch (error) {
    console.error(error);
    return null;
  }
}

module.exports = getToken;

const ordenCompra = require('./routes/ordenCompra');
const payInvoice = require("./routes/payInvoice.js");
const obtenerOrden = require("./routes/obtenerOrden.js");
const wait = require("./routes/wait.js");
const alterarEstado = require("./cambiar_estado.js");
app.use(ordenCompra.routes())

// dispatches products - ver input productid y orderid
router.get("/dispatch", async (ctx) => {
  try {
    const token = await getToken();
    //console.log("dispatch");
    console.log(token);

    const headers = {
      "Content-Type": "application/json", // Adjust the content type if necessary
      Authorization: "Bearer " + token,
    };

    const response = await axios.post(
      "https://dev.api-proyecto.2023-1.tallerdeintegracion.cl/warehouse/dispatch",
      { productId: `${productid}`, orderId: `${orderId}` },
      {
        headers,
      }
    ); // Replace with the API endpoint URL
    ctx.body = response.data;
    //console.log(response.data);
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: error.message };
  }
});

// Esta request es para generar un producto en la bodega.
// Actualmente tiene hardcodeado el sku y la cantidad
// se puede hacer funcion eventualmente para que el usuario ingrese el sku y la cantidad
router.get("/product", async (ctx) => {
  try {
    const token = await getToken();
    //console.log("product");
    //console.log(token);
    const headers = {
      "Content-Type": "application/json", // Adjust the content type if necessary
      Authorization: "Bearer " + token,
    };
    // en la linea de abajo esta hardcodeado el sku y la cantidad
    const response = await axios.post(
      "https://dev.api-proyecto.2023-1.tallerdeintegracion.cl/warehouse/products",
      { sku: "015edda868", quantity: 4 },
      {
        headers,
      }
    ); // Replace with the API endpoint URL
    ctx.body = response.data;
    console.log(response.data);
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: error.message };
  }
});

// Esta request es para obtener las distintas bodegas y su informacion
router.get("/inventory", async (ctx) => {
  const token = await getToken();
  console.log("inventory");
  console.log(token);
  try {
    const headers = {
      "Content-Type": "application/json", // Adjust the content type if necessary
      Authorization: "Bearer " + `${token}`,
    };
    //console.log(headers);
    const response = await axios.get(
      "https://dev.api-proyecto.2023-1.tallerdeintegracion.cl/warehouse/stores",
      {
        headers,
      }
    ); // Replace with the API endpoint URL
    ctx.body = response.data;
    console.log(response.data);
    // quiero obtener el _id de cada uno de los stores
    const storeId_1 = response.data[0]._id;
    const storeId_2 = response.data[1]._id;
    const storeId_3 = response.data[2]._id;
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: error.message };
  }
});

// Este llamado es para obtener el inventario de cada bodega e imprimirlo en consola
router.get("/stocks", async (ctx) => {
  const token = await getToken();
  try {
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + `${token}`,
    };
    const storesResponse = await axios.get(
      "https://dev.api-proyecto.2023-1.tallerdeintegracion.cl/warehouse/stores",
      {
        headers,
      }
    );
    //console.log(storesResponse.data);
    const stores = storesResponse.data;
    const products = [];
    for (const store of stores) {
      //console.log(store._id);
      const inventoryResponse = await axios.get(
        `https://dev.api-proyecto.2023-1.tallerdeintegracion.cl/warehouse/stores/${store._id}/inventory`,
        {
          headers,
        }
      );
      for (const inventory of inventoryResponse.data) {
        //console.log("entro inventario");
        //console.log(inventory);
        const productIndex = products.findIndex((p) => p.sku === inventory.sku && p.bodega === inventory.store);
        if (productIndex === -1) {
          products.push({
            sku: inventory.sku,
            total: inventory.quantity,
            bodega: inventory.store,
          });
        } else {
          //console.log("entro else");
          //console.log(inventory.quantity);
          //console.log(products[productIndex].total);
          products[productIndex].total += inventory.quantity;
          //console.log(products[productIndex].total);
        }
      }
    }
    //console.log(products);
    ctx.body = JSON.stringify(products, null, 2);
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: error.message };
  }
});

// Dashboard
router.get("/dashboard", async (ctx) => {
  const token = await getToken();
  const inventoryDict = {};
  try {
    const headers = {
      "Content-Type": "application/json", 
      Authorization: "Bearer " + `${token}`,
    };
    const response = await axios.get(
      "https://dev.api-proyecto.2023-1.tallerdeintegracion.cl/warehouse/stores",
      {
        headers,
      }
    );
      // Tabla Inventario
    let table = fs.readFileSync("src/dashboard.html", "utf8")
    response.data.forEach(element => {
      table += dashboardInventory(element);
      if (element.buffer == true) {
        inventoryDict[element._id] = "Bodega Buffer";
      } else if (element.kitchen== true) {
        inventoryDict[element._id] = "Bodega Kitchen";
      } else {
        inventoryDict[element._id] = "Bodega";
      }
    });
    table += "</table>"

    // Tabla Stock
    const stores = response.data;
    for (const store of stores) {
      const stockResponse = await axios.get(
        `https://dev.api-proyecto.2023-1.tallerdeintegracion.cl/warehouse/stores/${store._id}/inventory`,
        {
          headers,
        }
      );
      for (const stock of stockResponse.data) {
        if (stock.store in inventoryDict) {
          table += "<table><tr><th>SKU</th><th>Cantidad</th><br>"
          table += `<h2>Stock en ${inventoryDict[stock.store]}</h2>`;
          table += dashboardStock(stock);
          delete inventoryDict[store._id];
        } else {
          table += dashboardStock(stock);
        }
      }
    }
    ctx.body = table;
    //console.log(response.data);
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: error.message };
  }
});

function dashboardInventory (element){
  const occupation = ((element.usedSpace / element.totalSpace) * 100).toFixed(2) + "%";

  if (element.buffer == true) {
    return `<tr><td>Bodega Buffer</td><td>${element.usedSpace}</td><td>${element.totalSpace}</td><td>${occupation}</td><td>${element._id}</td></tr>`;
  } else if (element.kitchen == true) {
    return `<tr><td>Bodega Kitchen</td><td>${element.usedSpace}</td><td>${element.totalSpace}</td><td>${occupation}</td><td>${element._id}</td></tr>`;
  } else {
    return `<tr><td>Bodega</td><td>${element.usedSpace}</td><td>${element.totalSpace}</td><td>${occupation}</td><td>${element._id}</td></tr>`;
  }
}

function dashboardStock(product) {
  return `<tr><td>${product.sku}</td><td>${product.quantity}</td></tr>`;
}

const ordenesRecibidas = [];
const ordenesRecibidas2 = [];
const ordenesRecibidas3 = [];
const listInstructions = [];
const listInstructions2 = [];


// servicio 2 - recibe orden
app.use(async (ctx, next) => {
  if (ctx.method === "POST" && ctx.url.startsWith("/ordenes-compra/")) {
    const id_orden = ctx.url.replace("/ordenes-compra/", "");

    const { cliente, sku, fechaEntrega, cantidad, urlNotificacion } =
      ctx.request.body;

    if (ordenesRecibidas.includes(id_orden)) {
      ctx.status = 400;
      ctx.body = { mensaje: "OC ya fue recibida" };
      const instruction = {
        id: id_orden,
        instruction: "post",
      };
      listInstructions.push(instruction);
      writeInstruction(
        "Instruction_S2.txt",
        JSON.stringify(listInstructions, null, 2).replace(/\n/g, "\r\n") + "\r\n"
      );
      return;
    }

    const nuevaOrden = {
      id: id_orden,
      cliente,
      sku,
      fechaEntrega,
      cantidad,
      urlNotificacion,
      estado: "recibida",
    };

    ordenesRecibidas.push(id_orden);
    ordenesRecibidas2.push(nuevaOrden);
    writeFile(
      "Output_S2.txt",
      JSON.stringify(ordenesRecibidas2, null, 2).replace(/\n/g, "\r\n") + "\r\n"
    );

    const instruction = {
      id: id_orden,
      instruction: "post",
    };
    listInstructions.push(instruction);
    writeInstruction(
      "Instruction_S2.txt",
      JSON.stringify(listInstructions, null, 2).replace(/\n/g, "\r\n") + "\r\n"
    );
    //writeInstruction(JSON.stringify(listInstructions) + '\n');

    // Send the response
    ctx.status = 201;
    ctx.body = nuevaOrden;

    console.log("Orden grupo recibida exitosamente");
    console.log(nuevaOrden);
    // manejar la orden
    manejarOrden(nuevaOrden.id, "grupo");

  }

  await next();
});

// servicio 3 - consulta estado
app.use(async (ctx, next) => {
  if (ctx.method === "PATCH" && ctx.url.startsWith("/ordenes-compra/")) {
    const id_orden = ctx.url.replace("/ordenes-compra/", "");
    var orden = ordenesRecibidas2.find((orden) => orden.id == id_orden);

    if (orden == undefined) {
      // creamos la orden con su id y el estado recibido
      console.log("Orden no existe");
      ctx.status = 204;
      orden = {
        id: id_orden,
        estado: ctx.request.body.estado,
      };  
      ordenesRecibidas2.push(orden);
      writeFile(
        "Output_S3.txt",
        JSON.stringify(ordenesRecibidas2, null, 2).replace(/\n/g, "\r\n") + "\r\n"
      );

      //payInvoice(id_orden);
    }else{
      orden.estado = ctx.request.body.estado;
      //payInvoice(id_orden);

      ctx.status = 204;
      //ctx.body = orden;
      ordenesRecibidas3.push(orden);
      writeFile(
        "Output_S3.txt",
        JSON.stringify(ordenesRecibidas3, null, 2).replace(/\n/g, "\r\n") + "\r\n"
      );

      const instruction = {
        id: id_orden,
        estado: ctx.request.body.estado,
      };
      listInstructions2.push(instruction);
      writeInstruction(
        "Instruction_S3.txt",
        JSON.stringify(listInstructions2, null, 2).replace(/\n/g, "\r\n") + "\r\n"
      );
    }
    if (orden.estado == "aceptada"){
      await alterarEstado(id_orden, orden.estado);
      await payInvoice(id_orden);
      let datosOrden = "";
      let cumplida = false;
      while(!cumplida){
        datosOrden = await obtenerOrden(id_orden)
        if (datosOrden.estado == "cumplida"){
          payInvoice(id_orden);
          cumplida = true
          break
        }
        wait(10*60*1000)
      }
    }
    
    await next();
  }
});


function writeFile(nombre_archivo, data) {
  fs.writeFile(nombre_archivo, data, (err) => {
    // In case of a error throw err.
    if (err) throw err;
  });
}

function readFile(id_orden, status) {
  fs.readFile("Output.txt", (err, inputD) => {
    if (err) throw err;
    const text = inputD.toString();
    const data = JSON.parse(text);
    for (let i = 0; i < data.length; i++) {
      if (data[i].id == id_orden.toString()) {
        data[i].estado = status;
        writeFile(JSON.stringify(data));
        return 1;
      }
    }
  });
}

function writeInstruction(nombre_archivo, data) {
  fs.writeFile(nombre_archivo, data, (err) => {
    // In case of a error throw err.
    if (err) throw err;
  });
}

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
