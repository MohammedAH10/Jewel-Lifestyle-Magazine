import { useState, useEffect } from 'react'
import { api } from '@/api/client'
import { Loader2, Download, Trash2, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function SubscribersAdmin() {
  const [subscribers, setSubscribers] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchSubscribers = async () => {
    try {
      setLoading(true)
      const data = await api.get('/subscribers')
      setSubscribers(data)
    } catch (err) {
      console.error('Failed to load subscribers', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubscribers()
  }, [])

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this subscriber?')) return
    await api.delete(`/subscribers/${id}`)
    fetchSubscribers()
  }

  const handleExportCSV = () => {
    const csv = [
      'Name,Email,Subscribed Date',
      ...subscribers.map((s) =>
        `"${(s.name || '').replace(/"/g, '""')}","${s.email.replace(/"/g, '""')}","${s.subscribed_date || ''}"`
      ),
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `subscribers_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const formatDate = (d) => {
    if (!d) return '—'
    try {
      return new Date(d).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    } catch {
      return d
    }
  }

  const activeCount = subscribers.filter((s) => s.is_active !== false).length

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <p className="text-white/60">Manage newsletter subscribers</p>
          <p className="text-gold text-sm mt-1">
            {activeCount} active subscriber{activeCount !== 1 ? 's' : ''} ({subscribers.length} total)
          </p>
        </div>
        <Button
          onClick={handleExportCSV}
          variant="outline"
          className="border-gold/30 text-gold"
        >
          <Download size={18} className="mr-2" />
          Export CSV
        </Button>
      </div>

      <div className="bg-black border border-gold/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gold/10">
                <th className="text-left px-6 py-4 text-white/60 text-sm font-normal">Email</th>
                <th className="text-left px-6 py-4 text-white/60 text-sm font-normal">Name</th>
                <th className="text-left px-6 py-4 text-white/60 text-sm font-normal">Subscribed Date</th>
                <th className="text-left px-6 py-4 text-white/60 text-sm font-normal">Status</th>
                <th className="text-right px-6 py-4 text-white/60 text-sm font-normal">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Loader2 className="w-6 h-6 text-gold animate-spin mx-auto" />
                  </td>
                </tr>
              ) : subscribers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-white/50">
                    No subscribers yet
                  </td>
                </tr>
              ) : (
                subscribers.map((subscriber) => (
                  <tr key={subscriber.id} className="border-b border-gold/10 hover:bg-gold/5">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Mail size={16} className="text-gold/50" />
                        <span className="text-white">{subscriber.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white/70">
                      {subscriber.name || '—'}
                    </td>
                    <td className="px-6 py-4 text-white/60 text-sm whitespace-nowrap">
                      {formatDate(subscriber.subscribed_date)}
                    </td>
                    <td className="px-6 py-4">
                      {subscriber.is_active !== false ? (
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(subscriber.id)}
                          className="text-white/60 hover:text-red-400"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
