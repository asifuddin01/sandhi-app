import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { Empty, Label, Prose, Row, Screen, Section, Title } from '@/components/ui';
import { Space } from '@/constants/theme';
import { useApi } from '@/lib/api';
import { label, names, publicationMeta } from '@/lib/format';
import type { ThemeDetail } from '@/lib/types';

export default function ThemeScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const load = useApi<ThemeDetail>(`/research/themes/${encodeURIComponent(slug)}`);
  const theme = load.data;

  return (
    <Screen load={load}>
      {theme ? (
        <>
          <View style={{ gap: Space.s }}>
            <Label>{theme.gloss}</Label>
            <Title>{theme.name}</Title>
          </View>
          <Prose text={theme.overview} />
          <Section label="Areas">
            {theme.areas.map((area) => (
              <Row
                key={area.slug}
                href={{ pathname: '/area/[slug]', params: { slug: area.slug } }}
                title={area.name}
                detail={area.summary}
              />
            ))}
          </Section>
          <Section label="Projects">
            {theme.projects.length ? (
              theme.projects.map((project) => (
                <Row
                  key={project.slug}
                  href={{ pathname: '/project/[slug]', params: { slug: project.slug } }}
                  title={project.title}
                  detail={project.gloss}
                  meta={label(project.status)}
                />
              ))
            ) : (
              <Empty>No public projects in this theme yet.</Empty>
            )}
          </Section>
          {theme.publications.length ? (
            <Section label="Papers">
              {theme.publications.map((publication) => (
                <Row
                  key={publication.slug}
                  href={{ pathname: '/publication/[slug]', params: { slug: publication.slug } }}
                  title={publication.title}
                  detail={names(publication.authors)}
                  meta={publicationMeta(publication)}
                />
              ))}
            </Section>
          ) : null}
        </>
      ) : null}
    </Screen>
  );
}
