/**
 * 現在の時刻を取得します
 * @param timezone IANA形式のタイムゾーン名 (例: 'Asia/Tokyo', 'America/New_York', 'Europe/London')
 * @returns フォーマットされた時刻文字列
 */
export const currentTime = (timezone?: string) => {
  if (timezone) {
    return new Date().toLocaleString("en-US", { timeZone: timezone });
  } else {
    return new Date().toLocaleString("en-US");
  }
};

// 変換結果の型定義
interface TimeConversionResult {
  source: TimeResult;
  target: TimeResult;
  time_difference: string;
}

interface TimeResult {
  datetime: string;
  is_dst: boolean;
  timezone: string;
}

export const convertTime = (
  sourceTimezone: string,
  timeStr: string,
  targetTimezone: string,
): TimeConversionResult => {
  // HH:MM形式の時間をパースする
  const timeMatch = timeStr.match(/^(\d{1,2}):(\d{2})$/);
  if (!timeMatch) {
    throw new Error("Invalid time format. Expected HH:MM [24-hour format]");
  }

  const hour = parseInt(timeMatch[1], 10);
  const minute = parseInt(timeMatch[2], 10);

  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    throw new Error("Invalid time values. Hours must be 0-23, minutes must be 0-59");
  }

  // 現在の日付を取得
  const now = new Date();

  // ソースタイムゾーンの日時を作成
  const sourceDate = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), hour, minute, 0),
  );

  // ソースタイムゾーンの日時を作成
  const sourceOptions = { hour12: false, timeZone: sourceTimezone };
  const sourceParts = new Intl.DateTimeFormat("en-US", {
    ...sourceOptions,
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    month: "numeric",
    second: "numeric",
    year: "numeric",
  }).formatToParts(sourceDate);

  // DateTimeFormatの結果からオブジェクトを構築
  const sourceDateObj = sourceParts.reduce(
    (obj, part) => {
      if (part.type !== "literal") {
        obj[part.type] = parseInt(part.value, 10);
      }
      return obj;
    },
    {} as Record<string, number>,
  );

  // ソースタイムゾーンのISOフォーマット
  const sourceFullDate = new Date(
    Date.UTC(
      sourceDateObj.year,
      sourceDateObj.month - 1,
      sourceDateObj.day,
      sourceDateObj.hour,
      sourceDateObj.minute,
      sourceDateObj.second,
    ),
  );

  // ターゲットタイムゾーンの日時を作成
  const targetOptions = { hour12: false, timeZone: targetTimezone };
  const targetParts = new Intl.DateTimeFormat("en-US", {
    ...targetOptions,
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    month: "numeric",
    second: "numeric",
    year: "numeric",
  }).formatToParts(sourceDate);

  // DateTimeFormatの結果からオブジェクトを構築
  const targetDateObj = targetParts.reduce(
    (obj, part) => {
      if (part.type !== "literal") {
        obj[part.type] = parseInt(part.value, 10);
      }
      return obj;
    },
    {} as Record<string, number>,
  );

  // ターゲットタイムゾーンのISOフォーマット
  const targetFullDate = new Date(
    Date.UTC(
      targetDateObj.year,
      targetDateObj.month - 1,
      targetDateObj.day,
      targetDateObj.hour,
      targetDateObj.minute,
      targetDateObj.second,
    ),
  );

  // DST情報の取得（JavaScriptでは直接取得できないため、推定）
  const isDstSource = isDST(sourceTimezone);
  const isDstTarget = isDST(targetTimezone);

  // タイムゾーンの時差を計算
  const hoursDifference = (targetFullDate.getTime() - sourceFullDate.getTime()) / (1000 * 60 * 60);

  // 時差の文字列表現
  let timeDiffStr: string;
  if (Number.isInteger(hoursDifference)) {
    timeDiffStr = `${hoursDifference >= 0 ? "+" : ""}${hoursDifference}.0h`;
  } else {
    timeDiffStr = `${hoursDifference >= 0 ? "+" : ""}${hoursDifference.toFixed(2).replace(/\.?0+$/, "")}h`;
  }

  // ソースとターゲットのISOフォーマット文字列
  const sourceISOString = formatDateToISO(sourceFullDate, sourceTimezone);
  const targetISOString = formatDateToISO(targetFullDate, targetTimezone);

  return {
    source: {
      datetime: sourceISOString,
      is_dst: isDstSource,
      timezone: sourceTimezone,
    },
    target: {
      datetime: targetISOString,
      is_dst: isDstTarget,
      timezone: targetTimezone,
    },
    time_difference: timeDiffStr,
  };
};

// 日付とタイムゾーンからISO文字列を生成
function formatDateToISO(date: Date, timezone: string): string {
  const formatter = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
    month: "2-digit",
    second: "2-digit",
    timeZone: timezone,
    timeZoneName: "short",
    year: "numeric",
  });

  const parts = formatter.formatToParts(date);
  const values: Record<string, string> = {};

  parts.forEach((part) => {
    if (part.type !== "literal") {
      values[part.type] = part.value;
    }
  });

  return `${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}:${values.second}${values.timeZoneName}`;
}

// 現在のタイムゾーンがDSTかどうかを判定
function isDST(timezone: string): boolean {
  const jan = new Date(new Date().getFullYear(), 0, 1);
  const jul = new Date(new Date().getFullYear(), 6, 1);

  const janStr = jan.toLocaleString("en-US", { timeZone: timezone });
  const julStr = jul.toLocaleString("en-US", { timeZone: timezone });

  const janOffset = new Date(janStr).getTimezoneOffset();
  const julOffset = new Date(julStr).getTimezoneOffset();

  return Math.max(janOffset, julOffset) !== janOffset;
}
