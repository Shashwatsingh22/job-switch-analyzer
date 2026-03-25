import { useRef, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { exportCSV, exportExcel } from '../utils/exportData'

const INR = (n) => '₹' + Math.round(n).toLocaleString('en-IN')
const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6']

export default function AnalysisReport({ analysis, formData, onReset }) {
  const reportRef = useRef()
  const [showExportMenu, setShowExportMenu] = useState(false)
  const { current, targetExpenses, comparison, tiers } = analysis

  const downloadPDF = async () => {
    setShowExportMenu(false)
    const el = reportRef.current
    const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#0f172a' })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pdfW = pdf.internal.pageSize.getWidth()
    const pdfH = (canvas.height * pdfW) / canvas.width
    let position = 0
    const pageH = pdf.internal.pageSize.getHeight()
    while (position < pdfH) {
      if (position > 0) pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, -position, pdfW, pdfH)
      position += pageH
    }
    pdf.save(`job-switch-${formData.currentCity}-to-${formData.targetCity}.pdf`)
  }

  const handleExportCSV = () => {
    setShowExportMenu(false)
    exportCSV(analysis, formData)
  }

  const handleExportExcel = () => {
    setShowExportMenu(false)
    exportExcel(analysis, formData)
  }

  const expenseCompareData = [
    { name: 'Rent', current: current.expenses.rent, target: targetExpenses.rent },
    { name: 'Food', current: current.expenses.food, target: targetExpenses.food },
    { name: 'Transport', current: current.expenses.transport, target: targetExpenses.transport },
    { name: 'Utilities', current: current.expenses.utilities, target: targetExpenses.utilities },
    { name: 'Misc', current: current.expenses.misc, target: targetExpenses.misc },
    { name: 'Home Visits', current: current.expenses.homeVisit, target: targetExpenses.homeVisit },
    { name: 'Trips', current: current.expenses.trips, target: targetExpenses.trips },
  ]

  const salaryTierData = [
    { name: 'Minimum', salary: tiers.minimum.monthlySalary, saving: tiers.minimum.monthlySaving, tax: tiers.minimum.monthlyTax },
    { name: 'Comfortable', salary: tiers.comfortable.monthlySalary, saving: tiers.comfortable.monthlySaving, tax: tiers.comfortable.monthlyTax },
    { name: 'Recommended', salary: tiers.recommended.monthlySalary, saving: tiers.recommended.monthlySaving, tax: tiers.recommended.monthlyTax },
  ]

  const currentPieData = Object.entries(current.expenses)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => ({ name: k.charAt(0).toUpperCase() + k.slice(1), value: v }))

  const targetPieData = Object.entries(targetExpenses)
    .filter(([k, v]) => v > 0 && k !== 'total')
    .map(([k, v]) => ({ name: k.charAt(0).toUpperCase() + k.slice(1), value: v }))

  return (
    <div className="report-wrapper">
      <div className="report-actions">
        <button onClick={onReset} className="btn-secondary">← Back to Input</button>
        <div className="export-dropdown">
          <button onClick={() => setShowExportMenu(!showExportMenu)} className="btn-primary">
            📥 Export ▾
          </button>
          {showExportMenu && (
            <div className="export-menu">
              <button onClick={downloadPDF}>📄 PDF (with charts)</button>
              <button onClick={handleExportExcel}>📊 Excel (.xlsx)</button>
              <button onClick={handleExportCSV}>📝 CSV</button>
            </div>
          )}
        </div>
      </div>

      <div ref={reportRef} className="report">
        <h2 className="report-title">
          Job Switch Analysis: {formData.currentCity} → {formData.targetCity}
        </h2>

        {/* Recommended Salary Banner */}
        <div className="verdict positive">
          <span className="verdict-icon">🎯</span>
          <div>
            <strong>Ask for at least {INR(tiers.recommended.annualSalary)}/year ({INR(tiers.recommended.monthlySalary)}/mo)</strong>
            <p>That's a {tiers.recommended.hikePercent}% hike — gives you 20% more savings than today even after higher expenses &amp; tax</p>
          </div>
        </div>

        {/* Salary Tiers */}
        <div className="salary-tiers">
          <h3>💰 Salary You Should Ask For</h3>
          <div className="tier-cards">
            <div className="tier-card">
              <span className="tier-label">🔻 Minimum</span>
              <span className="tier-desc">Same savings as now</span>
              <span className="tier-salary">{INR(tiers.minimum.annualSalary)}/yr</span>
              <span className="tier-monthly">{INR(tiers.minimum.monthlySalary)}/mo</span>
              <span className="tier-hike">↑ {tiers.minimum.hikePercent}% hike</span>
              <span className="tier-saving">Saves {INR(tiers.minimum.monthlySaving)}/mo</span>
              <span className="tier-tax">Tax: {INR(tiers.minimum.tax.totalTax)}/yr ({tiers.minimum.tax.effectiveRate}%)</span>
            </div>
            <div className="tier-card comfortable">
              <span className="tier-label">✅ Comfortable</span>
              <span className="tier-desc">10% more savings</span>
              <span className="tier-salary">{INR(tiers.comfortable.annualSalary)}/yr</span>
              <span className="tier-monthly">{INR(tiers.comfortable.monthlySalary)}/mo</span>
              <span className="tier-hike">↑ {tiers.comfortable.hikePercent}% hike</span>
              <span className="tier-saving">Saves {INR(tiers.comfortable.monthlySaving)}/mo</span>
              <span className="tier-tax">Tax: {INR(tiers.comfortable.tax.totalTax)}/yr ({tiers.comfortable.tax.effectiveRate}%)</span>
            </div>
            <div className="tier-card recommended">
              <span className="tier-label">🚀 Recommended</span>
              <span className="tier-desc">20% more savings + buffer</span>
              <span className="tier-salary">{INR(tiers.recommended.annualSalary)}/yr</span>
              <span className="tier-monthly">{INR(tiers.recommended.monthlySalary)}/mo</span>
              <span className="tier-hike">↑ {tiers.recommended.hikePercent}% hike</span>
              <span className="tier-saving">Saves {INR(tiers.recommended.monthlySaving)}/mo</span>
              <span className="tier-tax">Tax: {INR(tiers.recommended.tax.totalTax)}/yr ({tiers.recommended.tax.effectiveRate}%)</span>
            </div>
          </div>
        </div>

        {/* Current Situation Summary */}
        <div className="current-summary">
          <h3>📍 Your Current Situation — {formData.currentCity}</h3>
          <div className="key-numbers">
            <div className="kn-card">
              <span className="kn-label">Monthly In-Hand</span>
              <span className="kn-value">{INR(current.monthlySalary)}</span>
            </div>
            <div className="kn-card">
              <span className="kn-label">Monthly Expenses</span>
              <span className="kn-value">{INR(current.totalMonthlyExpense)}</span>
            </div>
            <div className="kn-card">
              <span className="kn-label">Monthly Tax</span>
              <span className="kn-value">{INR(current.monthlyTax)}</span>
              <span className="kn-sub">{current.tax.marginalRelief ? 'No tax (≤₹12.75L)' : current.tax.effectiveRate + '%'}</span>
            </div>
            <div className="kn-card accent">
              <span className="kn-label">Monthly Savings</span>
              <span className="kn-value">{INR(current.monthlySaving)}</span>
              <span className="kn-sub">{INR(current.annualSaving)}/yr</span>
            </div>
          </div>
        </div>

        {/* Expense Comparison Table */}
        <div className="comparison-table">
          <h3>Monthly Expense Comparison</h3>
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>{formData.currentCity}</th>
                <th>{formData.targetCity}</th>
                <th>Difference</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Rent</td><td>{INR(current.expenses.rent)}</td><td>{INR(targetExpenses.rent)}</td><td className={targetExpenses.rent <= current.expenses.rent ? 'pos' : 'neg'}>{INR(targetExpenses.rent - current.expenses.rent)}</td></tr>
              <tr><td>Food</td><td>{INR(current.expenses.food)}</td><td>{INR(targetExpenses.food)}</td><td className={targetExpenses.food <= current.expenses.food ? 'pos' : 'neg'}>{INR(targetExpenses.food - current.expenses.food)}</td></tr>
              <tr><td>Transport</td><td>{INR(current.expenses.transport)}</td><td>{INR(targetExpenses.transport)}</td><td className={targetExpenses.transport <= current.expenses.transport ? 'pos' : 'neg'}>{INR(targetExpenses.transport - current.expenses.transport)}</td></tr>
              <tr><td>Utilities</td><td>{INR(current.expenses.utilities)}</td><td>{INR(targetExpenses.utilities)}</td><td className={targetExpenses.utilities <= current.expenses.utilities ? 'pos' : 'neg'}>{INR(targetExpenses.utilities - current.expenses.utilities)}</td></tr>
              <tr><td>Misc</td><td>{INR(current.expenses.misc)}</td><td>{INR(targetExpenses.misc)}</td><td className={targetExpenses.misc <= current.expenses.misc ? 'pos' : 'neg'}>{INR(targetExpenses.misc - current.expenses.misc)}</td></tr>
              <tr><td>Home Visits (avg/mo)</td><td>{INR(current.expenses.homeVisit)}</td><td>{INR(targetExpenses.homeVisit)}</td><td className={targetExpenses.homeVisit <= current.expenses.homeVisit ? 'pos' : 'neg'}>{INR(targetExpenses.homeVisit - current.expenses.homeVisit)}</td></tr>
              <tr><td>Riding Trips (avg/mo)</td><td>{INR(current.expenses.trips)}</td><td>{INR(targetExpenses.trips)}</td><td className={targetExpenses.trips <= current.expenses.trips ? 'pos' : 'neg'}>{INR(targetExpenses.trips - current.expenses.trips)}</td></tr>
              <tr className="total"><td>Total</td><td>{INR(current.totalMonthlyExpense)}</td><td>{INR(targetExpenses.total)}</td><td className="neg">{INR(comparison.expenseDiff)} ({comparison.expenseDiffPercent}%↑)</td></tr>
            </tbody>
          </table>
        </div>

        {/* Tax Impact at Recommended Salary */}
        <div className="tax-section">
          <h3>Tax Impact (New Regime FY 2025-26)</h3>
          <div className="tax-cards">
            <div className="tax-card">
              <h4>{formData.currentCity} — Current</h4>
              <p>CTC: {INR(current.annualSalary)}</p>
              <p>Taxable: {INR(current.tax.taxableIncome)}</p>
              <p>Tax: {INR(current.tax.tax)} {current.tax.marginalRelief && <span className="badge">No Tax (≤₹12.75L)</span>}</p>
              <p>Cess: {INR(current.tax.cess)}</p>
              <p className="tax-total">Total: {INR(current.tax.totalTax)}/yr</p>
            </div>
            <div className="tax-card">
              <h4>{formData.targetCity} — At Recommended CTC</h4>
              <p>CTC: {INR(tiers.recommended.annualSalary)}</p>
              <p>Taxable: {INR(tiers.recommended.tax.taxableIncome)}</p>
              <p>Tax: {INR(tiers.recommended.tax.tax)}</p>
              <p>Cess: {INR(tiers.recommended.tax.cess)}</p>
              <p className="tax-total">Total: {INR(tiers.recommended.tax.totalTax)}/yr ({tiers.recommended.tax.effectiveRate}%)</p>
            </div>
          </div>
          <p className="hint" style={{ marginTop: 12 }}>
            Extra tax you'll pay: {INR(tiers.recommended.tax.totalTax - current.tax.totalTax)}/yr
            ({INR(Math.round((tiers.recommended.tax.totalTax - current.tax.totalTax) / 12))}/mo)
          </p>
        </div>

        {/* Charts */}
        <div className="charts-section">
          <h3>Visual Comparison</h3>

          <div className="chart-container">
            <h4>Expense Breakdown — {formData.currentCity} vs {formData.targetCity}</h4>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={expenseCompareData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" tickFormatter={v => '₹' + (v/1000) + 'k'} />
                <Tooltip formatter={v => INR(v)} contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
                <Legend />
                <Bar dataKey="current" name={formData.currentCity} fill="#6366f1" radius={[4,4,0,0]} />
                <Bar dataKey="target" name={formData.targetCity} fill="#f59e0b" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-container">
            <h4>Salary Tiers — Monthly Breakdown</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salaryTierData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" tickFormatter={v => '₹' + (v/1000) + 'k'} />
                <Tooltip formatter={v => INR(v)} contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
                <Legend />
                <Bar dataKey="salary" name="Gross Salary" fill="#6366f1" radius={[4,4,0,0]} />
                <Bar dataKey="tax" name="Tax" fill="#ef4444" radius={[4,4,0,0]} />
                <Bar dataKey="saving" name="Savings" fill="#10b981" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="pie-row">
            <div className="chart-container half">
              <h4>{formData.currentCity} Expense Split</h4>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={currentPieData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}>
                    {currentPieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={v => INR(v)} contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-container half">
              <h4>{formData.targetCity} Expense Split</h4>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={targetPieData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}>
                    {targetPieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={v => INR(v)} contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recommendation */}
        <div className="recommendation">
          <h3>💡 Negotiation Strategy</h3>
          <p>
            Your expenses jump from <strong>{INR(current.totalMonthlyExpense)}</strong> to <strong>{INR(targetExpenses.total)}</strong>/mo
            ({comparison.expenseDiffPercent}% increase) in {formData.targetCity}. The biggest hits are rent (+{INR(targetExpenses.rent - current.expenses.rent)})
            and flights home (+{INR(targetExpenses.homeVisit - current.expenses.homeVisit)}/mo avg).
          </p>
          <p style={{ marginTop: 10 }}>
            <strong>Floor:</strong> Don't go below {INR(tiers.minimum.annualSalary)}/yr — that just matches your current savings.
            <br />
            <strong>Target:</strong> Push for {INR(tiers.recommended.annualSalary)}/yr ({tiers.recommended.hikePercent}% hike) — this gives you
            {' '}{INR(tiers.recommended.monthlySaving)}/mo savings after all expenses and {INR(tiers.recommended.tax.totalTax)}/yr tax.
          </p>
        </div>
      </div>
    </div>
  )
}
