import { 
  generateTelegramBindToken, 
  verifyAndLinkTelegram, 
  getTelegramIdentityByUserId 
} from '../src/lib/services/identities';
import { 
  createPendingAction, 
  confirmPendingAction 
} from '../src/lib/services/pendingActions';
import { getAuditLogsByCommunity } from '../src/lib/services/audit';

async function runE2EMultichannelTest() {
  console.log('🧪 Iniciando prueba de integración End-to-End de la Arquitectura Multicanal...\n');

  const testUserId = `user_e2e_${Date.now()}`;
  const testCommunityId = `comm_e2e_${Date.now()}`;
  const testTelegramUserId = Math.floor(100000 + Math.random() * 900000);
  const testTelegramUsername = `tg_user_${Date.now()}`;

  // PASO 1: Generación y Vinculación de Identidad Telegram
  console.log('1️⃣ PASO 1: Generando token de vinculación e interconectando Telegram...');
  const bindToken = await generateTelegramBindToken(testUserId);
  if (!bindToken || bindToken.length !== 6) {
    throw new Error(`❌ PASO 1 FALLÓ: Token inválido devuelto (${bindToken}).`);
  }

  const linkedIdentity = await verifyAndLinkTelegram(bindToken, testTelegramUserId, testTelegramUsername);
  if (linkedIdentity.status !== 'linked' || linkedIdentity.telegramUserId !== testTelegramUserId) {
    throw new Error('❌ PASO 1 FALLÓ: El estado de la identidad no cambió a "linked".');
  }

  const fetchedIdentity = await getTelegramIdentityByUserId(testUserId);
  if (!fetchedIdentity || fetchedIdentity.status !== 'linked') {
    throw new Error('❌ PASO 1 FALLÓ: No se pudo consultar la identidad vinculada desde Firestore.');
  }
  console.log('   ✅ PASO 1 SUPERADO: Identidad vinculada correctamente con estado "linked".\n');

  // PASO 2: Creación de Acción Pendiente (2 Pasos)
  console.log('2️⃣ PASO 2: Creando una PendingAction desde canal de transporte...');
  const pendingAction = await createPendingAction({
    userId: testUserId,
    communityId: testCommunityId,
    actionType: 'create_proposal_e2e',
    payload: { title: 'Propuesta E2E Test', budget: 500 },
    channel: 'telegram',
    agentId: 'telegram-bot',
    sourceAction: 'telegram_command'
  });

  if (!pendingAction.id || pendingAction.status !== 'pending' || !pendingAction.confirmationToken) {
    throw new Error('❌ PASO 2 FALLÓ: La estructura de PendingAction creada es incorrecta.');
  }
  console.log(`   ✅ PASO 2 SUPERADO: PendingAction creada con ID [${pendingAction.id}] y token [${pendingAction.confirmationToken}].\n`);

  // PASO 3: Confirmación de Acción Pendiente
  console.log('3️⃣ PASO 3: Confirmando la PendingAction mediante confirmPendingAction()...');
  const confirmedAction = await confirmPendingAction(pendingAction.id, pendingAction.confirmationToken);
  if (confirmedAction.status !== 'confirmed') {
    throw new Error(`❌ PASO 3 FALLÓ: El estado final de la acción es ${confirmedAction.status}, se esperaba "confirmed".`);
  }
  console.log('   ✅ PASO 3 SUPERADO: Transición a estado "confirmed" validada con éxito.\n');

  // PASO 4: Auditoría Inmutable
  console.log('4️⃣ PASO 4: Verificando registro inmutable de auditoría en /audit_logs...');
  const auditLogs = await getAuditLogsByCommunity(testCommunityId, 10);
  const matchingLog = auditLogs.find(log => log.userId === testUserId && log.status === 'success');

  if (!matchingLog) {
    throw new Error('❌ PASO 4 FALLÓ: No se encontró la traza de auditoría inmutable correspondiente.');
  }

  if (matchingLog.channel !== 'telegram' || matchingLog.agentId !== 'telegram-bot') {
    throw new Error(`❌ PASO 4 FALLÓ: La taxonomía de auditoría (${matchingLog.channel}/${matchingLog.agentId}) es incoherente.`);
  }
  console.log(`   ✅ PASO 4 SUPERADO: Traza de auditoría localizada con id [${matchingLog.id}], canal [${matchingLog.channel}] y estado [${matchingLog.status}].\n`);

  console.log('🎉 ¡TODAS LAS PRUEBAS END-TO-END DE LA ARQUITECTURA MULTICANAL FUERON SUPERADAS CON ÉXITO!');
}

runE2EMultichannelTest().catch(err => {
  console.error('\n🔴 FALLO EN LA PRUEBA END-TO-END:', err.message);
  process.exit(1);
});
