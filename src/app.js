const Koa = require('koa');
const KoaLogger = require('koa-logger');
const koaBody = require('koa-body');
const axios = require('axios');
const Router = require('koa-router');
const fs = require('fs');
const csv = require('csv-parser');



const app = new Koa();
const router = new Router();
const port = 3000;

app.use(router.routes());
app.use(router.allowedMethods());


app.use(async (ctx, next) => {
    await next();
    ctx.set('Access-Control-Allow-Origin', '*');
    ctx.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    ctx.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
});

let productDictionary = {};

// gets token
router.get('/', async (ctx) => {
    try {

        const headers = {
            'Content-Type': 'application/json', // Adjust the content type if necessary
        };
        const response = await axios.post('https://dev.api-proyecto.2023-1.tallerdeintegracion.cl/warehouse/auth', { group: 5, secret: 'p=HjsR<8qUDZ9kSEdv' }, {
            headers }); // Replace with the API endpoint URL
        ctx.body = response.data.token;
        const token = response.data.token;
        console.log(response.data);
        } catch (error) {
			ctx.status = 500;
			ctx.body = { error: error.message };
        }
    
});

// Esta es una funcion para obtener el token, la usamos para hacer los llamados a la API (necesitan el token como autorizacion)
async function getToken() {
	try {
		const headers = {
		'Content-Type': 'application/json',
		};
		const response = await axios.post(
		'https://dev.api-proyecto.2023-1.tallerdeintegracion.cl/warehouse/auth',
		{ group: 5, secret: 'p=HjsR<8qUDZ9kSEdv' },
		{ headers }
		);
		return response.data.token;
	} catch (error) {
		console.error(error);
		return null;
	}
}

// dispatches products - ver input productid y orderid
router.get('/dispatch', async (ctx) => {
	try {

		const token = await getToken();
		console.log("dispatch")
		console.log(token)

		const headers = {
			'Content-Type': 'application/json', // Adjust the content type if necessary
			'Authorization': 'Bearer ' + ctx.request.body.token
		};

		const response = await axios.post('https://dev.api-proyecto.2023-1.tallerdeintegracion.cl/warehouse/dispatch', { productId: `${productid}`, orderId: `${orderId}` }, {
			headers }); // Replace with the API endpoint URL
		ctx.body = response.data;
		console.log(response.data);
		} catch (error) {
		ctx.status = 500;
		ctx.body = { error: error.message };
		}
}); 

// Esta request es para generar un producto en la bodega.
// Actualmente tiene hardcodeado el sku y la cantidad
// se puede hacer funcion eventualmente para que el usuario ingrese el sku y la cantidad
router.get('/product', async (ctx) => {
    try {

        const token = await getToken();
        console.log("product")
        console.log(token)
        const headers = {
            'Content-Type': 'application/json', // Adjust the content type if necessary
            'Authorization': 'Bearer ' + token
        };
        // en la linea de abajo esta hardcodeado el sku y la cantidad
        const response = await axios.post('https://dev.api-proyecto.2023-1.tallerdeintegracion.cl/warehouse/products', { sku: '22993410e2', quantity: 4 }, {
            headers }); // Replace with the API endpoint URL
        ctx.body = response.data;
        console.log(response.data);
        } catch (error) {
			ctx.status = 500;
			ctx.body = { error: error.message };
        }
});


// Esta request es para obtener las distintas bodegas y su informacion  
router.get('/inventory', async (ctx) => {
  const token = await getToken();
  console.log("inventory")
  console.log(token)
  try {
      const headers = {
          'Content-Type': 'application/json', // Adjust the content type if necessary
          'Authorization': 'Bearer ' + `${token}`
        };
      console.log(headers)
;      
    const response = await axios.get('https://dev.api-proyecto.2023-1.tallerdeintegracion.cl/warehouse/stores', {
          headers }); // Replace with the API endpoint URL
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
// creo que este no tiene nada hardcodeado, revisenlo igual
router.get('/superinventory', async (ctx) => {
  const token = await getToken();
  console.log("inventory")
  console.log(token)
  try {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + `${token}`
    };
    console.log(headers)
    const storesResponse = await axios.get('https://dev.api-proyecto.2023-1.tallerdeintegracion.cl/warehouse/stores', {
      headers
    });
    console.log(storesResponse.data);
    const stores = storesResponse.data;
    const products = [];
    for (const store of stores) {
      const inventoryResponse = await axios.get(`https://dev.api-proyecto.2023-1.tallerdeintegracion.cl/warehouse/stores/${store._id}/inventory`, {
        headers
      });
      console.log(inventoryResponse.data);
      for (const inventory of inventoryResponse.data) {
        const productIndex = products.findIndex(p => p.sku === inventory.sku);
        if (productIndex === -1) {
          products.push({ sku: inventory.sku, total: inventory.quantity , bodega: inventory.store});
        } else {
          products[productIndex].quantity += inventory.quantity;
        }
      }
    }
    console.log(products);
    ctx.body = products;
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: error.message };
  }
});



function getCSVDictionary() {
  console.log('get CSV file...');
  const filePath = './products.csv';

  readCSVFile(filePath)
  .then((dictionary) => {
      productDictionary = dictionary;
      //console.log(dictionary);
  })
  .catch((error) => {
      console.error(error);
  });
}

function readCSVFile(filePath) {
  return new Promise((resolve, reject) => {
      const dictionary = {};

      fs.createReadStream(filePath)
          .pipe(csv())
          .on('data', (row) => {
          const keys = Object.keys(row);
          const key = row[keys[0]];

          const values = keys.slice(1).map((column) => row[column]);

          dictionary[key] = values;
          })
          .on('end', () => {
          resolve(dictionary);
          })
          .on('error', (error) => {
          reject(error);
          });
      });
}

getCSVDictionary();





app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});