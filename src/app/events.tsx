import { Empty, Row, Screen, Section } from '@/components/ui';
import { SITE_URL, useApi } from '@/lib/api';
import { date, label } from '@/lib/format';
import type { EventItem } from '@/lib/types';

/** Details and registration stay on the website, where Turnstile guards the form. */
export default function EventsScreen() {
  const load = useApi<{ upcoming: EventItem[]; past: EventItem[] }>('/events');

  return (
    <Screen load={load}>
      <Section label="Upcoming">
        {load.data?.upcoming.length ? (
          load.data.upcoming.map((event) => <EventRow key={event.slug} event={event} />)
        ) : (
          <Empty>Nothing scheduled yet.</Empty>
        )}
      </Section>
      {load.data?.past.length ? (
        <Section label="Past">
          {load.data.past.map((event) => (
            <EventRow key={event.slug} event={event} />
          ))}
        </Section>
      ) : null}
    </Screen>
  );
}

function EventRow({ event }: { event: EventItem }) {
  return (
    <Row
      url={`${SITE_URL}/events/${event.slug}`}
      title={event.title}
      detail={event.abstract}
      meta={[date(event.startsAt), label(event.kind), event.isOnline ? 'Online' : event.location]
        .filter(Boolean)
        .join(' · ')}
    />
  );
}
