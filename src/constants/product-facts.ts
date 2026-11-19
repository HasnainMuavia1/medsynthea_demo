// Single source for every product claim shown in marketing, auth hero, FAQ and metadata.
// Change a number here — never in page copy.
export const PRODUCT_FACTS = {
  agents: {
    // Platform-wide count; also the Phase 1 roadmap count. Used in every agent-count claim.
    total: 52,
  },
  metrics: {
    submissionAccuracy: '99%+',
    manualWorkReduction: '70%',
    paymentCycleSpeedup: '4.2×',
    reimbursementSpeedup: '30%',
    denialReduction: '60%',
    claimsThroughput: '10×',
    revenueUplift: '5–7%',
    revenueLeakageRecovery: '5–15%',
    paymentPostingAccuracy: '99%',
    phiExposureInLogs: '0%',
    evidenceTraceability: '100%',
    availability: '24/7',
  },
  reach: {
    ehrIntegrations: '50+',
    clinicalSpecialties: '30+',
    specialtyCodingRules: '100M+',
    // Customers on the platform vs providers reachable through integrated EHR/PM systems.
    healthcareOrganizations: '100+',
    providerOrganizations: '10,000+',
  },
  security: {
    tokenVaultTtlMinutes: 15,
    transitEncryption: 'TLS 1.2+',
    atRestEncryption: 'AES-256',
    secureDataExchange: '99.9%',
  },
  roadmap: {
    phase1: { quarter: 'Q1 2026' },
    phase2: { quarter: 'Q2 2026', addedAgents: 5 },
    phase3: { quarter: 'Q3 2026', addedAgents: 4 },
    phase4: { quarter: 'Q4 2026', addedAgents: 3 },
  },
  demo: {
    duration: '30–45 minutes',
    productTourLength: '90 Seconds',
  },
} as const
