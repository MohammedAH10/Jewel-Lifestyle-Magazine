import { useState, useEffect } from 'react'
import { api } from '@/api/client'
import { motion } from 'framer-motion'
import { Plus, Edit2, Trash2, Loader2, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const categories = ['Tech', 'Fashion', 'Hospitality', 'Business', 'Finance', 'Healthcare', 'Entertainment', 'Other']
const interviewTypes = ['Article', 'Q&A', 'Video']

const defaultForm = {
  name: '',
  title: '',
  company: '',
  category: '',
  interview_type: 'Article',
  excerpt: '',
  content: '',
  video_url: '',
  is_featured: false,
  is_cover_story: false,
  published_date: new Date().toISOString().split('T')[0],
  scheduled_date: '',
  status: 'Draft',
}

export default function InterviewsAdmin() {
  const [interviews, setInterviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [formData, setFormData] = useState(defaultForm)
  const [headshotFile, setHeadshotFile] = useState(null)
  const [coverFile, setCoverFile] = useState(null)

  const fetchInterviews = async () => {
    try {
      setLoading(true)
      const res = await api.get('/executives')
      setInterviews(Array.isArray(res) ? res : res.data || [])
      setMessage({ type: '', text: '' })
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load interviews' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchInterviews() }, [])

  const resetForm = () => {
    setFormData(defaultForm)
    setHeadshotFile(null)
    setCoverFile(null)
    setEditingItem(null)
    setMessage({ type: '', text: '' })
  }

  const handleEdit = (interview) => {
    setEditingItem(interview)
    setFormData({
      name: interview.name || '',
      title: interview.title || '',
      company: interview.company || '',
      category: interview.category || '',
      interview_type: interview.interview_type || 'Article',
      excerpt: interview.excerpt || '',
      content: interview.content || '',
      video_url: interview.video_url || '',
      is_featured: interview.is_featured || false,
      is_cover_story: interview.is_cover_story || false,
      published_date: interview.published_date || defaultForm.published_date,
      scheduled_date: interview.scheduled_date || '',
      status: interview.status || 'Draft',
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this interview?')) return
    try {
      await api.delete(`/executives/${id}`)
      setMessage({ type: 'success', text: 'Interview deleted successfully' })
      fetchInterviews()
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to delete interview' })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage({ type: '', text: '' })

    try {
      let headshot_url = editingItem?.headshot_url || ''
      let cover_image_url = editingItem?.cover_image_url || ''

      if (headshotFile) {
        const { file_url } = await api.uploadFile(headshotFile)
        headshot_url = file_url
      }
      if (coverFile) {
        const { file_url } = await api.uploadFile(coverFile)
        cover_image_url = file_url
      }

      const data = { ...formData, headshot_url, cover_image_url }

      if (editingItem) {
        await api.put(`/executives/${editingItem.id}`, data)
        setMessage({ type: 'success', text: 'Interview updated successfully' })
      } else {
        await api.post('/executives', data)
        setMessage({ type: 'success', text: 'Interview created successfully' })
      }

      setIsDialogOpen(false)
      resetForm()
      fetchInterviews()
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to save interview' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-white/60">Manage executive interviews and features</p>
        <Button
          onClick={() => { resetForm(); setIsDialogOpen(true) }}
          className="gradient-gold text-black"
        >
          <Plus size={18} className="mr-2" />
          Add Interview
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

      <div className="bg-black border border-gold/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gold/10">
                <th className="text-left px-6 py-4 text-white/60 text-sm font-normal">Name</th>
                <th className="text-left px-6 py-4 text-white/60 text-sm font-normal">Company</th>
                <th className="text-left px-6 py-4 text-white/60 text-sm font-normal">Category</th>
                <th className="text-left px-6 py-4 text-white/60 text-sm font-normal">Type</th>
                <th className="text-left px-6 py-4 text-white/60 text-sm font-normal">Status</th>
                <th className="text-left px-6 py-4 text-white/60 text-sm font-normal">Scheduled</th>
                <th className="text-left px-6 py-4 text-white/60 text-sm font-normal">Featured</th>
                <th className="text-right px-6 py-4 text-white/60 text-sm font-normal">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <Loader2 className="w-6 h-6 text-gold animate-spin mx-auto" />
                  </td>
                </tr>
              ) : interviews.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-white/50">
                    No interviews yet
                  </td>
                </tr>
              ) : (
                interviews.map((interview) => (
                  <tr key={interview.id} className="border-b border-gold/10 hover:bg-gold/5">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {interview.headshot_url ? (
                          <img src={interview.headshot_url} alt={interview.name} className="w-10 h-10 object-cover rounded" />
                        ) : (
                          <div className="w-10 h-10 bg-zinc-800 rounded flex items-center justify-center">
                            <ImageIcon size={16} className="text-white/30" />
                          </div>
                        )}
                        <span className="text-white">{interview.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white/70">{interview.company}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-gold/20 text-gold text-xs rounded">{interview.category}</span>
                    </td>
                    <td className="px-6 py-4 text-white/70">{interview.interview_type}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded ${
                        interview.published_date
                          ? 'bg-green-500/20 text-green-400'
                          : interview.scheduled_date
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-zinc-500/20 text-zinc-400'
                      }`}>
                        {interview.published_date ? 'Published' : interview.scheduled_date ? 'Scheduled' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white/70">
                      {interview.scheduled_date || <span className="text-white/30">—</span>}
                    </td>
                    <td className="px-6 py-4">
                      {interview.is_cover_story ? (
                        <span className="text-gold text-xs">Cover Story</span>
                      ) : interview.is_featured ? (
                        <span className="text-gold/60 text-xs">Featured</span>
                      ) : (
                        <span className="text-white/30 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(interview)} className="text-white/60 hover:text-gold">
                          <Edit2 size={16} />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(interview.id)} className="text-white/60 hover:text-red-400">
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-zinc-900 border-gold/20 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-gilda text-2xl">
              {editingItem ? 'Edit Interview' : 'Add New Interview'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-white/60">Name *</label>
                <Input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="bg-black border-gold/20 text-white" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-white/60">Title/Position *</label>
                <Input required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="bg-black border-gold/20 text-white" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-white/60">Company *</label>
                <Input required value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} className="bg-black border-gold/20 text-white" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-white/60">Category *</label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger className="bg-black border-gold/20 text-white">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-gold/20">
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat} className="text-white">{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-white/60">Interview Type</label>
                <Select value={formData.interview_type} onValueChange={(value) => setFormData({ ...formData, interview_type: value })}>
                  <SelectTrigger className="bg-black border-gold/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-gold/20">
                    {interviewTypes.map((type) => (
                      <SelectItem key={type} value={type} className="text-white">{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-white/60">Published Date</label>
                <Input type="date" value={formData.published_date} onChange={(e) => setFormData({ ...formData, published_date: e.target.value })} className="bg-black border-gold/20 text-white" />
              </div>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-white/60">Cover Image</label>
                <Input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files[0])} className="bg-black border-gold/20 text-white" />
                {editingItem?.cover_image_url && !coverFile && (
                  <p className="text-white/50 text-xs">Current image kept if no new file selected</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm text-white/60">Headshot Photo</label>
                <Input type="file" accept="image/*" onChange={(e) => setHeadshotFile(e.target.files[0])} className="bg-black border-gold/20 text-white" />
                {editingItem?.headshot_url && !headshotFile && (
                  <p className="text-white/50 text-xs">Current photo kept if no new file selected</p>
                )}
              </div>
            </div>

            {formData.interview_type === 'Video' && (
              <div className="space-y-2">
                <label className="text-sm text-white/60">Video URL</label>
                <Input value={formData.video_url} onChange={(e) => setFormData({ ...formData, video_url: e.target.value })} className="bg-black border-gold/20 text-white" placeholder="YouTube or Vimeo embed URL" />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm text-white/60">Short Excerpt</label>
              <Textarea value={formData.excerpt} onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })} className="bg-black border-gold/20 text-white min-h-[80px]" placeholder="Brief preview text for listings" />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-white/60">Full Content (Markdown supported) *</label>
              <Textarea required value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} className="bg-black border-gold/20 text-white min-h-[200px]" placeholder="Full interview content..." />
            </div>

            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-3 text-white/80">
                <input type="checkbox" checked={formData.is_featured} onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })} className="accent-gold w-4 h-4" />
                Featured Interview
              </label>
              <label className="flex items-center gap-3 text-white/80">
                <input type="checkbox" checked={formData.is_cover_story} onChange={(e) => setFormData({ ...formData, is_cover_story: e.target.checked })} className="accent-gold w-4 h-4" />
                Cover Story
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
