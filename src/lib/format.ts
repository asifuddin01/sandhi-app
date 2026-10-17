import type { Href } from 'expo-router';

import type { Home, PublicationSummary } from './types';

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

export type FeedItem = {
  key: string;
  at: string;
  href: Href;
  title: string;
  detail: string | null;
  meta: string;
};

/** News posts and project updates as one list, newest first. */
export function labFeed(home: Pick<Home, 'news' | 'updates'>): FeedItem[] {
  return [
    ...home.news.map((post) => ({
      key: `news:${post.slug}`,
      at: post.date,
      href: { pathname: '/news/[slug]', params: { slug: post.slug } } as const,
      title: post.title,
      detail: null,
      meta: [label(post.category), date(post.date)].filter(Boolean).join(' · '),
    })),
    ...home.updates.map((update) => ({
      key: `update:${update.id}`,
      at: update.postedAt,
      href: { pathname: '/project/[slug]', params: { slug: update.project.slug } } as const,
      title: update.title,
      detail: update.summary,
      meta: `${update.project.title} · ${date(update.postedAt)}`,
    })),
  ].sort((a, b) => b.at.localeCompare(a.at));
}
