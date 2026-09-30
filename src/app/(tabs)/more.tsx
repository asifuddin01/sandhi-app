import Constants from 'expo-constants';

import { Meta, Row, Screen, Section, Title } from '@/components/ui';
import { SITE_URL } from '@/lib/api';

export default function MoreScreen() {
  return (
    <Screen top>
      <Title>More</Title>
      <Section label="The lab">
        <Row href="/people" title="People" />
        <Row href="/news" title="News" />
        <Row href="/events" title="Events" />
        <Row href="/insights" title="Research notes" />
        <Row href="/search" title="Search everything" />
      </Section>
      <Section label="Get in touch">
        <Row url={`${SITE_URL}/join`} title="Join SANDHI" detail="Apply as a researcher, intern or collaborator." />
        <Row url="mailto:contact@sandhiresearch.org" title="contact@sandhiresearch.org" />
        <Row url={SITE_URL} title="Open the website" />
      </Section>
      <Meta>SANDHI app {Constants.expoConfig?.version ?? ''}</Meta>
    </Screen>
  );
}
