import { type Href, Link } from 'expo-router';
import { openBrowserAsync } from 'expo-web-browser';
import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  type TextProps,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Font, Space, useColors } from '@/constants/theme';
import type { ApiError } from '@/lib/envelope';

type LoadState = {
  data: unknown;
  loading: boolean;
  error: ApiError | undefined;
  refreshing: boolean;
  refresh: () => void;
};

/**
 * Every screen scrolls, pulls to refresh, and shows the same loading and error
 * states. `top` pads under the status bar on tab screens, which have no header.
 */
export function Screen({
  load,
  top,
  children,
}: {
  load?: LoadState;
  top?: boolean;
  children?: ReactNode;
}) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  // Only the first load replaces the screen; later ones (a new search, a
  // refresh) keep what is showing, so a search box never loses focus.
  const waiting = load?.loading && load.data === undefined;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.ink }}
      contentContainerStyle={[
        styles.content,
        { paddingTop: (top ? insets.top : 0) + Space.l },
      ]}
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      refreshControl={
        load ? (
          <RefreshControl
            refreshing={load.refreshing}
            onRefresh={load.refresh}
            tintColor={colors.muted}
            colors={[colors.accent]}
          />
        ) : undefined
      }>
      {waiting ? (
        <ActivityIndicator color={colors.muted} style={{ marginTop: Space.xl }} />
      ) : load?.error ? (
        <>
          <ErrorNote error={load.error} onRetry={load.refresh} />
          {load.data === undefined ? null : children}
        </>
      ) : (
        children
      )}
    </ScrollView>
  );
}

function ErrorNote({ error, onRetry }: { error: ApiError; onRetry: () => void }) {
  const colors = useColors();
  return (
    <View style={[styles.note, { borderColor: colors.line }]}>
      <Body>{error.status === 404 ? 'This page is not available.' : error.message}</Body>
      {error.status !== 404 ? (
        <Pressable onPress={onRetry} accessibilityRole="button" hitSlop={8}>
          <Text style={[styles.action, { color: colors.link }]}>Try again</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function Themed({
  style,
  variant,
  ...props
}: TextProps & { variant: 'title' | 'heading' | 'body' | 'meta' | 'label' }) {
  const colors = useColors();
  const color = variant === 'meta' || variant === 'label' ? colors.muted : colors.text;
  return <Text {...props} style={[styles[variant], { color }, style]} />;
}

export const Title = (props: TextProps) => (
  <Themed variant="title" accessibilityRole="header" {...props} />
);
export const Heading = (props: TextProps) => (
  <Themed variant="heading" accessibilityRole="header" {...props} />
);
export const Body = (props: TextProps) => <Themed variant="body" {...props} />;
export const Meta = (props: TextProps) => <Themed variant="meta" {...props} />;
export const Label = (props: TextProps) => <Themed variant="label" {...props} />;

/** A small uppercase label over a group, like the website's section eyebrows. */
export function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Label>{label}</Label>
      <View>{children}</View>
    </View>
  );
}

/** One tappable line: a title, and optionally a line of detail under it. */
export function Row({
  href,
  url,
  title,
  detail,
  meta,
}: {
  href?: Href;
  url?: string;
  title: string;
  detail?: string | null;
  meta?: string | null;
}) {
  const colors = useColors();
  const body = (pressed: boolean) => (
    <View style={[styles.row, { borderColor: colors.line, opacity: pressed ? 0.6 : 1 }]}>
      <Text style={[styles.rowTitle, { color: colors.text }]}>{title}</Text>
      {detail ? (
        <Text style={[styles.rowDetail, { color: colors.muted }]} numberOfLines={3}>
          {detail}
        </Text>
      ) : null}
      {meta ? <Meta>{meta}</Meta> : null}
    </View>
  );

  if (href) {
    return (
      <Link href={href} asChild>
        <Pressable accessibilityRole="link">{({ pressed }) => body(pressed)}</Pressable>
      </Link>
    );
  }
  if (url) {
    return (
      <Pressable accessibilityRole="link" onPress={() => openLink(url)}>
        {({ pressed }) => body(pressed)}
      </Pressable>
    );
  }
  return body(false);
}

/** Web pages open in the in-app browser; mail and phone in their own apps. */
export function openLink(url: string): void {
  if (/^https?:/i.test(url)) void openBrowserAsync(url);
  else void Linking.openURL(url);
}

export function Empty({ children }: { children: ReactNode }) {
  return <Meta style={styles.empty}>{children}</Meta>;
}

/**
 * Markdown bodies shown as plain paragraphs: headings, emphasis and links are
 * flattened to their text, list items get a bullet.
 * ponytail: no tables, maths or code highlighting — add a Markdown renderer
 * when research notes with those reach the app.
 */
export function Prose({ text }: { text: string | null | undefined }) {
  if (!text?.trim()) return null;
  return text
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block, index) => (
      <Body key={index} style={styles.paragraph}>
        {flatten(block)}
      </Body>
    ));
}

function flatten(block: string): string {
  return block
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/(\*\*|__)(.+?)\1/g, '$2')
    .replace(/(\*|_)(.+?)\1/g, '$2')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^\s*[-*+]\s+/gm, '• ')
    .replace(/^>\s?/gm, '');
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: Space.m, paddingBottom: Space.xl * 2, gap: Space.l },
  title: { fontFamily: Font.display, fontSize: 38, lineHeight: 44 },
  heading: { fontFamily: Font.display, fontSize: 26, lineHeight: 32 },
  body: { fontFamily: Font.body, fontSize: 17, lineHeight: 26 },
  meta: { fontFamily: Font.body, fontSize: 14, lineHeight: 20 },
  label: {
    fontFamily: Font.semibold,
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  section: { gap: Space.s },
  row: {
    paddingVertical: Space.m,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: Space.xs,
  },
  rowTitle: { fontFamily: Font.medium, fontSize: 17, lineHeight: 23 },
  rowDetail: { fontFamily: Font.body, fontSize: 15, lineHeight: 21 },
  paragraph: { marginBottom: Space.s },
  empty: { paddingVertical: Space.m },
  note: { borderWidth: 1, padding: Space.m, gap: Space.s, marginTop: Space.l },
  action: { fontFamily: Font.medium, fontSize: 16 },
});
