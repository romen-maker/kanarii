
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const PROJECT_ID = 'gen-lang-client-0601258149';
const DATABASE_ID = 'ai-studio-fb5ef2e1-c472-43e5-bb6a-51f1141b0793';
const CONFIG_PATH = path.join(process.env.HOME || '', '.config/configstore/firebase-tools.json');

function runCurl(url: string, method = 'GET', body: any = null, token: string) {
    // Escapar comillas simples en el body para el comando curl
    const bodyStr = body ? JSON.stringify(body).replace(/'/g, "'\\''") : null;
    let cmd = `curl -s -X ${method} "${url}" -H "Authorization: Bearer ${token}"`;
    if (bodyStr) {
        cmd += ` -H "Content-Type: application/json" -d '${bodyStr}'`;
    }
    const output = execSync(cmd).toString();
    try {
        return output ? JSON.parse(output) : {};
    } catch (e) {
        console.error("❌ Error parseando JSON de salida:", output);
        return { error: "ParseError", output };
    }
}

async function alignData() {
    console.log('🚀 Iniciando Alineación Total de Arquitectura...');

    const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    const accessToken = config.tokens.access_token;
    const baseUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${DATABASE_ID}/documents`;

    // 1. Leer la verdad de 'fichas'
    console.log('📖 Leyendo la verdad histórica de "fichas"...');
    const fichasData = runCurl(`${baseUrl}/fichas?pageSize=100`, 'GET', null, accessToken);
    const fichas = fichasData.documents || [];

    for (const doc of fichas) {
        const id = doc.name.split('/').pop();
        const fields = doc.fields || {};
        
        // Ignorar semillas
        if (fields.isSeedData?.booleanValue || id.startsWith('seed-')) continue;

        const nombre = fields.nombre?.stringValue || fields.datosPersona?.mapValue?.fields?.nombre?.stringValue || 'Sin Nombre';
        console.log(`\n👤 Procesando a: ${nombre} (${id})`);

        // Limpiar campos de sistema para evitar errores de validación
        const cleanFields = { ...fields };
        delete (cleanFields as any).createTime;
        delete (cleanFields as any).updateTime;
        delete (cleanFields as any).name;

        // Asegurar que tiene communityId
        if (!cleanFields.communityId) {
            cleanFields.communityId = { stringValue: 'arteara' };
        }

        // 2. Upsert en 'profiles' usando PATCH (que crea si no existe)
        // Nota: Añadimos updateMask para que acepte el objeto
        console.log(`   ✅ Sincronizando en "profiles"...`);
        const updateMask = Object.keys(cleanFields).map(k => `updateMask.fieldPaths=${k}`).join('&');
        const resProfile = runCurl(`${baseUrl}/profiles/${id}?${updateMask}`, 'PATCH', { fields: cleanFields }, accessToken);
        if (resProfile.error) console.error(`      ❌ Error en profiles: ${resProfile.error.message}`);

        // 3. Upsert en 'community_members'
        console.log(`   ✅ Sincronizando en "community_members"...`);
        const memberFields = {
            userId: { stringValue: id },
            nombre: { stringValue: nombre },
            communityId: { stringValue: cleanFields.communityId.stringValue || 'arteara' },
            isSeedData: { booleanValue: false }
        };
        const memberMask = Object.keys(memberFields).map(k => `updateMask.fieldPaths=${k}`).join('&');
        const resMember = runCurl(`${baseUrl}/community_members/${id}?${memberMask}`, 'PATCH', { fields: memberFields }, accessToken);
        if (resMember.error) console.error(`      ❌ Error en community_members: ${resMember.error.message}`);
    }

    console.log('\n✨ Alineación completada.');
}

alignData().catch(console.error);
