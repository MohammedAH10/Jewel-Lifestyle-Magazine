import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function TeamAdmin() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    bio: "",
    linkedin_url: "",
    order: 0,
  });
  const [photoFile, setPhotoFile] = useState(null);

  const queryClient = useQueryClient();

  const { data: teamMembers = [], isLoading: loadingTeam } = useQuery({
    queryKey: ["adminTeam"],
    queryFn: () => base44.entities.TeamMember.list("order"),
  });

  const resetForm = () => {
    setFormData({
      name: "",
      role: "",
      bio: "",
      linkedin_url: "",
      order: teamMembers.length,
    });
    setPhotoFile(null);
    setEditingItem(null);
  };

  const handleEdit = (member) => {
    setEditingItem(member);
    setFormData({
      name: member.name || "",
      role: member.role || "",
      bio: member.bio || "",
      linkedin_url: member.linkedin_url || "",
      order: member.order || 0,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this team member?")) return;
    await base44.entities.TeamMember.delete(id);
    queryClient.invalidateQueries({ queryKey: ["adminTeam"] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    let photo_url = editingItem?.photo_url || "";

    if (photoFile) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: photoFile });
      photo_url = file_url;
    }

    const data = { ...formData, photo_url };

    if (editingItem) {
      await base44.entities.TeamMember.update(editingItem.id, data);
    } else {
      await base44.entities.TeamMember.create(data);
    }

    queryClient.invalidateQueries({ queryKey: ["adminTeam"] });
    setIsDialogOpen(false);
    resetForm();
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-white/60">Manage Jewel team members</p>
        <Button
          onClick={() => {
            resetForm();
            setIsDialogOpen(true);
          }}
          className="gradient-gold text-black"
        >
          <Plus size={18} className="mr-2" />
          Add Team Member
        </Button>
      </div>

      {/* Team Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loadingTeam ? (
          <div className="col-span-full text-center py-12">
            <Loader2 className="w-6 h-6 text-gold animate-spin mx-auto" />
          </div>
        ) : teamMembers.length === 0 ? (
          <div className="col-span-full text-center py-12 text-white/50 bg-black border border-gold/20">
            No team members added yet
          </div>
        ) : (
          teamMembers.map((member) => (
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
                      {member.name?.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleEdit(member)}
                    className="text-white hover:text-gold"
                  >
                    <Pencil size={18} />
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

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-zinc-900 border-gold/20 text-white max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-gilda text-2xl">
              {editingItem ? "Edit Team Member" : "Add Team Member"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-black border-gold/20 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label>Role *</Label>
                <Input
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
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
                onChange={(e) => setPhotoFile(e.target.files[0])}
                className="bg-black border-gold/20 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="bg-black border-gold/20 text-white min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>LinkedIn URL</Label>
                <Input
                  value={formData.linkedin_url}
                  onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                  className="bg-black border-gold/20 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label>Display Order</Label>
                <Input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                  className="bg-black border-gold/20 text-white"
                />
              </div>
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
    </div>
  );
}
