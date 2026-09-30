import type { PublicationSummary } from './types';

/** ACTIVE → Active, CONFERENCE_PAPER → Conference paper. */
export function label(value: string | null | undefined): string {
  if (!value) return '';
  const words = value.toLowerCase().replace(/_/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export function names(people: { name: string }[] | undefined): string {
  return (people ?? []).map((person) => person.name).join(', ');
}

export function publicationMeta(publication: PublicationSummary): string {
  return [
    publication.venueShort ?? publication.venueName,
    publication.year,
    label(publication.type),
  ]
    .filter(Boolean)
    .join(' · ');
}

const dateFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'Asia/Dhaka',
});

export function date(iso: string | null | undefined): string {
  return iso ? dateFormat.format(new Date(iso)) : '';
}
