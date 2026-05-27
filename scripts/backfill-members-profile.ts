import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const PROJECT_ID = 'gen-lang-client-0601258149';
const DATABASE_ID = 'ai-studio-fb5ef2e1-c472-43e5-bb6a-51f1141b0793';
const CONFIG_PATH = path.join(process.env.HOME || '', '.config/configstore/firebase-tools.json');

// 1. Obtener Token de Acceso (soporta emulador)
function getAccessToken(): string {
  if (process.env.FIRESTORE_EMULATOR_HOST) {
    return "owner"; // Token administrativo para el emulador
  }
  
  if (!fs.existsSync(CONFIG_PATH)) {
    throw new Error(`No se encontró el archivo de configuración de Firebase en: ${CONFIG_PATH}. Ejecuta 'firebase login' para autenticarte.`);
  }
  const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  const token = config.tokens?.access_token;
  if (!token) {
    throw new Error(`El archivo de configuración de Firebase existe pero no contiene un token de acceso válido. Por favor, vuelve a autenticarte con 'firebase login'.`);
  }
  return token;
}

// 2. Ejecutar comando curl
function runCurl(url: string, method = 'GET', body: any = null, token: string): any {
  let cmd = `curl -s -X ${method} "${url}" -H "Authorization: Bearer ${token}"`;
  if (body) {
    const bodyStr = JSON.stringify(body).replace(/'/g, "'\\''");
    cmd += ` -H "Content-Type: application/json" -d '${bodyStr}'`;
  }
  const output = execSync(cmd).toString();
  try {
    return JSON.parse(output);
  } catch (e) {
    return { error: { message: `No se pudo parsear JSON: ${output}` } };
  }
}

// 3. Helpers para parsear campos REST de Firestore
function parseField(field: any): any {
  if (!field || typeof field !== 'object') return field;
  if ('stringValue' in field) return field.stringValue;
  if ('booleanValue' in field) return field.booleanValue;
  if ('integerValue' in field) return parseInt(field.integerValue, 10);
  if ('doubleValue' in field) return parseFloat(field.doubleValue);
  if ('timestampValue' in field) return field.timestampValue;
  if ('nullValue' in field) return null;
  if ('arrayValue' in field) {
    const values = field.arrayValue?.values || [];
    return values.map((v: any) => parseField(v));
  }
  if ('mapValue' in field) {
    const fields = field.mapValue?.fields || {};
    const result: any = {};
    for (const key of Object.keys(fields)) {
      result[key] = parseField(fields[key]);
    }
    return result;
  }
  return field;
}

function parseDocument(doc: any): any {
  if (!doc || !doc.name) return null;
  const fields = doc.fields || {};
  const result: any = {
    _id: doc.name.split('/').pop(),
    _path: doc.name
  };
  for (const key of Object.keys(fields)) {
    result[key] = parseField(fields[key]);
  }
  return result;
}

// 4. Obtener todos los documentos de una colección de forma recursiva/paginada
function getDocuments(baseUrl: string, collection: string, token: string): any[] {
  const url = `${baseUrl}/${collection}?pageSize=100`;
  let allDocs: any[] = [];
  let nextPageToken: string | null = null;

  do {
    const fetchUrl = nextPageToken ? `${url}&pageToken=${nextPageToken}` : url;
    const response = runCurl(fetchUrl, 'GET', null, token);
    
    if (response.error) {
      if (response.error.status === 'NOT_FOUND') {
        return [];
      }
      throw new Error(`Error en API Firestore (${collection}): ${JSON.stringify(response.error)}`);
    }
    
    const docs = response.documents || [];
    allDocs = allDocs.concat(docs.map(parseDocument).filter(Boolean));
    nextPageToken = response.nextPageToken || null;
  } while (nextPageToken);

  return allDocs;
}

// 5. Obtener un único documento
function getDocument(baseUrl: string, collection: string, docId: string, token: string): any | null {
  const url = `${baseUrl}/${collection}/${docId}`;
  const response = runCurl(url, 'GET', null, token);
  
  if (response.error) {
    if (response.error.status === 'NOT_FOUND') {
      return null;
    }
    throw new Error(`Error en API Firestore (${collection}/${docId}): ${JSON.stringify(response.error)}`);
  }
  
  return parseDocument(response);
}

// 6. Función principal
async function main() {
  const isDryRun = !process.argv.includes('--write');
  console.log(`🚀 Iniciando backfill de perfiles en community_members [Modo: ${isDryRun ? 'DRY RUN' : 'ESCRITURA REAL'}]`);

  const token = getAccessToken();
  const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST;
  
  const baseUrl = emulatorHost
    ? `http://${emulatorHost}/v1/projects/${PROJECT_ID}/databases/${DATABASE_ID}/documents`
    : `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${DATABASE_ID}/documents`;

  if (emulatorHost) {
    console.log(`🔌 Conectado al emulador de Firestore en ${emulatorHost}`);
  } else {
    console.log(`🌐 Conectado a la base de datos de producción en la nube (${PROJECT_ID})`);
  }

  // Obtener todos los miembros
  let members: any[] = [];
  try {
    members = getDocuments(baseUrl, 'community_members', token);
  } catch (error) {
    console.error('❌ Error al obtener los miembros de la comunidad:', error);
    process.exit(1);
  }

  console.log(`🔍 Encontrados ${members.length} miembros en la colección.`);

  let processedCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;

  for (const member of members) {
    const memberId = member._id;
    if (!memberId) continue;

    // Extraer userId: id.split('_').slice(1).join('_')
    const userId = memberId.split('_').slice(1).join('_');
    if (!userId) {
      console.log(`⚠️ No se pudo extraer userId de memberId: "${memberId}". Saltando.`);
      skippedCount++;
      continue;
    }

    processedCount++;

    // Obtener usuario correspondiente de users
    let user: any = null;
    try {
      user = getDocument(baseUrl, 'users', userId, token);
    } catch (error) {
      console.error(`❌ Error al obtener usuario ${userId} para miembro ${memberId}:`, error);
      continue;
    }

    if (!user) {
      console.log(`⚠️ Usuario ${userId} no existe en la colección 'users'. Saltando.`);
      skippedCount++;
      continue;
    }

    // Campos del usuario
    const userDisplayName = user.displayName || '';
    const userEmail = user.email || '';
    const userPhotoURL = user.photoURL || '';

    // Campos del miembro actual
    const memberDisplayName = member.displayName || '';
    const memberNombre = member.nombre || '';
    const memberEmail = member.email || '';
    const memberPhotoURL = member.photoURL || '';

    // Si displayName del miembro es igual al email y el usuario tiene un displayName real, queremos actualizarlo.
    const isEmailFallback = memberDisplayName === memberEmail && userDisplayName && userDisplayName !== userEmail;
    
    const hasDiff =
      isEmailFallback ||
      !memberDisplayName ||
      memberDisplayName !== userDisplayName ||
      memberNombre !== userDisplayName ||
      memberEmail !== userEmail ||
      memberPhotoURL !== userPhotoURL;

    if (hasDiff) {
      console.log(`\n📄 Discrepancia detectada en miembro: ${memberId}`);
      console.log(`   Miembro actual:`);
      console.log(`     - nombre: "${memberNombre}"`);
      console.log(`     - displayName: "${memberDisplayName}"`);
      console.log(`     - email: "${memberEmail}"`);
      console.log(`     - photoURL: "${memberPhotoURL}"`);
      console.log(`   Usuario origen (users/${userId}):`);
      console.log(`     - displayName: "${userDisplayName}"`);
      console.log(`     - email: "${userEmail}"`);
      console.log(`     - photoURL: "${userPhotoURL}"`);

      // Preparar campos para actualizar en formato REST de Firestore
      const patchFields: any = {
        displayName: { stringValue: userDisplayName },
        nombre: { stringValue: userDisplayName },
        photoURL: { stringValue: userPhotoURL },
        email: { stringValue: userEmail },
        updatedAt: { timestampValue: new Date().toISOString() }
      };

      const fieldPaths = ['displayName', 'nombre', 'photoURL', 'email', 'updatedAt'];

      console.log(`   ✏️  Propuesta de actualización: ${JSON.stringify(fieldPaths)}`);

      if (!isDryRun) {
        const patchMask = fieldPaths.map(p => `updateMask.fieldPaths=${p}`).join('&');
        const patchUrl = `${baseUrl}/community_members/${memberId}?${patchMask}`;
        
        const patchResponse = runCurl(patchUrl, 'PATCH', { fields: patchFields }, token);
        
        if (patchResponse.error) {
          console.error(`      ❌ Error al actualizar ${memberId}:`, patchResponse.error);
        } else {
          updatedCount++;
          console.log(`      ✅ Miembro ${memberId} actualizado con éxito.`);
        }
      } else {
        updatedCount++; // Contabilizar para el reporte del dry run
      }
    }
  }

  console.log(`\n📊 Resumen de ejecución:`);
  console.log(`   - Miembros totales en base de datos: ${members.length}`);
  console.log(`   - Miembros procesados: ${processedCount}`);
  console.log(`   - Miembros saltados/no encontrados en 'users': ${skippedCount}`);
  console.log(`   - Miembros que requieren/recibieron actualización: ${updatedCount}`);

  if (isDryRun) {
    console.log(`\n💡 Ejecutado en modo DRY RUN. Ningún dato fue modificado.`);
    console.log(`   Para guardar los cambios en la base de datos, ejecuta:`);
    console.log(`   npx tsx scripts/backfill-members-profile.ts --write`);
  } else {
    console.log(`\n✨ Sincronización completada.`);
  }
}

main().catch(console.error);
