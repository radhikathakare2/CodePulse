import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

export default function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-dark bg-mesh">
      <Navbar />
      <Sidebar collapsed={sidebarCollapsed} />
      <main
        className="pt-16 min-h-screen transition-all duration-300"
        style={{ marginLeft: sidebarCollapsed ? '4rem' : '15rem' }}
      >
        <div className="p-6 max-w-screen-xl">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
