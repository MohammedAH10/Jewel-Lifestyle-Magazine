import React, { useState, useEffect } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { api } from '@/api/client'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Newspaper, Users, Award, Image, BookOpen,
  Mail, MessageSquare, LogOut, Menu, X, ChevronRight,
  FileText, BarChart3, TrendingUp, Eye, Shield
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { createPageUrl } from '@/utils'
import InterviewsAdmin from '@/components/admin/InterviewsAdmin'
import MagazineAdmin from '@/components/admin/MagazineAdmin'
import AwardsAdmin from '@/components/admin/AwardsAdmin'
import HeroSlidesAdmin from '@/components/admin/HeroSlidesAdmin'
import TeamAdmin from '@/components/admin/TeamAdmin'
import SubmissionsAdmin from '@/components/admin/SubmissionsAdmin'
import SubscribersAdmin from '@/components/admin/SubscribersAdmin'
import InquiriesAdmin from '@/components/admin/InquiriesAdmin'
import DevicesAdmin from '@/components/admin/DevicesAdmin'

const navItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'hero-slides', label: 'Hero Slides', icon: Image },
  { id: 'interviews', label: 'Executive Interviews', icon: Users },
  { id: 'magazine', label: 'Digital Magazine', icon: BookOpen },
  { id: 'awards', label: 'Awards & Winners', icon: Award },
  { id: 'team', label: 'Team Members', icon: Newspaper },
  { id: 'submissions', label: 'Story Submissions', icon: MessageSquare },
  { id: 'inquiries', label: 'Ad Inquiries', icon: MessageSquare },
  { id: 'subscribers', label: 'Subscribers', icon: Mail },
  { id: 'devices', label: 'Devices', icon: Shield },
]

function ErrorFallback({ error, reset }) {
  return (
    <div className="p-8 text-center">
      <p className="text-red-400 font-gilda text-xl mb-4">Something went wrong</p>
      <pre className="text-white/50 text-sm mb-4 max-w-xl mx-auto overflow-auto">{error?.message}</pre>
      <button onClick={reset} className="gradient-gold text-black px-6 py-2 text-sm uppercase tracking-wider">Retry</button>
    </div>
  )
}

class AdminErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null } }
  static getDerivedStateFromError(error) { return { error } }
  render() {
    if (this.state.error) {
      return <ErrorFallback error={this.state.error} reset={() => this.setState({ error: null })} />
    }
    return this.props.children
  }
}

export default function AdminDashboard() {
  const { user, isAuthenticated, isLoadingAuth, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [stats, setStats] = useState({ interviews: 0, subscribers: 0, submissions: 0, magazines: 0, inquiries: 0 })
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    if (activeTab === 'overview') {
      async function fetchStats() {
        setLoadingStats(true)
        try {
          const [interviews, subscribers, submissions, magazines, inquiries] = await Promise.all([
            api.get('/executives').then(d => d.length),
            api.get('/subscribers').then(d => d.length),
            api.get('/stories').then(d => d.length),
            api.get('/magazines').then(d => d.length),
            api.get('/inquiries').then(d => d.length),
          ])
          setStats({ interviews, subscribers, submissions, magazines, inquiries })
        } catch {
          // stats stay at 0
        } finally {
          setLoadingStats(false)
        }
      }
      fetchStats()
    }
  }, [activeTab])

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-gilda text-xl text-gold/60">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <p className="font-gilda text-2xl text-gold mb-4">Access Denied</p>
          <p className="text-white/50 mb-6">You must be logged in to access this page.</p>
          <Link
            to={createPageUrl('Home')}
            className="inline-block px-6 py-3 gradient-gold text-black font-semibold rounded"
          >
            Go Home
          </Link>
        </div>
      </div>
    )
  }

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <p className="font-gilda text-2xl text-gold mb-4">Access Denied</p>
          <p className="text-white/50 mb-6">You do not have permission to view this page.</p>
          <Link
            to={createPageUrl('Home')}
            className="inline-block px-6 py-3 gradient-gold text-black font-semibold rounded"
          >
            Go Home
          </Link>
        </div>
      </div>
    )
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab stats={stats} loading={loadingStats} />
      case 'hero-slides':
        return <HeroSlidesAdmin />
      case 'interviews':
        return <InterviewsAdmin />
      case 'magazine':
        return <MagazineAdmin />
      case 'awards':
        return <AwardsAdmin />
      case 'team':
        return <TeamAdmin />
      case 'submissions':
        return <SubmissionsAdmin />
      case 'inquiries':
        return <InquiriesAdmin />
      case 'subscribers':
        return <SubscribersAdmin />
      case 'devices':
        return <DevicesAdmin />
      default:
        return <OverviewTab stats={stats} loading={loadingStats} />
    }
  }

  return (
    <div className="min-h-screen bg-zinc-900 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-black border-r border-gold/10 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo area */}
          <div className="flex items-center justify-between px-6 py-6 border-b border-gold/10">
            <div>
              <Link to={createPageUrl('Home')} className="font-gilda text-xl text-gold">
                Jewel Magazine
              </Link>
              <p className="text-xs text-gold/50 mt-0.5">Admin Panel</p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gold/60 hover:text-gold"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id)
                    setSidebarOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === item.id
                      ? 'bg-gold/20 text-gold shadow-sm shadow-gold/5'
                      : 'text-white/50 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                  {activeTab === item.id && (
                    <ChevronRight size={16} className="ml-auto text-gold/60" />
                  )}
                </button>
              )
            })}
          </nav>

          {/* User info & logout */}
          <div className="px-3 py-4 border-t border-gold/10">
            <div className="px-4 py-3 mb-2">
              <p className="text-sm text-white/80 truncate">{user?.name || user?.email}</p>
              <p className="text-xs text-gold/50 capitalize">{user?.role}</p>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-zinc-900/90 backdrop-blur-sm border-b border-gold/10 px-4 lg:px-8 py-4 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gold/60 hover:text-gold transition-colors"
          >
            <Menu size={24} />
          </button>
          <div>
            <h1 className="font-gilda text-xl text-gold">
              {navItems.find((n) => n.id === activeTab)?.label || 'Dashboard'}
            </h1>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <AdminErrorBoundary>
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              {renderContent()}
            </motion.div>
          </AdminErrorBoundary>
        </main>
      </div>
    </div>
  )
}

function OverviewTab({ stats, loading }) {
  const statCards = [
    { label: 'Total Interviews', value: stats.interviews, icon: Users, color: 'from-blue-500/20 to-blue-600/10', border: 'border-blue-500/30' },
    { label: 'Total Subscribers', value: stats.subscribers, icon: Mail, color: 'from-green-500/20 to-green-600/10', border: 'border-green-500/30' },
    { label: 'Total Submissions', value: stats.submissions, icon: MessageSquare, color: 'from-purple-500/20 to-purple-600/10', border: 'border-purple-500/30' },
    { label: 'Magazine Issues', value: stats.magazines, icon: BookOpen, color: 'from-amber-500/20 to-amber-600/10', border: 'border-amber-500/30' },
  ]

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <motion.div
              key={card.label}
              whileHover={{ y: -2 }}
              className={`relative overflow-hidden bg-gradient-to-br ${card.color} border ${card.border} p-6`}
            >
              {loading ? (
                <div className="flex items-center justify-center h-24">
                  <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-white/60 mb-1">{card.label}</p>
                    <p className="text-3xl font-bold text-white">{card.value}</p>
                    <p className="text-xs text-white/30 mt-2">All time</p>
                  </div>
                  <div className="p-3 bg-black/30 rounded-full">
                    <Icon size={24} className="text-gold" />
                  </div>
                </div>
              )}
              {/* Decorative line */}
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gold/40 to-transparent" />
            </motion.div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="font-gilda text-lg text-gold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <ActionCard
            icon={FileText}
            label="New Interview"
            description="Add an executive interview"
            onClick={() => {}}
          />
          <ActionCard
            icon={Image}
            label="Hero Slides"
            description="Update homepage slides"
            onClick={() => {}}
          />
          <ActionCard
            icon={BarChart3}
            label="View Analytics"
            description="Track site performance"
            onClick={() => {}}
          />
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div>
        <h2 className="font-gilda text-lg text-gold mb-4">Quick Stats</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatBar label="Interviews" value={stats.interviews} max={Math.max(stats.interviews, 1)} icon={TrendingUp} />
          <StatBar label="Subscribers" value={stats.subscribers} max={Math.max(stats.subscribers, 1)} icon={Eye} />
          <StatBar label="Submissions" value={stats.submissions} max={Math.max(stats.submissions, 1)} icon={MessageSquare} />
        </div>
      </div>
    </div>
  )
}

function ActionCard({ icon: Icon, label, description, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-4 bg-black/50 border border-gold/10 p-5 hover:border-gold/30 hover:bg-black/70 transition-all duration-200 text-left"
    >
      <div className="p-3 bg-gold/10 rounded-full shrink-0">
        <Icon size={22} className="text-gold" />
      </div>
      <div>
        <p className="text-white font-medium mb-0.5">{label}</p>
        <p className="text-xs text-white/50">{description}</p>
      </div>
    </button>
  )
}

function StatBar({ label, value, max, icon: Icon }) {
  const percentage = max > 0 ? (value / max) * 100 : 0
  return (
    <div className="bg-black/50 border border-gold/10 p-5">
      <div className="flex items-center gap-3 mb-3">
        <Icon size={16} className="text-gold/60" />
        <p className="text-sm text-white/70">{label}</p>
      </div>
      <p className="text-2xl font-bold text-white mb-2">{value}</p>
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-gold to-gold/60 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
