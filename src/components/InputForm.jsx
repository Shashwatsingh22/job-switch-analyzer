import { useState } from 'react'

// Realistic defaults based on 2025-26 market data
const CITY_DEFAULTS = {
  'Noida': { rent: 8000, food: 5000, transport: 2000, utilities: 2000, misc: 3000, homeVisitCost: 3000, tripCost: 5000 },
  'Bangalore': { rent: 18000, food: 8000, transport: 4000, utilities: 3000, misc: 5000, homeVisitCost: 12000, tripCost: 8000 },
  'Mumbai': { rent: 22000, food: 8000, transport: 3500, utilities: 3500, misc: 5000, homeVisitCost: 8000, tripCost: 7000 },
  'Hyderabad': { rent: 14000, food: 6500, transport: 3000, utilities: 2500, misc: 3500, homeVisitCost: 8000, tripCost: 6000 },
  'Pune': { rent: 14000, food: 6500, transport: 3000, utilities: 2500, misc: 3500, homeVisitCost: 6000, tripCost: 5000 },
  'Chennai': { rent: 14000, food: 6000, transport: 3000, utilities: 2500, misc: 3500, homeVisitCost: 8000, tripCost: 6000 },
  'Delhi': { rent: 12000, food: 6000, transport: 3000, utilities: 2500, misc: 3500, homeVisitCost: 2500, tripCost: 5000 },
  'Gurgaon': { rent: 15000, food: 7000, transport: 3500, utilities: 3000, misc: 4000, homeVisitCost: 3000, tripCost: 5000 },
  'Custom': { rent: 10000, food: 6000, transport: 3000, utilities: 2500, misc: 3000, homeVisitCost: 5000, tripCost: 5000 },
}

const HOME_CITIES = ['Varanasi', 'Lucknow', 'Patna', 'Jaipur', 'Bhopal', 'Kolkata', 'Other']

export default function InputForm({ onAnalyze }) {
  const [currentCity, setCurrentCity] = useState('Noida')
  const [targetCity, setTargetCity] = useState('Bangalore')
  const [homeCity, setHomeCity] = useState('Varanasi')

  const [form, setForm] = useState({
    // Your actual numbers
    currentMonthlySalary: 100000,
    currentAnnualSalary: 1275000,
    // Noida expenses: 93k - 70k saving = 23k base spend
    // Rent 8k, Food 5k, Transport 2k, Utilities 2k, Misc 3k = ~20k
    // (remaining 3k absorbed into misc/food variance)
    currentRent: 8000,
    currentFood: 5000,
    currentTransport: 2000,
    currentUtilities: 2000,
    currentMisc: 3000,
    // Home visits to Varanasi: ~4x/year, ~3k per trip (train/bus from Noida)
    homeVisitFrequency: 4,
    homeVisitCostPerTrip: 3000,
    // Riding trips: ~4x/year, ~5k per trip
    tripFrequency: 4,
    tripCostPerTrip: 5000,
    // Bangalore target expenses (market rates 2025-26)
    targetRent: 18000,
    targetFood: 8000,
    targetTransport: 4000,
    targetUtilities: 3000,
    targetMisc: 5000,
    // Flights BLR→VNS: avg ₹5-6k one-way, ~12k round trip
    targetHomeVisitFrequency: 4,
    targetHomeVisitCostPerTrip: 12000,
    // Riding trips from Bangalore cost more (fuel, longer routes)
    targetTripFrequency: 4,
    targetTripCostPerTrip: 8000,
  })

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: Number(value) || 0 }))
  }

  const handleCurrentCityChange = (city) => {
    setCurrentCity(city)
    const d = CITY_DEFAULTS[city] || CITY_DEFAULTS['Custom']
    setForm(prev => ({
      ...prev,
      currentRent: d.rent, currentFood: d.food, currentTransport: d.transport,
      currentUtilities: d.utilities, currentMisc: d.misc,
      homeVisitCostPerTrip: d.homeVisitCost, tripCostPerTrip: d.tripCost,
    }))
  }

  const handleTargetCityChange = (city) => {
    setTargetCity(city)
    const d = CITY_DEFAULTS[city] || CITY_DEFAULTS['Custom']
    setForm(prev => ({
      ...prev,
      targetRent: d.rent, targetFood: d.food, targetTransport: d.transport,
      targetUtilities: d.utilities, targetMisc: d.misc,
      targetHomeVisitCostPerTrip: d.homeVisitCost, targetTripCostPerTrip: d.tripCost,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onAnalyze({ ...form, currentCity, targetCity, homeCity })
  }

  // Live savings preview
  const currentBaseExpense = form.currentRent + form.currentFood + form.currentTransport + form.currentUtilities + form.currentMisc
  const currentTravelMonthly = Math.round((form.homeVisitFrequency * form.homeVisitCostPerTrip + form.tripFrequency * form.tripCostPerTrip) / 12)
  const currentSaving = form.currentMonthlySalary - currentBaseExpense - currentTravelMonthly

  const Field = ({ label, field, prefix = '₹' }) => (
    <div className="field">
      <label>{label}</label>
      <div className="input-wrap">
        {prefix && <span className="prefix">{prefix}</span>}
        <input
          type="number"
          value={form[field]}
          onChange={e => handleChange(field, e.target.value)}
        />
      </div>
    </div>
  )

  return (
    <form className="input-form" onSubmit={handleSubmit}>
      {/* Salary Section */}
      <section className="form-section">
        <h2>💰 Current Salary</h2>
        <div className="field-row">
          <Field label="Monthly In-Hand" field="currentMonthlySalary" />
          <Field label="Annual CTC" field="currentAnnualSalary" />
        </div>
        <p className="hint">
          CTC ₹{(form.currentAnnualSalary / 100000).toFixed(1)}L → {form.currentAnnualSalary <= 1275000 ? 'No tax (under ₹12.75L)' : 'Tax applicable'}
        </p>
      </section>

      {/* Current City */}
      <section className="form-section">
        <h2>📍 Current City — {currentCity}</h2>
        <div className="field">
          <label>Current City</label>
          <select value={currentCity} onChange={e => handleCurrentCityChange(e.target.value)}>
            {Object.keys(CITY_DEFAULTS).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="field-grid">
          <Field label="Rent" field="currentRent" />
          <Field label="Food" field="currentFood" />
          <Field label="Transport" field="currentTransport" />
          <Field label="Utilities" field="currentUtilities" />
          <Field label="Misc" field="currentMisc" />
        </div>
        <p className="hint">Base monthly spend: ₹{currentBaseExpense.toLocaleString('en-IN')}</p>
      </section>

      {/* Home Visit & Trips */}
      <section className="form-section">
        <h2>🏠 Home Visits & 🏍️ Trips (from {currentCity})</h2>
        <div className="field">
          <label>Home City</label>
          <select value={homeCity} onChange={e => setHomeCity(e.target.value)}>
            {HOME_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="field-grid">
          <Field label="Home Visits / Year" field="homeVisitFrequency" prefix="" />
          <Field label="Cost per Home Visit" field="homeVisitCostPerTrip" />
          <Field label="Riding Trips / Year" field="tripFrequency" prefix="" />
          <Field label="Cost per Trip" field="tripCostPerTrip" />
        </div>
        <p className="hint">
          Travel adds ~₹{currentTravelMonthly.toLocaleString('en-IN')}/mo → Effective saving: ₹{currentSaving.toLocaleString('en-IN')}/mo
        </p>
      </section>

      {/* Target City */}
      <section className="form-section">
        <h2>🎯 Target City — {targetCity}</h2>
        <div className="field">
          <label>Target City</label>
          <select value={targetCity} onChange={e => handleTargetCityChange(e.target.value)}>
            {Object.keys(CITY_DEFAULTS).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="field-grid">
          <Field label="Rent" field="targetRent" />
          <Field label="Food" field="targetFood" />
          <Field label="Transport" field="targetTransport" />
          <Field label="Utilities" field="targetUtilities" />
          <Field label="Misc" field="targetMisc" />
        </div>
      </section>

      {/* Target Home Visit & Trips */}
      <section className="form-section">
        <h2>✈️ Home Visits & 🏍️ Trips (from {targetCity})</h2>
        <p className="hint">Flights from {targetCity} to {homeCity} will cost more than train/bus from {currentCity}</p>
        <div className="field-grid">
          <Field label="Home Visits / Year" field="targetHomeVisitFrequency" prefix="" />
          <Field label="Cost per Visit (incl. flight)" field="targetHomeVisitCostPerTrip" />
          <Field label="Riding Trips / Year" field="targetTripFrequency" prefix="" />
          <Field label="Cost per Trip" field="targetTripCostPerTrip" />
        </div>
      </section>

      <button type="submit" className="analyze-btn">📊 Calculate Required Salary</button>
    </form>
  )
}
