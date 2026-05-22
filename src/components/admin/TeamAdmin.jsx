import { useState, useEffect } from 'react'
import { api } from '@/api/client'
import { Plus, Edit2, Trash2, Loader2, Image } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

const defaultForm = {
  name: '',
  role: '',
  bio: '',
  linkedin_url: '',
  order: 0,
}

export default function TeamAdmin() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(defaultForm)
  const [file, setFile] = useState(null)

  const fetchMembers = async () => {
    try {
      setLoading(true)
      const data = await api.get('/team')
      setMembers(data)
    } catch (err) {
      console.error('Failed to load team members', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMembers()
  }, [])

  const resetForm = () => {
    setForm(defaultForm)
    setFile(null)
    setEditing(null)
  }

  const openAdd = () => {
    resetForm()
    setForm((prev) => ({ ...prev, order: members.length }))
    setOpen(true)
  }

  const openEdit = (member) => {
    setEditing(member)
    setForm({
      name: member.name || '',
      role: member.role || '',
      bio: member.bio || '',
      linkedin_url: member.linkedin_url || '',
      order: member.order ?? 0,
    })
    setOpen(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this team member?')) return
    await api.delete(`/team/${id}`)
    fetchMembers()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    let photo_url = editing?.photo_url || ''
    if (file) {
      const { file_url } = await api.uploadFile(file)
      photo_url = file_url
    }

    const payload = { ...form, photo_url }

    if (editing) {
      await api.put(`/team/${editing.id}`, payload)
    } else {
      await api.post('/team', payload)
    }

    setSaving(false)
    setOpen(false)
    resetForm()
    fetchMembers()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-white/60">Manage Jewel team members</p>
        <Button onClick={openAdd} className="gradient-gold text-black">
            <Plus size={18} className="mr-2" />
            Add Team Member
          </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12">
            <Loader2 className="w-6 h-6 text-gold animate-spin mx-auto" />
          </div>
        ) : members.length === 0 ? (
          <div className="col-span-full text-center py-12 text-white/50 bg-black border border-gold/20">
            No team members added yet
          </div>
        ) : (
          members.map((member) => (
            <div key={member.id} className="bg-black border border-gold/20 overflow-hidden group">
              <div className="aspect-square relative">
                {member.photo_url ? (
                  <img
                    src={member.photo_url}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                    <span className="font-gilda text-4xl text-gold/30">
                      {member.name?.charAt(0) || <Image className="w-8 h-8 text-gold/30" />}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => openEdit(member)}
                    className="text-white hover:text-gold"
                  >
                    <Edit2 size={18} />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(member.id)}
                    className="text-white hover:text-red-400"
                  >
                    <Trash2 size={18} />
                  </Button>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-white font-medium">{member.name}</h3>
                <p className="text-gold text-sm">{member.role}</p>
              </div>
            </div>
          ))
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-zinc-900 border-gold/20 text-white max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-gilda text-2xl">
              {editing ? 'Edit Team Member' : 'Add Team Member'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="bg-black border-gold/20 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label>Role *</Label>
                <Input
                  required
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="bg-black border-gold/20 text-white"
                  placeholder="e.g., Editor-in-Chief"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Photo</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files[0])}
                className="bg-black border-gold/20 text-white"
              />
              {editing?.photo_url && !file && (
                <div className="mt-2 flex items-center gap-3">
                  <img
                    src={editing.photo_url}
                    alt="Current"
                    className="w-12 h-12 object-cover rounded-full border border-gold/20"
                  />
                  <p className="text-white/50 text-sm">Current photo (kept if no new file selected)</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                className="bg-black border-gold/20 text-white min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>LinkedIn URL</Label>
                <Input
                  value={form.linkedin_url}
                  onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })}
                  className="bg-black border-gold/20 text-white"
                />
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
