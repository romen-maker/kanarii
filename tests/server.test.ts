import 'dotenv/config';
import { createApp } from '../src/server';
import http from 'http';

async function runServerIntegrationTest() {
  console.log('🧪 Iniciando prueba de integración y hardening de servidor Node/Express...\n');

  const app = createApp();
  const testPort = 3999;

  // Iniciar servidor de prueba en puerto efímero
  const server = await new Promise<http.Server>((resolve) => {
    const srv = app.listen(testPort, '127.0.0.1', () => {
      resolve(srv);
    });
  });

  const baseUrl = `http://127.0.0.1:${testPort}`;

  try {
    // PASO 1: Verificación de Healthcheck (/health)
    console.log('1️⃣ PASO 1: Probando endpoint de comprobación de salud GET /health...');
    const healthRes = await fetch(`${baseUrl}/health`);
    if (healthRes.status !== 200) {
      throw new Error(`❌ PASO 1 FALLÓ: Código de estado esperado 200, recibido ${healthRes.status}`);
    }
    const healthJson = await healthRes.json() as any;
    if (healthJson.status !== 'ok' || healthJson.service !== 'kanarii-server') {
      throw new Error(`❌ PASO 1 FALLÓ: JSON de respuesta inesperado (${JSON.stringify(healthJson)})`);
    }
    console.log('   ✅ PASO 1 SUPERADO: /health responde 200 OK con { status: "ok" }.\n');

    // PASO 2: Verificación de Aislamiento de Router API (/api/v1) sin intercepción SPA
    console.log('2️⃣ PASO 2: Probando aislamiento del router API REST (/api/v1/...)...');
    const apiRes = await fetch(`${baseUrl}/api/v1/pending-actions/test_id/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirmationToken: 'TEST' })
    });
    
    // Debe responder 401 por falta de token de autenticación API en la cabecera x-api-token
    if (apiRes.status !== 401) {
      throw new Error(`❌ PASO 2 FALLÓ: Código esperado 401 UNAUTHORIZED, recibido ${apiRes.status}`);
    }
    const apiJson = await apiRes.json() as any;
    if (!apiJson.error || !apiJson.error.includes('UNAUTHORIZED')) {
      throw new Error(`❌ PASO 2 FALLÓ: La respuesta API no devolvió el error de autenticación esperado (${JSON.stringify(apiJson)})`);
    }
    console.log('   ✅ PASO 2 SUPERADO: /api/v1 responde 401 JSON y NO es interceptado por el fallback SPA.\n');

    // PASO 3: Verificación de SPA Fallback para React Router 7
    console.log('3️⃣ PASO 3: Probando SPA Fallback en rutas cliente (/comunidades)...');
    const spaRes = await fetch(`${baseUrl}/comunidades`);
    if (spaRes.status !== 200) {
      throw new Error(`❌ PASO 3 FALLÓ: Código esperado 200 para SPA Fallback, recibido ${spaRes.status}`);
    }
    const spaText = await spaRes.text();
    if (!spaText.includes('<html') && !spaText.includes('<!DOCTYPE html>')) {
      throw new Error('❌ PASO 3 FALLÓ: La ruta /comunidades no devolvió el documento HTML del SPA.');
    }
    console.log('   ✅ PASO 3 SUPERADO: Las rutas cliente devuelven correctamente el index.html del SPA.\n');

    console.log('================================================================');
    console.log(' ✨ PRUEBA DE INTEGRACIÓN DE SERVIDOR COMPLETADA CON ÉXITO — 100% AFIRMACIONES SUPERADAS');
    console.log('================================================================\n');
  } finally {
    server.close();
  }
}

runServerIntegrationTest().catch(err => {
  console.error('\n🔴 Error en la prueba de servidor:', err);
  process.exit(1);
});
