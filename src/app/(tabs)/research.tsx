import { View } from 'react-native';

import { Body, Empty, Row, Screen, Section, Title } from '@/components/ui';
import { Space, useColors } from '@/constants/theme';
import { useApi } from '@/lib/api';
import type { Theme } from '@/lib/types';

export default function ResearchScreen() {
  const colors = useColors();
  const load = useApi<{ themes: Theme[] }>('/research');

  return (
    <Screen load={load} top>
      <View style={{ gap: Space.s }}>
        <Title>Research</Title>
        <Body style={{ color: colors.muted }}>
          Themes are the lab’s large questions; each holds the areas where the
          work happens.
        </Body>
      </View>
      {load.data?.themes.length === 0 ? <Empty>No research themes yet.</Empty> : null}
      {load.data?.themes.map((theme) => (
        <Section key={theme.slug} label={theme.gloss}>
          <Row
            href={{ pathname: '/theme/[slug]', params: { slug: theme.slug } }}
            title={theme.name}
            meta={count(theme.projectCount, 'project') + count(theme.publicationCount, 'paper')}
          />
          {theme.areas.map((area) => (
            <Row
              key={area.slug}
              href={{ pathname: '/area/[slug]', params: { slug: area.slug } }}
              title={`— ${area.name}`}
              detail={area.summary}
            />
          ))}
        </Section>
      ))}
    </Screen>
  );
}

function count(value: number | undefined, noun: string): string {
  if (!value) return '';
  return `${value} ${noun}${value === 1 ? '' : 's'}  `;
}
