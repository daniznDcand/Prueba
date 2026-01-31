import fetch from 'node-fetch';

let handler = async (m, { text }) => {
  if (!text) return m.reply('❌ *Escribe lo que quieres buscar*\nEjemplo: /soundcloud Bad Bunny');

  await m.reply('🔍 Buscando en SoundCloud...');

  const APIs = [
    // API 1 (la original)
    `https://api.stellarwa.xyz/dl/soundcloudsearch?query=${encodeURIComponent(text)}&key=stellar-wCnAirJG`,
    
    // API 2 (alternativa)
    `https://api.lolhuman.xyz/api/soundcloud?apikey=TU_API_KEY&query=${encodeURIComponent(text)}`,
    
    // API 3 (otra alternativa)
    `https://api.neoxr.my.id/api/soundcloud?q=${encodeURIComponent(text)}&apikey=neoxr-apikey`,
    
    // API 4 (más simple)
    `https://soundcloud-scraper.p.rapidapi.com/v1/search/tracks?query=${encodeURIComponent(text)}`,
  ];

  for (let apiUrl of APIs) {
    try {
      console.log('Probando API:', apiUrl);
      
      const response = await fetch(apiUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 10000
      });
      
      if (!response.ok) continue;
      
      const result = await response.json();
      
      // Diferentes estructuras de respuesta según la API
      let tracks = [];
      
      if (result.status && result.result) {
        // API 1: stellarwa.xyz
        tracks = result.result;
      } else if (result.result) {
        // API 2: lolhuman
        tracks = result.result;
      } else if (Array.isArray(result)) {
        // API 3: neoxr
        tracks = result;
      } else if (result.data) {
        // API 4: rapidapi
        tracks = result.data;
      } else if (result.tracks) {
        // Otra estructura común
        tracks = result.tracks;
      }
      
      if (tracks.length > 0) {
        let message = '🎧 *RESULTADOS SOUNDCLOUD*\n\n';
        
        tracks.slice(0, 5).forEach((track, i) => {
          message += `*${i + 1}.* ${track.title || 'Sin título'}\n`;
          if (track.user) message += `   👤 *Artista:* ${track.user.username || track.artist}\n`;
          if (track.duration) message += `   ⏱️ *Duración:* ${formatDuration(track.duration)}\n`;
          if (track.genre) message += `   🎶 *Género:* ${track.genre}\n`;
          if (track.permalink_url) message += `   🔗 *URL:* ${track.permalink_url}\n`;
          message += '\n';
        });
        
        message += '📌 Para descargar: /song <nombre>';
        
        await m.reply(message);
        return;
      }
      
    } catch (error) {
      console.log('API falló:', apiUrl, error.message);
      continue;
    }
  }
  
  // Si todas las APIs fallaron
  await m.reply('❌ *No se pudo conectar con SoundCloud*\n\nUsa: /song <nombre> para buscar y descargar música');
};

function formatDuration(ms) {
  if (!ms) return 'Desconocida';
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

handler.command = ['soundcloud', 'sc'];
handler.tags = ['music'];
handler.help = ['soundcloud <texto>'];

export default handler;
