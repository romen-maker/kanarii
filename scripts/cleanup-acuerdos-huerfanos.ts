import { getDocuments, patchDocument } from './db-client';
import readline from 'readline';

/**
 * Helper para solicitar entrada de texto por consola (stdin) de forma asíncrona.
 */
function askQuestion(query: string): Promise<string> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans);
    }));
}

async function cleanupAcuerdosHuerfanos() {
    console.log('🕵️‍♂️ Iniciando Limpieza de Acuerdos Huérfanos...');
    
    // 1. Obtener colecciones
    const acuerdos = getDocuments('acuerdos');
    const servicios = getDocuments('servicios');
    
    const serviciosSet = new Set<string>(servicios.map(s => s._id));
    
    // 2. Identificar acuerdos huérfanos (servicioId no existe en /servicios)
    const huerfanos: any[] = [];
    for (const a of acuerdos) {
        const servicioId = a.servicioId;
        if (!servicioId || !serviciosSet.has(servicioId)) {
            huerfanos.push(a);
        }
    }
    
    if (huerfanos.length === 0) {
        console.log('\n✅ Sin anomalías detectadas. No hay acuerdos huérfanos que limpiar.');
        return;
    }
    
    // 3. Imprimir acuerdos afectados
    console.log(`\n⚠️ Se encontraron ${huerfanos.length} acuerdos huérfanos que serán modificados:`);
    for (const h of huerfanos) {
        console.log(`   - ID Acuerdo: ${h._id} | servicioId: ${h.servicioId || 'AUSENTE'} | Comunidad: ${h.communityId || 'S/C'}`);
    }
    
    // Solicitar confirmación interactiva
    console.log('\nEsta acción actualizará el estado de estos acuerdos a "cancelada" con motivo "servicio_eliminado" en la base de datos.');
    const input = await askQuestion('Escribe "CONFIRMAR" para continuar: ');
    
    if (input.trim() !== 'CONFIRMAR') {
        console.log('\n❌ Operación cancelada por el usuario. No se realizaron cambios.');
        return;
    }
    
    console.log('\n🚀 Iniciando actualizaciones en Firestore...');
    
    let exitos = 0;
    let fallos = 0;
    
    const timestampActual = new Date().toISOString();
    
    // 4. Actualizar cada acuerdo huérfano vía PATCH a la API REST de Firestore
    for (const h of huerfanos) {
        const fields = {
            status: {
                stringValue: 'cancelada'
            },
            motivoCancelacion: {
                stringValue: 'servicio_eliminado'
            },
            actualizadoEn: {
                timestampValue: timestampActual
            }
        };
        const fieldPaths = ['status', 'motivoCancelacion', 'actualizadoEn'];
        
        try {
            patchDocument('acuerdos', h._id, fields, fieldPaths);
            console.log(`   ✅ ID Acuerdo: ${h._id} -> Actualizado exitosamente.`);
            exitos++;
        } catch (e: any) {
            console.error(`   ❌ ID Acuerdo: ${h._id} -> Error al actualizar: ${e.message || e}`);
            fallos++;
        }
    }
    
    // 6. Imprimir resumen de la ejecución
    console.log('\n📊 Resumen de la limpieza:');
    console.log(`   - Total acuerdos huérfanos identificados: ${huerfanos.length}`);
    console.log(`   - Éxitos (actualizados): ${exitos}`);
    console.log(`   - Fallos (errores): ${fallos}`);
}

cleanupAcuerdosHuerfanos().catch(console.error);
