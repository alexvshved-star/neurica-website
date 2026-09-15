/** Imports normalize explicit source values; manual visual reviews are logged separately. */
export const COLORS = {
 white:['Білий','White'], black:['Чорний','Black'], grey:['Сірий','Grey'],
 beige:['Бежевий','Beige'], brown:['Коричневий','Brown'], yellow:['Жовтий','Yellow'],
 blue:['Синій','Blue'], green:['Зелений','Green'], red:['Червоний','Red'],
 pink:['Рожевий','Pink'], gold:['Золотий','Gold'], multicolor:['Багатоколірний','Multicolour']
};
export function normalizeColor(value) {
 if(typeof value!=='string') return null;
 const text=value.normalize('NFKC').trim().toLowerCase();
 return Object.keys(COLORS).find(key=>key===text || COLORS[key].some(label=>label.toLowerCase()===text)) ?? null;
}
export function stockColor(value, reviewValue) {
 const color=normalizeColor(value);
 return color===reviewValue ? null : color;
}
export function colorLabel(value,locale) {
 return COLORS[value]?.[locale==='uk'?0:1] ?? (locale==='uk'?'Потребує уточнення':'Pending confirmation');
}
