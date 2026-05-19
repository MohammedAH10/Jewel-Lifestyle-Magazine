import { useState, useEffect } from 'react'
import { api } from '@/api/client'
import { Loader2, Eye, Check, X, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const statusOptions = ['Pending', 'Reviewed', 'Approved', 'Rejected']

const statusColors = {
  Pending: 'bg-yellow-500/20 text-yellow-400',
  Reviewed: 'bg-blue-500/20 text-blue-400',
  Approved: 'bg-green-500/20 text-green-400',
  Rejected: 'bg-red-500/20 text-red-400',
}

export default function SubmissionsAdmin() {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)

  const fetchSubmissions = async () => {
    try {
      setLoading(true)
      const data = await api.get('/stories')
      setSubmissions(data)
    } catch (err) {
      console.error('Failed to load submissions', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubmissions()
  }, [])

  const handleStatusChange = async (id, status) => {
    await api.put(`/stories/${id}`, { status })
    setSubmissions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status } : s))
    )
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this submission?')) return
    await api.delete(`/stories/${id}`)
    fetchSubmissions()
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

  return (
    <div className="space-y-6">
      <p className="text-white/60">Manage story submissions from readers</p>

      <div className="bg-black border border-gold/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gold/10">
                <th className="text-left px-6 py-4 text-white/60 text-sm font-normal">Name</th>
                <th className="text-left px-6 py-4 text-white/60 text-sm font-normal">Email</th>
                <th className="text-left px-6 py-4 text-white/60 text-sm font-normal">Story Title</th>
                <th className="text-left px-6 py-4 text-white/60 text-sm font-normal">Type</th>
                <th className="text-left px-6 py-4 text-white/60 text-sm font-normal">Status</th>
                <th className="text-left px-6 py-4 text-white/60 text-sm font-normal">Date</th>
                <th className="text-right px-6 py-4 text-white/60 text-sm font-normal">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Loader2 className="w-6 h-6 text-gold animate-spin mx-auto" />
                  </td>
                </tr>
              ) : submissions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-white/50">
                    No story submissions yet
                  </td>
                </tr>
              ) : (
                submissions.map((submission) => (
                  <tr key={submission.id} className="border-b border-gold/10 hover:bg-gold/5">
                    <td className="px-6 py-4 text-white">{submission.name}</td>
                    <td className="px-6 py-4 text-white/70">{submission.email}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-white truncate max-w-[200px]">{submission.story_title}</span>
                        <button
                          onClick={() => setExpanded(expanded === submission.id ? null : submission.id)}
                          className="text-gold text-xs hover:underline mt-1 flex items-center gap-1"
                        >
                          <Eye size={12} />
                          {expanded === submission.id ? 'Hide' : 'View'} description
                        </button>
                        {expanded === submission.id && submission.story_description && (
                          <p className="text-white/60 text-sm mt-2 bg-black p-3 rounded border border-gold/10 whitespace-pre-wrap">
                            {submission.story_description}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white/70">{submission.story_type}</td>
                    <td className="px-6 py-4">
                      <Select
                        value={submission.status || 'Pending'}
                        onValueChange={(value) => handleStatusChange(submission.id, value)}
                      >
                        <SelectTrigger
                          className={`w-[140px] h-8 text-xs border-0 ${statusColors[submission.status || 'Pending']}`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-gold/20">
                          {statusOptions.map((opt) => (
                            <SelectItem key={opt} value={opt} className="text-white">
                              {opt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-6 py-4 text-white/60 text-sm whitespace-nowrap">
                      {formatDate(submission.date || submission.created_date)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        {submission.attachment_url && (
                          <a
                            href={submission.attachment_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-white/60 hover:text-gold transition-colors"
                            title="View attachment"
                          >
                            <ExternalLink size={16} />
                          </a>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(submission.id)}
                          className="text-white/60 hover:text-red-400"
                        >
                          <X size={16} />
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
