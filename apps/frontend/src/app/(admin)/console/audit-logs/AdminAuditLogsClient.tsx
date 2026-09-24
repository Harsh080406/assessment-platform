"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  ScrollText,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Eye,
  X,
  User,
} from "lucide-react";
import { AuditResult } from "@prisma/client";

interface AuditLogItem {
  id: string;
  userId: string | null;
  userEmail: string | null;
  action: string;
  resource: string;
  resourceId: string | null;
  ipAddress: string | null;
  metadata: any;
  result: AuditResult;
  createdAt: string;
}

interface AdminAuditLogsClientProps {
  initialLogs: AuditLogItem[];
}

export default function AdminAuditLogsClient({ initialLogs }: AdminAuditLogsClientProps) {
  const [logs, setLogs] = useState<AuditLogItem[]>(initialLogs);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("ALL");
  const [inspectingLog, setInspectingLog] = useState<AuditLogItem | null>(null);

  const filteredLogs = logs.filter((l) => {
    const matchesAction = actionFilter === "ALL" || l.action === actionFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      l.action.toLowerCase().includes(q) ||
      l.resource.toLowerCase().includes(q) ||
      (l.resourceId && l.resourceId.toLowerCase().includes(q)) ||
      (l.userEmail && l.userEmail.toLowerCase().includes(q));

    return matchesAction && matchesQuery;
  });

  const uniqueActions = Array.from(new Set(logs.map((l) => l.action)));

  return (
    <div className="space-y-6">
      {/* Control Bar */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-[#64748B]">Action Event:</label>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-bold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="ALL">All Audit Actions</option>
            {uniqueActions.map((act) => (
              <option key={act} value={act}>
                {act}
              </option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search action, resource, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white text-xs font-medium text-[#0F172A] border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <Filter className="w-10 h-10 text-[#CBD5E1] mx-auto mb-3" />
            <h3 className="text-base font-extrabold text-[#0F172A]">No audit entries match filter</h3>
            <p className="text-xs text-[#64748B] max-w-sm mx-auto mt-1">
              There are currently no audit log records matching the selected search query or action filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[11px] font-extrabold uppercase tracking-wider text-[#64748B]">
                  <th className="py-3.5 px-6">Timestamp</th>
                  <th className="py-3.5 px-4">Action Event</th>
                  <th className="py-3.5 px-4">Resource</th>
                  <th className="py-3.5 px-4">Actor Email</th>
                  <th className="py-3.5 px-4">Result</th>
                  <th className="py-3.5 px-6 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9] text-xs font-medium font-mono">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#F8FAFC] transition-colors">
                    {/* Timestamp */}
                    <td className="py-4 px-6 text-[#64748B]">
                      {new Date(log.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </td>

                    {/* Action */}
                    <td className="py-4 px-4 font-sans font-bold text-[#0F172A]">
                      <span className="px-2.5 py-1 rounded-md bg-[#EEF2FF] text-[#4F46E5] border border-[#E0E7FE] text-xs inline-block">
                        {log.action}
                      </span>
                    </td>

                    {/* Resource */}
                    <td className="py-4 px-4 text-[#0F172A]">
                      <span className="font-semibold">{log.resource}</span>
                      {log.resourceId && (
                        <span className="text-[10px] text-[#94A3B8] block truncate max-w-[120px]">
                          ID: {log.resourceId}
                        </span>
                      )}
                    </td>

                    {/* Actor Email */}
                    <td className="py-4 px-4 font-sans text-[#475569]">
                      {log.userEmail || "System / Guest"}
                    </td>

                    {/* Result */}
                    <td className="py-4 px-4 font-sans">
                      {log.result === AuditResult.SUCCESS ? (
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                          SUCCESS
                        </span>
                      ) : (
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">
                          FAILURE
                        </span>
                      )}
                    </td>

                    {/* Inspector Action */}
                    <td className="py-4 px-6 text-right font-sans">
                      <button
                        onClick={() => setInspectingLog(log)}
                        className="p-1.5 rounded-lg border border-[#E2E8F0] hover:bg-[#F1F5F9] text-[#0F172A] transition-colors"
                        title="Inspect Event Metadata JSON"
                      >
                        <Eye className="w-4 h-4 text-[#4F46E5]" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* METADATA JSON INSPECTOR MODAL */}
      {inspectingLog && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl w-full max-w-lg p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div>
                <h3 className="font-bold text-base text-[#0F172A]">
                  Audit Event: {inspectingLog.action}
                </h3>
                <p className="text-xs text-[#64748B] font-mono">
                  {new Date(inspectingLog.createdAt).toISOString()}
                </p>
              </div>
              <button
                onClick={() => setInspectingLog(null)}
                className="p-1.5 text-gray-400 hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold text-[#0F172A]">Event Metadata Object</div>
              <pre className="p-4 bg-[#0F172A] text-emerald-400 rounded-xl text-xs font-mono overflow-x-auto max-h-60 leading-relaxed">
                {JSON.stringify(inspectingLog.metadata || {}, null, 2)}
              </pre>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setInspectingLog(null)}
                className="px-4 py-2 bg-[#0F172A] text-white text-xs font-bold rounded-xl"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
