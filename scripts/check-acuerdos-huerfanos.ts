import { getDocuments } from './db-client';

async function checkAcuerdosHuerfanos() {
    console.log('🕵️‍♂️ Ejecutando Hipótesis 3: Comprobando acuerdos huérfanos (acuerdos vs servicios/users)...');
    
    const acuerdos = getDocuments('acuerdos');
    const servicios = getDocuments('servicios');
    const users = getDocuments('users');
    
    // Almacenar los IDs existentes en Sets para búsquedas O(1)
    const serviciosSet = new Set<string>(servicios.map(s => s._id));
    const usersSet = new Set<string>(users.map(u => u._id));
    
    const totalAcuerdos = acuerdos.length;
    let acuerdosRotos = 0;
    
    let roturasServicio = 0;
    let roturasProvider = 0;
    let roturasSolicitante = 0;
    
    const reportes: any[] = [];
    
    for (const a of acuerdos) {
        const acuerdoId = a._id;
        const servicioId = a.servicioId;
        const providerId = a.providerId;
        const solicitanteId = a.solicitanteId;
        const communityId = a.communityId || 'S/C';
        
        const roturas: string[] = [];
        let esRoto = false;
        
        // Verificar Servicio
        if (!servicioId) {
            roturas.push('servicioId ausente o vacío');
            roturasServicio++;
            esRoto = true;
        } else if (!serviciosSet.has(servicioId)) {
            roturas.push(`servicioId [${servicioId}] no existe en /servicios`);
            roturasServicio++;
            esRoto = true;
        }
        
        // Verificar Provider
        if (!providerId) {
            roturas.push('providerId ausente o vacío');
            roturasProvider++;
            esRoto = true;
        } else if (!usersSet.has(providerId)) {
            roturas.push(`providerId [${providerId}] no existe en /users`);
            roturasProvider++;
            esRoto = true;
        }
        
        // Verificar Solicitante
        if (!solicitanteId) {
            roturas.push('solicitanteId ausente o vacío');
            roturasSolicitante++;
            esRoto = true;
        } else if (!usersSet.has(solicitanteId)) {
            roturas.push(`solicitanteId [${solicitanteId}] no existe en /users`);
            roturasSolicitante++;
            esRoto = true;
        }
        
        if (esRoto) {
            acuerdosRotos++;
            reportes.push({
                acuerdoId,
                communityId,
                servicioId: servicioId || 'AUSENTE',
                providerId: providerId || 'AUSENTE',
                solicitanteId: solicitanteId || 'AUSENTE',
                roturas
            });
        }
    }
    
    if (reportes.length > 0) {
        console.log('\n⚠️ Se detectaron acuerdos con referencias rotas o ausentes:');
        for (const rep of reportes) {
            console.log(`\n📄 Acuerdo ID: ${rep.acuerdoId} (Comunidad: ${rep.communityId})`);
            console.log(`   - servicioId: ${rep.servicioId}`);
            console.log(`   - providerId: ${rep.providerId}`);
            console.log(`   - solicitanteId: ${rep.solicitanteId}`);
            console.log('   🔴 Referencias rotas:');
            for (const rot of rep.roturas) {
                console.log(`     * ${rot}`);
            }
        }
    } else {
        console.log('\n✅ Sin anomalías detectadas');
    }
    
    console.log('\n📊 Resumen final de roturas:');
    console.log(`   - Acuerdos totales revisados: ${totalAcuerdos}`);
    console.log(`   - Acuerdos rotos/incompletos: ${acuerdosRotos}`);
    console.log(`   - Fallas en referencia de servicio: ${roturasServicio}`);
    console.log(`   - Fallas en referencia de proveedor: ${roturasProvider}`);
    console.log(`   - Fallas en referencia de solicitante: ${roturasSolicitante}`);
}

checkAcuerdosHuerfanos().catch(console.error);
