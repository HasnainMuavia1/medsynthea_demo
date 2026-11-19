import { placeOfService } from './engine'
import { PRACTICE, payerById, providerById } from './reference'
import type { DemoCase, Patient } from './types'

export const build837P = (c: DemoCase, patient: Patient): string => {
  const { claim, coding } = c
  if (!claim || !coding) return ''
  const payer = payerById(patient.insurance.payerId)
  const provider = providerById(c.appointment.providerId)
  const dos = c.appointment.date.replace(/-/g, '')
  const [first, last] = provider.name.split(' ')
  return [
    'ISA*00*          *00*          *ZZ*MEDSYNTHEA     *ZZ*STEDI          *260101*1200*^*00501*000000421*0*P*:~',
    'GS*HC*MEDSYNTHEA*STEDI*20260101*1200*421*X*005010X222A1~',
    'ST*837*0001*005010X222A1~',
    `BHT*0019*00*${claim.claimId}*20260101*1200*CH~`,
    `NM1*85*2*${PRACTICE.name.toUpperCase()}*****XX*${PRACTICE.groupNpi}~`,
    `REF*EI*${PRACTICE.taxId.replace('-', '')}~`,
    `NM1*IL*1*${patient.lastName.toUpperCase()}*${patient.firstName.toUpperCase()}****MI*${patient.insurance.memberId}~`,
    `DMG*D8*${patient.dob.replace(/-/g, '')}*${patient.sex === 'Male' ? 'M' : 'F'}~`,
    `NM1*PR*2*${payer.name.toUpperCase()}*****PI*${payer.payerIdCode}~`,
    `CLM*${claim.claimId}*${claim.totalCharge}***${placeOfService(c)}:B:1*Y*A*Y*Y~`,
    ...(c.priorAuth?.authNumber ? [`REF*G1*${c.priorAuth.authNumber}~`] : []),
    `HI*${coding.diagnoses.map((d, i) => `${i === 0 ? 'ABK' : 'ABF'}:${d.code.replace('.', '')}`).join('*')}~`,
    `NM1*82*1*${(last ?? '').toUpperCase()}*${(first ?? '').toUpperCase()}****XX*${provider.npi}~`,
    ...coding.procedures.flatMap((p, i) => [
      `LX*${i + 1}~`,
      `SV1*HC:${p.code}${p.modifiers.map((m) => `:${m}`).join('')}*${p.charge}*UN*${p.units}***${p.dxPointers.join(':')}~`,
      `DTP*472*D8*${dos}~`,
    ]),
    `SE*${14 + coding.procedures.length * 3}*0001~`,
  ].join('\n')
}
