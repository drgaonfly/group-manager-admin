export const locationMapping = {
  'Vietnam Ho Chi Minh': '越南胡志明',
  'Vietnam Hanoi': '越南河内',
  Thailand: '泰国',
  Malaysia: '马来西亚',
  Philippines: '菲律宾',
  Indonesia: '印尼',
};

export const platformNames = {
  Shopee: 'Shopee',
  Lazada: 'Lazada',
  TikTok: 'TikTok',
};

interface TextObject {
  [key: string]: { text: string };
}

export const convertToTextObject = (obj: Record<string, string>): TextObject => {
  const newObj: TextObject = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      newObj[key] = { text: obj[key] };
    }
  }
  return newObj;
};
