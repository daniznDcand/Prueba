import fetch from 'node-fetch';

let handler = async (m, { text }) => {
  if (!text) {
    return m.reply('❌ *Falta el texto de búsqueda*\n\nEjemplo: /soundcloud Bad Bunny');
  }
  
  await m.reply('🔍 Buscando...');

  try {
    let url = `https://api.stellarwa.xyz/search/soundcloud?query=${encodeURIComponent(text)}&key=stellar-wCnAirJG`;
    let res = await fetch(url);
    let data = await res.json();

    if (!data.status || !data.results || data.results.length === 0) {
      return m.reply('❌ No se encontraron resultados');
    }

    let message = '🎧 *RESULTADOS SOUNDCLOUD*\n\n';
    
    data.results.slice(0, 5).forEach((item, i) => {
      message += `*${i + 1}.* ${item.title || 'Sin título'}\n`;
      message += `   👤 *Autor:* ${item.author?.name || 'Desconocido'}\n`;
      if (item.duration) message += `   ⏱️ *Duración:* ${item.duration}\n`;
      if (item.release_date) message += `   📅 *Fecha:* ${item.release_date}\n`;
      if (item.play_count) message += `   ▶️ *Reproducciones:* ${item.play_count}\n`;
      if (item.like_count) message += `   ❤️ *Likes:* ${item.like_count}\n`;
      message += `   🔗 [Escuchar](${item.url})\n\n`;
    });

    message += `📌 Usa */song <nombre>* para descargar`;

    await m.reply(message);
    m.react('✅');
    
  } catch (error) {
    console.error(error);
    m.reply('❌ Error al buscar en SoundCloud');
  }
};

handler.command = ['soundcloud', 'sc'];
handler.tags = ['music'];
handler.help = ['soundcloud <texto>'];
handler.register = false;

export default handler;
