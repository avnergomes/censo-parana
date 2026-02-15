import { LayoutDashboard, Map, Building2, Trophy, Users } from 'lucide-react'

const ICONS = {
  LayoutDashboard,
  Map,
  Building2,
  Trophy,
  Users,
}

export default function Tabs({ tabs, activeTab, onChange }) {
  return (
    <div className="flex flex-wrap gap-2 mt-6">
      {tabs.map(tab => {
        const Icon = ICONS[tab.icon]
        const isActive = activeTab === tab.id

        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm
              transition-all duration-200
              ${isActive
                ? 'bg-primary-600 text-white shadow-md'
                : 'bg-white text-dark-600 hover:bg-dark-100 border border-dark-200'
              }
            `}
          >
            {Icon && <Icon className="w-4 h-4" />}
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
