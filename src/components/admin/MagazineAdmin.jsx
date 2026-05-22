import { useState, useEffect } from 'react'
import { api } from '@/api/client'
import { motion } from 'framer-motion'
import { Plus, Edit2, Trash2, Loader2, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const defaultForm = {
  title: '',
  issue_number: '',
  month: '',
  year: new Date().getFullYear(),
  description: '',
  flipbook_url: '',
  pdf_url: '',
  is_current: false,
  scheduled_date: '',
  status: 'Draft',
  article_content: '',
}

export default function MagazineAdmin() {
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [formData, setFormData] = useState(defaultForm)
  const [coverFile, setCoverFile] = useState(null)

  const fetchIssues = async () => {
    try {
      setLoading(true)
      const res = await api.get('/magazines')
      setIssues(Array.isArray(res) ? res : res.data || [])
      setMessage({ type: '', text: '' })
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load magazine issues' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchIssues() }, [])

  const resetForm = () => {
    setFormData(defaultForm)
    setCoverFile(null)
    setEditingItem(null)
    setMessage({ type: '', text: '' })
  }

  const handleEdit = (issue) => {
    setEditingItem(issue)
    setFormData({
      title: issue.title || '',
      issue_number: issue.issue_number || '',
      month: issue.month || '',
      year: issue.year || new Date().getFullYear(),
      description: issue.description || '',
      flipbook_url: issue.flipbook_url || '',
      pdf_url: issue.pdf_url || '',
      is_current: issue.is_current || false,
      scheduled_date: issue.scheduled_date || '',
      status: issue.status || 'Draft',
      article_content: issue.article_content || '',
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this issue?')) return
    try {
      await api.delete(`/magazines/${id}`)
      setMessage({ type: 'success', text: 'Issue deleted successfully' })
      fetchIssues()
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to delete issue' })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage({ type: '', text: '' })

    try {
      let cover_image_url = editingItem?.cover_image_url || ''

      if (coverFile) {
        const { file_url } = await api.uploadFile(coverFile)
        cover_image_url = file_url
      }

      if (formData.is_current) {
        const currentIssues = issues.filter(i => i.is_current && i.id !== editingItem?.id)
        for (const issue of currentIssues) {
          await api.put(`/magazines/${issue.id}`, { is_current: false })
        }
      }

      const data = { ...formData, cover_image_url }

      if (editingItem) {
        await api.put(`/magazines/${editingItem.id}`, data)
        setMessage({ type: 'success', text: 'Issue updated successfully' })
      } else {
        await api.post('/magazines', data)
        setMessage({ type: 'success', text: 'Issue created successfully' })
      }

      setIsDialogOpen(false)
      resetForm()
      fetchIssues()
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to save issue' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-white/60">Manage digital magazine issues</p>
        <Button
          onClick={() => { resetForm(); setIsDialogOpen(true) }}
          className="gradient-gold text-black"
        >
          <Plus size={18} className="mr-2" />
          Add Issue
        </Button>
      </div>

      {message.text && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`px-4 py-3 rounded border ${
            message.type === 'error'
              ? 'bg-red-500/20 text-red-400 border-red-500/20'
              : 'bg-green-500/20 text-green-400 border-green-500/20'
          }`}
        >
          {message.text}
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12">
            <Loader2 className="w-6 h-6 text-gold animate-spin mx-auto" />
          </div>
        ) : issues.length === 0 ? (
          <div className="col-span-full text-center py-12 text-white/50">
            No magazine issues yet
          </div>
        ) : (
          issues.map((issue) => (
            <div key={issue.id} className="bg-black border border-gold/20 overflow-hidden group">
              <div className="aspect-[3/4] relative">
                {issue.cover_image_url ? (
                  <img src={issue.cover_image_url} alt={issue.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                    <ImageIcon size={32} className="text-white/30" />
                  </div>
                )}
                {issue.is_current && (
                  <div className="absolute top-2 right-2 px-2 py-1 bg-gold text-black text-xs font-medium">
                    Current Issue
                  </div>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button size="icon" variant="ghost" onClick={() => handleEdit(issue)} className="text-white hover:text-gold">
                    <Edit2 size={18} />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(issue.id)} className="text-white hover:text-red-400">
                    <Trash2 size={18} />
                  </Button>
                </div>
              </div>
                <div className="p-4">
                  <h3 className="text-white font-medium truncate">{issue.title}</h3>
                  <p className="text-white/50 text-sm">{issue.month} {issue.year}</p>
                  <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded ${
                    issue.status === 'Published'
                      ? 'bg-green-500/20 text-green-400'
                      : issue.status === 'Scheduled'
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-zinc-500/20 text-zinc-400'
                  }`}>
                    {issue.status || 'Draft'}
                  </span>
                </div>
            </div>
          ))
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-zinc-900 border-gold/20 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-gilda text-2xl">
              {editingItem ? 'Edit Issue' : 'Add New Issue'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm text-white/60">Issue Title *</label>
              <Input required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="bg-black border-gold/20 text-white" placeholder="e.g., The Innovation Issue" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-white/60">Month *</label>
                <Select value={formData.month} onValueChange={(value) => setFormData({ ...formData, month: value })}>
                  <SelectTrigger className="bg-black border-gold/20 text-white">
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-gold/20">
                    {months.map((month) => (
                      <SelectItem key={month} value={month} className="text-white">{month}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-white/60">Year *</label>
                <Input type="number" required value={formData.year} onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })} className="bg-black border-gold/20 text-white" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-white/60">Issue Number</label>
                <Input value={formData.issue_number} onChange={(e) => setFormData({ ...formData, issue_number: e.target.value })} className="bg-black border-gold/20 text-white" placeholder="e.g., Vol. 2, No. 5" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-white/60">Cover Image *</label>
              <Input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files[0])} className="bg-black border-gold/20 text-white" />
              {editingItem?.cover_image_url && !coverFile && (
                <p className="text-white/50 text-xs">Current cover will be kept if no new file selected</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm text-white/60">Description</label>
              <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="bg-black border-gold/20 text-white min-h-[100px]" placeholder="Brief description of this issue..." />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-white/60">Status</label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger className="bg-black border-gold/20 text-white">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-gold/20">
                    {['Draft', 'Scheduled', 'Published'].map((s) => (
                      <SelectItem key={s} value={s} className="text-white">{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-white/60">Scheduled Date</label>
                <Input type="date" value={formData.scheduled_date} onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })} className="bg-black border-gold/20 text-white" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-white/60">Article Content</label>
              <Textarea value={formData.article_content} onChange={(e) => setFormData({ ...formData, article_content: e.target.value })} className="bg-black border-gold/20 text-white min-h-[200px]" placeholder="Full magazine article content..." />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-white/60">Flipbook URL</label>
                <Input value={formData.flipbook_url} onChange={(e) => setFormData({ ...formData, flipbook_url: e.target.value })} className="bg-black border-gold/20 text-white" placeholder="Online viewer URL" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-white/60">PDF Download URL</label>
                <Input value={formData.pdf_url} onChange={(e) => setFormData({ ...formData, pdf_url: e.target.value })} className="bg-black border-gold/20 text-white" placeholder="Direct PDF link" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-3 text-white/80">
                <input type="checkbox" checked={formData.is_current} onChange={(e) => setFormData({ ...formData, is_current: e.target.checked })} className="accent-gold w-4 h-4" />
                Set as Current Issue
              </label>
            </div>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="border-gold/30 text-white">
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="gradient-gold text-black">
                {submitting ? <Loader2 className="animate-spin" size={18} /> : editingItem ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
