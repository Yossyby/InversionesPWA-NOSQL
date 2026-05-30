const dotenv = require('dotenv');
const path = require('path');

// Cargar el archivo .env real del backend
dotenv.config({ path: path.join(__dirname, '.env') });

console.log("================ VERIFICACIÓN DE ENTORNO ================");
console.log("GEMINI_API_KEY detectada en process.env:", process.env.GEMINI_API_KEY ? "SÍ (Presente)" : "NO (Vacío/Ausente)");
console.log("GEMINI_ENABLED en process.env:", process.env.GEMINI_ENABLED ?? "No especificado (default true)");

// Importar el servicio transpilado para probar el cliente real de Google Gen AI
try {
  const { GeminiAgentService } = require('./dist/modules/agents/geminiAgentService');
  const service = new GeminiAgentService();
  console.log("¿GeminiAgentService.isEnabled() es verdadero?:", service.isEnabled() ? "SÍ" : "NO");

  if (service.isEnabled()) {
    console.log("Realizando llamada de prueba con GeminiAgentService...");
    service.generateSimpleResponse("Responde con la palabra 'LISTO'")
      .then(res => {
        console.log("RESPUESTA DEL AGENTE GEMINI:", res);
        console.log("========================================================");
      })
      .catch(err => {
        console.error("Error en llamada de prueba de GeminiAgentService:", err);
        console.log("========================================================");
      });
  } else {
    console.log("El servicio está inhabilitado porque no detecta process.env.GEMINI_API_KEY");
    console.log("========================================================");
  }
} catch (e) {
  console.log("El backend no está transpilado aún en ./dist. Intentemos requerir vía ts-node/register.");
  try {
    require('ts-node').register();
    const { GeminiAgentService } = require('./src/modules/agents/geminiAgentService');
    const service = new GeminiAgentService();
    console.log("¿GeminiAgentService.isEnabled() es verdadero?:", service.isEnabled() ? "SÍ" : "NO");
    
    if (service.isEnabled()) {
      console.log("Realizando llamada de prueba con GeminiAgentService...");
      service.generateSimpleResponse("Responde con la palabra 'LISTO'")
        .then(res => {
          console.log("RESPUESTA DEL AGENTE GEMINI:", res);
          console.log("========================================================");
        })
        .catch(err => {
          console.error("Error en llamada de prueba de GeminiAgentService:", err);
          console.log("========================================================");
        });
    } else {
      console.log("El servicio está inhabilitado.");
      console.log("========================================================");
    }
  } catch (err) {
    console.error("Error al registrar ts-node o cargar modulo:", err);
    console.log("========================================================");
  }
}
