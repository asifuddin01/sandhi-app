import { Empty, Row, Screen } from '@/components/ui';
import { useApi } from '@/lib/api';
import { date, label } from '@/lib/format';
import type { NewsSummary } from '@/lib/types';

export default function NewsScreen() {
  const load = useApi<{ news: NewsSummary[] }>('/news');

  return (
    <Screen load={load}>
      {load.data?.news.length === 0 ? <Empty>No news yet.</Empty> : null}
      {load.data?.news.map((post) => (
        <Row
          key={post.slug}
          href={{ pathname: '/news/[slug]', params: { slug: post.slug } }}
          title={post.title}
          detail={post.excerpt}
          meta={[date(post.publishAt ?? post.createdAt), label(post.category)].join(' · ')}
        />
      ))}
    </Screen>
  );
}
