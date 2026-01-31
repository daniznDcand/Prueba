import fetch from 'node-fetch';

let handler = async (m, { text, args, usedPrefix, command }) => {
  // Si no se proporciona texto, mostrar ayuda
  if (!text) {
    return m.reply(`🎵 *${command.toUpperCase()} - Descarga de SoundCloud*\n\n📌 *Uso:* ${usedPrefix}${command} <URL de SoundCloud>\n\n📝 *Ejemplos:*\n${usedPrefix}${command} https://soundcloud.com/artista/cancion\n${usedPrefix}${command} https://on.soundcloud.com/xxxxx\n\n⚠️ *Nota:* Necesitas la URL completa de SoundCloud`);
  }

  // Verificar si es una URL de SoundCloud
  let url = text.trim();
  if (!url.match(/soundcloud\.com|on\.soundcloud\.com/i)) {
    return m.reply(`❌ *URL inválida*\n\nPor favor, ingresa una URL válida de SoundCloud.\nEjemplo: https://soundcloud.com/twice-57013/one-spark\n\nTambién puedes usar: ${usedPrefix}song <nombre> para buscar y descargar música.`);
  }

  // Limpiar y preparar URL
  url = url.split('?')[0]; // Remover parámetros de query
  
  await m.reply('🔍 *Procesando enlace de SoundCloud...*');

  try {
    const apiUrl = `https://api.delirius.store/download/soundcloud?url=${encodeURIComponent(url)}`;
    
    console.log('Consultando API:', apiUrl);
    
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json'
      },
      timeout: 30000 // 30 segundos timeout
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const result = await response.json();
    
    console.log('Respuesta API:', JSON.stringify(result, null, 2));

    // Verificar estructura de respuesta
    if (result.error || !result.success) {
      const errorMsg = result.message || result.error || 'Error desconocido en la API';
      return m.reply(`❌ *Error en la API:* ${errorMsg}`);
    }

    // Extraer información de la respuesta
    const data = result.data || result;
    
    if (!data) {
      return m.reply('❌ *No se pudo obtener información de la canción*');
    }

    // Crear mensaje con la información
    let message = `🎧 *DESCARGA DE SOUNDCLOUD*\n\n`;
    
    // Información básica
    if (data.title) message += `*Título:* ${data.title}\n`;
    if (data.artist || data.uploader) message += `*Artista:* ${data.artist || data.uploader}\n`;
    if (data.duration) message += `*Duración:* ${formatDuration(data.duration)}\n`;
    if (data.quality) message += `*Calidad:* ${data.quality}\n`;
    if (data.size) message += `*Tamaño:* ${formatBytes(data.size)}\n`;
    
    message += '\n⬇️ *ENLACES DE DESCARGA:*\n';

    // Verificar si hay URL de audio directo
    if (data.url || data.downloadUrl) {
      const audioUrl = data.url || data.downloadUrl;
      message += `🔗 *Audio:* ${audioUrl}\n`;
      
      // Intentar enviar el audio directamente
      try {
        await m.conn.sendFile(m.chat, audioUrl, 'soundcloud.mp3', '', m, null, {
          mimetype: 'audio/mpeg',
          filename: `${data.title || 'soundcloud'}.mp3`
        });
        
        // También enviar la información
        return m.reply(message);
        
      } catch (sendError) {
        console.log('Error enviando archivo:', sendError);
        message += `\n⚠️ *No se pudo enviar el audio automáticamente*\n`;
        message += `📥 *Descarga manual:* ${audioUrl}\n`;
        return m.reply(message);
      }
    }
    // Si hay múltiples formatos
    else if (data.formats && Array.isArray(data.formats)) {
      data.formats.forEach((format, index) => {
        message += `\n*Opción ${index + 1}:*\n`;
        if (format.quality) message += `   Calidad: ${format.quality}\n`;
        if (format.url) message += `   URL: ${format.url}\n`;
        if (format.size) message += `   Tamaño: ${formatBytes(format.size)}\n`;
      });
      
      return m.reply(message);
    }
    // Si no hay URL de descarga
    else {
      message += '❌ *No se encontraron enlaces de descarga disponibles*';
      return m.reply(message);
    }

  } catch (error) {
    console.error('❌ Error en soundcloud download:', error);
    
    let errorMessage = '❌ *Error al procesar la solicitud*\n\n';
    
    if (error.message.includes('timeout')) {
      errorMessage += '⏱️ *Tiempo de espera agotado*\nLa API tardó demasiado en responder.';
    } else if (error.message.includes('fetch failed')) {
      errorMessage += '🌐 *Error de conexión*\nNo se pudo conectar con el servidor.';
    } else {
      errorMessage += `🔧 *Detalles:* ${error.message}`;
    }
    
    errorMessage += `\n\n🎵 *Alternativa:* Usa ${usedPrefix}song <nombre> para buscar música.`;
    
    return m.reply(errorMessage);
  }
};

// Función para formatear duración
function formatDuration(seconds) {
  if (!seconds) return 'Desconocida';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// Función para formatear bytes
function formatBytes(bytes) {
  if (!bytes) return 'Desconocido';
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

// Comandos que activan este handler
handler.command = ['soundcloud', 'scdl', 'scdownload'];
handler.tags = ['music', 'download'];
handler.help = [
  'soundcloud <url> - Descargar audio de SoundCloud',
  'scdl <url> - Atajo para descargar de SoundCloud'
];

// Configuración adicional
handler.limit = true; // Limitar uso
handler.premium = false; // No requiere premium

export default handler;
