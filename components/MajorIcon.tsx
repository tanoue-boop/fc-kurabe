// 業種（大分類）ごとの線画アイコン
const PATHS: Record<string, JSX.Element> = {
  food: (
    <>
      <path d="M3 12h18a9 7 0 0 1-18 0z" />
      <path d="M8 8.5c0-1.5 1.5-1.5 1.5-3M12 8.5c0-1.5 1.5-1.5 1.5-3" />
      <path d="M15 21h-6" />
    </>
  ),
  education: (
    <>
      <path d="M3 5h6a3 3 0 0 1 3 3v12a2.5 2.5 0 0 0-2.5-2.5H3z" />
      <path d="M21 5h-6a3 3 0 0 0-3 3v12a2.5 2.5 0 0 1 2.5-2.5H21z" />
    </>
  ),
  'fitness-beauty': (
    <>
      <path d="M6.5 7v10M17.5 7v10M3.5 9.5v5M20.5 9.5v5M6.5 12h11" />
    </>
  ),
  'life-service': (
    <>
      <path d="M3.5 11 12 4l8.5 7" />
      <path d="M6 9.5V20h12V9.5" />
      <path d="M10 20v-5h4v5" />
    </>
  ),
  retail: (
    <>
      <path d="M3 4h8l10 10-7 7L4 11z" />
      <circle cx="8" cy="8.5" r="1.5" />
    </>
  ),
  care: (
    <>
      <path d="M12 20s-7.5-4.6-7.5-10.2A4.2 4.2 0 0 1 12 7.3a4.2 4.2 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20z" />
    </>
  ),
  repair: (
    <>
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-7.9z" />
    </>
  ),
  business: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M9 7V5h6v2M3 12.5h18" />
    </>
  ),
};

export default function MajorIcon({ major, size = 28 }: { major: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PATHS[major] ?? PATHS.business}
    </svg>
  );
}
