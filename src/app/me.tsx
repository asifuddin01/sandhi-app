import { router } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';

import {
  Body,
  Button,
  Empty,
  Heading,
  Label,
  Meta,
  Prose,
  Row,
  Screen,
  Section,
  Title,
} from '@/components/ui';
import { Space, useColors } from '@/constants/theme';
import { SITE_URL, useApi } from '@/lib/api';
import { date, label } from '@/lib/format';
import { useSession } from '@/lib/session';
import type { Announcement, MyDocument, MyProfile, MyProject } from '@/lib/types';

const roleNames: Record<string, string> = {
  OWNER: 'Owner',
  ADMIN: 'Administrator',
  REVIEWER: 'Reviewer',
  MEMBER: 'Member',
};

export default function MeScreen() {
  const colors = useColors();
  const { ready, token, viewer, signOut, expire } = useSession();
  const profile = useApi<MyProfile>(token ? '/me/profile' : null, token);
  const projects = useApi<{ projects: MyProject[] }>(token ? '/me/projects' : null, token);
  const news = useApi<{ announcements: Announcement[]; unread: number }>(
    token ? '/me/announcements' : null,
    token,
  );
  const documents = useApi<{ documents: MyDocument[] }>(token ? '/me/documents' : null, token);
  const loads = [profile, projects, news, documents];

  // A refused token has ended elsewhere (signed out on the web, expired):
  // forget it here too rather than keep showing a session that is gone.
  const refused = loads.some((load) => load.error?.status === 401);
  useEffect(() => {
    if (refused) expire();
  }, [refused, expire]);

  if (ready && !token) {
    return (
      <Screen>
        <Title>Signed out</Title>
        <Body style={{ color: colors.muted }}>Sign in to see your projects and announcements.</Body>
        <Button title="Sign in" onPress={() => router.replace('/sign-in')} />
      </Screen>
    );
  }

  return (
    <Screen
      load={{
        data: viewer ?? undefined,
        loading: !ready,
        error: undefined,
        refreshing: loads.some((load) => load.refreshing),
        refresh: () => loads.forEach((load) => load.refresh()),
      }}>
      <View style={{ gap: Space.s }}>
        <Label>Signed in</Label>
        <Title>{viewer?.name}</Title>
        <Meta>{[viewer?.email, viewer ? roleNames[viewer.role] : null].filter(Boolean).join(' · ')}</Meta>
      </View>

      <Section
        label={`Announcements${news.data?.unread ? ` · ${news.data.unread} unread` : ''}`}>
        {news.data?.announcements.length === 0 ? <Empty>Nothing announced yet.</Empty> : null}
        {news.data?.announcements.map((item) => (
          <View key={item.id} style={{ gap: Space.xs, paddingVertical: Space.m }}>
            <Heading>{(item.pinned ? 'Pinned · ' : '') + item.title}</Heading>
            <Meta>{[date(item.createdAt), item.author?.name].filter(Boolean).join(' · ')}</Meta>
            <Prose text={item.body} />
          </View>
        ))}
        {news.error && news.error.status !== 401 ? <Empty>{news.error.message}</Empty> : null}
      </Section>

      <Section label="Your projects">
        {projects.data?.projects.length === 0 ? <Empty>You are not on a project yet.</Empty> : null}
        {projects.data?.projects.map((project) => {
          const published = project.state === 'PUBLISHED';
          return (
            <Row
              key={project.id}
              href={
                published
                  ? { pathname: '/project/[slug]', params: { slug: project.slug } }
                  : undefined
              }
              url={published ? undefined : `${SITE_URL}/portal/projects/${project.slug}`}
              title={project.title}
              detail={project.gloss}
              meta={[
                project.isLead ? 'Lead' : project.role,
                label(project.status),
                published ? null : `${label(project.state)} · opens on the website`,
              ]
                .filter(Boolean)
                .join(' · ')}
            />
          );
        })}
      </Section>

      <Section label="Documents">
        {documents.data?.documents.length === 0 ? (
          <Empty>No documents on your projects yet.</Empty>
        ) : null}
        {documents.data?.documents.map((document) => (
          <Row
            key={document.id}
            url={document.url ?? undefined}
            title={document.title}
            meta={[document.project.title, date(document.createdAt)].join(' · ')}
          />
        ))}
      </Section>

      <Section label="Your profile">
        {profile.data ? (
          <Row
            url={`${SITE_URL}/portal/profile`}
            title={profile.data.title ?? profile.data.name}
            detail={profile.data.interests.join(' · ')}
            meta={`${profile.data.isPublic ? 'Shown on People' : 'Not public yet'} · edit on the website`}
          />
        ) : profile.error && profile.error.status !== 401 ? (
          <Empty>{profile.error.message}</Empty>
        ) : null}
      </Section>

      <Section label="Account">
        <Row
          url={`${SITE_URL}/portal/security`}
          title="Password, passkeys and sessions"
          detail="Managed on the website."
        />
      </Section>

      <Button
        quiet
        title="Sign out"
        onPress={() => {
          void signOut();
          router.back();
        }}
      />
    </Screen>
  );
}
