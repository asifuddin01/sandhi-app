import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { Body, Empty, Label, Prose, Row, Screen, Section, Title } from '@/components/ui';
import { Space, useColors } from '@/constants/theme';
import { useApi } from '@/lib/api';
import { label, names, publicationMeta } from '@/lib/format';
import type { AreaDetail } from '@/lib/types';

export default function AreaScreen() {
  const colors = useColors();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const load = useApi<AreaDetail>(`/research/areas/${encodeURIComponent(slug)}`);
  const area = load.data;

  return (
    <Screen load={load}>
      {area ? (
        <>
          <View style={{ gap: Space.s }}>
            <Label>{area.theme.name}</Label>
            <Title>{area.name}</Title>
            <Body style={{ color: colors.muted }}>{area.summary}</Body>
          </View>
          <Prose text={area.overview} />
          {area.questions.length ? (
            <Section label="Open questions">
              {area.questions.map((question) => (
                <Body key={question}>• {question}</Body>
              ))}
            </Section>
          ) : null}
          <Section label="Projects">
            {area.projects.length ? (
              area.projects.map((project) => (
                <Row
                  key={project.slug}
                  href={{ pathname: '/project/[slug]', params: { slug: project.slug } }}
                  title={project.title}
                  detail={project.gloss}
                  meta={label(project.status)}
                />
              ))
            ) : (
              <Empty>No public projects in this area yet.</Empty>
            )}
          </Section>
          {area.publications.length ? (
            <Section label="Papers">
              {area.publications.map((publication) => (
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
          {area.researchers.length ? (
            <Section label="Researchers">
              {area.researchers.map((person) => (
                <Row
                  key={person.slug}
                  href={{ pathname: '/person/[slug]', params: { slug: person.slug } }}
                  title={person.name}
                  detail={person.title ?? label(person.rank)}
                />
              ))}
            </Section>
          ) : null}
        </>
      ) : null}
    </Screen>
  );
}
