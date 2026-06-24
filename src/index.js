import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { z } from "zod";

function createServer() {
  const server = new McpServer({
    name: "Mi Servidor de Cloudflare",
    version: "1.0.0"
  });

  server.registerTool(
    "calcular_cuadrado",
    {
      description: "Calcula el cuadrado de un número",
      inputSchema: z.object({
        numero: z.number().describe("El número a elevar al cuadrado")
      })
    },
    async ({ numero }) => {
      const resultado = numero * numero;
      return {
        content: [{ type: "text", text: `El cuadrado de ${numero} es ${resultado}` }]
      };
    }
  );

  return server;
}

export default {
  async fetch(request) {
    // Se crea una instancia nueva de server y transport por petición
    // (requerido desde la SDK 1.26+ para evitar fuga de datos entre clientes)
    const transport = new WebStandardStreamableHTTPServerTransport();
    const server = createServer();
    await server.connect(transport);
    return transport.handleRequest(request);
  }
};
