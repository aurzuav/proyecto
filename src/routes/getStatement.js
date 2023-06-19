const axios = require('axios');
const parser = require('fast-xml-parser');
const { v4: uuidv4 } = require('uuid');

// Function to retrieve invoices
async function getInvoices(status, side) {
  const url = 'https://dev.api-proyecto.2023-1.tallerdeintegracion.cl/soap/billing?wsdl';
  const soapEnvelope = `
    <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tns="http://tempuri.org/">
      <soap:Header>
        <wsse:Security xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">
          <wsse:UsernameToken>
            <wsse:Username>5</wsse:Username>
            <wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">p=HjsR<8qUDZ9kSEdv</wsse:Password>
          </wsse:UsernameToken>
        </wsse:Security>
      </soap:Header>
      <soap:Body>
        <tns:getInvoices>
          <tns:getInvoicesRequest>
            <tns:status>${status}</tns:status>
            <tns:side>${side}</tns:side>
          </tns:getInvoicesRequest>
        </tns:getInvoices>
      </soap:Body>
    </soap:Envelope>
  `;

  try {
    const response = await axios.post(url, soapEnvelope, {
      headers: {
        'Content-Type': 'text/xml',
      },
    });

    // Parse the SOAP response
    const xmlData = response.data;
    const jsonData = parser.parse(xmlData);

    // Extract the desired information from the parsed response
    const invoices = jsonData['soap:Envelope']['soap:Body']['tns:getInvoicesResponse']['tns:getInvoicesResult'];
    
    // Process the retrieved invoices
    for (const invoice of invoices) {
      // Emit statements, FTP, or pay the statements here
      console.log('Invoice:', invoice);
    }

  } catch (error) {
    // Handle any errors that occur during the API request
    console.error('Error:', error);
  }
}

// Call the function to retrieve invoices
module.exports = getInvoices;
