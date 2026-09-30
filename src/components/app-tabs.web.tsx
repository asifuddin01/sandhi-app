import { TabList, TabSlot, TabTrigger, type TabTriggerSlotProps, Tabs } from 'expo-router/ui';
import { Pressable, StyleSheet, Text } from 'react-native';

import { Font, Space, useColors } from '@/constants/theme';

/** Web preview only: a plain bottom bar standing in for the native tab bar. */
export default function AppTabs() {
  const colors = useColors();
  return (
    <Tabs>
      <TabSlot style={{ flex: 1 }} />
      <TabList style={[styles.bar, { backgroundColor: colors.ink, borderColor: colors.line }]}>
        <TabTrigger name="index" href="/" asChild>
          <Tab>Home</Tab>
        </TabTrigger>
        <TabTrigger name="research" href="/research" asChild>
          <Tab>Research</Tab>
        </TabTrigger>
        <TabTrigger name="projects" href="/projects" asChild>
          <Tab>Projects</Tab>
        </TabTrigger>
        <TabTrigger name="publications" href="/publications" asChild>
          <Tab>Papers</Tab>
        </TabTrigger>
        <TabTrigger name="more" href="/more" asChild>
          <Tab>More</Tab>
        </TabTrigger>
      </TabList>
    </Tabs>
  );
}

function Tab({ children, isFocused, ...props }: TabTriggerSlotProps) {
  const colors = useColors();
  return (
    <Pressable {...props} style={styles.tab}>
      <Text
        style={[styles.text, { color: isFocused ? colors.accent : colors.muted }]}>
        {children}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingVertical: Space.s,
  },
  tab: { paddingHorizontal: Space.s, paddingVertical: Space.xs },
  text: { fontFamily: Font.medium, fontSize: 13 },
});
