import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Home } from './pages/Home'
import { SpellSearchPage } from './pages/SpellSearchPage'
import { EntitySelectorsPage } from './pages/EntitySelectorsPage'
import { EntityManagementPage } from './pages/EntityManagementPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/spell-search" element={<SpellSearchPage />} />
        <Route path="/entity-selectors" element={<EntitySelectorsPage />} />
        <Route path="/entity-management" element={<EntityManagementPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
