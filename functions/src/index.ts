import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { onRequest } from 'firebase-functions/v2/https';
import { calcularKin } from './kinMaya';

initializeApp();
const db = getFirestore();

const BOT_AGENTS = /facebookexternalhit|WhatsApp|TelegramBot|Twitterbot|LinkedInBot|Slackbot|googlebot/i;

const esc = (s: string) => s.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');

export const ogPassaporte = onRequest({ cors: true }, async (req, res) => {
  const isBot = BOT_AGENTS.test(req.headers['user-agent'] || '');

  // Extraer slug y userId del path
  // La ruta esperada es /c/:slug/miembro/:userId
  const parts = req.path.split('/');
  const miembroIdx = parts.indexOf('miembro');
  const userId = miembroIdx !== -1 && parts[miembroIdx + 1] ? parts[miembroIdx + 1] : null;
  const slug = miembroIdx !== -1 && parts[miembroIdx - 1] ? parts[miembroIdx - 1] : null;

  if (!userId) {
    res.status(400).send('Falta el ID de miembro en la ruta.');
    return;
  }

  if (!isBot) {
    // Redirigir al usuario normal al index.html con el query param de la ruta original
    res.redirect(302, `/index.html?route=${encodeURIComponent(req.path)}`);
    return;
  }

  try {
    // 1. Obtener la ficha desde /profiles/{userId} o /fichas/{userId}
    // Prioridad 1: /profiles/{userId}
    let profileData: any = null;
    const profileSnap = await db.collection('profiles').doc(userId).get();
    if (profileSnap.exists) {
      profileData = profileSnap.data();
    } else {
      // Fallback a /fichas/{userId}
      const fichaSnap = await db.collection('fichas').doc(userId).get();
      if (fichaSnap.exists) {
        profileData = fichaSnap.data();
      }
    }

    // 2. Obtener datos del miembro en la comunidad
    let memberData: any = null;
    if (slug) {
      const memberSnap = await db.collection('community_members').doc(`${slug}_${userId}`).get();
      if (memberSnap.exists) {
        memberData = memberSnap.data();
      }
    }

    // 3. Extraer campos con los fallbacks adecuados
    const nombre = memberData?.nombre || memberData?.displayName || profileData?.datosPersona?.nombre || profileData?.datosOnboarding?.nombre || 'Miembro de Kanarii';
    const foto = memberData?.photoURL || profileData?.datosPersona?.photoURL || profileData?.datosOnboarding?.plataformaOrigen || 'https://kanarii.app/og-default.png';
    const rolesArray: string[] = [];
    if (memberData?.rol_comunidad) rolesArray.push(memberData.rol_comunidad);
    else if (memberData?.rolComunitario) rolesArray.push(memberData.rolComunitario);
    else if (profileData?.datosOnboarding?.rol_comunidad) rolesArray.push(profileData.datosOnboarding.rol_comunidad);
    const rolStr = rolesArray.length > 0 ? rolesArray.join(', ') : 'Miembro';

    // 4. Calcular el Kin Maya si existe fecha de nacimiento
    const birthDate = memberData?.fechaNacimiento || profileData?.datosPersona?.fechaNacimiento || profileData?.datosOnboarding?.fechaNacimiento;
    let kinStr = '';
    if (birthDate) {
      try {
        const kin = calcularKin(birthDate);
        kinStr = ` · Kin Maya: ${kin.descripcionCorta}`;
      } catch (err) {
        console.error('Error al calcular el Kin Maya:', err);
      }
    }

    // 5. Servir el HTML con las etiquetas Open Graph
    const title = `${nombre} - Pasaporte Comunitario`;
    const description = `Rol: ${rolStr}${kinStr} - Conoce mi rol, saberes y ofrendas en la comunidad.`;
    const url = `https://kanarii.app${req.path}`;

    res.set('Cache-Control', 'public, max-age=3600');
    res.status(200).send(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta property="og:title" content="${esc(nombre)}" />
  <meta property="og:description" content="${esc(description)}" />
  <meta property="og:image" content="${esc(foto)}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:type" content="profile" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(nombre)}" />
  <meta name="twitter:description" content="${esc(description)}" />
  <meta name="twitter:image" content="${esc(foto)}" />
  <title>${esc(title)}</title>
</head>
<body>
  <h1>${esc(nombre)}</h1>
  <p>${esc(description)}</p>
</body>
</html>`);
  } catch (err) {
    console.error('Error en Cloud Function ogPassaporte:', err);
    res.status(500).send('Error interno del servidor');
  }
});
