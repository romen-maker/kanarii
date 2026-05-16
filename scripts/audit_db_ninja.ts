
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const PROJECT_ID = 'gen-lang-client-0601258149';
const DATABASE_ID = 'ai-studio-fb5ef2e1-c472-43e5-bb6a-51f1141b0793';
const CONFIG_PATH = path.join(process.env.HOME || '', '.config/configstore/firebase-tools.json');

function runCurl(url: string, token: string) {
    const cmd = `curl -s -X GET "${url}" -H "Authorization: Bearer ${token}"`;
    const output = execSync(cmd).toString();
    return JSON.parse(output);
}

async function audit() {
    console.log('🕵️‍♂️ Iniciando Auditoría de Miembros (REST API)...');

    const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    const accessToken = config.tokens.access_token;
    const baseUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${DATABASE_ID}/documents`;

    const collections = ['profiles', 'community_members', 'fichas'];

    for (const col of collections) {
        console.log(`\n📂 Analizando colección: ${col}`);
        const data = runCurl(`${baseUrl}/${col}?pageSize=100`, accessToken);
        const docs = data.documents || [];
        
        console.log(`   - Total documentos: ${docs.length}`);
        
        const seeds = docs.filter((d: any) => {
            const fields = d.fields || {};
            const id = d.name.split('/').pop();
            return fields.isSeedData?.booleanValue === true || id.startsWith('seed-');
        });

        const real = docs.length - seeds.length;
        console.log(`   - Miembros Semilla (Seed): ${seeds.length}`);
        console.log(`   - Miembros Reales: ${real}`);

        if (real > 0) {
            const nombres = docs
                .filter((d: any) => !seeds.includes(d))
                .map((d: any) => {
                    const f = d.fields || {};
                    return f.nombre?.stringValue || f.datosPersona?.mapValue?.fields?.nombre?.stringValue || 'S/N';
                });
            console.log(`   - Nombres reales: ${nombres.join(', ')}`);
        }

        if (col === 'community_members') {
            const inArteara = docs.filter((d: any) => d.fields?.communityId?.stringValue === 'arteara').length;
            const inHidden = docs.filter((d: any) => d.fields?.communityId?.stringValue === 'arteara_hidden').length;
            console.log(`   - Visibles (communityId: arteara): ${inArteara}`);
            console.log(`   - Ocultos (communityId: arteara_hidden): ${inHidden}`);
        }
    }
}

audit().catch(console.error);
