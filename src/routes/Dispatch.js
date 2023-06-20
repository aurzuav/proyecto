
const axios = require("axios");
const getToken = require("./getTokenW");
const getData = require("./getData.js");

async function Dispatch(idOrden, productsId) {
	try {
        //TOKEN
        const token = await getToken();
        const headers = {
            "Content-Type": "application/json",
            Authorization: "Bearer " + `${token}`,
        };
        for (let indice in productsId){
            productId = productsId[indice]
            const dispatchResponse = await axios.post(
                `https://dev.api-proyecto.2023-1.tallerdeintegracion.cl/warehouse/dispatch`,
                { "productId": `${productId}`, "orderId": `${idOrden}` },
                {headers}
            );
            console.log(dispatchResponse.data)
            return true
        }
        getData({ order_id: `${idOrden}` })
	} catch (error) {
        if (error.isAxiosError) {
            const errorArray = error.response.data; // Accede al array de errores
            console.log(errorArray); // Imprime el array de errores
        }
	}
}



module.exports = Dispatch;
