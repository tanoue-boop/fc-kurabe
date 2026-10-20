import { useCallback, useEffect, useState } from 'react';

// 比較リスト（最大4社）。閲覧者ごとのブラウザ内だけに保存する
export const COMPARE_MAX = 4;
export type CompareItem = { slug: string; brand: string };

const KEY = 'fc-compare';
const EVT = 'fc-compare-change';

function read(): CompareItem[] {
  try {
    const v = JSON.parse(window.localStorage.getItem(KEY) || '[]');
    return Array.isArray(v) ? v.filter((x) => x && typeof x.slug === 'string').slice(0, COMPARE_MAX) : [];
  } catch {
    return [];
  }
}

function write(list: CompareItem[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list.slice(0, COMPARE_MAX)));
  } catch {
    /* 保存できない環境でも画面上の操作は続ける */
  }
  window.dispatchEvent(new CustomEvent(EVT, { detail: list.slice(0, COMPARE_MAX) }));
}

export function useCompare() {
  const [list, setList] = useState<CompareItem[]>([]);

  useEffect(() => {
    setList(read());
    const onChange = (e: Event) => setList((e as CustomEvent<CompareItem[]>).detail ?? read());
    const onStorage = () => setList(read());
    window.addEventListener(EVT, onChange);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(EVT, onChange);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const has = useCallback((slug: string) => list.some((x) => x.slug === slug), [list]);

  const toggle = useCallback(
    (item: CompareItem) => {
      const cur = read();
      if (cur.some((x) => x.slug === item.slug)) write(cur.filter((x) => x.slug !== item.slug));
      else if (cur.length < COMPARE_MAX) write([...cur, item]);
    },
    [],
  );

  const remove = useCallback((slug: string) => write(read().filter((x) => x.slug !== slug)), []);
  const clear = useCallback(() => write([]), []);
  const replace = useCallback((items: CompareItem[]) => write(items), []);

  return { list, has, toggle, remove, clear, replace, full: list.length >= COMPARE_MAX };
}
