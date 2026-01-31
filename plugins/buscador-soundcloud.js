import fetch from 'node-fetch';

let handler = async (m, { text }) => {
  if (!text) {
    return m.reply('❌ *Falta el texto de búsqueda*\n\nEjemplo: /soundcloud Bad Bunny');
  }
  
  await m.reply('🔍 Buscando en SoundCloud...');

  try {
    // Usando la nueva API que proporcionaste
    let url = `https://api.stellarwa.xyz/search/soundcloud?query=${encodeURIComponent(text)}&key=stellar-wCnAirJG`;
    
    let res = await fetch(url);
    
    if (!res.ok) {
      throw new Error(`Error HTTP: ${res.status}`);
    }
    
    let data = await res.json();

    // Verificar la estructura de la respuesta
    if (!data.status || !data.result || data.result.length === 0) {
      return m.reply('❌ No se encontraron resultados en SoundCloud');
    }

    let message = '🎧 *RESULTADOS SOUNDCLOUD*\n\n';
    
    // Mostrar primeros 5 resultados (o menos si hay menos de 5)
    let results = data.result.slice(0, 5);
    
    results.forEach((item, i) => {
      message += `*${i + 1}.* ${item.title || 'Sin título'}\n`;
      message += `   👤 *Artista:* ${item.artist || 'Desconocido'}\n`;
      
      // Convertir duración de segundos a formato MM:SS si está disponible
      if (item.duration) {
        let minutes = Math.floor(item.duration / 60);
        let seconds = item.duration % 60;
        message += `   ⏱️ *Duración:* ${minutes}:${seconds.toString().padStart(2, '0')}\n`;
      }
      
      if (item.genre) message += `   🎶 *Género:* ${item.genre}\n`;
      
      // Agregar URL si está disponible
      if (item.url) {
        message += `   🔗 *URL:* ${item.url}\n`;
      }
      
      message += '\n';
    });

    message += `📌 Usa el número correspondiente para seleccionar una canción\n`;
    message += `📌 Ejemplo: */sc 1* para seleccionar el primer resultado`;

    await m.reply(message);
    m.react('✅');
    
  } catch (error) {
    console.error('Error en búsqueda de SoundCloud:', error);
    m.reply('❌ Error al buscar en SoundCloud. Verifica la conexión o intenta más tarde.');
  }
};

handler.command = ['soundcloud', 'sc'];
handler.tags = ['music'];
handler.help = ['soundcloud <texto>'];
handler.register = false;

export default handler;
