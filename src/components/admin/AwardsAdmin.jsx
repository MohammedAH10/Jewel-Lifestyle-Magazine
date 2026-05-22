import { useState, useEffect } from 'react'
import { api } from '@/api/client'
import { Plus, Edit2, Trash2, Loader2, Trophy, Users, List, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const defaultCatForm = {
  name: '',
  description: '',
  vote_type: 'single',
  year: new Date().getFullYear(),
  active: true,
}

const defaultNomineeForm = {
  name: '',
  title: '',
  company: '',
  bio: '',
}

const defaultWinnerForm = {
  name: '',
  title: '',
  company: '',
  award_category: '',
  year: new Date().getFullYear(),
  bio: '',
}

export default function AwardsAdmin() {
  const [activeTab, setActiveTab] = useState('categories')
  const [categories, setCategories] = useState([])
  const [winners, setWinners] = useState([])
  const [votes, setVotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState({ type: '', text: '' })

  const [catDialogOpen, setCatDialogOpen] = useState(false)
  const [editingCat, setEditingCat] = useState(null)
  const [catForm, setCatForm] = useState(defaultCatForm)
  const [submitting, setSubmitting] = useState(false)

  const [nomineeDialogOpen, setNomineeDialogOpen] = useState(false)
  const [editingNomineeIdx, setEditingNomineeIdx] = useState(null)
  const [nomineeParentCat, setNomineeParentCat] = useState(null)
  const [nomineeForm, setNomineeForm] = useState(defaultNomineeForm)
  const [nomineeImageFile, setNomineeImageFile] = useState(null)

  const [winnerDialogOpen, setWinnerDialogOpen] = useState(false)
  const [editingWinner, setEditingWinner] = useState(null)
  const [winnerForm, setWinnerForm] = useState(defaultWinnerForm)
  const [photoFile, setPhotoFile] = useState(null)

  const [expandedCat, setExpandedCat] = useState(null)
  const [selectedVoteCat, setSelectedVoteCat] = useState(null)

  const fetchCategories = async () => {
    try {
      const res = await api.get('/award-categories')
      setCategories(Array.isArray(res) ? res : res.data || [])
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load categories' })
    }
  }

  const fetchWinners = async () => {
    try {
      const res = await api.get('/awards/winners')
      setWinners(Array.isArray(res) ? res : res.data || [])
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load winners' })
    }
  }

  const fetchVotes = async (categoryId) => {
    if (!categoryId) { setVotes([]); return }
    try {
      const res = await api.get(`/award-categories/${categoryId}/votes`)
      setVotes(Array.isArray(res) ? res : res.data || [])
    } catch (err) {
      setVotes([])
    }
  }

  const fetchAll = async () => {
    setLoading(true)
    setMessage({ type: '', text: '' })
    await Promise.all([fetchCategories(), fetchWinners()])
    setLoading(false)
  }

  useEffect(() => { fetchAll() }, [])

  const resetCatForm = () => {
    setCatForm(defaultCatForm)
    setEditingCat(null)
  }

  // Category CRUD
  const handleEditCat = (cat) => {
    setEditingCat(cat)
    setCatForm({
      name: cat.name || '',
      description: cat.description || '',
      vote_type: cat.vote_type || 'single',
      year: cat.year || new Date().getFullYear(),
      active: cat.active !== false,
    })
    setCatDialogOpen(true)
  }

  const handleDeleteCat = async (id) => {
    if (!confirm('Delete this category and all its votes?')) return
    try {
      await api.delete(`/award-categories/${id}`)
      setMessage({ type: 'success', text: 'Category deleted' })
      fetchCategories()
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to delete' })
    }
  }

  const handleSubmitCat = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage({ type: '', text: '' })
    try {
      const data = { ...catForm, year: parseInt(catForm.year) }
      if (editingCat) {
        await api.put(`/award-categories/${editingCat.id}`, data)
        setMessage({ type: 'success', text: 'Category updated' })
      } else {
        await api.post('/award-categories', data)
        setMessage({ type: 'success', text: 'Category created' })
      }
      setCatDialogOpen(false)
      resetCatForm()
      fetchCategories()
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to save' })
    } finally {
      setSubmitting(false)
    }
  }

  // Nominee CRUD
  const openAddNominee = (cat) => {
    setNomineeParentCat(cat)
    setEditingNomineeIdx(null)
    setNomineeForm(defaultNomineeForm)
    setNomineeImageFile(null)
    setNomineeDialogOpen(true)
  }

  const openEditNominee = (cat, idx) => {
    const nominee = cat.nominees[idx]
    setNomineeParentCat(cat)
    setEditingNomineeIdx(idx)
    setNomineeForm({
      name: nominee.name || '',
      title: nominee.title || '',
      company: nominee.company || '',
      bio: nominee.bio || '',
    })
    setNomineeImageFile(null)
    setNomineeDialogOpen(true)
  }

  const handleDeleteNominee = async (cat, idx) => {
    if (!confirm('Remove this nominee?')) return
    try {
      const updated = { nominees: cat.nominees.filter((_, i) => i !== idx) }
      await api.put(`/award-categories/${cat.id}`, updated)
      fetchCategories()
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to remove nominee' })
    }
  }

  const handleSubmitNominee = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage({ type: '', text: '' })
    try {
      let image = editingNomineeIdx != null ? nomineeParentCat.nominees[editingNomineeIdx]?.image || '' : ''
      if (nomineeImageFile) {
        const { file_url } = await api.uploadFile(nomineeImageFile)
        image = file_url
      }
      const nomineeData = { ...nomineeForm, image }
      const updatedNominees = editingNomineeIdx != null
        ? nomineeParentCat.nominees.map((n, i) => i === editingNomineeIdx ? nomineeData : n)
        : [...(nomineeParentCat.nominees || []), nomineeData]
      await api.put(`/award-categories/${nomineeParentCat.id}`, { nominees: updatedNominees })
      setNomineeDialogOpen(false)
      fetchCategories()
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to save nominee' })
    } finally {
      setSubmitting(false)
    }
  }

  // Winner CRUD (existing)
  const handleEditWinner = (winner) => {
    setEditingWinner(winner)
    setWinnerForm({
      name: winner.name || '',
      title: winner.title || '',
      company: winner.company || '',
      award_category: winner.award_category || '',
      year: winner.year || new Date().getFullYear(),
      bio: winner.bio || '',
    })
    setWinnerDialogOpen(true)
  }

  const handleDeleteWinner = async (id) => {
    if (!confirm('Delete this winner?')) return
    try {
      await api.delete(`/awards/winners/${id}`)
      setMessage({ type: 'success', text: 'Winner deleted' })
      fetchWinners()
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to delete' })
    }
  }

  const handleSubmitWinner = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage({ type: '', text: '' })
    try {
      let photo_url = editingWinner?.photo_url || ''
      if (photoFile) {
        const { file_url } = await api.uploadFile(photoFile)
        photo_url = file_url
      }
      const data = { ...winnerForm, photo_url, year: parseInt(winnerForm.year) }
      if (editingWinner) {
        await api.put(`/awards/winners/${editingWinner.id}`, data)
      } else {
        await api.post('/awards/winners', data)
      }
      setWinnerDialogOpen(false)
      setEditingWinner(null)
      setWinnerForm(defaultWinnerForm)
      setPhotoFile(null)
      fetchWinners()
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to save' })
    } finally {
      setSubmitting(false)
    }
  }

  // Votes view
  const handleViewVotes = async (cat) => {
    setSelectedVoteCat(cat)
    await fetchVotes(cat.id)
  }

  const getVoteCounts = (cat) => {
    const counts = {}
    cat.nominees?.forEach(n => { counts[n.name] = 0 })
    votes.forEach(v => {
      v.selected_nominees.forEach(name => {
        if (counts[name] !== undefined) counts[name]++
      })
    })
    return counts
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
          <TabsTrigger value="categories" className="data-[state=active]:bg-gold/20 data-[state=active]:text-gold">
            <List size={16} className="mr-2" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="votes" className="data-[state=active]:bg-gold/20 data-[state=active]:text-gold">
            <Users size={16} className="mr-2" />
            Votes
          </TabsTrigger>
          <TabsTrigger value="winners" className="data-[state=active]:bg-gold/20 data-[state=active]:text-gold">
            <Trophy size={16} className="mr-2" />
            Past Winners
          </TabsTrigger>
        </TabsList>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-white/60">Manage award categories and nominees</p>
            <Button onClick={() => { resetCatForm(); setCatDialogOpen(true) }} className="gradient-gold text-black">
              <Plus size={18} className="mr-2" />
              Add Category
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-6 h-6 text-gold animate-spin mx-auto" />
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12 text-white/50">No categories yet</div>
          ) : (
            <div className="space-y-4">
              {categories.map((cat) => (
                <div key={cat.id} className="bg-black border border-gold/20 overflow-hidden">
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button onClick={() => setExpandedCat(expandedCat === cat.id ? null : cat.id)} className="text-white/40 hover:text-gold transition-colors">
                        {expandedCat === cat.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                      <div>
                        <h3 className="text-white font-medium">{cat.name}</h3>
                        <p className="text-white/50 text-sm">
                          {cat.year} &middot; {cat.vote_type === 'single' ? 'Single Choice' : 'Multi Choice'}
                          &middot; {cat.nominees?.length || 0} nominees
                          &middot; {cat.active ? 'Active' : 'Inactive'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => openAddNominee(cat)} className="text-gold text-xs">
                        <Plus size={14} className="mr-1" /> Nominee
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleEditCat(cat)} className="text-white/60 hover:text-gold">
                        <Edit2 size={14} />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteCat(cat.id)} className="text-white/60 hover:text-red-400">
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>

                  {expandedCat === cat.id && (
                    <div className="border-t border-gold/10 p-4">
                      {cat.description && <p className="text-white/50 text-sm mb-4">{cat.description}</p>}
                      {(!cat.nominees || cat.nominees.length === 0) ? (
                        <p className="text-white/30 text-sm">No nominees yet</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {cat.nominees.map((nominee, idx) => (
                            <div key={idx} className="bg-zinc-900 border border-gold/10 overflow-hidden group">
                              <div className="aspect-square relative">
                                {nominee.image ? (
                                  <img src={nominee.image} alt={nominee.name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                                    <span className="font-gilda text-4xl text-gold/30">
                                      {(nominee.name || '?').charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                )}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                  <Button size="icon" variant="ghost" onClick={() => openEditNominee(cat, idx)} className="text-white hover:text-gold">
                                    <Edit2 size={16} />
                                  </Button>
                                  <Button size="icon" variant="ghost" onClick={() => handleDeleteNominee(cat, idx)} className="text-white hover:text-red-400">
                                    <Trash2 size={16} />
                                  </Button>
                                </div>
                              </div>
                              <div className="p-3">
                                <p className="text-white text-sm font-medium">{nominee.name}</p>
                                {nominee.title && <p className="text-white/50 text-xs">{nominee.title}</p>}
                                {nominee.company && <p className="text-white/40 text-xs">{nominee.company}</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Votes Tab */}
        <TabsContent value="votes" className="space-y-6">
          <p className="text-white/60">View votes per category</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {categories.filter(c => c.active).map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleViewVotes(cat)}
                className={`text-left p-4 border transition-colors ${
                  selectedVoteCat?.id === cat.id
                    ? 'border-gold bg-gold/10'
                    : 'border-gold/20 hover:border-gold/40'
                }`}
              >
                <p className="text-white font-medium text-sm">{cat.name}</p>
                <p className="text-white/50 text-xs mt-1">{cat.year}</p>
              </button>
            ))}
          </div>

          {selectedVoteCat && (
            <div className="bg-black border border-gold/20 overflow-hidden">
              <div className="p-4 border-b border-gold/10">
                <h3 className="text-white font-medium">{selectedVoteCat.name} — Vote Results</h3>
                <p className="text-white/50 text-sm">{votes.length} total votes</p>
              </div>
              {votes.length === 0 ? (
                <div className="p-4 text-center text-white/50">No votes yet</div>
              ) : (
                <div className="p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    {Object.entries(getVoteCounts(selectedVoteCat)).map(([name, count]) => (
                      <div key={name} className="bg-zinc-900 border border-gold/10 p-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-white text-sm">{name}</span>
                          <span className="text-gold font-bold">{count}</span>
                        </div>
                        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full gradient-gold rounded-full transition-all"
                            style={{ width: `${votes.length ? (count / votes.length) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gold/10">
                          <th className="text-left px-4 py-2 text-white/60 text-sm font-normal">Voter</th>
                          <th className="text-left px-4 py-2 text-white/60 text-sm font-normal">Email</th>
                          <th className="text-left px-4 py-2 text-white/60 text-sm font-normal">Voted For</th>
                          <th className="text-left px-4 py-2 text-white/60 text-sm font-normal">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {votes.map((vote) => (
                          <tr key={vote.id} className="border-b border-gold/10">
                            <td className="px-4 py-3 text-white">{vote.voter_name}</td>
                            <td className="px-4 py-3 text-white/60 text-sm">{vote.voter_email}</td>
                            <td className="px-4 py-3 text-white/70 text-sm">{vote.selected_nominees?.join(', ')}</td>
                            <td className="px-4 py-3 text-white/40 text-sm">
                              {new Date(vote.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* Winners Tab */}
        <TabsContent value="winners" className="space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-white/60">Manage past award winners</p>
            <Button onClick={() => { setEditingWinner(null); setWinnerForm(defaultWinnerForm); setPhotoFile(null); setWinnerDialogOpen(true) }} className="gradient-gold text-black">
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
              <div className="col-span-full text-center py-12 text-white/50">No winners added yet</div>
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
      </Tabs>

      {/* Category Dialog */}
      <Dialog open={catDialogOpen} onOpenChange={setCatDialogOpen}>
        <DialogContent className="bg-zinc-900 border-gold/20 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-gilda text-2xl">
              {editingCat ? 'Edit Category' : 'Add New Category'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitCat} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-white/60">Name *</label>
                <Input required value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} className="bg-black border-gold/20 text-white" placeholder="e.g., Male Entrepreneur of the Year" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-white/60">Year *</label>
                <Input type="number" required value={catForm.year} onChange={(e) => setCatForm({ ...catForm, year: e.target.value })} className="bg-black border-gold/20 text-white" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-white/60">Vote Type</label>
                <Select value={catForm.vote_type} onValueChange={(v) => setCatForm({ ...catForm, vote_type: v })}>
                  <SelectTrigger className="bg-black border-gold/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-gold/20">
                    <SelectItem value="single" className="text-white">Single Choice</SelectItem>
                    <SelectItem value="multi" className="text-white">Multi Choice</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-white/60">Status</label>
                <Select value={catForm.active ? 'true' : 'false'} onValueChange={(v) => setCatForm({ ...catForm, active: v === 'true' })}>
                  <SelectTrigger className="bg-black border-gold/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-gold/20">
                    <SelectItem value="true" className="text-white">Active (open for voting)</SelectItem>
                    <SelectItem value="false" className="text-white">Inactive (closed)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/60">Description</label>
              <Textarea value={catForm.description} onChange={(e) => setCatForm({ ...catForm, description: e.target.value })} className="bg-black border-gold/20 text-white min-h-[80px]" />
            </div>
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => setCatDialogOpen(false)} className="border-gold/30 text-white">Cancel</Button>
              <Button type="submit" disabled={submitting} className="gradient-gold text-black">
                {submitting ? <Loader2 className="animate-spin" size={18} /> : editingCat ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Nominee Dialog */}
      <Dialog open={nomineeDialogOpen} onOpenChange={setNomineeDialogOpen}>
        <DialogContent className="bg-zinc-900 border-gold/20 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-gilda text-2xl">
              {editingNomineeIdx != null ? 'Edit Nominee' : 'Add Nominee'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitNominee} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm text-white/60">Name *</label>
              <Input required value={nomineeForm.name} onChange={(e) => setNomineeForm({ ...nomineeForm, name: e.target.value })} className="bg-black border-gold/20 text-white" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-white/60">Title</label>
                <Input value={nomineeForm.title} onChange={(e) => setNomineeForm({ ...nomineeForm, title: e.target.value })} className="bg-black border-gold/20 text-white" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-white/60">Company</label>
                <Input value={nomineeForm.company} onChange={(e) => setNomineeForm({ ...nomineeForm, company: e.target.value })} className="bg-black border-gold/20 text-white" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/60">Image</label>
              <Input type="file" accept="image/*" onChange={(e) => setNomineeImageFile(e.target.files[0])} className="bg-black border-gold/20 text-white" />
              {editingNomineeIdx != null && nomineeParentCat?.nominees[editingNomineeIdx]?.image && !nomineeImageFile && (
                <p className="text-white/50 text-xs">Current image kept if no new file selected</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/60">Bio</label>
              <Textarea value={nomineeForm.bio} onChange={(e) => setNomineeForm({ ...nomineeForm, bio: e.target.value })} className="bg-black border-gold/20 text-white min-h-[80px]" />
            </div>
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => setNomineeDialogOpen(false)} className="border-gold/30 text-white">Cancel</Button>
              <Button type="submit" disabled={submitting} className="gradient-gold text-black">
                {submitting ? <Loader2 className="animate-spin" size={18} /> : editingNomineeIdx != null ? 'Update' : 'Add'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Winner Dialog */}
      <Dialog open={winnerDialogOpen} onOpenChange={setWinnerDialogOpen}>
        <DialogContent className="bg-zinc-900 border-gold/20 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-gilda text-2xl">{editingWinner ? 'Edit Winner' : 'Add New Winner'}</DialogTitle>
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
                <Input type="number" required value={winnerForm.year} onChange={(e) => setWinnerForm({ ...winnerForm, year: e.target.value })} className="bg-black border-gold/20 text-white" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/60">Photo</label>
              <Input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files[0])} className="bg-black border-gold/20 text-white" />
              {editingWinner?.photo_url && !photoFile && (
                <p className="text-white/50 text-xs">Current photo kept if no new file selected</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/60">Bio</label>
              <Textarea value={winnerForm.bio} onChange={(e) => setWinnerForm({ ...winnerForm, bio: e.target.value })} className="bg-black border-gold/20 text-white min-h-[100px]" />
            </div>
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => setWinnerDialogOpen(false)} className="border-gold/30 text-white">Cancel</Button>
              <Button type="submit" disabled={submitting} className="gradient-gold text-black">
                {submitting ? <Loader2 className="animate-spin" size={18} /> : editingWinner ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
