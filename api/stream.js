module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Cache-Control', 'no-cache');

  // Preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // /stream/ এর পরের অংশটাই আসল URL
  const rawUrl = req.url.replace(/^\/stream\//, '');
  const targetUrl = decodeURIComponent(rawUrl);

  if (!targetUrl.startsWith('http')) {
    return res.status(400).send('Invalid target URL');
  }

  console.log('[Dynamic Stream] Fetching:', targetUrl);

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': '*/*',
        'Accept-Encoding': 'identity'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const contentType =
      response.headers.get('content-type') || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);

    // m3u8 হলে TS লিংক rewrite
    if (targetUrl.endsWith('.m3u8')) {
      let text = await response.text();

      // relative .ts → proxy দিয়ে ঘুরানো
      text = text.replace(/([^\n\r]+\.ts)/g, (match) => {
        const base = targetUrl.substring(0, targetUrl.lastIndexOf('/') + 1);
        const fullTsUrl = base + match;
        return `/stream/${encodeURIComponent(fullTsUrl)}`;
      });

      return res.send(text);
    }

    // ts বা অন্য binary
    const buffer = Buffer.from(await response.arrayBuffer());
    res.send(buffer);

  } catch (err) {
    console.error('Stream Error:', err.message);
    res.status(500).json({
      error: 'Stream proxy failed',
      message: err.message
    });
  }
};
