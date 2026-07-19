const DATE=/^(\d{4})-(\d{2})-(\d{2})$/;
export function localDateKey(date=new Date()){
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}
export function parseLocalDate(value:string){
  const match=DATE.exec(value);if(!match)return null;
  const year=Number(match[1]),month=Number(match[2]),day=Number(match[3]);
  const date=new Date(year,month-1,day,12);
  return date.getFullYear()===year&&date.getMonth()===month-1&&date.getDate()===day?date:null;
}
export function isValidLocalDate(value:string){return parseLocalDate(value)!==null}
export function addLocalDays(value:string,amount:number){
  const date=parseLocalDate(value);if(!date)throw new Error('Ngày không hợp lệ');
  date.setDate(date.getDate()+amount);return localDateKey(date);
}
export function vietnameseDate(value:Date|string=new Date()){
  const date=typeof value==='string'?parseLocalDate(value):value;
  if(!date)throw new Error('Ngày không hợp lệ');
  const formatted=new Intl.DateTimeFormat('vi-VN',{weekday:'long',day:'2-digit',month:'2-digit',year:'numeric'}).format(date);
  return formatted.charAt(0).toUpperCase()+formatted.slice(1);
}
export function shortVietnameseDate(value:string){
  const date=parseLocalDate(value);if(!date)throw new Error('Ngày không hợp lệ');
  return new Intl.DateTimeFormat('vi-VN',{day:'2-digit',month:'2-digit',year:'numeric'}).format(date);
}
