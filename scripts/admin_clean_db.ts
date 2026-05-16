
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const PROJECT_ID = 'gen-lang-client-0601258149';
const DATABASE_ID = 'ai-studio-fb5ef2e1-c472-43e5-bb6a-51f1141b0793';
const CONFIG_PATH = path.join(process.env.HOME || '', '.config/configstore/firebase-tools.json');

function normalize(text: string) {
    return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function runCurl(url: string, method = 'GET', body: any = null, token: string) {
    let cmd = `curl -s -X ${method} "${url}" -H "Authorization: Bearer ${token}"`;
    if (body) {
        cmd += ` -H "Content-Type: application/json" -d '${JSON.stringify(body)}'`;
    }
    const output = execSync(cmd).toString();
    return JSON.parse(output);
}

async function run() {
    console.log('🚀 Iniciando operación "Limpieza Ninja v3" (vía Curl)...');

    const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    const accessToken = config.tokens.access_token;

    const baseUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${DATABASE_ID}/documents`;
    const listUrl = `${baseUrl}/community_members`;

    console.log('🔍 Listando miembros...');
    const data = runCurl(listUrl, 'GET', null, accessToken);
    const members = data.documents || [];

    console.log(`📊 Análisis de ${members.length} miembros:`);

    for (const doc of members) {
        const fields = doc.fields;
        const uid = doc.name.split('/').pop();
        const nombre = fields.nombre?.stringValue || fields.displayName?.stringValue || 'Sin nombre';
        const email = fields.email?.stringValue || 'Sin email';

        const normNombre = normalize(nombre);
        const normEmail = normalize(email);

        const esReal = normEmail.includes('romenusabo3') || 
                       normNombre.includes('romen') || 
                       normNombre.includes('abian') || 
                       normNombre.includes('monzon');

        if (esReal) {
            console.log(`✅ [REAL] ${nombre} (${email})`);
        } else {
            console.log(`🙈 [DEMO] ${nombre} (${email}) - UID: ${uid}`);
            
            // Ocultar
            const patchUrl = `${baseUrl}/community_members/${uid}?updateMask.fieldPaths=communityId`;
            try {
                runCurl(patchUrl, 'PATCH', {
                    fields: { communityId: { stringValue: 'arteara_hidden' } }
                }, accessToken);
                console.log(`   └─ Ocultado con éxito.`);
            } catch (e) {
                console.error(`   └─ Error ocultando a ${nombre}`);
            }
        }
    }
    console.log('✨ Operación completada.');
}

run().catch(console.error);
