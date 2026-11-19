import { jsPDF } from 'jspdf'
import { CARC_LABELS, formatDate, fullName, money, placeOfService, usDob } from './engine'
import { PRACTICE, payerById, providerById } from './reference'
import type { DemoCase, Patient } from './types'

const INK: [number, number, number] = [24, 32, 40]
const MUTED: [number, number, number] = [110, 118, 128]
const BRAND: [number, number, number] = [16, 122, 87]
const LINE: [number, number, number] = [220, 224, 228]

const page = { w: 612, h: 792, m: 40 }

const ensureSpace = (doc: jsPDF, y: number, needed: number): number => {
  if (y + needed < page.h - page.m) return y
  doc.addPage()
  return page.m
}

export const downloadEobPdf = (c: DemoCase, patient: Patient): void => {
  const { era, eob, claim, coding } = c
  if (!era || !eob || !claim || !coding) return
  const payer = payerById(patient.insurance.payerId)
  const provider = providerById(c.appointment.providerId)
  const doc = new jsPDF({ unit: 'pt', format: 'letter' })
  const { m, w } = page

  doc.setFillColor(...BRAND)
  doc.rect(0, 0, w, 64, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.text(payer.name, m, 30)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text('EXPLANATION OF BENEFITS — THIS IS NOT A BILL', m, 48)
  doc.text(`Document ${eob.documentId}`, w - m, 30, { align: 'right' })
  doc.text(`Issued ${formatDate(eob.receivedAt)}`, w - m, 48, { align: 'right' })

  let y = 92
  doc.setTextColor(...INK)
  const block = (title: string, lines: string[], x: number) => {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(...MUTED)
    doc.text(title.toUpperCase(), x, y)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(...INK)
    lines.forEach((line, i) => doc.text(line, x, y + 15 + i * 13))
  }
  block('Member', [fullName(patient), `DOB ${usDob(patient.dob)}`, `Member ID ${patient.insurance.memberId}`, `Group ${patient.insurance.groupNumber}`], m)
  block('Plan', [payer.planName, `Payer ID ${payer.payerIdCode}`, `Claim # ${claim.payerClaimControl ?? claim.claimId}`, `Patient acct ${claim.claimId}`], m + 190)
  block('Provider', [`${provider.name}, ${provider.credentials}`, PRACTICE.name, `NPI ${provider.npi}`, `Date of service ${formatDate(`${c.appointment.date}T12:00:00`)}`], m + 380)

  y += 80
  doc.setDrawColor(...LINE)
  doc.line(m, y, w - m, y)
  y += 20

  const cols = [
    { label: 'Service', x: m, align: 'left' as const },
    { label: 'Units', x: m + 210, align: 'right' as const },
    { label: 'Billed', x: m + 270, align: 'right' as const },
    { label: 'Allowed', x: m + 335, align: 'right' as const },
    { label: 'Plan paid', x: m + 400, align: 'right' as const },
    { label: 'Adjust.', x: m + 465, align: 'right' as const },
    { label: 'You owe', x: w - m, align: 'right' as const },
  ]
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...MUTED)
  cols.forEach((col) => doc.text(col.label.toUpperCase(), col.x, y, { align: col.align }))
  y += 8
  doc.line(m, y, w - m, y)
  y += 16

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...INK)
  era.lines.forEach((line, i) => {
    y = ensureSpace(doc, y, 30)
    const proc = coding.procedures[i]
    const co = line.adjustments.filter((a) => a.group === 'CO').reduce((s, a) => s + a.amount, 0)
    const pr = line.adjustments.filter((a) => a.group === 'PR').reduce((s, a) => s + a.amount, 0)
    const label = `${line.code}${line.modifiers.length ? `-${line.modifiers.join('-')}` : ''}`
    doc.text(label, m, y)
    doc.setTextColor(...MUTED)
    doc.text(doc.splitTextToSize(proc?.description ?? '', 200)[0] ?? '', m, y + 11)
    doc.setTextColor(...INK)
    doc.text(String(line.units), cols[1].x, y, { align: 'right' })
    doc.text(money(line.charge), cols[2].x, y, { align: 'right' })
    doc.text(money(line.allowed), cols[3].x, y, { align: 'right' })
    doc.text(money(line.paid), cols[4].x, y, { align: 'right' })
    doc.text(money(co), cols[5].x, y, { align: 'right' })
    doc.text(money(pr), cols[6].x, y, { align: 'right' })
    y += 26
  })

  doc.line(m, y - 8, w - m, y - 8)
  doc.setFont('helvetica', 'bold')
  doc.text('Totals', m, y + 6)
  doc.text(money(era.totalCharge), cols[2].x, y + 6, { align: 'right' })
  doc.text(money(era.totalCharge - era.contractualAdjustment), cols[3].x, y + 6, { align: 'right' })
  doc.text(money(era.totalPaid), cols[4].x, y + 6, { align: 'right' })
  doc.text(money(era.contractualAdjustment), cols[5].x, y + 6, { align: 'right' })
  doc.text(money(era.patientResponsibility), cols[6].x, y + 6, { align: 'right' })

  y = ensureSpace(doc, y + 36, 140)
  doc.setFillColor(242, 248, 245)
  doc.roundedRect(m, y, w - m * 2, 70, 6, 6, 'F')
  doc.setFontSize(10)
  doc.setTextColor(...MUTED)
  doc.text('YOUR PLAN PAID', m + 16, y + 24)
  doc.text('YOU MAY OWE YOUR PROVIDER', m + 280, y + 24)
  doc.setFontSize(20)
  doc.setTextColor(...BRAND)
  doc.text(money(era.totalPaid), m + 16, y + 52)
  doc.setTextColor(...INK)
  doc.text(money(era.patientResponsibility), m + 280, y + 52)

  y += 96
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('Remark codes', m, y)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  Object.entries(CARC_LABELS).forEach(([code, label], i) => doc.text(`${code}: ${label}`, m, y + 16 + i * 13))

  y += 84
  doc.setFont('helvetica', 'bold')
  doc.text('Payment information', m, y)
  doc.setFont('helvetica', 'normal')
  doc.text(`${era.paymentMethod} trace ${era.checkNumber} · paid ${formatDate(`${era.paymentDate}T12:00:00`)} to ${PRACTICE.name} (TIN ${PRACTICE.taxId})`, m, y + 16)

  doc.setFontSize(8)
  doc.setTextColor(...MUTED)
  doc.text('Sample document generated by the MedSynthea demo. Contains fictional data only.', w / 2, page.h - 24, { align: 'center' })

  doc.save(`${eob.documentId}.pdf`)
}

export const downloadNotePdf = (c: DemoCase, patient: Patient): void => {
  const { note } = c
  if (!note) return
  const doc = new jsPDF({ unit: 'pt', format: 'letter' })
  const { m, w } = page
  const width = w - m * 2

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(...INK)
  doc.text(note.title.toUpperCase(), m, m + 10)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...MUTED)
  doc.text(`${PRACTICE.name} · ${fullName(patient)} · ${c.encounterNumber}`, m, m + 26)
  let y = m + 50

  note.sections.forEach((section) => {
    y = ensureSpace(doc, y, 40)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(...BRAND)
    doc.text(section.heading.toUpperCase(), m, y)
    y += 14
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...INK)
    section.lines.forEach((line) => {
      const wrapped: string[] = doc.splitTextToSize(line, width)
      wrapped.forEach((part) => {
        y = ensureSpace(doc, y, 14)
        doc.text(part, m, y)
        y += 12
      })
      y += 3
    })
    y += 8
  })

  if (note.signedAt) {
    y = ensureSpace(doc, y, 30)
    const provider = providerById(c.appointment.providerId)
    doc.setFont('helvetica', 'italic')
    doc.text(`Electronically signed by ${provider.name}, ${provider.credentials} on ${new Date(note.signedAt).toLocaleString('en-US')}`, m, y + 6)
  }
  doc.save(`${c.encounterNumber}-clinical-note.pdf`)
}

interface SimpleTable {
  head: string[]
  rows: string[][]
  widths: number[]
  footer?: string[]
}

interface SimpleDocSpec {
  fileName: string
  title: string
  subtitle: string
  blocks: { title: string; lines: string[] }[]
  table: SimpleTable
  highlights: { label: string; value: string }[]
  notes: string[]
}

const renderSimpleDoc = (spec: SimpleDocSpec): void => {
  const doc = new jsPDF({ unit: 'pt', format: 'letter' })
  const { m, w } = page

  doc.setFillColor(...BRAND)
  doc.rect(0, 0, w, 64, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(17)
  doc.text(spec.title, m, 30)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(spec.subtitle, m, 48)
  doc.text(PRACTICE.name, w - m, 30, { align: 'right' })
  doc.text(PRACTICE.phone, w - m, 48, { align: 'right' })

  let y = 92
  const colW = (w - m * 2) / Math.max(spec.blocks.length, 1)
  spec.blocks.forEach((block, bi) => {
    const x = m + bi * colW
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(...MUTED)
    doc.text(block.title.toUpperCase(), x, y)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(...INK)
    block.lines.forEach((line, i) => doc.text(doc.splitTextToSize(line, colW - 10)[0] ?? '', x, y + 15 + i * 13))
  })
  y += 26 + Math.max(...spec.blocks.map((b) => b.lines.length)) * 13
  doc.setDrawColor(...LINE)
  doc.line(m, y, w - m, y)
  y += 20

  const xs: number[] = []
  let acc = m
  spec.table.widths.forEach((cw) => {
    xs.push(acc)
    acc += cw
  })
  const cellX = (i: number) => (i === 0 ? xs[i] : xs[i] + spec.table.widths[i])
  const align = (i: number): 'left' | 'right' => (i === 0 ? 'left' : 'right')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...MUTED)
  spec.table.head.forEach((h, i) => doc.text(h.toUpperCase(), cellX(i), y, { align: align(i) }))
  y += 8
  doc.line(m, y, w - m, y)
  y += 15
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...INK)
  spec.table.rows.forEach((row) => {
    y = ensureSpace(doc, y, 18)
    row.forEach((cell, i) => doc.text(i === 0 ? (doc.splitTextToSize(cell, spec.table.widths[0] - 8)[0] ?? '') : cell, cellX(i), y, { align: align(i) }))
    y += 16
  })
  if (spec.table.footer) {
    doc.line(m, y - 8, w - m, y - 8)
    doc.setFont('helvetica', 'bold')
    spec.table.footer.forEach((cell, i) => doc.text(cell, cellX(i), y + 6, { align: align(i) }))
    y += 20
  }

  y = ensureSpace(doc, y + 16, 90)
  doc.setFillColor(242, 248, 245)
  doc.roundedRect(m, y, w - m * 2, 66, 6, 6, 'F')
  const hw = (w - m * 2) / Math.max(spec.highlights.length, 1)
  spec.highlights.forEach((h, i) => {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...MUTED)
    doc.text(h.label.toUpperCase(), m + 16 + i * hw, y + 22)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(18)
    doc.setTextColor(...(i === 0 ? BRAND : INK))
    doc.text(h.value, m + 16 + i * hw, y + 48)
  })
  y += 92
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...INK)
  spec.notes.forEach((note) => {
    const wrapped: string[] = doc.splitTextToSize(note, w - m * 2)
    wrapped.forEach((part) => {
      y = ensureSpace(doc, y, 14)
      doc.text(part, m, y)
      y += 12
    })
    y += 4
  })
  doc.setFontSize(8)
  doc.setTextColor(...MUTED)
  doc.text('Sample document generated by the MedSynthea demo. Contains fictional data only.', w / 2, page.h - 24, { align: 'center' })
  doc.save(spec.fileName)
}

export const downloadEstimatePdf = (c: DemoCase, patient: Patient): void => {
  const { estimate, coding } = c
  if (!estimate || !coding) return
  const payer = payerById(patient.insurance.payerId)
  const provider = providerById(c.appointment.providerId)
  renderSimpleDoc({
    fileName: `${c.encounterNumber}-patient-estimate.pdf`,
    title: 'Patient Cost Estimate',
    subtitle: `Prepared ${formatDate(estimate.createdAt)} · ${c.encounterNumber}`,
    blocks: [
      { title: 'Patient', lines: [fullName(patient), `DOB ${usDob(patient.dob)}`, patient.mrn] },
      { title: 'Coverage', lines: [payer.name, payer.planName, `Member ${patient.insurance.memberId}`] },
      { title: 'Visit', lines: [`Dr. ${provider.name}`, formatDate(`${c.appointment.date}T12:00:00`), c.appointment.location] },
    ],
    table: {
      head: ['Breakdown', 'Amount'],
      widths: [400, 132],
      rows: [
        ['Billed charges', money(estimate.totalCharges)],
        ['In-network discount', `- ${money(estimate.contractualAdjustment)}`],
        ['Allowed amount', money(estimate.allowedAmount)],
        ['Copay', money(estimate.copayAmount)],
        ['Deductible applied', money(estimate.deductibleApplied)],
        [`Coinsurance (${payer.coinsurancePct}%)`, money(estimate.coinsuranceAmount)],
      ],
    },
    highlights: [
      { label: 'Estimated insurance payment', value: money(estimate.insurancePays) },
      { label: 'Your estimated responsibility', value: money(estimate.patientResponsibility) },
    ],
    notes: [
      'This estimate is based on your benefits on the date it was prepared and the services documented for this visit. Your final amount is set by your health plan when the claim is processed.',
      `Questions? Call ${PRACTICE.name} billing at ${PRACTICE.phone}.`,
    ],
  })
}

export const downloadStatementPdf = (c: DemoCase, patient: Patient): void => {
  const { era, claim, reconciliation } = c
  if (!era || !claim) return
  const paid = reconciliation?.patientPaidAt ? era.patientResponsibility : 0
  const due = Math.max(0, Math.round((era.patientResponsibility - paid) * 100) / 100)
  renderSimpleDoc({
    fileName: `${c.encounterNumber}-patient-statement.pdf`,
    title: 'Patient Statement',
    subtitle: `Statement date ${formatDate(new Date().toISOString())} · Account ${claim.claimId}`,
    blocks: [
      { title: 'Bill to', lines: [fullName(patient), patient.address, `${patient.city}, ${patient.state} ${patient.zip}`] },
      { title: 'Account', lines: [patient.mrn, c.encounterNumber, `Service ${formatDate(`${c.appointment.date}T12:00:00`)}`] },
      { title: 'Insurance', lines: [patient.insurance.payerName, `Paid ${money(era.totalPaid)}`, `Claim ${claim.payerClaimControl ?? claim.claimId}`] },
    ],
    table: {
      head: ['Description', 'Charges', 'Credits'],
      widths: [330, 101, 101],
      rows: [
        ['Services billed', money(era.totalCharge), ''],
        [`Insurance payment (${era.checkNumber})`, '', money(era.totalPaid)],
        ['Contractual adjustment', '', money(era.contractualAdjustment)],
        ...(paid > 0 ? [[`Patient payment (${reconciliation?.patientPaymentMethod ?? 'card'})`, '', money(paid)]] : []),
      ],
      footer: ['Balance due', '', money(due)],
    },
    highlights: [
      { label: 'Your responsibility', value: money(era.patientResponsibility) },
      { label: due > 0 ? 'Amount due' : 'Paid in full', value: money(due) },
    ],
    notes: [due > 0 ? 'Pay online, by text-to-pay link, or call the billing office. Payment plans are available.' : 'Thank you — this account is paid in full.'],
  })
}

export const downloadClaimPdf = (c: DemoCase, patient: Patient): void => {
  const { claim, coding } = c
  if (!claim || !coding) return
  const payer = payerById(patient.insurance.payerId)
  const provider = providerById(c.appointment.providerId)
  renderSimpleDoc({
    fileName: `${claim.claimId}-cms1500.pdf`,
    title: 'Health Insurance Claim (CMS-1500 summary)',
    subtitle: `${claim.claimId} · created ${formatDate(claim.createdAt)}`,
    blocks: [
      { title: 'Insured / patient', lines: [fullName(patient), `DOB ${usDob(patient.dob)} · ${patient.sex}`, `ID ${patient.insurance.memberId}`, `Group ${patient.insurance.groupNumber}`] },
      { title: 'Payer', lines: [payer.name, `Payer ID ${payer.payerIdCode}`, payer.planName] },
      { title: 'Provider', lines: [`${provider.name}, ${provider.credentials}`, `NPI ${provider.npi}`, `Billing NPI ${PRACTICE.groupNpi}`, `TIN ${PRACTICE.taxId}`] },
    ],
    table: {
      head: ['24. Service', 'Mod', 'Dx ptr', 'Units', 'Charge'],
      widths: [300, 60, 60, 50, 62],
      rows: coding.procedures.map((p) => [`${p.code} ${p.description}`, p.modifiers.join(' ') || '-', p.dxPointers.map((n) => 'ABCDEFGHIJKL'[n - 1]).join(''), String(p.units), money(p.charge)]),
      footer: ['28. Total charge', '', '', '', money(claim.totalCharge)],
    },
    highlights: [
      { label: '21. Diagnoses', value: coding.diagnoses.map((d) => d.code).join('  ') },
      { label: 'Place of service', value: placeOfService(c) },
    ],
    notes: [`Date of service ${formatDate(`${c.appointment.date}T12:00:00`)}. Submitted electronically via ${PRACTICE.clearinghouse}${claim.submittedAt ? ` on ${formatDate(claim.submittedAt)}` : ''}.`],
  })
}
