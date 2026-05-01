import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function MagazineAdmin() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    issue_number: "",
    month: "",
    year: new Date().getFullYear(),
    description: "",
    flipbook_url: "",
    pdf_url: "",
    is_current: false,
  });
  const [coverFile, setCoverFile] = useState(null);

  const queryClient = useQueryClient();

  const { data: issues = [], isLoading: loadingIssues } = useQuery({
    queryKey: ["adminMagazineIssues"],
    queryFn: () => base44.entities.MagazineIssue.list("-year"),
  });

  const resetForm = () => {
    setFormData({
      title: "",
      issue_number: "",
      month: "",
      year: new Date().getFullYear(),
      description: "",
      flipbook_url: "",
      pdf_url: "",
      is_current: false,
    });
    setCoverFile(null);
    setEditingItem(null);
  };

  const handleEdit = (issue) => {
    setEditingItem(issue);
    setFormData({
      title: issue.title || "",
      issue_number: issue.issue_number || "",
      month: issue.month || "",
      year: issue.year || new Date().getFullYear(),
      description: issue.description || "",
      flipbook_url: issue.flipbook_url || "",
      pdf_url: issue.pdf_url || "",
      is_current: issue.is_current || false,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this issue?")) return;
    await base44.entities.MagazineIssue.delete(id);
    queryClient.invalidateQueries({ queryKey: ["adminMagazineIssues"] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    let cover_image_url = editingItem?.cover_image_url || "";

    if (coverFile) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: coverFile });
      cover_image_url = file_url;
    }

    // If setting as current, unset others
    if (formData.is_current) {
      const currentIssues = issues.filter(i => i.is_current && i.id !== editingItem?.id);
      for (const issue of currentIssues) {
        await base44.entities.MagazineIssue.update(issue.id, { is_current: false });
      }
    }

    const data = { ...formData, cover_image_url };

    if (editingItem) {
      await base44.entities.MagazineIssue.update(editingItem.id, data);
    } else {
      await base44.entities.MagazineIssue.create(data);
    }

    queryClient.invalidateQueries({ queryKey: ["adminMagazineIssues"] });
    setIsDialogOpen(false);
    resetForm();
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-white/60">Manage digital magazine issues</p>
        <Button
          onClick={() => {
            resetForm();
            setIsDialogOpen(true);
          }}
          className="gradient-gold text-black"
        >
          <Plus size={18} className="mr-2" />
          Add Issue
        </Button>
      </div>

      {/* Issues Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loadingIssues ? (
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
                  <img
                    src={issue.cover_image_url}
                    alt={issue.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                    <span className="text-white/30">No Cover</span>
                  </div>
                )}
                {issue.is_current && (
                  <div className="absolute top-2 right-2 px-2 py-1 bg-gold text-black text-xs font-medium">
                    Current Issue
                  </div>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleEdit(issue)}
                    className="text-white hover:text-gold"
                  >
                    <Pencil size={18} />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(issue.id)}
                    className="text-white hover:text-red-400"
                  >
                    <Trash2 size={18} />
                  </Button>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-white font-medium truncate">{issue.title}</h3>
                <p className="text-white/50 text-sm">{issue.month} {issue.year}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-zinc-900 border-gold/20 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-gilda text-2xl">
              {editingItem ? "Edit Issue" : "Add New Issue"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label>Issue Title *</Label>
              <Input
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-black border-gold/20 text-white"
                placeholder="e.g., The Innovation Issue"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Month *</Label>
                <Select
                  value={formData.month}
                  onValueChange={(value) => setFormData({ ...formData, month: value })}
                >
                  <SelectTrigger className="bg-black border-gold/20 text-white">
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-gold/20">
                    {months.map((month) => (
                      <SelectItem key={month} value={month} className="text-white">
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Year *</Label>
                <Input
                  type="number"
                  required
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                  className="bg-black border-gold/20 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label>Issue Number</Label>
                <Input
                  value={formData.issue_number}
                  onChange={(e) => setFormData({ ...formData, issue_number: e.target.value })}
                  className="bg-black border-gold/20 text-white"
                  placeholder="e.g., Vol. 2, No. 5"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Cover Image *</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setCoverFile(e.target.files[0])}
                className="bg-black border-gold/20 text-white"
              />
              {editingItem?.cover_image_url && !coverFile && (
                <p className="text-white/50 text-sm">Current cover will be kept if no new file selected</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-black border-gold/20 text-white min-h-[100px]"
                placeholder="Brief description of this issue..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Flipbook URL</Label>
                <Input
                  value={formData.flipbook_url}
                  onChange={(e) => setFormData({ ...formData, flipbook_url: e.target.value })}
                  className="bg-black border-gold/20 text-white"
                  placeholder="Online viewer URL"
                />
              </div>
              <div className="space-y-2">
                <Label>PDF Download URL</Label>
                <Input
                  value={formData.pdf_url}
                  onChange={(e) => setFormData({ ...formData, pdf_url: e.target.value })}
                  className="bg-black border-gold/20 text-white"
                  placeholder="Direct PDF link"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                checked={formData.is_current}
                onCheckedChange={(checked) => setFormData({ ...formData, is_current: checked })}
              />
              <Label>Set as Current Issue</Label>
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
