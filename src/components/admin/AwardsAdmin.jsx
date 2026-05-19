import { useState, useEffect } from 'react'
import { api } from '@/api/client'
import { Plus, Edit2, Trash2, Loader2, Trophy, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

const defaultWinnerForm = {
  name: '',
  title: '',
  company: '',
  award_category: '',
  year: new Date().getFullYear(),
  bio: '',
}

export default function AwardsAdmin() {
  const [activeTab, setActiveTab] = useState('winners')
  const [winners, setWinners] = useState([])
  const [nominations, setNominations] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState({ type: '', text: '' })

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogType, setDialogType] = useState('winner')
  const [editingItem, setEditingItem] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [winnerForm, setWinnerForm] = useState(defaultWinnerForm)
  const [photoFile, setPhotoFile] = useState(null)

  const fetchWinners = async () => {
    try {
      const res = await api.get('/awards/winners')
      setWinners(Array.isArray(res) ? res : res.data || [])
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load winners' })
    }
  }

  const fetchNominations = async () => {
    try {
      const res = await api.get('/awards/nominations')
      setNominations(Array.isArray(res) ? res : res.data || [])
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load nominations' })
    }
  }

  const fetchAll = async () => {
    setLoading(true)
    setMessage({ type: '', text: '' })
    await Promise.all([fetchWinners(), fetchNominations()])
    setLoading(false)
  }

  useEffect(() => { fetchAll() }, [])

  const resetWinnerForm = () => {
    setWinnerForm(defaultWinnerForm)
    setPhotoFile(null)
    setEditingItem(null)
  }

  const handleEditWinner = (winner) => {
    setEditingItem(winner)
    setWinnerForm({
      name: winner.name || '',
      title: winner.title || '',
      company: winner.company || '',
      award_category: winner.award_category || '',
      year: winner.year || new Date().getFullYear(),
      bio: winner.bio || '',
    })
    setDialogType('winner')
    setIsDialogOpen(true)
  }

  const handleDeleteWinner = async (id) => {
    if (!confirm('Are you sure you want to delete this winner?')) return
    try {
      await api.delete(`/awards/winners/${id}`)
      setMessage({ type: 'success', text: 'Winner deleted successfully' })
      fetchWinners()
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to delete winner' })
    }
  }

  const handleSubmitWinner = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage({ type: '', text: '' })

    try {
      let photo_url = editingItem?.photo_url || ''

      if (photoFile) {
        const { file_url } = await api.uploadFile(photoFile)
        photo_url = file_url
      }

      const data = { ...winnerForm, photo_url }

      if (editingItem) {
        await api.put(`/awards/winners/${editingItem.id}`, data)
        setMessage({ type: 'success', text: 'Winner updated successfully' })
      } else {
        await api.post('/awards/winners', data)
        setMessage({ type: 'success', text: 'Winner created successfully' })
      }

      setIsDialogOpen(false)
      resetWinnerForm()
      fetchWinners()
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to save winner' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateNominationStatus = async (nominationId, status) => {
    try {
      await api.put(`/awards/nominations/${nominationId}`, { status })
      setMessage({ type: 'success', text: 'Nomination status updated' })
      fetchNominations()
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to update status' })
    }
  }

  const nominationStatuses = ['Pending', 'Under Review', 'Shortlisted', 'Winner', 'Not Selected']

  const statusColors = {
    'Pending': 'bg-yellow-500/20 text-yellow-400',
    'Under Review': 'bg-blue-500/20 text-blue-400',
    'Shortlisted': 'bg-purple-500/20 text-purple-400',
    'Winner': 'bg-green-500/20 text-green-400',
    'Not Selected': 'bg-red-500/20 text-red-400',
  }

  return (
    <div className="space-y-6">
      {message.text && (
        <div className={`px-4 py-3 rounded border ${
          message.type === 'error'
            ? 'bg-red-500/20 text-red-400 border-red-500/20'
            : 'bg-green-500/20 text-green-400 border-green-500/20'
        }`}>
          {message.text}
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-black border border-gold/20">
          <TabsTrigger value="winners" className="data-[state=active]:bg-gold/20 data-[state=active]:text-gold">
            <Trophy size={16} className="mr-2" />
            Past Winners
          </TabsTrigger>
          <TabsTrigger value="nominations" className="data-[state=active]:bg-gold/20 data-[state=active]:text-gold">
            <Users size={16} className="mr-2" />
            Nominations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="winners" className="space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-white/60">Manage award winners</p>
            <Button
              onClick={() => { resetWinnerForm(); setDialogType('winner'); setIsDialogOpen(true) }}
              className="gradient-gold text-black"
            >
              <Plus size={18} className="mr-2" />
              Add Winner
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full text-center py-12">
                <Loader2 className="w-6 h-6 text-gold animate-spin mx-auto" />
              </div>
            ) : winners.length === 0 ? (
              <div className="col-span-full text-center py-12 text-white/50">
                No winners added yet
              </div>
            ) : (
              winners.map((winner) => (
                <div key={winner.id} className="bg-black border border-gold/20 overflow-hidden group">
                  <div className="aspect-square relative">
                    {winner.photo_url ? (
                      <img src={winner.photo_url} alt={winner.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                        <Trophy className="w-12 h-12 text-gold/30" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 px-2 py-1 bg-gold text-black text-xs font-medium">
                      {winner.year}
                    </div>
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button size="icon" variant="ghost" onClick={() => handleEditWinner(winner)} className="text-white hover:text-gold">
                        <Edit2 size={18} />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDeleteWinner(winner.id)} className="text-white hover:text-red-400">
                        <Trash2 size={18} />
                      </Button>
                    </div>
                  </div>
                  <div className="p-4">
                    <span className="text-gold text-xs">{winner.award_category}</span>
                    <h3 className="text-white font-medium mt-1">{winner.name}</h3>
                    <p className="text-white/50 text-sm">{winner.title}</p>
                    {winner.company && <p className="text-white/40 text-sm">{winner.company}</p>}
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="nominations" className="space-y-6">
          <p className="text-white/60">Review and manage award nominations</p>

          <div className="bg-black border border-gold/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gold/10">
                    <th className="text-left px-6 py-4 text-white/60 text-sm font-normal">Nominee</th>
                    <th className="text-left px-6 py-4 text-white/60 text-sm font-normal">Category</th>
                    <th className="text-left px-6 py-4 text-white/60 text-sm font-normal">Nominator</th>
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
                  ) : nominations.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-white/50">
                        No nominations yet
                      </td>
                    </tr>
                  ) : (
                    nominations.map((nomination) => (
                      <tr key={nomination.id} className="border-b border-gold/10 hover:bg-gold/5">
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-white">{nomination.nominee_name}</p>
                            <p className="text-white/50 text-sm">{nomination.nominee_title}</p>
                            {nomination.nominee_company && (
                              <p className="text-white/40 text-xs">{nomination.nominee_company}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-white/70">{nomination.award_category}</td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-white/70">{nomination.nominator_name}</p>
                            <p className="text-white/50 text-sm">{nomination.nominator_email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Select
                            value={nomination.status || 'Pending'}
                            onValueChange={(value) => handleUpdateNominationStatus(nomination.id, value)}
                          >
                            <SelectTrigger className={`text-sm px-3 py-1 h-8 border-0 ${statusColors[nomination.status || 'Pending']}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-gold/20">
                              {nominationStatuses.map((status) => (
                                <SelectItem key={status} value={status} className="text-white">{status}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end">
                            <Button
                              variant="ghost" size="sm"
                              onClick={() => { setEditingItem(nomination); setDialogType('viewNomination'); setIsDialogOpen(true) }}
                              className="text-gold text-xs"
                            >
                              View Details
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
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen && dialogType === 'winner'} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-zinc-900 border-gold/20 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-gilda text-2xl">
              {editingItem ? 'Edit Winner' : 'Add New Winner'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmitWinner} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-white/60">Name *</label>
                <Input required value={winnerForm.name} onChange={(e) => setWinnerForm({ ...winnerForm, name: e.target.value })} className="bg-black border-gold/20 text-white" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-white/60">Award Category *</label>
                <Input required value={winnerForm.award_category} onChange={(e) => setWinnerForm({ ...winnerForm, award_category: e.target.value })} className="bg-black border-gold/20 text-white" placeholder="e.g., Business Excellence" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-white/60">Title</label>
                <Input value={winnerForm.title} onChange={(e) => setWinnerForm({ ...winnerForm, title: e.target.value })} className="bg-black border-gold/20 text-white" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-white/60">Company</label>
                <Input value={winnerForm.company} onChange={(e) => setWinnerForm({ ...winnerForm, company: e.target.value })} className="bg-black border-gold/20 text-white" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-white/60">Year *</label>
                <Input type="number" required value={winnerForm.year} onChange={(e) => setWinnerForm({ ...winnerForm, year: parseInt(e.target.value) })} className="bg-black border-gold/20 text-white" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-white/60">Photo</label>
              <Input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files[0])} className="bg-black border-gold/20 text-white" />
              {editingItem?.photo_url && !photoFile && (
                <p className="text-white/50 text-xs">Current photo kept if no new file selected</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm text-white/60">Bio</label>
              <Textarea value={winnerForm.bio} onChange={(e) => setWinnerForm({ ...winnerForm, bio: e.target.value })} className="bg-black border-gold/20 text-white min-h-[100px]" />
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

      <Dialog open={isDialogOpen && dialogType === 'viewNomination'} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-zinc-900 border-gold/20 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-gilda text-2xl">Nomination Details</DialogTitle>
          </DialogHeader>

          {editingItem && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-white/50 text-sm">Nominee</p>
                  <p className="text-white font-medium">{editingItem.nominee_name}</p>
                </div>
                <div>
                  <p className="text-white/50 text-sm">Category</p>
                  <p className="text-white">{editingItem.award_category}</p>
                </div>
                <div>
                  <p className="text-white/50 text-sm">Title</p>
                  <p className="text-white">{editingItem.nominee_title || '—'}</p>
                </div>
                <div>
                  <p className="text-white/50 text-sm">Company</p>
                  <p className="text-white">{editingItem.nominee_company || '—'}</p>
                </div>
              </div>

              <div>
                <p className="text-white/50 text-sm mb-2">Reason for Nomination</p>
                <p className="text-white/80 bg-black p-4 rounded border border-gold/10 whitespace-pre-wrap">
                  {editingItem.reason || 'No reason provided'}
                </p>
              </div>

              {editingItem.supporting_links && (
                <div>
                  <p className="text-white/50 text-sm mb-2">Supporting Links</p>
                  <p className="text-white/80">{editingItem.supporting_links}</p>
                </div>
              )}

              <div className="border-t border-gold/10 pt-4">
                <p className="text-white/50 text-sm">Nominated by</p>
                <p className="text-white">{editingItem.nominator_name}</p>
                <p className="text-white/60 text-sm">{editingItem.nominator_email}</p>
                {editingItem.nominator_phone && (
                  <p className="text-white/60 text-sm">{editingItem.nominator_phone}</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
