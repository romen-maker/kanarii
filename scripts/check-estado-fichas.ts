import { getDocuments } from './db-client';

async function checkEstadoFichas() {
    console.log('🕵️‍♂️ Ejecutando Hipótesis 4: Comprobando estado de fichas (profiles y fichas)...');
    
    const profiles = getDocuments('profiles');
    const fichas = getDocuments('fichas');
    
    let totalCompletoProfiles = 0;
    let profilesIncompletos = 0;
    
    let totalCompletoFichas = 0;
    let fichasIncompletas = 0;
    
    const reportes: any[] = [];
    
    // Analizar la colección /profiles
    for (const p of profiles) {
        if (p.estado === 'completo') {
            totalCompletoProfiles++;
            const manual = p.manualMarkdown;
            if (manual === undefined || manual === null || (typeof manual === 'string' && manual.trim() === '')) {
                profilesIncompletos++;
                reportes.push({
                    userId: p._id,
                    coleccion: 'profiles',
                    camposFaltantes: ['manualMarkdown']
                });
            }
        }
    }
    
    // Analizar la colección /fichas
    for (const f of fichas) {
        if (f.estado === 'completo') {
            totalCompletoFichas++;
            const manual = f.manualMarkdown;
            if (manual === undefined || manual === null || (typeof manual === 'string' && manual.trim() === '')) {
                fichasIncompletas++;
                reportes.push({
                    userId: f._id,
                    coleccion: 'fichas',
                    camposFaltantes: ['manualMarkdown']
                });
            }
        }
    }
    
    if (reportes.length > 0) {
        console.log('\n⚠️ Se detectaron fichas o profiles marcados como "completo" pero sin contenido en manualMarkdown:');
        for (const rep of reportes) {
            console.log(`- Colección: /${rep.coleccion} | User ID: ${rep.userId} | Campos faltantes: ${rep.camposFaltantes.join(', ')}`);
        }
    } else {
        console.log('\n✅ Sin anomalías detectadas');
    }
    
    const totalIncompletos = profilesIncompletos + fichasIncompletas;
    const totalCompleto = totalCompletoProfiles + totalCompletoFichas;
    
    console.log('\n📊 Resumen de integridad de Fichas/Profiles:');
    console.log(`   - En /profiles: ${profilesIncompletos} incompletos de ${totalCompletoProfiles} totales con estado "completo"`);
    console.log(`   - En /fichas: ${fichasIncompletas} incompletos de ${totalCompletoFichas} totales con estado "completo"`);
    console.log(`   - Resumen global: ${totalIncompletos} fichas "completas" con datos incompletos de ${totalCompleto} totales`);
}

checkEstadoFichas().catch(console.error);
