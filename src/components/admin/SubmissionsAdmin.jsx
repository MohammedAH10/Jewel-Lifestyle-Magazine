import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, ExternalLink, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";

export default function SubmissionsAdmin() {
  const [viewingItem, setViewingItem] = useState(null);
  const queryClient = useQueryClient();

  const { data: submissions = [], isLoading } = useQuery({
    queryKey: ["adminSubmissions"],
    queryFn: () => base44.entities.StorySubmission.list("-created_date"),
  });

  const handleStatusChange = async (id, status) => {
    await base44.entities.StorySubmission.update(id, { status });
    queryClient.invalidateQueries({ queryKey: ["adminSubmissions"] });
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this submission?")) return;
    await base44.entities.StorySubmission.delete(id);
    queryClient.invalidateQueries({ queryKey: ["adminSubmissions"] });
  };

  const statusColors = {
    Pending: "bg-yellow-500/20 text-yellow-400",
    Reviewed: "bg-blue-500/20 text-blue-400",
    Approved: "bg-green-500/20 text-green-400",
    Rejected: "bg-red-500/20 text-red-400",
  };

  return (
    <div className="space-y-6">
      <p className="text-white/60">Manage story submissions from readers</p>

      <div className="bg-black border border-gold/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gold/10">
                <th className="text-left px-6 py-4 text-white/60 text-sm font-normal">Submitter</th>
                <th className="text-left px-6 py-4 text-white/60 text-sm font-normal">Story</th>
                <th className="text-left px-6 py-4 text-white/60 text-sm font-normal">Type</th>
                <th className="text-left px-6 py-4 text-white/60 text-sm font-normal">Date</th>
                <th className="text-left px-6 py-4 text-white/60 text-sm font-normal">Status</th>
                <th className="text-right px-6 py-4 text-white/60 text-sm font-normal">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Loader2 className="w-6 h-6 text-gold animate-spin mx-auto" />
                  </td>
                </tr>
              ) : submissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-white/50">
                    No story submissions yet
                  </td>
                </tr>
              ) : (
                submissions.map((submission) => (
                  <tr key={submission.id} className="border-b border-gold/10 hover:bg-gold/5">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white">{submission.submitter_name}</p>
                        <p className="text-white/50 text-sm">{submission.submitter_email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-white truncate max-w-xs">{submission.story_title}</p>
                    </td>
                    <td className="px-6 py-4 text-white/70">{submission.story_type}</td>
                    <td className="px-6 py-4 text-white/60 text-sm">
                      {submission.created_date && format(new Date(submission.created_date), "MMM d, yyyy")}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={submission.status || "Pending"}
                        onChange={(e) => handleStatusChange(submission.id, e.target.value)}
                        className={`text-sm px-3 py-1 rounded border-0 ${statusColors[submission.status || "Pending"]}`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Reviewed">Reviewed</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setViewingItem(submission)}
                          className="text-white/60 hover:text-gold"
                        >
                          <Eye size={16} />
                        </Button>
                        {submission.attachment_url && (
                          <a
                            href={submission.attachment_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-white/60 hover:text-gold transition-colors"
                          >
                            <ExternalLink size={16} />
                          </a>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(submission.id)}
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

      {/* View Dialog */}
      <Dialog open={!!viewingItem} onOpenChange={() => setViewingItem(null)}>
        <DialogContent className="bg-zinc-900 border-gold/20 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-gilda text-2xl">Story Submission</DialogTitle>
          </DialogHeader>

          {viewingItem && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-white/50 text-sm">Submitter</p>
                  <p className="text-white font-medium">{viewingItem.submitter_name}</p>
                  <p className="text-white/60 text-sm">{viewingItem.submitter_email}</p>
                  {viewingItem.submitter_phone && (
                    <p className="text-white/60 text-sm">{viewingItem.submitter_phone}</p>
                  )}
                </div>
                <div>
                  <p className="text-white/50 text-sm">Story Type</p>
                  <p className="text-white">{viewingItem.story_type}</p>
                </div>
              </div>

              <div>
                <p className="text-white/50 text-sm mb-2">Story Title</p>
                <p className="text-white font-medium text-lg">{viewingItem.story_title}</p>
              </div>

              <div>
                <p className="text-white/50 text-sm mb-2">Description</p>
                <p className="text-white/80 bg-black p-4 rounded border border-gold/10 whitespace-pre-wrap">
                  {viewingItem.story_description}
                </p>
              </div>

              {viewingItem.attachment_url && (
                <div>
                  <p className="text-white/50 text-sm mb-2">Attachment</p>
                  <a
                    href={viewingItem.attachment_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-gold hover:underline"
                  >
                    <ExternalLink size={16} />
                    View Attachment
                  </a>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
