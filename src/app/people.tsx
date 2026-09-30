import { Empty, Row, Screen } from '@/components/ui';
import { useApi } from '@/lib/api';
import { label } from '@/lib/format';
import type { Person } from '@/lib/types';

export default function PeopleScreen() {
  const load = useApi<{ people: Person[] }>('/people');

  return (
    <Screen load={load}>
      {load.data?.people.length === 0 ? <Empty>No public profiles yet.</Empty> : null}
      {load.data?.people.map((person) => (
        <Row
          key={person.slug}
          href={{ pathname: '/person/[slug]', params: { slug: person.slug } }}
          title={person.name}
          detail={person.title ?? label(person.rank)}
          meta={person.areas.map((area) => area.name).join(' · ')}
        />
      ))}
    </Screen>
  );
}
