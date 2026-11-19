export const statusTone = (
  status: string
): 'green' | 'yellow' | 'red' | 'blue' | 'purple' | 'gray' => {
  const map: Record<string, 'green' | 'yellow' | 'red' | 'blue' | 'purple' | 'gray'> = {
    Coding: 'blue',
    Scrubbing: 'purple',
    Ready: 'blue',
    Submitted: 'yellow',
    'In Review': 'yellow',
    Appeal: 'purple',
    Denied: 'red',
    Paid: 'green',
    Posted: 'green',
    Eligible: 'green',
    Active: 'green',
    Pending: 'yellow',
    Coded: 'blue',
    Billed: 'yellow',
    Closed: 'gray',
    Inactive: 'red',
  }
  return map[status] ?? 'gray'
}
