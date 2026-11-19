'use client'

import { FileAudio, FileText, MessageSquareText, PenLine } from 'lucide-react'
import { Badge } from '@/components/shared/Badge'
import { StatTile } from '@/components/demo/DemoUi'
import { ModuleListPage } from '@/components/demo/ModuleListPage'
import { formatDateTime, formatDuration } from '@/demo/engine'
import { visitTypeById } from '@/demo/reference'

const DocumentationPage = () => (
  <ModuleListPage
    title="Documentation"
    subtitle="Encounter audio, transcripts and AI-generated clinical notes."
    step="note"
    filter={(c) => c.eligibility !== null}
    emptyMessage="No encounters ready for documentation."
    kpis={(rows) => (
      <>
        <StatTile label="Recordings" value={rows.filter((r) => r.c.audio).length} icon={FileAudio} />
        <StatTile label="Transcripts" value={rows.filter((r) => r.c.transcript).length} icon={MessageSquareText} tone="blue" />
        <StatTile label="Notes drafted" value={rows.filter((r) => r.c.note).length} icon={FileText} tone="purple" />
        <StatTile label="Signed" value={rows.filter((r) => r.c.note?.signedAt).length} icon={PenLine} />
      </>
    )}
    columns={[
      { id: 'visit', header: 'Visit', cell: ({ c }) => visitTypeById(c.appointment.visitType).short },
      { id: 'audio', header: 'Audio', cell: ({ c }) => (c.audio ? `${formatDuration(c.audio.durationSec)} · ${c.audio.source}` : <span className="text-muted-foreground">Not uploaded</span>) },
      { id: 'transcript', header: 'Transcript', cell: ({ c }) => (c.transcript ? <Badge tone="blue" density="fit">{c.transcript.length} utterances</Badge> : '—') },
      {
        id: 'note',
        header: 'Clinical note',
        cell: ({ c }) => (c.note ? (c.note.signedAt ? <Badge tone="green" density="fit" dot>Signed</Badge> : <Badge tone="yellow" density="fit" dot>Draft</Badge>) : '—'),
      },
      { id: 'updated', header: 'Updated', cell: ({ c }) => (c.note ? formatDateTime(c.note.signedAt ?? c.note.generatedAt) : c.audio ? formatDateTime(c.audio.uploadedAt) : '—') },
    ]}
  />
)

export default DocumentationPage
