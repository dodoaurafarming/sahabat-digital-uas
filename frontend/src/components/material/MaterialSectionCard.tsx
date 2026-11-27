import type { MaterialSectionItem } from '../../data/materialData';

interface MaterialSectionCardProps {
  section: MaterialSectionItem;
  index: number;
}

export function MaterialSectionCard({
  section,
  index,
}: MaterialSectionCardProps) {
  const isEven = index % 2 === 0;

  const renderSectionIcon = (iconType: MaterialSectionItem['iconType']) => {
    switch (iconType) {
      case 'shield':
        return (
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        );
      case 'chat':
        return (
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        );
      case 'heart':
        return (
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        );
      case 'lock':
        return (
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        );
      case 'spark':
        return (
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        );
      case 'users':
        return (
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        );
    }
  };

  return (
    <div
      id={section.id}
      className={`scroll-mt-28 flex w-full ${
        isEven ? 'lg:justify-start' : 'lg:justify-end'
      }`}
    >
      <article
        style={{ borderLeftColor: section.accentColor }}
        className="relative w-full overflow-hidden rounded-3xl border-l-8 bg-white p-6 shadow-lg transition-transform duration-300 hover:-translate-y-1 sm:p-8 lg:w-[92%]"
      >
        <div
          aria-hidden="true"
          style={{ backgroundColor: `${section.accentColor}15` }}
          className="pointer-events-none absolute -top-12 -right-12 h-36 w-36 rounded-full"
        />

        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div
            style={{ backgroundColor: section.accentColor }}
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-md"
          >
            {renderSectionIcon(section.iconType)}
          </div>

          <div>
            <span
              style={{
                backgroundColor: `${section.accentColor}20`,
                color: '#0F294A',
              }}
              className="font-playful inline-block rounded-full px-3.5 py-1 text-xs font-bold"
            >
              {section.badgeText}
            </span>
            <h2 className="font-playful mt-1.5 text-2xl font-bold text-[#2B569A] sm:text-3xl">
              {section.title}
            </h2>
          </div>
        </div>

        {section.paragraphs && section.paragraphs.length > 0 && (
          <div className="relative z-10 mt-5 space-y-3">
            {section.paragraphs.map((paragraph, pIdx) => (
              <p
                key={pIdx}
                className="font-clean text-base leading-relaxed text-slate-700 sm:text-lg"
              >
                {paragraph}
              </p>
            ))}
          </div>
        )}

        {section.list && section.list.length > 0 && (
          <div className="relative z-10 mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            {section.list.map((item, itemIdx) => (
              <div
                key={itemIdx}
                className="flex items-start gap-3.5 rounded-xl border border-sky-100 bg-[#F3F8FC] p-4 shadow-sm transition-colors hover:bg-sky-50"
              >
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#7BB642] text-white shadow-sm">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>

                <div>
                  <h3 className="font-playful text-base font-bold text-[#0F294A] sm:text-lg">
                    {item.title}
                  </h3>
                  <p className="font-clean mt-1 text-sm leading-relaxed text-slate-700">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </article>
    </div>
  );
}

export default MaterialSectionCard;
