export default async function handler(req, res) {
  const baseUrl = 'https://rt-esp.rttv.com/live/rtesp/';
  const streamPath = req.query.path;
  const targetUrl = baseUrl + streamPath;

  try {
    const response = await fetch(targetUrl);
    if (!response.ok) {
      return res.status(response.status).send(response.statusText);
    }

    const body = await response.arrayBuffer();

    // Cabeceras de Permiso (CORS)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // --- MEJORA DE VELOCIDAD ---
    // Añadimos una cabecera de Caché para mejorar la velocidad
    const isPlaylist = req.query.path.endsWith('.m3u8');
    if (isPlaylist) {
      // El playlist se actualiza a menudo, lo guardamos en caché por solo 3 segundos.
      res.setHeader('Cache-Control', 'public, s-maxage=3, stale-while-revalidate=3');
    } else {
      // Los segmentos de video (.ts) no cambian, los guardamos por 10 minutos.
      res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=600');
    }

    res.send(Buffer.from(body));

  } catch (error) {
    console.error(error);
    res.status(500).send('Error en el servidor proxy.');
  }
}
