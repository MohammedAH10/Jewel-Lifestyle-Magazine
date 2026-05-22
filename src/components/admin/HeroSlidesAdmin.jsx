import { useState, useEffect } from 'react'
import { api } from '@/api/client'
import { Plus, Edit2, Trash2, Loader2, Image } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

const slideTypes = ['Interview', 'Award', 'Event', 'Magazine']

const defaultForm = {
  title: '',
  subtitle: '',
  link_url: '',
  link_text: '',
  slide_type: 'Interview',
  order: 0,
  is_active: true,
}

export default function HeroSlidesAdmin() {
  const [slides, setSlides] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(defaultForm)
  const [file, setFile] = useState(null)

  const fetchSlides = async () => {
    try {
      setLoading(true)
      const data = await api.get('/heroes/all')
      setSlides(data)
    } catch (err) {
      console.error('Failed to load slides', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSlides()
  }, [])

  const resetForm = () => {
    setForm(defaultForm)
    setFile(null)
    setEditing(null)
  }

  const openAdd = () => {
    resetForm()
    setOpen(true)
  }

  const openEdit = (slide) => {
    setEditing(slide)
    setForm({
      title: slide.title || '',
      subtitle: slide.subtitle || '',
      link_url: slide.link_url || '',
      link_text: slide.link_text || '',
      slide_type: slide.slide_type || 'Interview',
      order: slide.order ?? 0,
      is_active: slide.is_active !== false,
    })
    setOpen(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this slide?')) return
    await api.delete(`/heroes/${id}`)
    fetchSlides()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    let image_url = editing?.image_url || ''
    if (file) {
      const { file_url } = await api.uploadFile(file)
      image_url = file_url
    }

    const payload = { ...form, image_url }

    if (editing) {
      await api.put(`/heroes/${editing.id}`, payload)
    } else {
      await api.post('/heroes', payload)
    }

    setSaving(false)
    setOpen(false)
    resetForm()
    fetchSlides()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-white/60">Manage homepage hero carousel slides</p>
        <Button onClick={openAdd} className="gradient-gold text-black">
            <Plus size={18} className="mr-2" />
            Add Slide
          </Button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-6 h-6 text-gold animate-spin mx-auto" />
          </div>
        ) : slides.length === 0 ? (
          <div className="text-center py-12 text-white/50 bg-black border border-gold/20">
            No hero slides yet. Add your first slide to get started.
          </div>
        ) : (
          slides.map((slide) => (
            <div
              key={slide.id}
              className="flex items-center gap-4 bg-black border border-gold/20 p-4 group"
            >
              {slide.image_url ? (
                <div className="w-32 h-20 flex-shrink-0 overflow-hidden rounded">
                  <img
                    src={slide.image_url}
                    alt={slide.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-32 h-20 flex-shrink-0 bg-zinc-800 flex items-center justify-center rounded">
                  <Image className="w-6 h-6 text-white/30" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <h3 className="text-white font-medium truncate">{slide.title}</h3>
                  <span className="px-2 py-0.5 bg-gold/20 text-gold text-xs rounded">
                    {slide.slide_type}
                  </span>
                  {!slide.is_active && (
                    <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded">
                      Inactive
                    </span>
                  )}
                </div>
                {slide.subtitle && (
                  <p className="text-white/50 text-sm truncate">{slide.subtitle}</p>
                )}
                <p className="text-white/30 text-xs mt-1">Order: {slide.order}</p>
              </div>

              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEdit(slide)}
                  className="text-white/60 hover:text-gold"
                >
                  <Edit2 size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(slide.id)}
                  className="text-white/60 hover:text-red-400"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-zinc-900 border-gold/20 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-gilda text-2xl">
              {editing ? 'Edit Slide' : 'Add New Slide'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="bg-black border-gold/20 text-white"
                placeholder="Main headline"
              />
            </div>

            <div className="space-y-2">
              <Label>Subtitle</Label>
              <Input
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                className="bg-black border-gold/20 text-white"
                placeholder="Supporting text"
              />
            </div>

            <div className="space-y-2">
              <Label>Background Image</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files[0])}
                className="bg-black border-gold/20 text-white"
              />
              {editing?.image_url && !file && (
                <div className="mt-2">
                  <img
                    src={editing.image_url}
                    alt="Current"
                    className="h-24 w-auto object-cover rounded border border-gold/20"
                  />
                  <p className="text-white/50 text-sm mt-1">Current image (kept if no new file selected)</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Slide Type</Label>
                <Select
                  value={form.slide_type}
                  onValueChange={(value) => setForm({ ...form, slide_type: value })}
                >
                  <SelectTrigger className="bg-black border-gold/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-gold/20">
                    {slideTypes.map((type) => (
                      <SelectItem key={type} value={type} className="text-white">
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Display Order</Label>
                <Input
                  type="number"
                  value={form.order}
                  onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
                  className="bg-black border-gold/20 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Link URL</Label>
                <Input
                  value={form.link_url}
                  onChange={(e) => setForm({ ...form, link_url: e.target.value })}
                  className="bg-black border-gold/20 text-white"
                  placeholder="/ExecutiveInterviews?id=xxx"
                />
              </div>
              <div className="space-y-2">
                <Label>Link Button Text</Label>
                <Input
                  value={form.link_text}
                  onChange={(e) => setForm({ ...form, link_text: e.target.value })}
                  className="bg-black border-gold/20 text-white"
                  placeholder="e.g., Read More"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Checkbox
                id="is_active"
                checked={form.is_active}
                onCheckedChange={(checked) => setForm({ ...form, is_active: !!checked })}
              />
              <Label htmlFor="is_active" className="text-white">Active (visible on homepage)</Label>
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="border-gold/30 text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="gradient-gold text-black"
              >
                {saving ? <Loader2 className="animate-spin" size={18} /> : editing ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
