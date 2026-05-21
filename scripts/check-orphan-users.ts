import { getDocuments } from './db-client';

async function checkOrphanUsers() {
    console.log('🕵️‍♂️ Ejecutando Hipótesis 2: Comprobando usuarios huérfanos (users vs community_members)...');
    
    const users = getDocuments('users');
    const members = getDocuments('community_members');
    
    // Almacenar todos los IDs de community_members en un Set para búsquedas O(1)
    const membersSet = new Set<string>();
    for (const m of members) {
        membersSet.add(m._id);
    }
    
    let totalConComunidad = 0;
    let totalHuerfanos = 0;
    const huerfanos: any[] = [];
    
    for (const u of users) {
        const userId = u._id;
        const email = u.email || 'S/N';
        const communityIds = u.communityIds || [];
        
        if (communityIds.length > 0) {
            totalConComunidad++;
            let esHuerfano = false;
            const comunidadesFaltantes: string[] = [];
            
            for (const communityId of communityIds) {
                const memberDocId = `${communityId}_${userId}`;
                if (!membersSet.has(memberDocId)) {
                    esHuerfano = true;
                    comunidadesFaltantes.push(communityId);
                }
            }
            
            if (esHuerfano) {
                totalHuerfanos++;
                huerfanos.push({
                    userId,
                    email,
                    comunidades: comunidadesFaltantes
                });
            }
        }
    }
    
    if (huerfanos.length > 0) {
        console.log('\n⚠️ Se detectaron usuarios con comunidades asignadas pero sin documento en community_members:');
        for (const h of huerfanos) {
            console.log(`\n👤 Usuario ID: ${h.userId} (${h.email})`);
            for (const communityId of h.comunidades) {
                console.log(`   - Falta el miembro en comunidad: ${communityId} (Documento esperado: community_members/${communityId}_${h.userId})`);
            }
        }
    } else {
        console.log('\n✅ Sin anomalías detectadas');
    }
    
    console.log(`\n📊 Resumen final: ${totalHuerfanos} usuarios sin community_member de ${totalConComunidad} usuarios totales con comunidad`);
}

checkOrphanUsers().catch(console.error);
