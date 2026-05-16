
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

async function verifyCommunityIds() {
    console.log('🧐 Verificando integridad de communityId en community_members...');

    const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    const accessToken = config.tokens.access_token;
    const baseUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${DATABASE_ID}/documents`;

    const data = runCurl(`${baseUrl}/community_members?pageSize=100`, 'GET', null, accessToken);
    const docs = data.documents || [];

    for (const doc of docs) {
        const id = doc.name.split('/').pop();
        const fields = doc.fields || {};
        const cId = fields.communityId?.stringValue;

        if (!cId || cId === 'null') {
            console.log(`   ⚠️ Miembro ${id} sin communityId. Reparando desde profiles...`);
            const profile = runCurl(`${baseUrl}/profiles/${id}`, 'GET', null, accessToken);
            const realCId = profile.fields?.communityId?.stringValue || 'arteara';
            
            runCurl(`${baseUrl}/community_members/${id}?updateMask.fieldPaths=communityId`, 'PATCH', {
                fields: { communityId: { stringValue: realCId } }
            }, accessToken);
            console.log(`   ✅ Reparado: ${id} -> ${realCId}`);
        } else {
            console.log(`   ✅ Miembro ${id} OK: ${cId}`);
        }
    }
}

verifyCommunityIds().catch(console.error);
