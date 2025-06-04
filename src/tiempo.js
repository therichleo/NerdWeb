export function tiempoTranscurrido(timestamp) {
  const ahora = Date.now();
  const diferencia = ahora - timestamp;

  const segundos = Math.floor(diferencia / 1000);
  const minutos = Math.floor(segundos / 60);
  const horas = Math.floor(minutos / 60);
  const dias = Math.floor(horas / 24);
  const semanas = Math.floor(dias / 7);
  const meses = Math.floor(dias / 30);
  const años = Math.floor(dias / 365);

  if (segundos < 60) return 'hace unos segundos';
  if (minutos < 60) return `hace ${minutos} minuto${minutos > 1 ? 's' : ''}`;
  if (horas < 24) return `hace ${horas} hora${horas > 1 ? 's' : ''}`;
  if (dias === 1) return 'ayer';
  if (dias < 7) return `hace ${dias} día${dias > 1 ? 's' : ''}`;
  if (semanas < 4) return `hace ${semanas} semana${semanas > 1 ? 's' : ''}`;
  if (meses < 12) return `hace ${meses} mes${meses > 1 ? 'es' : ''}`;
  return `hace ${años} año${años > 1 ? 's' : ''}`;
}
