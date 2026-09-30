/**
 * The fields of /api/v1 responses the app reads. Dates arrive as ISO strings.
 * Only what a screen uses is listed; the API sends more.
 */
export type Named = { slug: string; name: string };
export type Titled = { slug: string; title: string };

export type ProjectSummary = Titled & {
  gloss: string;
  status: string;
  phase: string | null;
  areas: Named[];
  members?: (Named & { role: string | null; isLead: boolean })[];
  researchers?: Named[];
};

export type ProjectDetail = ProjectSummary & {
  abstract: string | null;
  question: string | null;
  motivation: string | null;
  approach: string | null;
  results: string | null;
  resultsPublic: boolean;
  links: { label: string; href: string }[];
  publications: PublicationSummary[];
  relatedProjects: ProjectSummary[];
};

export type PublicationSummary = Titled & {
  type: string;
  venueName: string | null;
  venueShort?: string | null;
  year: number | null;
  authors: { name: string; slug?: string | null }[];
};

export type PublicationDetail = Omit<PublicationSummary, 'authors'> & {
  abstract: string;
  doi: string | null;
  arxivId: string | null;
  pdfUrl: string | null;
  codeUrl: string | null;
  datasetUrl: string | null;
  pageUrl: string | null;
  award: string | null;
  authors: { name: string; member: Named | null }[];
  areas: Named[];
  project: Titled | null;
};

export type Person = Named & {
  rank: string;
  title: string | null;
  interests: string[];
  photoUrl: string | null;
  photoAlt: string;
  areas: Named[];
};

export type PersonDetail = Person & {
  bio: string | null;
  links: { label: string; href: string }[];
  projects: ProjectSummary[];
  publications: PublicationSummary[];
};

export type Area = Named & { summary: string; overview?: string | null };

export type Theme = Named & {
  gloss: string;
  areas: Area[];
  projectCount?: number;
  publicationCount?: number;
};

export type ThemeDetail = Theme & {
  overview: string | null;
  projects: ProjectSummary[];
  publications: PublicationSummary[];
};

export type AreaDetail = Area & {
  questions: string[];
  theme: Named & { gloss: string };
  projects: ProjectSummary[];
  publications: PublicationSummary[];
  researchers: Person[];
};

export type NewsSummary = Titled & {
  excerpt: string;
  category: string;
  publishAt: string | null;
  createdAt: string;
};

export type NewsDetail = NewsSummary & {
  body: string;
  author: Named | null;
};

export type EventItem = Titled & {
  kind: string;
  abstract: string;
  speakers: string[];
  startsAt: string;
  endsAt: string | null;
  timeZone: string;
  location: string | null;
  isOnline: boolean;
  registerUrl: string | null;
  recordingUrl: string | null;
};

export type InsightSummary = Titled & {
  summary: string;
  kind: string;
  publishedAt: string | null;
  readingMinutes: number;
  authors: Named[];
};

export type InsightDetail = InsightSummary & { body: string };

export type SearchResult = {
  kind: string;
  title: string;
  description: string;
  href: string;
};

export type Home = {
  projects: ProjectSummary[];
  publications: PublicationSummary[];
  news: NewsSummary[];
  metrics: {
    researchers: number;
    projects: number;
    publications: number;
    areas: number;
    visible: boolean;
  };
};
