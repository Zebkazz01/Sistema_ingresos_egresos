import { NextApiRequest, NextApiResponse } from 'next';
import swaggerSpec from '../../lib/swagger';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Servir la especificación OpenAPI como JSON
    if (req.query.format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      return res.status(200).json(swaggerSpec);
    }

    // Inicializar Swagger UI
    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>API Documentation - Sistema de Gestión Financiera</title>
    <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.10.5/swagger-ui.css" />
    <style>
        html {
            box-sizing: border-box;
            overflow: -moz-scrollbars-vertical;
            overflow-y: scroll;
        }
        *, *:before, *:after {
            box-sizing: inherit;
        }
        body {
            margin: 0;
            background: #fafafa;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
        .swagger-ui .topbar {
            background: #2563eb;
            background-image: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
        }
        .swagger-ui .topbar .download-url-wrapper {
            display: none;
        }
        .swagger-ui .info {
            margin: 20px 0;
        }
        .swagger-ui .info .title {
            color: #2563eb;
            font-size: 2.5em;
            margin: 0 0 10px;
        }
        .swagger-ui .info .description {
            background: #f8fafc;
            border-left: 4px solid #2563eb;
            padding: 15px;
            margin: 15px 0;
            border-radius: 4px;
        }
        .swagger-ui .scheme-container {
            background: #f1f5f9;
            border: 1px solid #cbd5e1;
            border-radius: 4px;
            padding: 15px;
            margin: 20px 0;
        }
        .topbar-wrapper {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 20px;
            background: #2563eb;
            color: white;
        }
        .topbar-wrapper .title {
            font-size: 1.5em;
            font-weight: bold;
        }
        .topbar-wrapper .links a {
            color: white;
            text-decoration: none;
            margin-left: 20px;
            padding: 8px 15px;
            border: 1px solid rgba(255,255,255,0.3);
            border-radius: 4px;
            transition: all 0.3s;
        }
        .topbar-wrapper .links a:hover {
            background: rgba(255,255,255,0.1);
            border-color: rgba(255,255,255,0.5);
        }
        .auth-notice {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            padding: 15px;
            margin: 0px;
            color: #92400e;
        }
        .auth-notice strong {
            color: #78350f;
        }
    </style>
</head>
<body>
    <div class="topbar-wrapper">
        <div class="title">Prueba tecnica de Sistema de Gestión de ingresos y egresos - API Documentation</div>
        <div class="links">
            <a href="/api/docs?format=json" target="_blank"> OpenAPI JSON</a>
            <a href="/" target="_blank"> Inicio</a>
        </div>
    </div>
    
    <div class=" auth-notice">
        <strong> Nota de Autenticación:</strong> 
        Para probar los endpoints protegidos, primero debe autenticarse visitando 
        <a href="/auth/signin" target="_blank" style="color: #1d4ed8; font-weight: bold;">/auth/signin</a>
        en otra pestaña. Esto establecerá las cookies de sesión necesarias.
    </div>

    <div id="swagger-ui"></div>

    <script src="https://unpkg.com/swagger-ui-dist@5.10.5/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@5.10.5/swagger-ui-standalone-preset.js"></script>
    <script>
        window.onload = function() {
            const spec = ${JSON.stringify(swaggerSpec)};
            
            const ui = SwaggerUIBundle({
                spec: spec,
                dom_id: '#swagger-ui',
                deepLinking: true,
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIStandalonePreset
                ],
                plugins: [
                    SwaggerUIBundle.plugins.DownloadUrl
                ],
                layout: "StandaloneLayout",
                validatorUrl: null,
                tryItOutEnabled: true,
                supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch'],
                docExpansion: 'list',
                tagsSorter: 'alpha',
                operationsSorter: 'alpha',
                defaultModelsExpandDepth: 2,
                defaultModelExpandDepth: 2,
                showExtensions: true,
                showCommonExtensions: true,
                requestInterceptor: function(request) {
                    // Los interceptors se pueden usar para modificar las requests
                    console.log('Request:', request);
                    return request;
                },
                responseInterceptor: function(response) {
                    // Los interceptors se pueden usar para modificar las responses
                    console.log('Response:', response);
                    return response;
                }
            });
            
            // Personalizar la interfaz después de que se carga
            setTimeout(function() {
                // Ocultar el logo de Swagger
                const logo = document.querySelector('.topbar-wrapper img');
                if (logo) logo.style.display = 'none';
                
                // Agregar información adicional
                const infoSection = document.querySelector('.information-container');
                if (infoSection && !document.querySelector('.custom-info')) {
                    const customInfo = document.createElement('div');
                    customInfo.className = 'custom-info';
                    customInfo.style.cssText = 'background: #eff6ff; border: 1px solid #2563eb; border-radius: 6px; padding: 15px; margin: 20px 0; color: #1e40af;';
                    customInfo.innerHTML = \`
                        <h3 style="margin: 0 0 10px; color: #1e40af;"> Instrucciones de Uso</h3>
                        <ol style="margin: 0; padding-left: 20px; line-height: 1.6;">
                            <li><strong>Autenticación:</strong> Visite <code style="background: #dbeafe; padding: 2px 6px; border-radius: 3px;"> /auth/signin</code> para obtener cookies de sesión</li>
                            <li><strong>Probar Endpoints:</strong> Use el botón "Try it out" en cada endpoint</li>
                            <li><strong>Movimientos:</strong> Los endpoints de movimientos están en <code style="background: #dbeafe; padding: 2px 6px; border-radius: 3px;">/api/movements/simple</code></li>
                            <li><strong>Roles:</strong> Los endpoints marcados con  requieren permisos de ADMIN</li>
                        </ol>
                        
                        <h3 style="margin: 20px 0 10px; color: #1e40af;"> Pruebas Unitarias</h3>
                        <div style="background: #f1f5f9; padding: 15px; border-radius: 6px; margin: 10px 0;">
                            <p style="margin: 0 0 10px;"><strong>36 pruebas unitarias implementadas:</strong></p>
                            <ul style="margin: 0; padding-left: 20px; line-height: 1.6;">
                                <li><strong>19 pruebas de utilidades:</strong> formateo, validaciones, cálculos</li>
                                <li><strong>17 pruebas de lógica de negocio:</strong> hook useMovements completo</li>
                                <li><strong>Configuración Jest:</strong> React Testing Library + mocks</li>
                            </ul>
                            <div style="margin-top: 15px; font-family: monospace; background: #1e293b; color: #f8fafc; padding: 10px; border-radius: 4px; font-size: 13px;">
                                <div># Comandos para ejecutar las pruebas:</div>
                                <div style="color: #34d399;">npm test</div>
                                <div style="color: #34d399;">npm run test:watch</div>
                                <div style="color: #34d399;">npm run test:coverage</div>
                            </div>
                        </div>
                        
                        <h3 style="margin: 20px 0 10px; color: #1e40af;"> Stack Tecnológico</h3>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 10px 0;">
                            <div style="background: #f8fafc; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0;">
                                <strong>Frontend:</strong><br>
                                Next.js 15, TypeScript, Tailwind CSS, Shadcn/ui, Recharts
                            </div>
                            <div style="background: #f8fafc; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0;">
                                <strong>Backend:</strong><br>
                                API Routes, Prisma ORM, PostgreSQL, Better Auth
                            </div>
                        </div>
                    \`;
                    infoSection.appendChild(customInfo);
                }
            }, 1000);
        };
    </script>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(html);
  }

  res.setHeader('Allow', ['GET']);
  res.status(405).json({ error: 'Método no permitido' });
}
