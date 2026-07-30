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

function printHeader(title: string) {
  console.log('\n================================================================');
  console.log(` 🌿 KANARII MULTI-CHANNEL DEMO & DEBUGGER — ${title.toUpperCase()}`);
  console.log('================================================================\n');
}

function printStep(stepNum: number, title: string, detail: string) {
  console.log(`┌─── PASO ${stepNum}: ${title} ${'─'.repeat(Math.max(2, 50 - title.length))}`);
  console.log(`│ 💡 ${detail}`);
  console.log('└───' + '─'.repeat(60));
}

async function runMultichannelSimulation() {
  printHeader('Simulación de Flujo Multicanal');

  const demoUserId = 'user_demo_kanarii_01';
  const demoCommunityId = 'comunidad_finca_efemerides';
  const demoTelegramId = 88776655;
  const demoTelegramUser = 'ecocomunero_canarias';

  // PASO 1: Generación de enlace y simulación de vinculación en Telegram
  printStep(
    1, 
    'VINCULACIÓN DE IDENTIDAD TELEGRAM', 
    'Generando token efímero (5 min TTL) y simulando recepción de /start bind_TOKEN'
  );

  const token = await generateTelegramBindToken(demoUserId);
  console.log(`   🔗 Enlace generado: https://t.me/KanariiBot?start=bind_${token}`);
  console.log(`   🔑 Token efímero : [ ${token} ] (Expira en 5 min)`);

  console.log('\n   🤖 [Telegram Bot] Recibido /start bind_' + token + ' desde @' + demoTelegramUser + '...');
  const identity = await verifyAndLinkTelegram(token, demoTelegramId, demoTelegramUser);
  console.log(`   ✅ Estado Firestore (/user_telegram_identities/${demoUserId}):`);
  console.log(`      status: "${identity.status}" | telegramUserId: ${identity.telegramUserId} | username: "@${identity.telegramUsername}"\n`);

  // PASO 2: Disparo de acción sensible en diferido (PendingAction 2 pasos)
  printStep(
    2,
    'DISPARO DE ACCIÓN PENDIENTE (PENDINGACTION)',
    'Creando propuesta sociocrática que requiere confirmación humana explícita'
  );

  const pending = await createPendingAction({
    userId: demoUserId,
    communityId: demoCommunityId,
    actionType: 'crear_propuesta_inversion',
    payload: {
      titulo: 'Instalación de Paneles Solares en Finca',
      presupuestoEur: 1200,
      proponente: demoUserId
    },
    channel: 'telegram',
    agentId: 'telegram-bot',
    sourceAction: 'telegram_command'
  });

  console.log(`   📄 Documento Creado (/pending_actions/${pending.id}):`);
  console.log(`      Acción      : ${pending.actionType}`);
  console.log(`      Estado      : ${pending.status} (TTL 15 min)`);
  console.log(`      Token Confirm: ${pending.confirmationToken}`);
  console.log('\n   📱 Simulación Teclado Inline Telegram:');
  console.log('   ┌────────────────────────────────────────────────────────────┐');
  console.log(`   │ 💬 "Vas a crear la propuesta: Paneles Solares (1200€)"      │`);
  console.log(`   │                                                            │`);
  console.log(`   │   [ ✅ Confirmar (pending:confirm:${pending.id}) ]           │`);
  console.log(`   │   [ ❌ Cancelar  (pending:cancel:${pending.id}) ]            │`);
  console.log('   └────────────────────────────────────────────────────────────┘\n');

  // PASO 3: Simulación de Confirmación Humana
  printStep(
    3,
    'CONFIRMACIÓN HUMANA (TELEGRAM CALLBACK)',
    'Simulando clic del usuario en [ ✅ Confirmar ]'
  );

  console.log(`   🖱️ [User Callback] Ejecutando confirmPendingAction("${pending.id}", "${pending.confirmationToken}")...`);
  const confirmed = await confirmPendingAction(pending.id, pending.confirmationToken);

  console.log(`   ✅ Transición de Estado (/pending_actions/${pending.id}):`);
  console.log(`      Estado Final : "${confirmed.status.toUpperCase()}"`);
  console.log(`      Action Type  : ${confirmed.actionType}\n`);

  // PASO 4: Auditoría e Inspección Inmutable
  printStep(
    4,
    'AUDITORÍA INMUTABLE DE ACCIONES (/audit_logs)',
    'Inspeccionando trazas inmutables registradas por canal y origen'
  );

  const logs = await getAuditLogsByCommunity(demoCommunityId, 5);
  console.log(`   📋 Trazas registradas para comunidad [${demoCommunityId}]:\n`);

  logs.forEach((log, index) => {
    console.log(`   [Log #${index + 1}] ID: ${log.id}`);
    console.log(`           Canal      : ${log.channel.toUpperCase()} (${log.agentId})`);
    console.log(`           Origen     : ${log.sourceAction}`);
    console.log(`           Acción     : ${log.action}`);
    console.log(`           Estado     : ${log.status}`);
    console.log(`           Usuario    : ${log.userId}`);
    console.log('   ──────────────────────────────────────────────────────────');
  });

  console.log('\n================================================================');
  console.log(' ✨ SIMULACIÓN Y DEPURACIÓN COMPLETADA CORRECTAMENTE');
  console.log('================================================================\n');
}

runMultichannelSimulation().catch(err => {
  console.error('\n🔴 Error en la simulación:', err);
  process.exit(1);
});
