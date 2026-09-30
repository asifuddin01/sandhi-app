import { Empty, Row, Screen } from '@/components/ui';
import { useApi } from '@/lib/api';
import { label, names } from '@/lib/format';
import type { InsightSummary } from '@/lib/types';

export default function InsightsScreen() {
  const load = useApi<{ insights: InsightSummary[] }>('/insights');

  return (
    <Screen load={load}>
      {load.data?.insights.length === 0 ? <Empty>No research notes yet.</Empty> : null}
      {load.data?.insights.map((note) => (
        <Row
          key={note.slug}
          href={{ pathname: '/insight/[slug]', params: { slug: note.slug } }}
          title={note.title}
          detail={note.summary}
          meta={[label(note.kind), names(note.authors), `${note.readingMinutes} min read`]
            .filter(Boolean)
            .join(' · ')}
        />
      ))}
    </Screen>
  );
}
