
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const PROJECT_ID = 'gen-lang-client-0601258149';
const DATABASE_ID = 'ai-studio-fb5ef2e1-c472-43e5-bb6a-51f1141b0793';
const CONFIG_PATH = path.join(process.env.HOME || '', '.config/configstore/firebase-tools.json');

function runCurl(url: string, method = 'GET', body: any = null, token: string) {
    let cmd = `curl -s -X ${method} "${url}" -H "Authorization: Bearer ${token}"`;
    if (body) {
        cmd += ` -H "Content-Type: application/json" -d '${JSON.stringify(body)}'`;
    }
    const output = execSync(cmd).toString();
    return output ? JSON.parse(output) : {};
}

async function totalCleanup() {
    console.log('🧹 Iniciando Limpieza Total de Miembros Semilla...');

    const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    const accessToken = config.tokens.access_token;
    const baseUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${DATABASE_ID}/documents`;

    const collections = ['profiles', 'community_members', 'fichas'];

    for (const col of collections) {
        console.log(`\n📂 Limpiando colección: ${col}`);
        const data = runCurl(`${baseUrl}/${col}?pageSize=100`, 'GET', null, accessToken);
        const docs = data.documents || [];
        
        for (const doc of docs) {
            const id = doc.name.split('/').pop();
            const fields = doc.fields || {};
            const isSeed = fields.isSeedData?.booleanValue === true || id.startsWith('seed-');

            if (isSeed) {
                console.log(`   🗑️ Borrando semilla: ${id}`);
                runCurl(`${baseUrl}/${col}/${id}`, 'DELETE', null, accessToken);
            }
        }
    }
    console.log('\n✨ Base de datos purificada en todas las colecciones.');
}

totalCleanup().catch(console.error);
