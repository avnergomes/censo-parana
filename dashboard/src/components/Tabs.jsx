import { useState, useRef, useEffect, useCallback } from 'react'
import { LayoutDashboard, Map, Building2, Trophy, Users, ChevronLeft, ChevronRight } from 'lucide-react'

const ICONS = {
  LayoutDashboard,
  Map,
  Building2,
  Trophy,
  Users,
}

export default function Tabs({ tabs, activeTab, onChange }) {
  const scrollRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const checkScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 2)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2)
  }, [])

  useEffect(() => {
    checkScroll()
    const el = scrollRef.current
    if (!el) return
    el.addEventListener('scroll', checkScroll, { passive: true })
    window.addEventListener('resize', checkScroll)
    return () => {
      el.removeEventListener('scroll', checkScroll)
      window.removeEventListener('resize', checkScroll)
    }
  }, [checkScroll])

  const scroll = (direction) => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: direction * 160, behavior: 'smooth' })
  }

  return (
    <div
      className={`tab-scroll-container relative mt-6 ${canScrollLeft ? 'can-scroll-left' : ''} ${canScrollRight ? 'can-scroll-right' : ''}`}
    >
      {canScrollLeft && (
        <button
          onClick={() => scroll(-1)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white shadow border border-dark-200 text-dark-500 hover:bg-dark-50 sm:hidden"
          aria-label="Rolar para esquerda"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}

      <div
        ref={scrollRef}
        role="tablist"
        className="flex gap-2 overflow-x-auto scrollbar-none sm:flex-wrap"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {tabs.map(tab => {
          const Icon = ICONS[tab.icon]
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-3 rounded-lg font-medium text-sm
                whitespace-nowrap transition-all duration-200
                ${isActive
                  ? 'bg-accent-600 text-white shadow-md scale-[1.03]'
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

      {canScrollRight && (
        <button
          onClick={() => scroll(1)}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white shadow border border-dark-200 text-dark-500 hover:bg-dark-50 sm:hidden"
          aria-label="Rolar para direita"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
