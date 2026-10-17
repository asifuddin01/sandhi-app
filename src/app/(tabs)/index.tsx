import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Body, Empty, Heading, Label, Meta, Row, Screen, Section } from '@/components/ui';
import { Font, Space, useColors } from '@/constants/theme';
import { useApi } from '@/lib/api';
import { labFeed, label, names, publicationMeta } from '@/lib/format';
import { useSession } from '@/lib/session';
import type { Home } from '@/lib/types';

export default function HomeScreen() {
  const colors = useColors();
  const { token } = useSession();
  const load = useApi<Home>('/home');
  const home = load.data;
  const feed = home ? labFeed(home) : [];

  return (
    <Screen load={load} top>
      <View style={styles.hero}>
        <View style={styles.topRow}>
          <Text style={[styles.mark, { color: colors.accent }]}>सन्धि</Text>
          <Link href={token ? '/me' : '/sign-in'} asChild>
            <Pressable accessibilityRole="link" hitSlop={12}>
              <Text style={[styles.account, { color: colors.link }]}>
                {token ? 'Account' : 'Sign in'}
              </Text>
            </Pressable>
          </Link>
        </View>
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

      <Section label="News and updates">
        {feed.length ? (
          feed.map((item) => (
            <Row key={item.key} href={item.href} title={item.title} detail={item.detail} meta={item.meta} />
          ))
        ) : (
          <Empty>News and project updates from the lab will appear here.</Empty>
        )}
      </Section>

      <View style={styles.footer}>
        <Heading>Join SANDHI</Heading>
        <Meta>Researchers, interns and collaborators apply on the website.</Meta>
        <Row url="https://sandhiresearch.org/join" title="Apply on sandhiresearch.org" />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { gap: Space.m, paddingBottom: Space.m },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  mark: { fontSize: 22 },
  account: { fontFamily: Font.medium, fontSize: 16 },
  // Capitals only on the first line, so 1.14 × 46 is enough (see Font.display).
  title: { fontFamily: Font.display, fontSize: 46, lineHeight: 53 },
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
