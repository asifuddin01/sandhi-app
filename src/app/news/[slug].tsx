import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { Label, Meta, Prose, Row, Screen, Title } from '@/components/ui';
import { Space } from '@/constants/theme';
import { useApi } from '@/lib/api';
import { date, label } from '@/lib/format';
import type { NewsDetail } from '@/lib/types';

export default function NewsPostScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const load = useApi<NewsDetail>(`/news/${encodeURIComponent(slug)}`);
  const post = load.data;

  return (
    <Screen load={load}>
      {post ? (
        <>
          <View style={{ gap: Space.s }}>
            <Label>{[label(post.category), date(post.publishAt ?? post.createdAt)].join(' · ')}</Label>
            <Title>{post.title}</Title>
            {post.author ? <Meta>By {post.author.name}</Meta> : null}
          </View>
          <Prose text={post.body} />
          {post.author ? (
            <Row
              href={{ pathname: '/person/[slug]', params: { slug: post.author.slug } }}
              title={`More from ${post.author.name}`}
            />
          ) : null}
        </>
      ) : null}
    </Screen>
  );
}
