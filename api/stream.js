export default async function handler(req, res) {
  // La URL base de tu stream original
  const baseUrl = 'http://186.121.206.197/live/daniel/';

  // Obtenemos la parte de la URL que necesitamos (ej. index.m3u8 o 12345.ts)
  const streamPath = req.query.path.join('/');
  const targetUrl = baseUrl + streamPath;

  try {
    // Hacemos la petición al servidor original
    const response = await fetch(targetUrl);

    // Si el servidor original no responde bien, enviamos el error
    if (!response.ok) {
      return res.status(response.status).send(response.statusText);
    }

    const body = await response.arrayBuffer();

    // ¡La parte más importante! Añadimos las cabeceras de permiso (CORS)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Enviamos el contenido del video (el playlist o el segmento) al navegador
    res.send(Buffer.from(body));

  } catch (error) {
    console.error(error);
    res.status(500).send('Error en el servidor proxy.');
  }
}
