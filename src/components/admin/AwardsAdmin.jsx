import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Loader2, Award, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AwardsAdmin() {
  const [activeTab, setActiveTab] = useState("winners");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState("winner");
  const [editingItem, setEditingItem] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [winnerForm, setWinnerForm] = useState({
    name: "",
    title: "",
    company: "",
    award_category: "",
    year: new Date().getFullYear(),
    bio: "",
  });
  const [winnerPhoto, setWinnerPhoto] = useState(null);

  const [nominationStatus, setNominationStatus] = useState("");

  const queryClient = useQueryClient();

  const { data: winners = [], isLoading: loadingWinners } = useQuery({
    queryKey: ["adminWinners"],
    queryFn: () => base44.entities.AwardWinner.list("-year"),
  });

  const { data: nominations = [], isLoading: loadingNominations } = useQuery({
    queryKey: ["adminNominations"],
    queryFn: () => base44.entities.AwardNomination.list("-created_date"),
  });

  const resetWinnerForm = () => {
    setWinnerForm({
      name: "",
      title: "",
      company: "",
      award_category: "",
      year: new Date().getFullYear(),
      bio: "",
    });
    setWinnerPhoto(null);
    setEditingItem(null);
  };

  const handleEditWinner = (winner) => {
    setEditingItem(winner);
    setWinnerForm({
      name: winner.name || "",
      title: winner.title || "",
      company: winner.company || "",
      award_category: winner.award_category || "",
      year: winner.year || new Date().getFullYear(),
      bio: winner.bio || "",
    });
    setDialogType("winner");
    setIsDialogOpen(true);
  };

  const handleDeleteWinner = async (id) => {
    if (!confirm("Are you sure you want to delete this winner?")) return;
    await base44.entities.AwardWinner.delete(id);
    queryClient.invalidateQueries({ queryKey: ["adminWinners"] });
  };

  const handleSubmitWinner = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    let photo_url = editingItem?.photo_url || "";

    if (winnerPhoto) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: winnerPhoto });
      photo_url = file_url;
    }

    const data = { ...winnerForm, photo_url };

    if (editingItem) {
      await base44.entities.AwardWinner.update(editingItem.id, data);
    } else {
      await base44.entities.AwardWinner.create(data);
    }

    queryClient.invalidateQueries({ queryKey: ["adminWinners"] });
    setIsDialogOpen(false);
    resetWinnerForm();
    setIsLoading(false);
  };

  const handleUpdateNominationStatus = async (nominationId, status) => {
    await base44.entities.AwardNomination.update(nominationId, { status });
    queryClient.invalidateQueries({ queryKey: ["adminNominations"] });
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-black border border-gold/20">
          <TabsTrigger value="winners" className="data-[state=active]:bg-gold/20 data-[state=active]:text-gold">
            <Trophy size={16} className="mr-2" />
            Past Winners
          </TabsTrigger>
          <TabsTrigger value="nominations" className="data-[state=active]:bg-gold/20 data-[state=active]:text-gold">
            <Award size={16} className="mr-2" />
            Nominations
          </TabsTrigger>
        </TabsList>

        {/* Winners Tab */}
        <TabsContent value="winners" className="space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-white/60">Manage award winners</p>
            <Button
              onClick={() => {
                resetWinnerForm();
                setDialogType("winner");
                setIsDialogOpen(true);
              }}
              className="gradient-gold text-black"
            >
              <Plus size={18} className="mr-2" />
              Add Winner
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loadingWinners ? (
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
                      <img
                        src={winner.photo_url}
                        alt={winner.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                        <Trophy className="w-12 h-12 text-gold/30" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 px-2 py-1 bg-gold text-black text-xs font-medium">
                      {winner.year}
                    </div>
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleEditWinner(winner)}
                        className="text-white hover:text-gold"
                      >
                        <Pencil size={18} />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDeleteWinner(winner.id)}
                        className="text-white hover:text-red-400"
                      >
                        <Trash2 size={18} />
                      </Button>
                    </div>
                  </div>
                  <div className="p-4">
                    <span className="text-gold text-xs">{winner.award_category}</span>
                    <h3 className="text-white font-medium mt-1">{winner.name}</h3>
                    <p className="text-white/50 text-sm">{winner.title}</p>
                    {winner.company && (
                      <p className="text-white/40 text-sm">{winner.company}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>

        {/* Nominations Tab */}
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
                  {loadingNominations ? (
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
                          <select
                            value={nomination.status || "Pending"}
                            onChange={(e) => handleUpdateNominationStatus(nomination.id, e.target.value)}
                            className="bg-zinc-800 border border-gold/20 text-white text-sm px-3 py-1 rounded"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Under Review">Under Review</option>
                            <option value="Shortlisted">Shortlisted</option>
                            <option value="Winner">Winner</option>
                            <option value="Not Selected">Not Selected</option>
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingItem(nomination);
                                setDialogType("viewNomination");
                                setIsDialogOpen(true);
                              }}
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

      {/* Winner Dialog */}
      <Dialog open={isDialogOpen && dialogType === "winner"} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-zinc-900 border-gold/20 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-gilda text-2xl">
              {editingItem ? "Edit Winner" : "Add New Winner"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmitWinner} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  required
                  value={winnerForm.name}
                  onChange={(e) => setWinnerForm({ ...winnerForm, name: e.target.value })}
                  className="bg-black border-gold/20 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label>Award Category *</Label>
                <Input
                  required
                  value={winnerForm.award_category}
                  onChange={(e) => setWinnerForm({ ...winnerForm, award_category: e.target.value })}
                  className="bg-black border-gold/20 text-white"
                  placeholder="e.g., Business Excellence"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={winnerForm.title}
                  onChange={(e) => setWinnerForm({ ...winnerForm, title: e.target.value })}
                  className="bg-black border-gold/20 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label>Company</Label>
                <Input
                  value={winnerForm.company}
                  onChange={(e) => setWinnerForm({ ...winnerForm, company: e.target.value })}
                  className="bg-black border-gold/20 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label>Year *</Label>
                <Input
                  type="number"
                  required
                  value={winnerForm.year}
                  onChange={(e) => setWinnerForm({ ...winnerForm, year: parseInt(e.target.value) })}
                  className="bg-black border-gold/20 text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Photo</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setWinnerPhoto(e.target.files[0])}
                className="bg-black border-gold/20 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea
                value={winnerForm.bio}
                onChange={(e) => setWinnerForm({ ...winnerForm, bio: e.target.value })}
                className="bg-black border-gold/20 text-white min-h-[100px]"
              />
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="border-gold/30 text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="gradient-gold text-black"
              >
                {isLoading ? <Loader2 className="animate-spin" size={18} /> : editingItem ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Nomination Dialog */}
      <Dialog open={isDialogOpen && dialogType === "viewNomination"} onOpenChange={setIsDialogOpen}>
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
                  <p className="text-white">{editingItem.nominee_title || "—"}</p>
                </div>
                <div>
                  <p className="text-white/50 text-sm">Company</p>
                  <p className="text-white">{editingItem.nominee_company || "—"}</p>
                </div>
              </div>

              <div>
                <p className="text-white/50 text-sm mb-2">Reason for Nomination</p>
                <p className="text-white/80 bg-black p-4 rounded border border-gold/10">
                  {editingItem.reason}
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
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
