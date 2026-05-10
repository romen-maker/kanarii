export async function geocodeLugar(lugar: string): Promise<{
    latitud: number;
    longitud: number;
    timezone: string;
    lugarNormalizado: string;
}> {
    if (!lugar || !lugar.trim()) {
        throw new Error("El lugar proporcionado está vacío.");
    }
    
    // 1. Geocode
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(lugar)}&count=1&language=es&format=json`;
    const geoRes = await fetch(geoUrl);
    if (!geoRes.ok) {
        throw new Error("No se pudo conectar con el servicio de ubicaciones.");
    }
    
    const geoData = await geoRes.json();
    if (!geoData.results || geoData.results.length === 0) {
        throw new Error("No se encontró esta ubicación, intenta ser más específico.");
    }
    
    const target = geoData.results[0];
    const latitud = target.latitude;
    const longitud = target.longitude;
    
    // Normalizar lugar un poco más
    const country = target.country ? `, ${target.country}` : '';
    const admin1 = target.admin1 && target.admin1 !== target.name ? `, ${target.admin1}` : '';
    const lugarNormalizado = `${target.name}${admin1}${country}`;

    // 2. Timezone
    let timezone = "UTC";
    // For timezone open-meteo response usually also returns `timezone`
    if (target.timezone) {
        timezone = target.timezone;
    } else {
        const tzUrl = `https://www.timeapi.io/api/timezone/coordinate?latitude=${latitud}&longitude=${longitud}`;
        try {
            const tzRes = await fetch(tzUrl);
            if (tzRes.ok) {
                const tzData = await tzRes.json();
                if (tzData.timeZone) {
                    timezone = tzData.timeZone;
                }
            }
        } catch (e) {
            console.warn("No se pudo obtener la zona horaria desde timeapi", e);
        }
    }

    return {
        latitud,
        longitud,
        timezone,
        lugarNormalizado
    };
}
