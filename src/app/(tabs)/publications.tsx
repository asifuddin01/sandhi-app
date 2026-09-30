import { useEffect, useState } from 'react';
import { StyleSheet, TextInput } from 'react-native';

import { Empty, Row, Screen, Title } from '@/components/ui';
import { Font, Space, useColors } from '@/constants/theme';
import { useApi } from '@/lib/api';
import { names, publicationMeta } from '@/lib/format';
import type { PublicationSummary } from '@/lib/types';

export default function PublicationsScreen() {
  const colors = useColors();
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const load = useApi<{ publications: PublicationSummary[] }>(
    debounced ? `/publications?q=${encodeURIComponent(debounced)}` : '/publications',
  );

  return (
    <Screen load={load} top>
      <Title>Papers</Title>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search titles, authors, abstracts"
        placeholderTextColor={colors.muted}
        style={[styles.search, { color: colors.text, borderColor: colors.line }]}
        returnKeyType="search"
        clearButtonMode="while-editing"
        autoCorrect={false}
        accessibilityLabel="Search papers"
      />
      {load.data?.publications.length === 0 ? (
        <Empty>{debounced ? 'No papers match that search.' : 'No papers published yet.'}</Empty>
      ) : null}
      {load.data?.publications.map((publication) => (
        <Row
          key={publication.slug}
          href={{ pathname: '/publication/[slug]', params: { slug: publication.slug } }}
          title={publication.title}
          detail={names(publication.authors)}
          meta={publicationMeta(publication)}
        />
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  search: {
    borderWidth: 1,
    fontFamily: Font.body,
    fontSize: 16,
    paddingHorizontal: Space.m,
    paddingVertical: Space.s + 2,
  },
});
