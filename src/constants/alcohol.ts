export const DAILY_LIMIT_G = 40
export const WEEKLY_LIMIT_G = 280
export const CONSECUTIVE_ALERT_DAYS = 3

export const DRINK_CATEGORIES = [
  { value: 'beer',    label: 'ビール',     defaultMl: 500, defaultPercent: 5   },
  { value: 'sake',    label: '日本酒',     defaultMl: 180, defaultPercent: 15  },
  { value: 'wine',    label: 'ワイン',     defaultMl: 120, defaultPercent: 12  },
  { value: 'whiskey', label: 'ウイスキー', defaultMl: 60,  defaultPercent: 40  },
  { value: 'chu-hi',  label: 'チューハイ', defaultMl: 350, defaultPercent: 5   },
  { value: 'other',   label: 'その他',     defaultMl: 0,   defaultPercent: 0   },
] as const
