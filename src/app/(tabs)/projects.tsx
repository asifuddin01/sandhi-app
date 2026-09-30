import { Body, Empty, Row, Screen, Title } from '@/components/ui';
import { useColors } from '@/constants/theme';
import { useApi } from '@/lib/api';
import { label, names } from '@/lib/format';
import type { ProjectSummary } from '@/lib/types';

export default function ProjectsScreen() {
  const colors = useColors();
  const load = useApi<{ projects: ProjectSummary[] }>('/projects');

  return (
    <Screen load={load} top>
      <Title>Projects</Title>
      <Body style={{ color: colors.muted }}>
        What the lab is working on, with public progress as it happens.
      </Body>
      {load.data?.projects.length === 0 ? <Empty>No public projects yet.</Empty> : null}
      {load.data?.projects.map((project) => (
        <Row
          key={project.slug}
          href={{ pathname: '/project/[slug]', params: { slug: project.slug } }}
          title={project.title}
          detail={project.gloss}
          meta={[label(project.status), names(project.areas)].filter(Boolean).join(' · ')}
        />
      ))}
    </Screen>
  );
}
