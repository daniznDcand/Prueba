import fetch from 'node-fetch';

let handler = async (m, { text, conn }) => {
  if (!text) {
    return m.reply('❌ *Falta el texto de búsqueda*\n\nEjemplo: /soundclouddl Bad Bunny');
  }
  
  await m.reply('🔍 Buscando y preparando descarga...');

  try {
    let url = `https://api.stellarwa.xyz/dl/soundcloudsearch?query=${encodeURIComponent(text)}&key=stellar-wCnAirJG`;
    let res = await fetch(url);
    let data = await res.json();

    if (!data.success || !data.data) {
      return m.reply('❌ No se encontró el audio');
    }

    let track = data.data;

    let message = `🎧 *SOUNDCLOUD DL*\n\n`;
    message += `📌 *Título:* ${track.title}\n`;
    message += `👤 *Artista:* ${track.artist}\n`;
    message += `⏱️ *Duración:* ${(track.duration / 1000 / 60).toFixed(2)} min\n`;
    message += `🖼️ *Banner:* ${track.banner}\n`;
    message += `⬇️ *Descargando...*\n`;

    await m.reply(message);

    await conn.sendMessage(m.chat, {
      audio: { url: track.dl },
      mimetype: 'audio/mpeg',
      fileName: `${track.title}.mp3`
    }, { quoted: m });

    m.react('✅');
    
  } catch (error) {
    console.error(error);
    m.reply('❌ Error al descargar desde SoundCloud');
  }
};

handler.command = ['soundclouddl', 'scdl'];
handler.tags = ['music'];
handler.help = ['soundclouddl <texto>'];
handler.register = false;

export default handler;
