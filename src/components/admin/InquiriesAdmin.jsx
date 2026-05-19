import { useState, useEffect } from 'react'
import { api } from '@/api/client'
import { motion } from 'framer-motion'
import { Loader2, Mail, Phone, Building, DollarSign, MessageSquare, Trash2, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'

const statusOptions = ['New', 'Contacted', 'In Progress', 'Closed']

const statusColors = {
  'New': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  'Contacted': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'In Progress': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  'Closed': 'bg-green-500/20 text-green-400 border-green-500/30',
}

export default function InquiriesAdmin() {
  const [inquiries, setInquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const fetchInquiries = async () => {
    try {
      setLoading(true)
      const data = await api.get('/inquiries')
      setInquiries(data)
    } catch (err) {
      console.error('Failed to load inquiries', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInquiries()
  }, [])

  const handleStatusChange = async (id, status) => {
    await api.put(`/inquiries/${id}`, { status })
    setInquiries((prev) =>
      prev.map((inq) => (inq.id === id ? { ...inq, status } : inq))
    )
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this inquiry?')) return
    await api.delete(`/inquiries/${id}`)
    fetchInquiries()
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

  const openDetail = (inquiry) => {
    setSelected(inquiry)
    setDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <p className="text-white/60">Manage advertising inquiries from the Advertise page</p>

      <div className="bg-black border border-gold/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gold/10">
                <th className="text-left px-6 py-4 text-white/60 text-sm font-normal">Contact</th>
                <th className="text-left px-6 py-4 text-white/60 text-sm font-normal">Company</th>
                <th className="text-left px-6 py-4 text-white/60 text-sm font-normal">Email</th>
                <th className="text-left px-6 py-4 text-white/60 text-sm font-normal">Ad Type</th>
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
              ) : inquiries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-white/50">
                    No inquiries yet
                  </td>
                </tr>
              ) : (
                inquiries.map((inquiry) => (
                  <tr key={inquiry.id} className="border-b border-gold/10 hover:bg-gold/5">
                    <td className="px-6 py-4 text-white">{inquiry.contact_name}</td>
                    <td className="px-6 py-4 text-white/70">{inquiry.company_name || '—'}</td>
                    <td className="px-6 py-4 text-white/70">{inquiry.email}</td>
                    <td className="px-6 py-4 text-white/70 capitalize">{inquiry.ad_type || '—'}</td>
                    <td className="px-6 py-4">
                      <Select
                        value={inquiry.status || 'New'}
                        onValueChange={(value) => handleStatusChange(inquiry.id, value)}
                      >
                        <SelectTrigger className="w-[140px] h-8 text-xs border-0">
                          <Badge
                            variant="outline"
                            className={`${statusColors[inquiry.status || 'New']} border-0`}
                          >
                            {inquiry.status || 'New'}
                          </Badge>
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
                      {formatDate(inquiry.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <Dialog open={dialogOpen && selected?.id === inquiry.id} onOpenChange={(open) => { if (!open) setDialogOpen(false); setSelected(open ? inquiry : null); }}>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openDetail(inquiry)}
                              className="text-white/60 hover:text-gold"
                            >
                              <Eye size={16} />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-zinc-900 border-gold/20 text-white max-w-lg max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="text-gold text-xl">Inquiry Details</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 mt-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-white/40 text-xs uppercase tracking-wider">Contact Name</label>
                                  <p className="text-white mt-1">{selected?.contact_name}</p>
                                </div>
                                <div>
                                  <label className="text-white/40 text-xs uppercase tracking-wider">Company</label>
                                  <p className="text-white mt-1">{selected?.company_name || '—'}</p>
                                </div>
                                <div>
                                  <label className="text-white/40 text-xs uppercase tracking-wider">Email</label>
                                  <p className="text-white mt-1 flex items-center gap-1">
                                    <Mail size={12} className="text-gold/60" />
                                    {selected?.email}
                                  </p>
                                </div>
                                <div>
                                  <label className="text-white/40 text-xs uppercase tracking-wider">Phone</label>
                                  <p className="text-white mt-1 flex items-center gap-1">
                                    <Phone size={12} className="text-gold/60" />
                                    {selected?.phone || '—'}
                                  </p>
                                </div>
                                <div>
                                  <label className="text-white/40 text-xs uppercase tracking-wider">Ad Type</label>
                                  <p className="text-white mt-1 capitalize">{selected?.ad_type || '—'}</p>
                                </div>
                                <div>
                                  <label className="text-white/40 text-xs uppercase tracking-wider">Budget Range</label>
                                  <p className="text-white mt-1 flex items-center gap-1">
                                    <DollarSign size={12} className="text-gold/60" />
                                    {selected?.budget_range || '—'}
                                  </p>
                                </div>
                                <div>
                                  <label className="text-white/40 text-xs uppercase tracking-wider">Status</label>
                                  <div className="mt-1">
                                    {selected && (
                                      <Badge variant="outline" className={statusColors[selected.status || 'New']}>
                                        {selected.status || 'New'}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <label className="text-white/40 text-xs uppercase tracking-wider">Date</label>
                                  <p className="text-white mt-1">{formatDate(selected?.created_at)}</p>
                                </div>
                              </div>
                              <div>
                                <label className="text-white/40 text-xs uppercase tracking-wider flex items-center gap-1">
                                  <MessageSquare size={12} className="text-gold/60" />
                                  Message
                                </label>
                                <p className="text-white/80 mt-2 bg-black p-4 rounded border border-gold/10 whitespace-pre-wrap text-sm leading-relaxed">
                                  {selected?.message || 'No message provided'}
                                </p>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(inquiry.id)}
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
