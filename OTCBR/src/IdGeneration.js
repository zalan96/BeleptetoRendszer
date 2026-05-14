export default function GenerateTicketId(birthDate, extra = '') {
  // birthDate: ISO string vagy 'YYYY-MM-DD' formátum
  const d = new Date(birthDate);
  if (Number.isNaN(d.getTime())) throw new Error('Érvénytelen születési dátum');

  const yy = String(d.getUTCFullYear()).slice(-2);
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const birthPart = `${yy}${mm}${dd}`; // pl. 900715

  // biztonságos véletlen (kliensben: crypto, fallback: Math.random)
  let rand = '';
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const arr = new Uint8Array(4);
    crypto.getRandomValues(arr);
    rand = Array.from(arr).map(b => b.toString(36).padStart(2, '0')).join('').slice(0,6).toUpperCase();
  } else {
    rand = Math.random().toString(36).slice(2,8).toUpperCase();
  }

  // rövid checksum a collision csökkentésére (nem kriptografikus)
  const s = birthPart + rand + String(extra);
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h) + s.charCodeAt(i) | 0;
  const chk = (Math.abs(h) % (36 * 36)).toString(36).padStart(2, '0').toUpperCase();

  // formátum: YYMMDD-RAND-CK
  return `${birthPart}-${rand}-${chk}`;
}