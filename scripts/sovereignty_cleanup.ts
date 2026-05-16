
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

async function finalSovereigntyCleanup() {
    console.log('🏛️ Iniciando Limpieza de Soberanía (Fichas = Verdad)...');

    const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    const accessToken = config.tokens.access_token;
    const baseUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${DATABASE_ID}/documents`;

    // 1. Obtener los IDs válidos de 'fichas'
    console.log('📖 Obteniendo IDs válidos de "fichas"...');
    const fichasData = runCurl(`${baseUrl}/fichas?pageSize=100`, 'GET', null, accessToken);
    const validIds = new Set((fichasData.documents || []).map((d: any) => d.name.split('/').pop()));
    
    console.log(`   ✅ IDs válidos encontrados: ${Array.from(validIds).join(', ')}`);

    // 2. Limpiar 'profiles' y 'community_members'
    const collections = ['profiles', 'community_members'];

    for (const col of collections) {
        console.log(`\n📂 Auditando colección: ${col}`);
        const data = runCurl(`${baseUrl}/${col}?pageSize=100`, 'GET', null, accessToken);
        const docs = data.documents || [];
        
        for (const doc of docs) {
            const id = doc.name.split('/').pop();
            if (!validIds.has(id)) {
                console.log(`   🗑️ Eliminando intruso/duplicado: ${id}`);
                runCurl(`${baseUrl}/${col}/${id}`, 'DELETE', null, accessToken);
            } else {
                console.log(`   keep: ${id}`);
            }
        }
    }

    console.log('\n✨ Soberanía de datos restaurada. La base de datos está impecable.');
}

finalSovereigntyCleanup().catch(console.error);
