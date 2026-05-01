import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Loader2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const slideTypes = ["Interview", "Award", "Event", "Magazine"];

export default function HeroSlidesAdmin() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    link_url: "",
    link_text: "",
    slide_type: "Interview",
    order: 0,
    is_active: true,
  });
  const [imageFile, setImageFile] = useState(null);

  const queryClient = useQueryClient();

  const { data: slides = [], isLoading: loadingSlides } = useQuery({
    queryKey: ["adminHeroSlides"],
    queryFn: () => base44.entities.HeroSlide.list("order"),
  });

  const resetForm = () => {
    setFormData({
      title: "",
      subtitle: "",
      link_url: "",
      link_text: "",
      slide_type: "Interview",
      order: slides.length,
      is_active: true,
    });
    setImageFile(null);
    setEditingItem(null);
  };

  const handleEdit = (slide) => {
    setEditingItem(slide);
    setFormData({
      title: slide.title || "",
      subtitle: slide.subtitle || "",
      link_url: slide.link_url || "",
      link_text: slide.link_text || "",
      slide_type: slide.slide_type || "Interview",
      order: slide.order || 0,
      is_active: slide.is_active !== false,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this slide?")) return;
    await base44.entities.HeroSlide.delete(id);
    queryClient.invalidateQueries({ queryKey: ["adminHeroSlides"] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    let image_url = editingItem?.image_url || "";

    if (imageFile) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: imageFile });
      image_url = file_url;
    }

    const data = { ...formData, image_url };

    if (editingItem) {
      await base44.entities.HeroSlide.update(editingItem.id, data);
    } else {
      await base44.entities.HeroSlide.create(data);
    }

    queryClient.invalidateQueries({ queryKey: ["adminHeroSlides"] });
    setIsDialogOpen(false);
    resetForm();
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-white/60">Manage homepage hero carousel slides</p>
        <Button
          onClick={() => {
            resetForm();
            setIsDialogOpen(true);
          }}
          className="gradient-gold text-black"
        >
          <Plus size={18} className="mr-2" />
          Add Slide
        </Button>
      </div>

      {/* Slides List */}
      <div className="space-y-4">
        {loadingSlides ? (
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
              <GripVertical className="w-5 h-5 text-white/30" />
              
              {slide.image_url && (
                <div className="w-32 h-20 flex-shrink-0 overflow-hidden">
                  <img
                    src={slide.image_url}
                    alt={slide.title}
                    className="w-full h-full object-cover"
                  />
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
              </div>

              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(slide)}
                  className="text-white/60 hover:text-gold"
                >
                  <Pencil size={16} />
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

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-zinc-900 border-gold/20 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-gilda text-2xl">
              {editingItem ? "Edit Slide" : "Add New Slide"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-black border-gold/20 text-white"
                placeholder="Main headline"
              />
            </div>

            <div className="space-y-2">
              <Label>Subtitle</Label>
              <Input
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                className="bg-black border-gold/20 text-white"
                placeholder="Supporting text"
              />
            </div>

            <div className="space-y-2">
              <Label>Background Image *</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])}
                className="bg-black border-gold/20 text-white"
              />
              {editingItem?.image_url && !imageFile && (
                <p className="text-white/50 text-sm">Current image will be kept if no new file selected</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Slide Type</Label>
                <Select
                  value={formData.slide_type}
                  onValueChange={(value) => setFormData({ ...formData, slide_type: value })}
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
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                  className="bg-black border-gold/20 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Link URL</Label>
                <Input
                  value={formData.link_url}
                  onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                  className="bg-black border-gold/20 text-white"
                  placeholder="/ExecutiveInterviews?id=xxx"
                />
              </div>
              <div className="space-y-2">
                <Label>Link Button Text</Label>
                <Input
                  value={formData.link_text}
                  onChange={(e) => setFormData({ ...formData, link_text: e.target.value })}
                  className="bg-black border-gold/20 text-white"
                  placeholder="e.g., Read More"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label>Active (visible on homepage)</Label>
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
