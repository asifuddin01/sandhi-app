import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { Font, useColors } from '@/constants/theme';

/** The platform's own tab bar: SF Symbols on iOS, Material Symbols on Android. */
export default function AppTabs() {
  const colors = useColors();

  return (
    <NativeTabs
      backgroundColor={colors.ink}
      tintColor={colors.accent}
      iconColor={{ default: colors.muted, selected: colors.accent }}
      labelStyle={{
        default: { color: colors.muted, fontFamily: Font.medium },
        selected: { color: colors.text, fontFamily: Font.medium },
      }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'house', selected: 'house.fill' }} md="home" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="research">
        <NativeTabs.Trigger.Label>Research</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="point.3.connected.trianglepath.dotted" md="hub" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="projects">
        <NativeTabs.Trigger.Label>Projects</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'square.stack.3d.up', selected: 'square.stack.3d.up.fill' }}
          md="layers"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="publications">
        <NativeTabs.Trigger.Label>Papers</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'doc.text', selected: 'doc.text.fill' }}
          md="article"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="more">
        <NativeTabs.Trigger.Label>More</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="ellipsis.circle" md="more_horiz" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
