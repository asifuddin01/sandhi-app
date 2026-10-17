import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Body, Heading, Label, Meta, Prose, Row, Screen, Section, Title } from '@/components/ui';
import { Font, Space, useColors } from '@/constants/theme';
import { useApi } from '@/lib/api';
import { date, label, names, publicationMeta } from '@/lib/format';
import type { ProjectDetail } from '@/lib/types';

export default function ProjectScreen() {
  const colors = useColors();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const load = useApi<ProjectDetail>(`/projects/${encodeURIComponent(slug)}`);
  const project = load.data;

  return (
    <Screen load={load}>
      {project ? (
        <>
          <View style={{ gap: Space.s }}>
            <Label>
              {[label(project.status), label(project.phase), names(project.areas)]
                .filter(Boolean)
                .join(' · ')}
            </Label>
            <Title>{project.title}</Title>
            <Body style={{ color: colors.muted }}>{project.gloss}</Body>
          </View>
          <Part title="Abstract" text={project.abstract} />
          <Part title="The question" text={project.question} />
          <Part title="Why it matters" text={project.motivation} />
          <Part title="Approach" text={project.approach} />
          {project.resultsPublic ? <Part title="Results" text={project.results} /> : null}
          {project.updates?.length ? (
            <Section label="Progress">
              {project.updates.map((update) => (
                <View
                  key={update.id}
                  style={[styles.update, { borderColor: colors.line }]}>
                  <Body style={styles.updateTitle}>{update.title}</Body>
                  <Meta>
                    {[date(update.postedAt), update.author?.name].filter(Boolean).join(' · ')}
                  </Meta>
                  <Prose text={update.body} />
                  {update.nextUp?.trim() ? (
                    <>
                      <Label>What comes next</Label>
                      <Prose text={update.nextUp} />
                    </>
                  ) : null}
                </View>
              ))}
            </Section>
          ) : null}
          {project.members?.length ? (
            <Section label="Team">
              {project.members.map((member) => (
                <Row
                  key={member.slug}
                  href={{ pathname: '/person/[slug]', params: { slug: member.slug } }}
                  title={member.name}
                  detail={[member.isLead ? 'Lead' : null, member.role].filter(Boolean).join(' · ')}
                />
              ))}
            </Section>
          ) : null}
          {project.publications.length ? (
            <Section label="Papers">
              {project.publications.map((publication) => (
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
          {project.links.length ? (
            <Section label="Links">
              {project.links.map((link) => (
                <Row key={link.href} url={link.href} title={link.label} />
              ))}
            </Section>
          ) : null}
        </>
      ) : null}
    </Screen>
  );
}

function Part({ title, text }: { title: string; text: string | null }) {
  if (!text?.trim()) return null;
  return (
    <View style={{ gap: Space.s }}>
      <Heading>{title}</Heading>
      <Prose text={text} />
    </View>
  );
}

const styles = StyleSheet.create({
  update: {
    gap: Space.xs,
    paddingVertical: Space.m,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  updateTitle: { fontFamily: Font.medium },
});
