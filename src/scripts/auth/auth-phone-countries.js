/** @typedef {{ iso2: string, dial: string, nameUa: string, nationalMaxLen: number }} AuthPhoneCountry */

/** @type {AuthPhoneCountry[]} */
const RAW = [
  { iso2: 'UA', dial: '380', nameUa: 'Україна', nationalMaxLen: 9 },
  { iso2: 'US', dial: '1', nameUa: 'Сполучені Штати', nationalMaxLen: 10 },
  { iso2: 'CA', dial: '1', nameUa: 'Канада', nationalMaxLen: 10 },
  { iso2: 'GB', dial: '44', nameUa: 'Велика Британія', nationalMaxLen: 10 },
  { iso2: 'DE', dial: '49', nameUa: 'Німеччина', nationalMaxLen: 11 },
  { iso2: 'FR', dial: '33', nameUa: 'Франція', nationalMaxLen: 9 },
  { iso2: 'IT', dial: '39', nameUa: 'Італія', nationalMaxLen: 10 },
  { iso2: 'ES', dial: '34', nameUa: 'Іспанія', nationalMaxLen: 9 },
  { iso2: 'PL', dial: '48', nameUa: 'Польща', nationalMaxLen: 9 },
  { iso2: 'NL', dial: '31', nameUa: 'Нідерланди', nationalMaxLen: 9 },
  { iso2: 'BE', dial: '32', nameUa: 'Бельгія', nationalMaxLen: 9 },
  { iso2: 'SE', dial: '46', nameUa: 'Швеція', nationalMaxLen: 9 },
  { iso2: 'NO', dial: '47', nameUa: 'Норвегія', nationalMaxLen: 8 },
  { iso2: 'DK', dial: '45', nameUa: 'Данія', nationalMaxLen: 8 },
  { iso2: 'FI', dial: '358', nameUa: 'Фінляндія', nationalMaxLen: 9 },
  { iso2: 'IE', dial: '353', nameUa: 'Ірландія', nationalMaxLen: 9 },
  { iso2: 'PT', dial: '351', nameUa: 'Португалія', nationalMaxLen: 9 },
  { iso2: 'GR', dial: '30', nameUa: 'Греція', nationalMaxLen: 10 },
  { iso2: 'CZ', dial: '420', nameUa: 'Чехія', nationalMaxLen: 9 },
  { iso2: 'SK', dial: '421', nameUa: 'Словаччина', nationalMaxLen: 9 },
  { iso2: 'HU', dial: '36', nameUa: 'Угорщина', nationalMaxLen: 9 },
  { iso2: 'RO', dial: '40', nameUa: 'Румунія', nationalMaxLen: 9 },
  { iso2: 'BG', dial: '359', nameUa: 'Болгарія', nationalMaxLen: 9 },
  { iso2: 'MD', dial: '373', nameUa: 'Молдова', nationalMaxLen: 8 },
  { iso2: 'BY', dial: '375', nameUa: 'Білорусь', nationalMaxLen: 9 },
  { iso2: 'LT', dial: '370', nameUa: 'Литва', nationalMaxLen: 8 },
  { iso2: 'LV', dial: '371', nameUa: 'Латвія', nationalMaxLen: 8 },
  { iso2: 'EE', dial: '372', nameUa: 'Естонія', nationalMaxLen: 8 },
  { iso2: 'TR', dial: '90', nameUa: 'Туреччина', nationalMaxLen: 10 },
  { iso2: 'IL', dial: '972', nameUa: 'Ізраїль', nationalMaxLen: 9 },
  { iso2: 'AE', dial: '971', nameUa: 'ОАЕ', nationalMaxLen: 9 },
  { iso2: 'SA', dial: '966', nameUa: 'Саудівська Аравія', nationalMaxLen: 9 },
  { iso2: 'EG', dial: '20', nameUa: 'Єгипет', nationalMaxLen: 10 },
  { iso2: 'ZA', dial: '27', nameUa: 'ПАР', nationalMaxLen: 9 },
  { iso2: 'NG', dial: '234', nameUa: 'Нігерія', nationalMaxLen: 10 },
  { iso2: 'KE', dial: '254', nameUa: 'Кенія', nationalMaxLen: 9 },
  { iso2: 'IN', dial: '91', nameUa: 'Індія', nationalMaxLen: 10 },
  { iso2: 'CN', dial: '86', nameUa: 'Китай', nationalMaxLen: 11 },
  { iso2: 'JP', dial: '81', nameUa: 'Японія', nationalMaxLen: 10 },
  { iso2: 'KR', dial: '82', nameUa: 'Південна Корея', nationalMaxLen: 10 },
  { iso2: 'VN', dial: '84', nameUa: "В'єтнам", nationalMaxLen: 9 },
  { iso2: 'TH', dial: '66', nameUa: 'Таїланд', nationalMaxLen: 9 },
  { iso2: 'ID', dial: '62', nameUa: 'Індонезія', nationalMaxLen: 11 },
  { iso2: 'MY', dial: '60', nameUa: 'Малайзія', nationalMaxLen: 9 },
  { iso2: 'SG', dial: '65', nameUa: 'Сінгапур', nationalMaxLen: 8 },
  { iso2: 'PH', dial: '63', nameUa: 'Філіппіни', nationalMaxLen: 10 },
  { iso2: 'AU', dial: '61', nameUa: 'Австралія', nationalMaxLen: 9 },
  { iso2: 'NZ', dial: '64', nameUa: 'Нова Зеландія', nationalMaxLen: 9 },
  { iso2: 'MX', dial: '52', nameUa: 'Мексика', nationalMaxLen: 10 },
  { iso2: 'BR', dial: '55', nameUa: 'Бразилія', nationalMaxLen: 11 },
  { iso2: 'AR', dial: '54', nameUa: 'Аргентина', nationalMaxLen: 10 },
  { iso2: 'CL', dial: '56', nameUa: 'Чилі', nationalMaxLen: 9 },
  { iso2: 'CO', dial: '57', nameUa: 'Колумбія', nationalMaxLen: 10 },
  { iso2: 'AT', dial: '43', nameUa: 'Австрія', nationalMaxLen: 10 },
  { iso2: 'CH', dial: '41', nameUa: 'Швейцарія', nationalMaxLen: 9 },
  { iso2: 'LU', dial: '352', nameUa: 'Люксембург', nationalMaxLen: 9 },
  { iso2: 'IS', dial: '354', nameUa: 'Ісландія', nationalMaxLen: 7 },
  { iso2: 'HR', dial: '385', nameUa: 'Хорватія', nationalMaxLen: 9 },
  { iso2: 'SI', dial: '386', nameUa: 'Словенія', nationalMaxLen: 8 },
  { iso2: 'RS', dial: '381', nameUa: 'Сербія', nationalMaxLen: 9 },
  { iso2: 'BA', dial: '387', nameUa: 'Боснія і Герцеговина', nationalMaxLen: 8 },
  { iso2: 'ME', dial: '382', nameUa: 'Чорногорія', nationalMaxLen: 8 },
  { iso2: 'MK', dial: '389', nameUa: 'Північна Македонія', nationalMaxLen: 8 },
  { iso2: 'AL', dial: '355', nameUa: 'Албанія', nationalMaxLen: 9 },
  { iso2: 'GE', dial: '995', nameUa: 'Грузія', nationalMaxLen: 9 },
  { iso2: 'AM', dial: '374', nameUa: 'Вірменія', nationalMaxLen: 8 },
  { iso2: 'AZ', dial: '994', nameUa: 'Азербайджан', nationalMaxLen: 9 },
  { iso2: 'UZ', dial: '998', nameUa: 'Узбекистан', nationalMaxLen: 9 },
  { iso2: 'TJ', dial: '992', nameUa: 'Таджикистан', nationalMaxLen: 9 },
  { iso2: 'KG', dial: '996', nameUa: 'Киргизстан', nationalMaxLen: 9 },
  { iso2: 'TM', dial: '993', nameUa: 'Туркменістан', nationalMaxLen: 8 },
  { iso2: 'PK', dial: '92', nameUa: 'Пакистан', nationalMaxLen: 10 },
  { iso2: 'BD', dial: '880', nameUa: 'Бангладеш', nationalMaxLen: 10 },
  { iso2: 'LK', dial: '94', nameUa: 'Шрі-Ланка', nationalMaxLen: 9 },
  { iso2: 'TW', dial: '886', nameUa: 'Тайвань', nationalMaxLen: 9 },
  { iso2: 'HK', dial: '852', nameUa: 'Гонконг', nationalMaxLen: 8 },
  { iso2: 'MO', dial: '853', nameUa: 'Макао', nationalMaxLen: 8 },
  { iso2: 'CY', dial: '357', nameUa: 'Кіпр', nationalMaxLen: 8 },
  { iso2: 'MT', dial: '356', nameUa: 'Мальта', nationalMaxLen: 8 },
  { iso2: 'KZ', dial: '7', nameUa: 'Казахстан', nationalMaxLen: 10 }
];

export function iso2ToFlagEmoji(iso2) {
  const c = String(iso2 || '').toUpperCase();
  if (!/^[A-Z]{2}$/.test(c)) return '🏳️';
  return String.fromCodePoint(c.charCodeAt(0) - 65 + 0x1f1e6, c.charCodeAt(1) - 65 + 0x1f1e6);
}

/** Список країн для селектора (українські назви, сортовано). */
export const AUTH_PHONE_COUNTRIES = [...RAW].sort((a, b) =>
  a.nameUa.localeCompare(b.nameUa, 'uk', { sensitivity: 'base' })
);

/**
 * Зіставляє початок рядка цифр (без «+») із кодом країни (найдовший dial першим).
 * @param {string} allDigits
 * @returns {{ country: AuthPhoneCountry, nationalDigits: string } | null}
 */
export function matchDialFromDigits(allDigits) {
  const d = String(allDigits || '').replace(/\D/g, '');
  if (!d) return null;
  const sorted = [...AUTH_PHONE_COUNTRIES].sort((a, b) => b.dial.length - a.dial.length);
  for (const country of sorted) {
    if (d.startsWith(country.dial)) {
      return { country, nationalDigits: d.slice(country.dial.length) };
    }
  }
  return null;
}

export function getDefaultPhoneCountry() {
  return AUTH_PHONE_COUNTRIES.find((c) => c.iso2 === 'UA') || AUTH_PHONE_COUNTRIES[0];
}
