import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Loader2, X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const categories = ["Tech", "Fashion", "Hospitality", "Business", "Finance", "Healthcare", "Entertainment", "Other"];
const interviewTypes = ["Article", "Q&A", "Video"];

export default function InterviewsAdmin() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    company: "",
    category: "",
    interview_type: "Article",
    excerpt: "",
    content: "",
    video_url: "",
    is_featured: false,
    is_cover_story: false,
    published_date: new Date().toISOString().split("T")[0],
  });
  const [coverFile, setCoverFile] = useState(null);
  const [headshotFile, setHeadshotFile] = useState(null);

  const queryClient = useQueryClient();

  const { data: interviews = [], isLoading: loadingInterviews } = useQuery({
    queryKey: ["adminInterviews"],
    queryFn: () => base44.entities.ExecutiveInterview.list("-published_date"),
  });

  const resetForm = () => {
    setFormData({
      name: "",
      title: "",
      company: "",
      category: "",
      interview_type: "Article",
      excerpt: "",
      content: "",
      video_url: "",
      is_featured: false,
      is_cover_story: false,
      published_date: new Date().toISOString().split("T")[0],
    });
    setCoverFile(null);
    setHeadshotFile(null);
    setEditingItem(null);
  };

  const handleEdit = (interview) => {
    setEditingItem(interview);
    setFormData({
      name: interview.name || "",
      title: interview.title || "",
      company: interview.company || "",
      category: interview.category || "",
      interview_type: interview.interview_type || "Article",
      excerpt: interview.excerpt || "",
      content: interview.content || "",
      video_url: interview.video_url || "",
      is_featured: interview.is_featured || false,
      is_cover_story: interview.is_cover_story || false,
      published_date: interview.published_date || new Date().toISOString().split("T")[0],
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this interview?")) return;
    await base44.entities.ExecutiveInterview.delete(id);
    queryClient.invalidateQueries({ queryKey: ["adminInterviews"] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    let cover_image_url = editingItem?.cover_image_url || "";
    let headshot_url = editingItem?.headshot_url || "";

    if (coverFile) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: coverFile });
      cover_image_url = file_url;
    }

    if (headshotFile) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: headshotFile });
      headshot_url = file_url;
    }

    const data = { ...formData, cover_image_url, headshot_url };

    if (editingItem) {
      await base44.entities.ExecutiveInterview.update(editingItem.id, data);
    } else {
      await base44.entities.ExecutiveInterview.create(data);
    }

    queryClient.invalidateQueries({ queryKey: ["adminInterviews"] });
    setIsDialogOpen(false);
    resetForm();
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-white/60">Manage executive interviews and features</p>
        <Button
          onClick={() => {
            resetForm();
            setIsDialogOpen(true);
          }}
          className="gradient-gold text-black"
        >
          <Plus size={18} className="mr-2" />
          Add Interview
        </Button>
      </div>

      {/* Interviews Table */}
      <div className="bg-black border border-gold/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gold/10">
                <th className="text-left px-6 py-4 text-white/60 text-sm font-normal">Name</th>
                <th className="text-left px-6 py-4 text-white/60 text-sm font-normal">Title</th>
                <th className="text-left px-6 py-4 text-white/60 text-sm font-normal">Category</th>
                <th className="text-left px-6 py-4 text-white/60 text-sm font-normal">Type</th>
                <th className="text-left px-6 py-4 text-white/60 text-sm font-normal">Featured</th>
                <th className="text-right px-6 py-4 text-white/60 text-sm font-normal">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loadingInterviews ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Loader2 className="w-6 h-6 text-gold animate-spin mx-auto" />
                  </td>
                </tr>
              ) : interviews.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-white/50">
                    No interviews yet
                  </td>
                </tr>
              ) : (
                interviews.map((interview) => (
                  <tr key={interview.id} className="border-b border-gold/10 hover:bg-gold/5">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {interview.headshot_url && (
                          <img
                            src={interview.headshot_url}
                            alt={interview.name}
                            className="w-10 h-10 object-cover rounded"
                          />
                        )}
                        <span className="text-white">{interview.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white/70">{interview.title}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-gold/20 text-gold text-xs rounded">
                        {interview.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white/70">{interview.interview_type}</td>
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
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(interview)}
                          className="text-white/60 hover:text-gold"
                        >
                          <Pencil size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(interview.id)}
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

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-zinc-900 border-gold/20 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-gilda text-2xl">
              {editingItem ? "Edit Interview" : "Add New Interview"}
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
                <Label>Title/Position *</Label>
                <Input
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-black border-gold/20 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Company *</Label>
                <Input
                  required
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="bg-black border-gold/20 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger className="bg-black border-gold/20 text-white">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-gold/20">
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat} className="text-white">
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Interview Type</Label>
                <Select
                  value={formData.interview_type}
                  onValueChange={(value) => setFormData({ ...formData, interview_type: value })}
                >
                  <SelectTrigger className="bg-black border-gold/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-gold/20">
                    {interviewTypes.map((type) => (
                      <SelectItem key={type} value={type} className="text-white">
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Published Date</Label>
                <Input
                  type="date"
                  value={formData.published_date}
                  onChange={(e) => setFormData({ ...formData, published_date: e.target.value })}
                  className="bg-black border-gold/20 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cover Image</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCoverFile(e.target.files[0])}
                  className="bg-black border-gold/20 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label>Headshot Photo</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setHeadshotFile(e.target.files[0])}
                  className="bg-black border-gold/20 text-white"
                />
              </div>
            </div>

            {formData.interview_type === "Video" && (
              <div className="space-y-2">
                <Label>Video URL</Label>
                <Input
                  value={formData.video_url}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                  className="bg-black border-gold/20 text-white"
                  placeholder="YouTube or Vimeo embed URL"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Short Excerpt</Label>
              <Textarea
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                className="bg-black border-gold/20 text-white min-h-[80px]"
                placeholder="Brief preview text for listings"
              />
            </div>

            <div className="space-y-2">
              <Label>Full Content (Markdown supported) *</Label>
              <Textarea
                required
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="bg-black border-gold/20 text-white min-h-[200px]"
                placeholder="Full interview content..."
              />
            </div>

            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-3">
                <Switch
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                />
                <Label>Featured Interview</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={formData.is_cover_story}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_cover_story: checked })}
                />
                <Label>Cover Story</Label>
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
