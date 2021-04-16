import { getPtBRMonth } from './parseDate';

export const getDateTime = (date: Date): string => {
  const d = Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
    .formatToParts(date)
    .map(({ type, value }, i) =>
      type === 'literal' && i < 5
        ? ' '
        : type === 'literal' && i === 5
        ? ', às '
        : type === 'month'
        ? getPtBRMonth(value).toLowerCase()
        : value,
    );

  return d[2] + d[1] + d[0] + d.filter((_, i) => i > 2).join('');
};

// export const getDateTime = (date: Date): string =>
//   Intl.DateTimeFormat('pt-BR', {
//     day: '2-digit',
//     month: 'short',
//     year: 'numeric',
//     hour: '2-digit',
//     minute: '2-digit',
//   })
//     .formatToParts(date)
//     .map(({ type, value }, i) =>
//       type === 'literal' && i < 5
//         ? ' '
//         : type === 'literal' && i === 5
//         ? ', às '
//         : type === 'month'
//         ? value.substr(0, 3).toLowerCase()
//         : value,
//     )
//     .join('');
