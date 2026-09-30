import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { Label, Meta, Prose, Screen, Title } from '@/components/ui';
import { Space } from '@/constants/theme';
import { useApi } from '@/lib/api';
import { date, label, names } from '@/lib/format';
import type { InsightDetail } from '@/lib/types';

export default function InsightScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const load = useApi<InsightDetail>(`/insights/${encodeURIComponent(slug)}`);
  const note = load.data;

  return (
    <Screen load={load}>
      {note ? (
        <>
          <View style={{ gap: Space.s }}>
            <Label>{[label(note.kind), date(note.publishedAt)].filter(Boolean).join(' · ')}</Label>
            <Title>{note.title}</Title>
            <Meta>
              {[names(note.authors), `${note.readingMinutes} min read`].filter(Boolean).join(' · ')}
            </Meta>
          </View>
          <Prose text={note.body} />
        </>
      ) : null}
    </Screen>
  );
}
