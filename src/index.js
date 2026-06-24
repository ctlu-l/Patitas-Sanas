import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

// Inicializamos el servidor MCP
const server = new McpServer({
  name: "Mi Servidor de Cloudflare",
  version: "1.0.0"
});

// Agregamos una herramienta (Tool) de ejemplo para que la IA la pruebe
server.tool(
  "calcular_cuadrado",
  "Calcula el cuadrado de un número",
  async ({ numero }) => {
    const resultado = numero * numero;
    return {
      content: [{ type: "text", text: `El cuadrado de ${numero} es ${resultado}` }]
    };
  }
);

// Formato de exportación obligatorio para Cloudflare Workers
export default {
  async fetch(request, env, ctx) {
    // Aquí el SDK de MCP se encarga de procesar la petición de la IA
    return new Response("Servidor MCP de Cloudflare Inicializado", { status: 200 });
  }
};
