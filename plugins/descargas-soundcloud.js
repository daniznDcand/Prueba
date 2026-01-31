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

    let caption = `🎧 *SOUNDCLOUD DL*\n\n`;
    caption += `📌 *Título:* ${track.title}\n`;
    caption += `👤 *Artista:* ${track.artist}\n`;
    caption += `⏱️ *Duración:* ${(track.duration / 1000 / 60).toFixed(2)} min\n`;
    caption += `⬇️ *Descargando...*\n`;

    await conn.sendMessage(m.chat, {
      image: { url: track.banner },
      caption: caption
    }, { quoted: m });

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
