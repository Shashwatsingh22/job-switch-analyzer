// India New Tax Regime FY 2025-26 slabs
const TAX_SLABS = [
  { min: 0, max: 400000, rate: 0 },
  { min: 400000, max: 800000, rate: 0.05 },
  { min: 800000, max: 1200000, rate: 0.10 },
  { min: 1200000, max: 1600000, rate: 0.15 },
  { min: 1600000, max: 2000000, rate: 0.20 },
  { min: 2000000, max: 2400000, rate: 0.25 },
  { min: 2400000, max: Infinity, rate: 0.30 },
]

const STANDARD_DEDUCTION = 75000

export function calculateTax(annualIncome) {
  const taxableIncome = Math.max(0, annualIncome - STANDARD_DEDUCTION)

  if (annualIncome <= 1275000) {
    return { tax: 0, cess: 0, totalTax: 0, taxableIncome, effectiveRate: 0, marginalRelief: true }
  }

  let tax = 0
  for (const slab of TAX_SLABS) {
    if (taxableIncome > slab.min) {
      const taxableInSlab = Math.min(taxableIncome, slab.max) - slab.min
      tax += taxableInSlab * slab.rate
    }
  }

  const excessOver1275k = annualIncome - 1275000
  if (tax > excessOver1275k && excessOver1275k > 0) {
    tax = excessOver1275k
  }

  const cess = tax * 0.04
  const totalTax = tax + cess

  return {
    tax: Math.round(tax),
    cess: Math.round(cess),
    totalTax: Math.round(totalTax),
    taxableIncome,
    effectiveRate: annualIncome > 0 ? ((totalTax / annualIncome) * 100).toFixed(2) : 0,
    marginalRelief: false,
  }
}

// Iteratively find the annual salary needed to achieve a target monthly saving
// given a fixed monthly expense in the target city
function findAnnualForTargetSaving(targetMonthlySaving, targetTotalMonthly) {
  // Start with a rough estimate (no tax)
  let testAnnual = (targetMonthlySaving + targetTotalMonthly) * 12
  for (let i = 0; i < 50; i++) {
    const tax = calculateTax(testAnnual)
    const netMonthly = (testAnnual - tax.totalTax) / 12
    const saving = netMonthly - targetTotalMonthly
    const diff = targetMonthlySaving - saving
    if (Math.abs(diff) < 50) break
    testAnnual += diff * 12
  }
  // Round up to nearest 10k for clean numbers
  return Math.ceil(testAnnual / 10000) * 10000
}

export function analyzeSwitch(data) {
  const {
    currentMonthlySalary, currentAnnualSalary,
    currentRent, currentFood, currentTransport, currentUtilities, currentMisc,
    homeVisitFrequency, homeVisitCostPerTrip,
    tripFrequency, tripCostPerTrip,
    targetRent, targetFood, targetTransport, targetUtilities, targetMisc,
    targetHomeVisitFrequency, targetHomeVisitCostPerTrip,
    targetTripFrequency, targetTripCostPerTrip,
  } = data

  // Current city calculations
  const currentMonthlyExpenses = currentRent + currentFood + currentTransport + currentUtilities + currentMisc
  const currentHomeVisitMonthly = (homeVisitFrequency * homeVisitCostPerTrip) / 12
  const currentTripMonthly = (tripFrequency * tripCostPerTrip) / 12
  const currentTotalMonthly = currentMonthlyExpenses + currentHomeVisitMonthly + currentTripMonthly
  const currentTax = calculateTax(currentAnnualSalary)
  const currentMonthlyTax = Math.round(currentTax.totalTax / 12)
  const currentMonthlySaving = currentMonthlySalary - currentTotalMonthly - currentMonthlyTax

  // Target city expense totals (salary-independent)
  const targetMonthlyExpenses = targetRent + targetFood + targetTransport + targetUtilities + targetMisc
  const targetHomeVisitMonthly = (targetHomeVisitFrequency * targetHomeVisitCostPerTrip) / 12
  const targetTripMonthly = (targetTripFrequency * targetTripCostPerTrip) / 12
  const targetTotalMonthly = targetMonthlyExpenses + targetHomeVisitMonthly + targetTripMonthly

  const expenseDiff = targetTotalMonthly - currentTotalMonthly

  // --- Compute 3 salary tiers ---
  // 1. Minimum: same monthly saving as current
  const minAnnual = findAnnualForTargetSaving(currentMonthlySaving, targetTotalMonthly)
  // 2. Comfortable: 10% more saving than current
  const comfortAnnual = findAnnualForTargetSaving(currentMonthlySaving * 1.10, targetTotalMonthly)
  // 3. Recommended: 20% more saving + buffer for unexpected costs
  const recommendedAnnual = findAnnualForTargetSaving(currentMonthlySaving * 1.20, targetTotalMonthly)

  // Build full analysis for each tier
  const buildTierAnalysis = (annual) => {
    const monthly = Math.round(annual / 12)
    const tax = calculateTax(annual)
    const monthlyTax = Math.round(tax.totalTax / 12)
    const monthlySaving = monthly - targetTotalMonthly - monthlyTax
    return {
      annualSalary: annual,
      monthlySalary: monthly,
      tax,
      monthlyTax,
      monthlySaving: Math.round(monthlySaving),
      annualSaving: Math.round(monthlySaving * 12),
      hikePercent: (((annual - currentAnnualSalary) / currentAnnualSalary) * 100).toFixed(1),
      hikeAmount: annual - currentAnnualSalary,
    }
  }

  const tiers = {
    minimum: buildTierAnalysis(minAnnual),
    comfortable: buildTierAnalysis(comfortAnnual),
    recommended: buildTierAnalysis(recommendedAnnual),
  }

  return {
    current: {
      monthlySalary: currentMonthlySalary,
      annualSalary: currentAnnualSalary,
      tax: currentTax,
      monthlyTax: currentMonthlyTax,
      expenses: {
        rent: currentRent, food: currentFood, transport: currentTransport,
        utilities: currentUtilities, misc: currentMisc,
        homeVisit: Math.round(currentHomeVisitMonthly),
        trips: Math.round(currentTripMonthly),
      },
      totalMonthlyExpense: Math.round(currentTotalMonthly),
      monthlySaving: Math.round(currentMonthlySaving),
      annualSaving: Math.round(currentMonthlySaving * 12),
    },
    targetExpenses: {
      rent: targetRent, food: targetFood, transport: targetTransport,
      utilities: targetUtilities, misc: targetMisc,
      homeVisit: Math.round(targetHomeVisitMonthly),
      trips: Math.round(targetTripMonthly),
      total: Math.round(targetTotalMonthly),
    },
    comparison: {
      expenseDiff: Math.round(expenseDiff),
      expenseDiffPercent: ((expenseDiff / currentTotalMonthly) * 100).toFixed(1),
    },
    tiers,
  }
}
