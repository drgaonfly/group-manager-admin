import { FormattedMessage } from '@umijs/max';

export const locationMapping = {
  'Vietnam Ho Chi Minh': (
    <FormattedMessage id="vietnam_ho_chi_minh" defaultMessage="越南胡志明 (VNH)" />
  ),
  'Vietnam Hanoi': <FormattedMessage id="vietnam_hanoi" defaultMessage="越南河内 (VN)" />,
  Thailand: <FormattedMessage id="thailand" defaultMessage="泰国 (TH)" />,
  Malaysia: <FormattedMessage id="malaysia" defaultMessage="马来西亚 (MY)" />,
  Philippines: <FormattedMessage id="philippines" defaultMessage="菲律宾 (PH)" />,
  Indonesia: <FormattedMessage id="indonesia" defaultMessage="印尼 (ID)" />,
};

export const platformNames = {
  Shopee: 'Shopee',
  Lazada: 'Lazada',
  TikTok: 'TikTok',
};

interface TextObject {
  [key: string]: { text: any };
}

export const convertToTextObject = (obj: Record<string, any>): TextObject => {
  const newObj: TextObject = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      newObj[key] = { text: obj[key] };
    }
  }
  return newObj;
};
