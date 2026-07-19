export function isValidHexColor(value:string){return /^#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?$/.test(value)}
export function normalizeHexColor(value:string){
  const trimmed=value.trim();
  if(!isValidHexColor(trimmed))return null;
  const body=trimmed.slice(1);
  return `#${(body.length===3?[...body].map(character=>character.repeat(2)).join(''):body).toUpperCase()}`;
}
function channel(value:number){const normalized=value/255;return normalized<=.04045?normalized/12.92:((normalized+.055)/1.055)**2.4}
export function calculateRelativeLuminance(value:string){
  const normalized=normalizeHexColor(value);if(!normalized)throw new Error('Màu HEX không hợp lệ.');
  return .2126*channel(parseInt(normalized.slice(1,3),16))+.7152*channel(parseInt(normalized.slice(3,5),16))+.0722*channel(parseInt(normalized.slice(5,7),16));
}
export function calculateContrastRatio(first:string,second:string){
  const [lighter,darker]=[calculateRelativeLuminance(first),calculateRelativeLuminance(second)].sort((a,b)=>b-a);
  return (lighter+.05)/(darker+.05);
}
export function chooseReadableTextColor(background:string){return calculateContrastRatio('#000000',background)>=calculateContrastRatio('#FFFFFF',background)?'#000000':'#FFFFFF'}
