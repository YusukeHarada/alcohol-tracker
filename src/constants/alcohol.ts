export const DAILY_LIMIT_G = 40
export const WEEKLY_LIMIT_G = 280
export const CONSECUTIVE_ALERT_DAYS = 3

// ワンタップ記録チップの生成パラメータ
// 60日：1ヶ月記録が止まっても「いつもの酒」が候補に戻る長さ
// 4個 ：max-w-md の中で2列×2行に収まる上限
export const QUICK_ADD_LOOKBACK_DAYS = 60
export const QUICK_ADD_CHIP_COUNT = 4
// チップの「+」で指定できる本数の上限。ここを超えると1本に戻る（減らす操作を兼ねる）
export const QUICK_ADD_MAX_TAP_COUNT = 6

export const DRINK_CATEGORIES = [
  { value: 't-hi',  label: '宝ハイボール', defaultMl: 500, defaultPercent: 7   },
  { value: 'beer',    label: 'ビール',     defaultMl: 500, defaultPercent: 5   },
  { value: 'sake',    label: '日本酒',     defaultMl: 180, defaultPercent: 15  },
  { value: 'wine',    label: 'ワイン',     defaultMl: 120, defaultPercent: 12  },
  { value: 'whiskey', label: 'ウイスキー', defaultMl: 60,  defaultPercent: 40  },
  { value: 'chu-hi',  label: 'チューハイ', defaultMl: 350, defaultPercent: 5   },
  { value: 'other',   label: 'その他',     defaultMl: 0,   defaultPercent: 0   },
] as const
