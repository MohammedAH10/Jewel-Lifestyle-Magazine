import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Trash2, Download, Mail, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export default function SubscribersAdmin() {
  const queryClient = useQueryClient();

  const { data: subscribers = [], isLoading } = useQuery({
    queryKey: ["adminSubscribers"],
    queryFn: () => base44.entities.Subscriber.list("-created_date"),
  });

  const handleToggleActive = async (id, currentStatus) => {
    await base44.entities.Subscriber.update(id, { is_active: !currentStatus });
    queryClient.invalidateQueries({ queryKey: ["adminSubscribers"] });
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this subscriber?")) return;
    await base44.entities.Subscriber.delete(id);
    queryClient.invalidateQueries({ queryKey: ["adminSubscribers"] });
  };

  const handleExportCSV = () => {
    const activeSubscribers = subscribers.filter(s => s.is_active);
    const csv = [
      "Name,Email,Subscribed Date",
      ...activeSubscribers.map(s => 
        `"${s.name || ''}","${s.email}","${s.subscribed_date || s.created_date || ''}"`
      )
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subscribers_${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const activeCount = subscribers.filter(s => s.is_active).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <p className="text-white/60">Manage newsletter subscribers</p>
          <p className="text-gold text-sm mt-1">
            {activeCount} active subscriber{activeCount !== 1 ? 's' : ''}
          </p>
        </div>
        <Button
          onClick={handleExportCSV}
          variant="outline"
          className="border-gold/30 text-gold"
        >
          <Download size={18} className="mr-2" />
          Export CSV
        </Button>
      </div>

      <div className="bg-black border border-gold/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gold/10">
                <th className="text-left px-6 py-4 text-white/60 text-sm font-normal">Email</th>
                <th className="text-left px-6 py-4 text-white/60 text-sm font-normal">Name</th>
                <th className="text-left px-6 py-4 text-white/60 text-sm font-normal">Date</th>
                <th className="text-left px-6 py-4 text-white/60 text-sm font-normal">Status</th>
                <th className="text-right px-6 py-4 text-white/60 text-sm font-normal">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Loader2 className="w-6 h-6 text-gold animate-spin mx-auto" />
                  </td>
                </tr>
              ) : subscribers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-white/50">
                    No subscribers yet
                  </td>
                </tr>
              ) : (
                subscribers.map((subscriber) => (
                  <tr key={subscriber.id} className="border-b border-gold/10 hover:bg-gold/5">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Mail size={16} className="text-gold/50" />
                        <span className="text-white">{subscriber.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white/70">
                      {subscriber.name || "—"}
                    </td>
                    <td className="px-6 py-4 text-white/60 text-sm">
                      {subscriber.subscribed_date 
                        ? format(new Date(subscriber.subscribed_date), "MMM d, yyyy")
                        : subscriber.created_date 
                          ? format(new Date(subscriber.created_date), "MMM d, yyyy")
                          : "—"}
                    </td>
                    <td className="px-6 py-4">
                      {subscriber.is_active ? (
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded">
                          Unsubscribed
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleActive(subscriber.id, subscriber.is_active)}
                          className="text-white/60 hover:text-gold"
                          title={subscriber.is_active ? "Deactivate" : "Reactivate"}
                        >
                          <UserX size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(subscriber.id)}
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
    </div>
  );
}
