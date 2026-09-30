import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { Heading, Label, Meta, Prose, Row, Screen, Section, Title } from '@/components/ui';
import { Space } from '@/constants/theme';
import { useApi } from '@/lib/api';
import { publicationMeta } from '@/lib/format';
import type { PublicationDetail } from '@/lib/types';

export default function PublicationScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const load = useApi<PublicationDetail>(`/publications/${encodeURIComponent(slug)}`);
  const paper = load.data;

  const links = paper
    ? [
        ['PDF', paper.pdfUrl],
        ['Code', paper.codeUrl],
        ['Dataset', paper.datasetUrl],
        ['Project page', paper.pageUrl],
        ['DOI', paper.doi ? `https://doi.org/${paper.doi}` : null],
        ['arXiv', paper.arxivId && /^\d{4}\.\d{4,5}/.test(paper.arxivId) ? `https://arxiv.org/abs/${paper.arxivId}` : null],
      ].filter((link): link is [string, string] => Boolean(link[1]))
    : [];

  return (
    <Screen load={load}>
      {paper ? (
        <>
          <View style={{ gap: Space.s }}>
            <Label>{publicationMeta(paper)}</Label>
            <Title>{paper.title}</Title>
            {paper.award ? <Meta>{paper.award}</Meta> : null}
          </View>
          <Section label="Authors">
            {paper.authors.map((author) =>
              author.member ? (
                <Row
                  key={author.member.slug}
                  href={{ pathname: '/person/[slug]', params: { slug: author.member.slug } }}
                  title={author.name}
                />
              ) : (
                <Row key={author.name} title={author.name} />
              ),
            )}
          </Section>
          <View style={{ gap: Space.s }}>
            <Heading>Abstract</Heading>
            <Prose text={paper.abstract} />
          </View>
          {links.length ? (
            <Section label="Read and reuse">
              {links.map(([name, url]) => (
                <Row key={name} url={url} title={name} />
              ))}
            </Section>
          ) : null}
          {paper.project ? (
            <Section label="From the project">
              <Row
                href={{ pathname: '/project/[slug]', params: { slug: paper.project.slug } }}
                title={paper.project.title}
              />
            </Section>
          ) : null}
        </>
      ) : null}
    </Screen>
  );
}
