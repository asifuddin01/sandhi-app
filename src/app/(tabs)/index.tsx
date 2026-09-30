import { StyleSheet, Text, View } from 'react-native';

import { Body, Empty, Heading, Label, Meta, Row, Screen, Section } from '@/components/ui';
import { Font, Space, useColors } from '@/constants/theme';
import { useApi } from '@/lib/api';
import { date, label, names, publicationMeta } from '@/lib/format';
import type { Home } from '@/lib/types';

export default function HomeScreen() {
  const colors = useColors();
  const load = useApi<Home>('/home');
  const home = load.data;

  return (
    <Screen load={load} top>
      <View style={styles.hero}>
        <Text style={[styles.mark, { color: colors.accent }]}>सन्धि</Text>
        <Text style={[styles.title, { color: colors.text }]}>SANDHI{'\n'}Research Lab</Text>
        <Text style={[styles.tagline, { color: colors.text }]}>
          Where ideas meet, discovery begins.
        </Text>
        <Body style={{ color: colors.muted }}>
          An independent research lab exploring artificial intelligence and
          computational science.
        </Body>
      </View>

      {home?.metrics.visible ? (
        <View style={[styles.metrics, { borderColor: colors.line }]}>
          {(
            [
              ['Researchers', home.metrics.researchers],
              ['Projects', home.metrics.projects],
              ['Papers', home.metrics.publications],
              ['Areas', home.metrics.areas],
            ] as const
          ).map(([name, value]) => (
            <View key={name} style={styles.metric}>
              <Text style={[styles.metricValue, { color: colors.text }]}>{value}</Text>
              <Label>{name}</Label>
            </View>
          ))}
        </View>
      ) : null}

      <Section label="Research">
        <Row href="/research" title="Explore the research map" detail="The lab's themes and the areas beneath them." />
      </Section>

      <Section label="Latest projects">
        {home?.projects.length ? (
          home.projects.map((project) => (
            <Row
              key={project.slug}
              href={{ pathname: '/project/[slug]', params: { slug: project.slug } }}
              title={project.title}
              detail={project.gloss}
              meta={[label(project.status), names(project.areas)].filter(Boolean).join(' · ')}
            />
          ))
        ) : (
          <Empty>No public projects yet.</Empty>
        )}
      </Section>

      <Section label="Recent papers">
        {home?.publications.length ? (
          home.publications.map((publication) => (
            <Row
              key={publication.slug}
              href={{ pathname: '/publication/[slug]', params: { slug: publication.slug } }}
              title={publication.title}
              detail={names(publication.authors)}
              meta={publicationMeta(publication)}
            />
          ))
        ) : (
          <Empty>No papers published yet.</Empty>
        )}
      </Section>

      {home?.news.length ? (
        <Section label="News">
          {home.news.map((post) => (
            <Row
              key={post.slug}
              href={{ pathname: '/news/[slug]', params: { slug: post.slug } }}
              title={post.title}
              detail={post.excerpt}
              meta={date(post.publishAt ?? post.createdAt)}
            />
          ))}
        </Section>
      ) : null}

      <View style={styles.footer}>
        <Heading>Join SANDHI</Heading>
        <Meta>Researchers, interns and collaborators apply on the website.</Meta>
        <Row url="https://sandhiresearch.org/join" title="Apply on sandhiresearch.org" />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { gap: Space.m, paddingTop: Space.l, paddingBottom: Space.m },
  mark: { fontSize: 22 },
  title: { fontFamily: Font.display, fontSize: 46, lineHeight: 52 },
  tagline: { fontFamily: Font.displayItalic, fontSize: 22, lineHeight: 30 },
  metrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: Space.m,
    rowGap: Space.m,
  },
  metric: { width: '50%', gap: Space.xs },
  metricValue: { fontFamily: Font.display, fontSize: 34 },
  footer: { gap: Space.s, paddingTop: Space.l },
});
