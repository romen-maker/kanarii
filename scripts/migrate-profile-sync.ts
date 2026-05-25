import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const PROJECT_ID = 'gen-lang-client-0601258149';
const DATABASE_ID = 'ai-studio-fb5ef2e1-c472-43e5-bb6a-51f1141b0793';
const CONFIG_PATH = path.join(process.env.HOME || '', '.config/configstore/firebase-tools.json');

// 1. Obtener Token de Acceso (solo necesario para producción)
function getAccessToken(): string {
  if (process.env.FIRESTORE_EMULATOR_HOST) {
    return "owner"; // Token administrativo para saltarse reglas en el emulador
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
    // Escapar comillas simples en el JSON body
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

async function migrate() {
  console.log("🚀 Iniciando migración de datos de perfil de usuario a community_members...");
  
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

  // 1. Obtener todos los usuarios de la colección 'users'
  const usersUrl = `${baseUrl}/users?pageSize=300`;
  const usersResponse = runCurl(usersUrl, 'GET', null, token);
  
  if (usersResponse.error) {
    console.error("❌ Error al obtener usuarios:", usersResponse.error);
    process.exit(1);
  }
  
  const rawUsers = usersResponse.documents || [];
  const users = rawUsers.map(parseDocument).filter(Boolean);
  
  console.log(`🔍 Encontrados ${users.length} usuarios en total.`);
  
  let processedUsers = 0;
  let updatedMembersCount = 0;
  
  for (const user of users) {
    // Solo migrar usuarios con hasFicha: true
    if (!user.hasFicha) {
      continue;
    }
    
    processedUsers++;
    const userId = user._id;
    const userDisplayName = user.displayName || '';
    const userPhotoURL = user.photoURL || '';
    const userEmail = user.email || '';
    
    // Obtener los communityIds del usuario
    let communityIds: string[] = [];
    if (Array.isArray(user.communityIds)) {
      communityIds = user.communityIds;
    } else if (user.communityId) {
      communityIds = [user.communityId];
    }
    
    console.log(`\n👤 Procesando usuario: ${userEmail} (${userId})`);
    console.log(`   ├─ displayName: "${userDisplayName}" | photoURL: "${userPhotoURL}"`);
    console.log(`   └─ communityIds: ${JSON.stringify(communityIds)}`);
    
    if (communityIds.length === 0) {
      console.log(`   ⚠️  El usuario no tiene comunidades asociadas.`);
      continue;
    }
    
    for (const cId of communityIds) {
      const memberDocId = `${cId}_${userId}`;
      const memberUrl = `${baseUrl}/community_members/${memberDocId}`;
      
      // Obtener el documento del miembro para comprobar si existe y si tiene diferencias
      const memberResponse = runCurl(memberUrl, 'GET', null, token);
      
      if (memberResponse.error) {
        if (memberResponse.error.status === 'NOT_FOUND') {
          console.log(`   ⏭️ Membresía ${memberDocId} no existe, saltando.`);
          continue;
        }
        console.error(`   ❌ Error al obtener membresía ${memberDocId}:`, memberResponse.error);
        continue;
      }
      
      const memberData = parseDocument(memberResponse);
      
      const hasDiff = 
        memberData.displayName !== userDisplayName ||
        memberData.nombre !== userDisplayName ||
        memberData.photoURL !== userPhotoURL ||
        memberData.email !== userEmail;
        
      if (hasDiff) {
        console.log(`   ✏️  Discrepancia detectada en membresía ${memberDocId}. Actualizando...`);
        
        // Construir los campos de actualización en formato REST de Firestore
        const patchFields: any = {
          displayName: { stringValue: userDisplayName },
          nombre: { stringValue: userDisplayName },
          photoURL: { stringValue: userPhotoURL },
          email: { stringValue: userEmail },
          updatedAt: { timestampValue: new Date().toISOString() }
        };
        
        const fieldPaths = ['displayName', 'nombre', 'photoURL', 'email', 'updatedAt'];
        const patchMask = fieldPaths.map(p => `updateMask.fieldPaths=${p}`).join('&');
        const patchUrl = `${memberUrl}?${patchMask}`;
        
        const patchResponse = runCurl(patchUrl, 'PATCH', { fields: patchFields }, token);
        
        if (patchResponse.error) {
          console.error(`      ❌ Error al actualizar ${memberDocId}:`, patchResponse.error);
        } else {
          updatedMembersCount++;
          console.log(`      ✅ Membresía ${memberDocId} actualizada.`);
        }
      } else {
        console.log(`   ⏭️ Membresía ${memberDocId} ya está sincronizada.`);
      }
    }
  }
  
  console.log("\n✨ Resumen de la migración:");
  console.log(`   - Usuarios con ficha procesados: ${processedUsers}`);
  console.log(`   - Documentos de community_members actualizados: ${updatedMembersCount}`);
  console.log("🚀 Migración completada con éxito.");
}

migrate().catch(console.error);
