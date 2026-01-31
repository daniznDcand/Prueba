import fetch from 'node-fetch';

let handler = async (m, { text }) => {
  if (!text) {
    return m.reply(`🎵 *Uso correcto:*\n\`\`\`/soundcloud <nombre de la canción/artista>\`\`\`\nEjemplo: */soundcloud Bad Bunny*`);
  }

  m.reply('🔍 *Buscando en SoundCloud...*');

  const apiUrl = `https://api.stellarwa.xyz/dl/soundcloudsearch?query=${encodeURIComponent(text)}&key=stellar-wCnAirJG`;

  try {
    const response = await fetch(apiUrl);
    const result = await response.json();

    if (!result.status || !result.result || result.result.length === 0) {
      return m.reply('❌ *No se encontraron resultados en SoundCloud*');
    }

    let replyMessage = `🔊 *Resultados de SoundCloud:*\n\n`;
    
    // Mostrar hasta 5 resultados
    const resultsToShow = result.result.slice(0, 5);
    
    resultsToShow.forEach((item, index) => {
      replyMessage += `*${index + 1}. ${item.title || 'Sin título'}*\n`;
      replyMessage += `• 👤 *Artista:* ${item.artist || 'Desconocido'}\n`;
      replyMessage += `• ⏱️ *Duración:* ${item.duration || 'Desconocida'}\n`;
      replyMessage += `• 🎶 *Género:* ${item.genre || 'No especificado'}\n`;
      replyMessage += `• 🔗 *URL:* ${item.url || 'No disponible'}\n`;
      replyMessage += `• 💿 *Tipo:* ${item.type || 'Canción'}\n`;
      replyMessage += `━━━━━━━━━━━━━━\n\n`;
    });

    replyMessage += `📌 *Para descargar:*\nUsa el comando */song* o */play* con el nombre exacto`;

    m.react('🎶');
    
    await m.reply(replyMessage);
    
  } catch (error) {
    console.error('Error en soundcloud:', error);
    m.reply(`❌ *Error al conectar con SoundCloud*\n\nPosibles causas:\n1. API no disponible\n2. Límite de solicitudes\n3. Problema de red\n\nIntenta más tarde o usa: */song <nombre>*`);
  }
};

handler.command = /^(soundcloud|scsearch|sound)$/i;
handler.tags = ['music', 'download'];
handler.help = ['soundcloud <texto>', 'scsearch <texto>'];
handler.register = false;

export default handler;
