import * as XLSX from 'xlsx'

function buildRows(analysis, formData) {
  const { current, targetExpenses, comparison, tiers } = analysis
  const c = formData.currentCity
  const t = formData.targetCity

  const rows = [
    ['Job Switch Analysis', `${c} → ${t}`],
    [],
    ['=== CURRENT SITUATION ==='],
    ['Monthly In-Hand', current.monthlySalary],
    ['Annual CTC', current.annualSalary],
    ['Annual Tax', current.tax.totalTax],
    ['Effective Tax Rate', current.tax.effectiveRate + '%'],
    [],
    ['=== MONTHLY EXPENSES ==='],
    ['Category', c, t, 'Difference'],
    ['Rent', current.expenses.rent, targetExpenses.rent, targetExpenses.rent - current.expenses.rent],
    ['Food', current.expenses.food, targetExpenses.food, targetExpenses.food - current.expenses.food],
    ['Transport', current.expenses.transport, targetExpenses.transport, targetExpenses.transport - current.expenses.transport],
    ['Utilities', current.expenses.utilities, targetExpenses.utilities, targetExpenses.utilities - current.expenses.utilities],
    ['Misc', current.expenses.misc, targetExpenses.misc, targetExpenses.misc - current.expenses.misc],
    ['Home Visits (avg/mo)', current.expenses.homeVisit, targetExpenses.homeVisit, targetExpenses.homeVisit - current.expenses.homeVisit],
    ['Riding Trips (avg/mo)', current.expenses.trips, targetExpenses.trips, targetExpenses.trips - current.expenses.trips],
    ['Total Expenses', current.totalMonthlyExpense, targetExpenses.total, comparison.expenseDiff],
    [],
    ['Current Monthly Savings', current.monthlySaving],
    ['Current Annual Savings', current.annualSaving],
    [],
    ['=== RECOMMENDED SALARY TIERS ==='],
    ['Tier', 'Annual CTC', 'Monthly Salary', 'Hike %', 'Monthly Tax', 'Monthly Savings', 'Annual Tax', 'Tax Rate'],
    ['Minimum (same savings)', tiers.minimum.annualSalary, tiers.minimum.monthlySalary, tiers.minimum.hikePercent + '%', tiers.minimum.monthlyTax, tiers.minimum.monthlySaving, tiers.minimum.tax.totalTax, tiers.minimum.tax.effectiveRate + '%'],
    ['Comfortable (+10% savings)', tiers.comfortable.annualSalary, tiers.comfortable.monthlySalary, tiers.comfortable.hikePercent + '%', tiers.comfortable.monthlyTax, tiers.comfortable.monthlySaving, tiers.comfortable.tax.totalTax, tiers.comfortable.tax.effectiveRate + '%'],
    ['Recommended (+20% savings)', tiers.recommended.annualSalary, tiers.recommended.monthlySalary, tiers.recommended.hikePercent + '%', tiers.recommended.monthlyTax, tiers.recommended.monthlySaving, tiers.recommended.tax.totalTax, tiers.recommended.tax.effectiveRate + '%'],
    [],
    ['=== TAX COMPARISON ==='],
    ['', c + ' (Current)', t + ' (Recommended)'],
    ['CTC', current.annualSalary, tiers.recommended.annualSalary],
    ['Taxable Income', current.tax.taxableIncome, tiers.recommended.tax.taxableIncome],
    ['Tax', current.tax.tax, tiers.recommended.tax.tax],
    ['Cess (4%)', current.tax.cess, tiers.recommended.tax.cess],
    ['Total Tax', current.tax.totalTax, tiers.recommended.tax.totalTax],
    ['Effective Rate', current.tax.effectiveRate + '%', tiers.recommended.tax.effectiveRate + '%'],
    [],
    ['Tax slabs as per India New Regime FY 2025-26'],
  ]
  return rows
}

export function exportCSV(analysis, formData) {
  const rows = buildRows(analysis, formData)
  const csvContent = rows.map(row => row.map(cell => {
    const str = String(cell ?? '')
    return str.includes(',') ? `"${str}"` : str
  }).join(',')).join('\n')

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  downloadBlob(blob, `job-switch-${formData.currentCity}-to-${formData.targetCity}.csv`)
}

export function exportExcel(analysis, formData) {
  const rows = buildRows(analysis, formData)
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.aoa_to_sheet(rows)

  // Set column widths
  ws['!cols'] = [
    { wch: 28 }, { wch: 18 }, { wch: 18 }, { wch: 16 },
    { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 },
  ]

  XLSX.utils.book_append_sheet(wb, ws, 'Analysis')
  XLSX.writeFile(wb, `job-switch-${formData.currentCity}-to-${formData.targetCity}.xlsx`)
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
