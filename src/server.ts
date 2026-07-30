import 'dotenv/config';
import express, { Express, Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { createHttpRouter } from './adapters/http/router';
import { createTelegramBot } from './adapters/telegram/bot';

/**
 * Factory para crear y configurar la instancia de Express desacoplada del listener HTTP.
 */
export function createApp(): Express {
  const app = express();

  // Middleware para parsear JSON
  app.use(express.json());

  // Endpoint de comprobación de salud (Healthcheck para Coolify / Traefik)
  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'ok',
      service: 'kanarii-server',
      timestamp: new Date().toISOString()
    });
  });

  // Montar endpoints HTTP/REST de adaptadores
  const httpRouter = createHttpRouter();
  app.use(httpRouter);

  // Configuración de servicio estático y Fallback SPA
  const distPath = path.resolve(process.cwd(), 'dist');

  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath, {
      maxAge: '1y',
      setHeaders: (res: Response, filePath: string) => {
        if (filePath.endsWith('.html')) {
          res.setHeader('Cache-Control', 'no-cache');
        }
      }
    }));

    // Catch-all SPA fallback para React Router 7
    app.get('*', (req: Request, res: Response, next: NextFunction) => {
      if (req.path.startsWith('/api') || req.path === '/health') {
        return next();
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    console.warn(`⚠️ Advertencia: La carpeta estática '${distPath}' no existe aún. Ejecuta 'npm run build' para compilar el frontend.`);
  }

  return app;
}

/**
 * Inicia el servidor HTTP y los servicios secundarios (ej. Telegram Bot).
 */
export function startServer() {
  const app = createApp();

  // Inicializar Bot de Telegram condicional si ENABLE_TELEGRAM_BOT=true
  const enableTelegram = process.env.ENABLE_TELEGRAM_BOT === 'true';
  const telegramToken = process.env.TELEGRAM_BOT_TOKEN;

  if (enableTelegram && telegramToken) {
    try {
      const bot = createTelegramBot(telegramToken);
      bot.start({
        onStart: (info) => {
          console.log(`🤖 Bot de Telegram iniciado correctamente para @${info.username}`);
        }
      }).catch((botErr) => {
        console.error('⚠️ [Telegram Bot] Error en el sondeo del Bot de Telegram (ej. conflicto HTTP 409 de otra instancia en ejecución). El servidor web continuará funcionando:', botErr.message || botErr);
      });
    } catch (botErr) {
      console.error('🔴 Error al iniciar el Bot de Telegram:', botErr);
    }
  } else if (enableTelegram) {
    console.warn('⚠️ ENABLE_TELEGRAM_BOT está activo pero no se ha proporcionado TELEGRAM_BOT_TOKEN.');
  }

  const PORT = Number(process.env.PORT) || 3000;
  const HOST = process.env.HOST || '0.0.0.0';

  const server = app.listen(PORT, HOST, () => {
    console.log(`🚀 Servidor unificado Kanarii escuchando en http://${HOST}:${PORT}`);
  });

  return server;
}

import { fileURLToPath } from 'url';

// Ejecutar servidor de forma automática si es el script principal
const isMainModule = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (process.env.NODE_ENV !== 'test' && isMainModule) {
  startServer();
}

export default createApp;
