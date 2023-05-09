// dispatches products - ver input productid y orderid
router.get('/', async (ctx) => {
    try {
  
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
  
  // produces products - ver input sku y quantity
  router.get('/', async (ctx) => {
    try {
  
        const headers = {
            'Content-Type': 'application/json', // Adjust the content type if necessary
            'Authorization': 'Bearer ' + ctx.request.body.token
          };
      
        const response = await axios.post('https://dev.api-proyecto.2023-1.tallerdeintegracion.cl/warehouse/products', { sku: `${sku}`, quantity: `${quantity}` }, {
            headers }); // Replace with the API endpoint URL
        ctx.body = response.data;
        console.log(response.data);
        } catch (error) {
          ctx.status = 500;
          ctx.body = { error: error.message };
        }
  });
  
// moves product to another groups inventary - ver input group y productid
router.get('/', async (ctx) => {
try {

    const productid = 22993410e2;

    const headers = {
        'Content-Type': 'application/json', // Adjust the content type if necessary
        'Authorization': 'Bearer ' + ctx.request.body.token
        };
    
    const response = await axios.post('https://dev.api-proyecto.2023-1.tallerdeintegracion.cl/warehouse/products/' + `${productid}` + '/group', { group: `${group}` }, {
        headers }); // Replace with the API endpoint URL
    ctx.body = response.data;
    console.log(response.data);
    } catch (error) {
        ctx.status = 500;
        ctx.body = { error: error.message };
    }
});
  
  // moves product from one inventary to another (from same group) - ver input store y productid
  // check if patch is really needed
  router.get('/', async (ctx) => {
    try {
  
        const productid = 22993410e2;
  
        const headers = {
            'Content-Type': 'application/json', // Adjust the content type if necessary
            'Authorization': 'Bearer ' + ctx.request.body.token
          };
      
        const response = await axios.post('https://dev.api-proyecto.2023-1.tallerdeintegracion.cl/warehouse/products/' + `${productid}`, { store: `${store}` }, {
            headers }); // Replace with the API endpoint URL
        ctx.body = response.data;
        console.log(response.data);
        } catch (error) {
          ctx.status = 500;
          ctx.body = { error: error.message };
        }
  });
  
  // get inventory
  router.get('/', async (ctx) => {
    try {
  
        const headers = {
            'Content-Type': 'application/json', // Adjust the content type if necessary
            'Authorization': 'Bearer ' + ctx.request.body.token
          };
      
        const response = await axios.get('https://dev.api-proyecto.2023-1.tallerdeintegracion.cl/warehouse/stores', {}, {
            headers }); // Replace with the API endpoint URL
        ctx.body = response.data;
        console.log(response.data);
        } catch (error) {
          ctx.status = 500;
          ctx.body = { error: error.message };
        }
  });
  
  // get product from store - check input storeid and sku
  router.get('/', async (ctx) => {
    try {
  
        const storeid = 0;
        const sku = 22993410e2;
  
        const headers = {
            'Content-Type': 'application/json', // Adjust the content type if necessary
            'Authorization': 'Bearer ' + ctx.request.body.token
          };
      
        const response = await axios.get('https://dev.api-proyecto.2023-1.tallerdeintegracion.cl/warehouse/stores' + `${storeid}` + '/products?sku=' + `${sku}`, {}, {
            headers }); // Replace with the API endpoint URL
        ctx.body = response.data;
        console.log(response.data);
        } catch (error) {
          ctx.status = 500;
          ctx.body = { error: error.message };
        }
  });
  
  // get skus with stock - check input storeid
  router.get('/', async (ctx) => {
    try {
  
        const storeid = 0;
  
        const headers = {
            'Content-Type': 'application/json', // Adjust the content type if necessary
            'Authorization': 'Bearer ' + ctx.request.body.token
          };
      
        const response = await axios.get('https://dev.api-proyecto.2023-1.tallerdeintegracion.cl/warehouse/stores' + `${storeid}` + '/invetory', {}, {
            headers }); // Replace with the API endpoint URL
        ctx.body = response.data;
        console.log(response.data);
        } catch (error) {
          ctx.status = 500;
          ctx.body = { error: error.message };
        }
  });