import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Body, Label, Prose, Row, Screen, Section, Title } from '@/components/ui';
import { Space, useColors } from '@/constants/theme';
import { useApi } from '@/lib/api';
import { label, names, publicationMeta } from '@/lib/format';
import type { PersonDetail } from '@/lib/types';

export default function PersonScreen() {
  const colors = useColors();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const load = useApi<PersonDetail>(`/people/${encodeURIComponent(slug)}`);
  const person = load.data;

  return (
    <Screen load={load}>
      {person ? (
        <>
          <View style={{ gap: Space.m }}>
            {person.photoUrl ? (
              <Image
                source={person.photoUrl}
                accessibilityLabel={person.photoAlt}
                style={[styles.photo, { backgroundColor: colors.raised }]}
                contentFit="contain"
              />
            ) : null}
            <View style={{ gap: Space.s }}>
              <Label>{person.title ?? label(person.rank)}</Label>
              <Title>{person.name}</Title>
              {person.interests.length ? (
                <Body style={{ color: colors.muted }}>{person.interests.join(' · ')}</Body>
              ) : null}
            </View>
          </View>
          <Prose text={person.bio} />
          {person.projects.length ? (
            <Section label="Projects">
              {person.projects.map((project) => (
                <Row
                  key={project.slug}
                  href={{ pathname: '/project/[slug]', params: { slug: project.slug } }}
                  title={project.title}
                  detail={project.gloss}
                  meta={label(project.status)}
                />
              ))}
            </Section>
          ) : null}
          {person.publications.length ? (
            <Section label="Papers">
              {person.publications.map((publication) => (
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
          {person.links.length ? (
            <Section label="Elsewhere">
              {person.links.map((link) => (
                <Row key={link.href} url={link.href} title={link.label} />
              ))}
            </Section>
          ) : null}
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  photo: { width: 128, height: 160 },
});
