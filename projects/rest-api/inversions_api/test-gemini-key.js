const https = require('https');

// La clave de API provista por el usuario con el espacio inicial exacto de su .env
const apiKey = " AIzaSyB3JEAKEw9yhES9GRKyoA-cx3YyC3LhM0s";
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

const data = JSON.stringify({
  contents: [{ parts: [{ text: "Hola, responde brevemente con la palabra 'OK' si recibes este mensaje." }] }]
});

console.log("Iniciando petición de diagnóstico a Gemini API...");
console.log("Endpoint:", `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSy...M0s`);

const req = https.request(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log("\n================ DIAGNÓSTICO GEMINI ================");
    console.log("Código de Estado HTTP:", res.statusCode);
    try {
      const parsed = JSON.parse(body);
      console.log("Cuerpo de Respuesta Parseado:\n", JSON.stringify(parsed, null, 2));
    } catch {
      console.log("Cuerpo de Respuesta Crudo:\n", body);
    }
    console.log("====================================================");
  });
});

req.on('error', (e) => {
  console.error("\nError de Red al Conectar a Google APIs:", e);
});

req.write(data);
req.end();
