import type { Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, TextInput } from 'react-native';

import { Empty, Row, Screen } from '@/components/ui';
import { Font, Space, useColors } from '@/constants/theme';
import { SITE_URL, useApi } from '@/lib/api';
import { appRoute } from '@/lib/routes';
import type { SearchResult } from '@/lib/types';

export default function SearchScreen() {
  const colors = useColors();
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(timer);
  }, [query]);

  // The API needs two characters; shorter queries wait instead of erroring.
  const load = useApi<{ results: SearchResult[] }>(
    debounced.length >= 2 ? `/search?q=${encodeURIComponent(debounced)}` : null,
  );
  const results = debounced.length >= 2 ? load.data?.results : undefined;

  return (
    // data never undefined here, so the first search never swaps the box for a spinner
    <Screen load={{ ...load, data: load.data ?? null }}>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Projects, papers, people, news"
        placeholderTextColor={colors.muted}
        style={[styles.search, { color: colors.text, borderColor: colors.line }]}
        autoFocus
        returnKeyType="search"
        clearButtonMode="while-editing"
        autoCorrect={false}
        accessibilityLabel="Search SANDHI"
      />
      {results?.length === 0 ? <Empty>Nothing matches that search.</Empty> : null}
      {results?.map((result) => {
        const route = appRoute(result.href);
        return (
          <Row
            key={result.href}
            href={route ? (route as Href) : undefined}
            url={route ? undefined : `${SITE_URL}${result.href}`}
            title={result.title}
            detail={result.description}
            meta={result.kind}
          />
        );
      })}
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
