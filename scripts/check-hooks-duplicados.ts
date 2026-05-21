import { getDocuments } from './db-client';

async function checkHooksDuplicados() {
    console.log('🕵️‍♂️ Ejecutando Hipótesis 1: Comprobando hooks duplicados (fichas vs profiles)...');
    
    const fichas = getDocuments('fichas');
    const profiles = getDocuments('profiles');
    
    const fichasMap = new Map<string, any>();
    for (const f of fichas) {
        fichasMap.set(f._id, f);
    }
    
    let totalRevisados = 0;
    let totalDivergentes = 0;
    const divergencias: any[] = [];
    
    for (const p of profiles) {
        const userId = p._id;
        const f = fichasMap.get(userId);
        
        if (f) {
            totalRevisados++;
            let esDivergente = false;
            const diferenciasCampos: string[] = [];
            
            const campos = ['estado', 'updatedAt', 'manualMarkdown', 'manualGenerado'];
            for (const campo of campos) {
                const valF = f[campo];
                const valP = p[campo];
                
                // Normalizar valores para evitar falsos positivos si uno es undefined y el otro null
                const normalF = (valF === undefined || valF === null) ? null : valF;
                const normalP = (valP === undefined || valP === null) ? null : valP;
                
                if (normalF !== normalP) {
                    esDivergente = true;
                    let difStr = `${campo}: Fichas = [${normalF}], Profiles = [${normalP}]`;
                    if (campo === 'updatedAt' && normalF && normalP) {
                        try {
                            const dateF = new Date(normalF);
                            const dateP = new Date(normalP);
                            const diffMs = Math.abs(dateF.getTime() - dateP.getTime());
                            const diffHrs = diffMs / (1000 * 60 * 60);
                            difStr += ` (Diferencia: ${diffHrs.toFixed(2)} horas)`;
                        } catch (e) {
                            // Ignorar error al parsear fecha
                        }
                    }
                    diferenciasCampos.push(difStr);
                }
            }
            
            if (esDivergente) {
                totalDivergentes++;
                divergencias.push({
                    userId,
                    diferencias: diferenciasCampos
                });
            }
        }
    }
    
    if (divergencias.length > 0) {
        console.log('\n⚠️ Se detectaron divergencias entre fichas y profiles:');
        for (const div of divergencias) {
            console.log(`\n👤 Usuario ID: ${div.userId}`);
            for (const dif of div.diferencias) {
                console.log(`   - ${dif}`);
            }
        }
    } else {
        console.log('\n✅ Sin anomalías detectadas');
    }
    
    console.log(`\n📊 Resumen final: ${totalDivergentes} usuarios con divergencia / ${totalRevisados} usuarios revisados (coincidentes en ambas colecciones)`);
}

checkHooksDuplicados().catch(console.error);
