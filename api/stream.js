export default async function handler(req, res) {
  // URL del stream original
  const baseUrl = 'https://rt-esp.rttv.com/live/';
  
  // Obtiene la ruta del archivo (ej: index.m3u8 o 12345.ts) desde la URL
  const streamPath = req.query.path;
  const targetUrl = baseUrl + streamPath;

  try {
    // Pide el archivo al servidor original
    const response = await fetch(targetUrl);
    
    // Si el servidor original da un error, lo pasamos al usuario
    if (!response.ok) {
      return res.status(response.status).send(response.statusText);
    }
    
    const body = await response.arrayBuffer();

    // --- CABECERAS DE RESPUESTA (La parte importante) ---

    // 1. Permisos CORS para que funcione en cualquier página web
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // 2. Caché para reducir la latencia y el congelamiento
    const isPlaylist = req.query.path.endsWith('.m3u8');
    if (isPlaylist) {
      // El playlist (lista de segmentos) se guarda por muy poco tiempo (3 segundos)
      res.setHeader('Cache-Control', 'public, s-maxage=3, stale-while-revalidate=3');
    } else {
      // Los segmentos de video (.ts) se guardan por más tiempo (10 minutos)
      res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=600');
    }
    
    // 3. Envía el archivo de video (playlist o segmento) al reproductor
    res.send(Buffer.from(body));

  } catch (error) {
    // En caso de un error en nuestro código, lo registramos y enviamos una respuesta de error
    console.error(error);
    res.status(500).send('Error en el servidor proxy.');
  }
}
