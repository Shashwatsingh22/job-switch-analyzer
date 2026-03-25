import { useState } from 'react'
import InputForm from './components/InputForm'
import AnalysisReport from './components/AnalysisReport'
import { analyzeSwitch } from './utils/analyzer'
import './App.css'

function App() {
  const [analysis, setAnalysis] = useState(null)
  const [formData, setFormData] = useState(null)

  const handleAnalyze = (data) => {
    setFormData(data)
    const result = analyzeSwitch(data)
    setAnalysis(result)
  }

  const handleReset = () => {
    setAnalysis(null)
    setFormData(null)
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🔄 Job Switch Analyzer</h1>
        <p>Compare your finances across cities before making the move</p>
      </header>
      <main>
        {!analysis ? (
          <InputForm onAnalyze={handleAnalyze} />
        ) : (
          <AnalysisReport analysis={analysis} formData={formData} onReset={handleReset} />
        )}
      </main>
      <footer className="app-footer">
        <p>Built for smart career decisions • Tax slabs as per India FY 2025-26 New Regime</p>
      </footer>
    </div>
  )
}

export default App
