const fetch = require('node-fetch');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Cache-Control', 'no-cache');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // Strip /stream prefix
  const originalUrl = req.url.replace('/stream', '');
  // Build target HTTP URL
  const targetUrl = `http://163.61.227.29:8000${originalUrl}`;

  console.log('[Stream Proxy] Fetching:', targetUrl);

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'Referer': 'http://163.61.227.29:8000/',
        'User-Agent': 'Mozilla/5.0',
        'Accept': '*/*',
        'Accept-Encoding': 'identity'
      }
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    // M3U8
    if (originalUrl.endsWith('.m3u8')) {
      let text = await response.text();
      // Rewrite TS segments
      text = text.replace(/([^\/]+\.ts)/g, match => `/stream/play/a05l/${match}`);
      return res.send(text);
    }

    // TS file / binary
    const buffer = await response.buffer();
    res.send(buffer);

  } catch (err) {
    console.error('Stream Error:', err.message);
    res.status(500).json({ error: 'Proxy Error', message: err.message, url: targetUrl });
  }
};
