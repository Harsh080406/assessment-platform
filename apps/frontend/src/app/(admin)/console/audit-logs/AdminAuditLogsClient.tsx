"use client";

import { useState } from "react";
import {
  Search,
  Eye,
  X,
  Copy,
  Check,
  ShieldAlert,
  Clock,
  User,
  ExternalLink,
} from "lucide-react";
import { AuditResult } from "@prisma/client";
import AdminStatusPill, { AdminTag } from "@/components/admin/AdminStatusPill";
import {
  AdminTableToolbar,
  AdminTablePagination,
  AdminEmptyState,
  type ActiveFilter,
} from "@/components/admin/AdminDataTable";

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
  const [logs] = useState<AuditLogItem[]>(initialLogs);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // Side Panel / Drawer State
  const [inspectingLog, setInspectingLog] = useState<AuditLogItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

  const paginatedLogs = filteredLogs.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const uniqueActions = Array.from(new Set(logs.map((l) => l.action)));

  const activeFilters: ActiveFilter[] = [];
  if (actionFilter !== "ALL") {
    activeFilters.push({
      key: "action",
      label: "Event",
      valueLabel: actionFilter,
    });
  }

  const handleCopyId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatRelativeTime = (isoDate: string) => {
    const diffMs = Date.now() - new Date(isoDate).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffDay > 0) return `${diffDay}d ago`;
    if (diffHour > 0) return `${diffHour}h ago`;
    if (diffMin > 0) return `${diffMin}m ago`;
    return "just now";
  };

  return (
    <div className="space-y-4">
      {/* Toolbar: Event Type Dropdown & Search */}
      <AdminTableToolbar
        searchValue={searchQuery}
        onSearchChange={(val) => {
          setSearchQuery(val);
          setPage(1);
        }}
        searchPlaceholder="Search event, resource, actor email..."
        filters={
          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(1);
            }}
            className="py-1.5 px-2.5 rounded-lg border border-[#E2E8F0] bg-white text-xs font-semibold text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-indigo-500"
            aria-label="Filter by action event"
          >
            <option value="ALL">All Event Types ({logs.length})</option>
            {uniqueActions.map((act) => (
              <option key={act} value={act}>
                {act}
              </option>
            ))}
          </select>
        }
        activeFilters={activeFilters}
        onRemoveFilter={() => {
          setActionFilter("ALL");
          setPage(1);
        }}
        onClearAllFilters={() => {
          setActionFilter("ALL");
          setSearchQuery("");
          setPage(1);
        }}
      />

      {/* Audit Log Table / Cards Container */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
        {filteredLogs.length === 0 ? (
          <AdminEmptyState
            title="No audit entries match filter"
            description="There are currently no immutable log records matching the selected query or action event."
            action={
              (actionFilter !== "ALL" || searchQuery) && (
                <button
                  type="button"
                  onClick={() => {
                    setActionFilter("ALL");
                    setSearchQuery("");
                  }}
                  className="px-3.5 py-2 rounded-xl bg-white border border-[#E2E8F0] text-xs font-semibold text-[#0F172A] hover:bg-[#F8FAFC]"
                >
                  Clear filters
                </button>
              )
            }
          />
        ) : (
          <>
            {/* Desktop Table (>=768px) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse table-fixed">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                    <th className="py-3 px-4 w-[20%]">Timestamp</th>
                    <th className="py-3 px-4 w-[24%]">Event Type</th>
                    <th className="py-3 px-4 w-[24%]">Resource</th>
                    <th className="py-3 px-4 w-[18%]">Actor</th>
                    <th className="py-3 px-4 w-[8%]">Result</th>
                    <th className="py-3 px-4 w-[6%] text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9] text-xs">
                  {paginatedLogs.map((log) => {
                    const shortId = log.resourceId
                      ? `${log.resourceId.slice(0, 8)}...`
                      : null;

                    return (
                      <tr
                        key={log.id}
                        onClick={() => setInspectingLog(log)}
                        className="hover:bg-[#F8FAFC] transition-colors cursor-pointer group"
                      >
                        {/* Timestamp: Absolute with Relative Tooltip */}
                        <td className="py-3.5 px-4 font-mono text-[11px] text-[#64748B] tabular-nums">
                          <span title={formatRelativeTime(log.createdAt)}>
                            {new Date(log.createdAt).toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            })}
                          </span>
                        </td>

                        {/* Event Type: Quiet Tag */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-mono font-medium border truncate max-w-full ${
                              log.result === AuditResult.FAILURE
                                ? "bg-red-50 text-red-700 border-red-200"
                                : "bg-[#F8FAFC] text-[#334155] border-[#E2E8F0]"
                            }`}
                          >
                            {log.action}
                          </span>
                        </td>

                        {/* Resource with Short ID + Copy Button */}
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-[#0F172A] truncate">
                            {log.resource}
                          </div>
                          {log.resourceId && (
                            <div className="flex items-center gap-1.5 text-[11px] text-[#64748B] font-mono mt-0.5">
                              <span className="truncate">{shortId}</span>
                              <button
                                type="button"
                                onClick={(e) => handleCopyId(log.resourceId!, e)}
                                className="text-[#94A3B8] hover:text-[#0F172A] p-0.5 rounded transition-colors"
                                title="Copy ID to clipboard"
                                aria-label="Copy Resource ID"
                              >
                                {copiedId === log.resourceId ? (
                                  <Check className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          )}
                        </td>

                        {/* Actor Email */}
                        <td className="py-3.5 px-4 text-[#475569] font-mono text-[11px] truncate">
                          {log.userEmail || "system"}
                        </td>

                        {/* Result Pill */}
                        <td className="py-3.5 px-4">
                          {log.result === AuditResult.SUCCESS ? (
                            <AdminStatusPill label="OK" variant="success" dot={false} />
                          ) : (
                            <AdminStatusPill label="Fail" variant="danger" dot={false} />
                          )}
                        </td>

                        {/* Inspect Eye Icon */}
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => setInspectingLog(log)}
                            className="p-1.5 rounded-lg border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#64748B] group-hover:text-[#0F172A] transition-colors"
                            aria-label="View Audit Entry Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List (<768px) */}
            <div className="md:hidden divide-y divide-[#F1F5F9]">
              {paginatedLogs.map((log) => (
                <div
                  key={log.id}
                  onClick={() => setInspectingLog(log)}
                  className="p-4 space-y-2 cursor-pointer hover:bg-[#F8FAFC] transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-mono font-medium border ${
                        log.result === AuditResult.FAILURE
                          ? "bg-red-50 text-red-700 border-red-200"
                          : "bg-[#F8FAFC] text-[#334155] border-[#E2E8F0]"
                      }`}
                    >
                      {log.action}
                    </span>
                    {log.result === AuditResult.SUCCESS ? (
                      <AdminStatusPill label="Success" variant="success" />
                    ) : (
                      <AdminStatusPill label="Failure" variant="danger" />
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#0F172A]">{log.resource}</span>
                    <span className="text-[#64748B] font-mono text-[11px]">
                      {formatRelativeTime(log.createdAt)}
                    </span>
                  </div>

                  <div className="text-[11px] text-[#64748B] font-mono truncate">
                    Actor: {log.userEmail || "system"}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="p-3 border-t border-[#F1F5F9]">
              <AdminTablePagination
                page={page}
                pageSize={pageSize}
                totalCount={filteredLogs.length}
                onPageChange={setPage}
                onPageSizeChange={(newSize) => {
                  setPageSize(newSize);
                  setPage(1);
                }}
              />
            </div>
          </>
        )}
      </div>

      {/* Audit Log Detail Side Panel (Desktop) / Bottom Sheet (Mobile) */}
      {inspectingLog && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-end animate-in fade-in-0 duration-150"
        >
          <div className="bg-white w-full max-w-lg h-full overflow-y-auto border-l border-[#E2E8F0] shadow-2xl p-5 sm:p-6 space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
                <div>
                  <h3 className="font-bold text-sm text-[#0F172A]">
                    Audit Record Details
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-mono font-bold text-indigo-700">
                      {inspectingLog.action}
                    </span>
                    {inspectingLog.result === AuditResult.SUCCESS ? (
                      <AdminStatusPill label="Success" variant="success" />
                    ) : (
                      <AdminStatusPill label="Failure" variant="danger" />
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setInspectingLog(null)}
                  className="text-[#94A3B8] hover:text-[#0F172A] p-1"
                  aria-label="Close panel"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Key Values */}
              <div className="space-y-2.5 text-xs">
                <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[#64748B]">Event Timestamp:</span>
                    <span className="font-mono text-[#0F172A] font-medium tabular-nums">
                      {new Date(inspectingLog.createdAt).toUTCString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#64748B]">Actor Account:</span>
                    <span className="font-mono text-[#0F172A] font-semibold">
                      {inspectingLog.userEmail || "system"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#64748B]">Target Resource:</span>
                    <span className="font-semibold text-[#0F172A]">
                      {inspectingLog.resource}
                    </span>
                  </div>
                  {inspectingLog.resourceId && (
                    <div className="flex items-center justify-between">
                      <span className="text-[#64748B]">Resource ID:</span>
                      <span className="font-mono text-[#0F172A] select-all">
                        {inspectingLog.resourceId}
                      </span>
                    </div>
                  )}
                  {inspectingLog.ipAddress && (
                    <div className="flex items-center justify-between">
                      <span className="text-[#64748B]">Network IP:</span>
                      <span className="font-mono text-[#0F172A]">
                        {inspectingLog.ipAddress}
                      </span>
                    </div>
                  )}
                </div>

                {/* Structured JSON Payload */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#0F172A]">
                      Event Payload Metadata
                    </span>
                    <button
                      type="button"
                      onClick={(e) =>
                        handleCopyId(JSON.stringify(inspectingLog.metadata, null, 2), e)
                      }
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:underline"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedId ? "Copied" : "Copy JSON"}</span>
                    </button>
                  </div>
                  <pre className="p-3 bg-[#0F172A] text-slate-100 rounded-lg text-xs font-mono overflow-x-auto max-h-80 leading-relaxed">
                    {JSON.stringify(inspectingLog.metadata, null, 2)}
                  </pre>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#F1F5F9] flex justify-end">
              <button
                type="button"
                onClick={() => setInspectingLog(null)}
                className="px-4 py-2 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-xl text-xs font-semibold"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
