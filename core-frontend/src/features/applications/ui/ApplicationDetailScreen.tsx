import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Archive,
  Building2,
  CalendarDays,
  ChevronDown,
  ExternalLink,
  MapPin,
  Pencil,
  Trash2,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import { StatusBadge, PriorityBadge } from "../../../components/ui/badge";
import { PageSpinner } from "../../../components/ui/spinner";
import { EmptyState } from "../../../components/ui/empty-state";
import { ConfirmDialog } from "../../../components/ui/confirm-dialog";
import { Textarea } from "../../../components/ui/input";
import { ShowMoreButton } from "../../../components/ui/show-more-button";
import { useCollapse } from "../../../hooks/useCollapse";
import {
  useApplication,
  useUpdateStatus,
  useArchiveApplication,
  useDeleteApplication,
} from "../api/applications-api";
import { useRoadmap } from "../../roadmap/api/roadmap-api";
import { RoadmapSection } from "../../roadmap/ui/RoadmapSection";
import { useTimeline } from "../../timeline/api/timeline-api";
import { useNotes, useCreateNote, useDeleteNote } from "../api/notes-api";
import { FollowUpSection } from "../../productivity/ui/FollowUpSection";
import { StageTasksSection } from "../../roadmap/ui/StageTasksSection";
import { ApplicationForm } from "./ApplicationForm";
import { getApiMessage } from "../../../lib/api-client";
import { ApiErrorAlert } from "../../../components/ui/api-error-alert";
import type { ApplicationStatus } from "../../../types/api";
import { cn } from "cn";

const ALL_STATUSES: ApplicationStatus[] = [
  "WISHLIST",
  "APPLIED",
  "IN_REVIEW",
  "ASSESSMENT",
  "INTERVIEW",
  "OFFER",
  "HIRED",
  "REJECTED",
  "WITHDRAWN",
  "ON_HOLD",
  "GHOSTED",
];

// Tabs for the left column
type Tab = "roadmap" | "stage-tasks" | "followups" | "notes";
const TABS: { id: Tab; label: string }[] = [
  { id: "roadmap", label: "Roadmap" },
  { id: "stage-tasks", label: "Stage Tasks" },
  { id: "followups", label: "Follow-up" },
  { id: "notes", label: "Catatan" },
];

export function ApplicationDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<Tab>("roadmap");
  const [showEdit, setShowEdit] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [noteContent, setNoteContent] = useState("");
  const [noteError, setNoteError] = useState("");

  const { data: application, isLoading } = useApplication(id ?? "");
  const { data: roadmap, isLoading: roadmapLoading } = useRoadmap(id ?? "");
  const { data: timeline = [] } = useTimeline(id ?? "");
  const { data: notes = [] } = useNotes(id ?? "");

  // Collapse state
  const timelineCollapse = useCollapse(timeline.length);
  const notesCollapse = useCollapse(notes.length);

  const updateStatus = useUpdateStatus(id ?? "");
  const archiveMutation = useArchiveApplication();
  const deleteMutation = useDeleteApplication();
  const createNote = useCreateNote(id ?? "");
  const deleteNote = useDeleteNote(id ?? "");

  const handleStatusChange = async (status: ApplicationStatus) => {
    setShowStatusMenu(false);
    await updateStatus.mutateAsync({ status });
  };

  const handleArchive = async () => {
    if (!application) return;
    await archiveMutation.mutateAsync({
      id: application.id,
      archive: !application.archived,
    });
  };

  const handleDelete = async () => {
    if (!id) return;
    await deleteMutation.mutateAsync(id);
    navigate("/applications", { replace: true });
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;
    setNoteError("");
    try {
      await createNote.mutateAsync({
        content: noteContent.trim(),
        pinned: true,
      });
      setNoteContent("");
    } catch (err) {
      setNoteError(getApiMessage(err));
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  const formatDateTime = (d: string) =>
    new Date(d).toLocaleString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  if (isLoading) return <PageSpinner />;
  if (!application)
    return (
      <div className="py-20 text-center text-[#68736a]">
        Lamaran tidak ditemukan.
      </div>
    );

  const salary = (() => {
    const fmt = (n: number) => new Intl.NumberFormat("id-ID").format(n);
    if (application.salaryRangeMin && application.salaryRangeMax)
      return `Rp ${fmt(application.salaryRangeMin)} – ${fmt(application.salaryRangeMax)}`;
    if (application.salaryRangeMin)
      return `Rp ${fmt(application.salaryRangeMin)}+`;
    if (application.salaryRangeMax)
      return `s/d Rp ${fmt(application.salaryRangeMax)}`;
    return null;
  })();

  return (
    <div className="mx-auto max-w-5xl">
      {/* Back */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-5 flex items-center gap-1.5 text-sm text-[#68736a] hover:text-[#17211b]"
      >
        <ArrowLeft size={15} /> Kembali
      </button>

      {/* ── Header card ── */}
      <div className="mb-5 rounded-xl border border-[#d9dfd5] bg-white p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <StatusBadge status={application.status} />
              <PriorityBadge priority={application.priority} />
              {application.archived && (
                <span className="rounded-full bg-[#f0f0ec] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#68736a]">
                  Arsip
                </span>
              )}
            </div>
            <h1 className="mt-2 text-2xl font-semibold text-[#17211b]">
              {application.position}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-[#68736a]">
              <span className="flex items-center gap-1">
                <Building2 size={14} /> {application.companyName}
              </span>
              {application.location && (
                <span className="flex items-center gap-1">
                  <MapPin size={14} /> {application.location}
                </span>
              )}
              <span className="flex items-center gap-1">
                <CalendarDays size={14} /> {formatDate(application.appliedDate)}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {application.employmentType && (
                <span className="rounded-full border border-[#d9dfd5] px-2.5 py-0.5 text-xs text-[#4a5c4e]">
                  {application.employmentType.replace("_", " ")}
                </span>
              )}
              {application.workArrangement && (
                <span className="rounded-full border border-[#d9dfd5] px-2.5 py-0.5 text-xs text-[#4a5c4e]">
                  {application.workArrangement}
                </span>
              )}
              {application.source && (
                <span className="rounded-full border border-[#d9dfd5] px-2.5 py-0.5 text-xs text-[#4a5c4e]">
                  {application.source.replace(/_/g, " ")}
                </span>
              )}
              {salary && (
                <span className="rounded-full border border-[#d9dfd5] px-2.5 py-0.5 text-xs text-[#4a5c4e]">
                  {salary}
                </span>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex shrink-0 items-start gap-2">
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowStatusMenu((v) => !v)}
                className="gap-1"
              >
                Ubah Status <ChevronDown size={13} />
              </Button>
              {showStatusMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowStatusMenu(false)}
                  />
                  <div className="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-lg border border-[#d9dfd5] bg-white shadow-lg">
                    {ALL_STATUSES.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => void handleStatusChange(s)}
                        className={cn(
                          "flex w-full items-center px-3 py-2 text-left text-sm transition-colors hover:bg-[#f8faf6]",
                          application.status === s &&
                            "bg-[#e7eee3] font-medium text-[#256b4d]",
                        )}
                      >
                        {s.replace(/_/g, " ")}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEdit(true)}
            >
              <Pencil size={13} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void handleArchive()}
              title={application.archived ? "Unarchive" : "Archive"}
            >
              <Archive size={13} />
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 size={13} />
            </Button>
          </div>
        </div>

        {/* Links */}
        {(application.jobUrl || application.applicationUrl) && (
          <div className="mt-4 flex flex-wrap gap-2 border-t border-[#d9dfd5] pt-4">
            {application.jobUrl && (
              <a
                href={application.jobUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-[#256b4d] hover:underline"
              >
                <ExternalLink size={13} /> Lihat Lowongan
              </a>
            )}
            {application.applicationUrl && (
              <a
                href={application.applicationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-[#256b4d] hover:underline"
              >
                <ExternalLink size={13} /> Portal Lamaran
              </a>
            )}
          </div>
        )}
      </div>

      {/* ── Main content ── */}
      <div className="grid items-start gap-5 lg:grid-cols-[1fr_340px]">
        {/* Left col — tabbed sections */}
        <div className="flex flex-col gap-0">
          {/* Tab bar */}
          <div className="flex overflow-x-auto rounded-t-xl border border-b-0 border-[#d9dfd5] bg-white">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                  activeTab === tab.id
                    ? "border-[#256b4d] text-[#256b4d]"
                    : "border-transparent text-[#68736a] hover:text-[#17211b]",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab panel */}
          <div className="rounded-b-xl border border-[#d9dfd5] bg-white p-5">
            {activeTab === "roadmap" && (
              <RoadmapSection
                applicationId={id ?? ""}
                roadmap={roadmap}
                isLoading={roadmapLoading}
              />
            )}
            {activeTab === "stage-tasks" && (
              <StageTasksSection applicationId={id ?? ""} stages={roadmap?.stages} />
            )}
            {activeTab === "followups" && (
              <FollowUpSection applicationId={id ?? ""} />
            )}
            {activeTab === "notes" && (
              <div>
                <form onSubmit={(e) => void handleAddNote(e)} className="mb-4">
                  <Textarea
                    placeholder="Tambahkan catatan..."
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    rows={2}
                  />
                  {noteError && (
                    <ApiErrorAlert error={noteError} />
                  )}
                  <Button
                    type="submit"
                    size="sm"
                    disabled={createNote.isPending || !noteContent.trim()}
                    className="mt-2 bg-[#256b4d] text-white hover:bg-[#1b563d]"
                  >
                    Tambah Catatan
                  </Button>
                </form>
                {notes.length === 0 ? (
                  <p className="text-sm text-[#9aaa9e]">Belum ada catatan.</p>
                ) : (
                  <>
                    <div className="space-y-2">
                      {notes.slice(0, notesCollapse.visibleCount).map((note) => (
                        <div
                          key={note.id}
                          className="group flex gap-3 rounded-lg border border-[#d9dfd5] bg-[#f8faf6] p-3"
                        >
                          <div className="flex-1">
                            <p className="whitespace-pre-wrap text-sm text-[#17211b]">
                              {note.content}
                            </p>
                            <p className="mt-1 text-[11px] text-[#9aaa9e]">
                              {formatDateTime(note.createdAt)}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => void deleteNote.mutateAsync(note.id)}
                            className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                            aria-label="Hapus catatan"
                          >
                            <Trash2 size={13} />
                          </Button>
                        </div>
                      ))}
                    </div>
                    {notesCollapse.hasMore && (
                      <ShowMoreButton
                        expanded={notesCollapse.expanded}
                        hiddenCount={notesCollapse.hiddenCount}
                        onToggle={notesCollapse.toggle}
                      />
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right col — Timeline */}
        <div className="self-start rounded-xl border border-[#d9dfd5] bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#68736a]">
            Timeline
          </h2>
          {timeline.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title="Belum ada aktivitas"
              description="Aktivitas akan otomatis tercatat saat status berubah."
            />
          ) : (
            <>
              <ol className="relative space-y-4 pl-4 before:absolute before:top-2 before:bottom-2 before:left-1.5 before:w-px before:bg-[#d9dfd5]">
                {timeline.slice(0, timelineCollapse.visibleCount).map((event) => (
                  <li key={event.id} className="relative">
                    <span className="absolute -left-4 top-1.5 size-2 rounded-full bg-[#256b4d]" />
                    <div className="text-xs text-[#9aaa9e]">
                      {formatDateTime(event.eventDate)}
                    </div>
                    <div className="mt-0.5 text-sm font-medium text-[#17211b]">
                      {event.eventType.replace(/_/g, " ")}
                    </div>
                    {event.description && (
                      <div className="mt-0.5 text-sm text-[#68736a]">
                        {event.description}
                      </div>
                    )}
                    {event.previousStatus && event.newStatus && (
                      <div className="mt-0.5 flex items-center gap-1.5 text-[12px]">
                        <span className="text-[#9aaa9e]">
                          {event.previousStatus.replace(/_/g, " ")}
                        </span>
                        <span className="text-[#d9dfd5]">→</span>
                        <span className="font-medium text-[#256b4d]">
                          {event.newStatus.replace(/_/g, " ")}
                        </span>
                      </div>
                    )}
                  </li>
                ))}
              </ol>
              {timelineCollapse.hasMore && (
                <ShowMoreButton
                  expanded={timelineCollapse.expanded}
                  hiddenCount={timelineCollapse.hiddenCount}
                  onToggle={timelineCollapse.toggle}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      <ApplicationForm
        open={showEdit}
        onClose={() => setShowEdit(false)}
        application={application}
      />
      <ConfirmDialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => void handleDelete()}
        title="Hapus Lamaran"
        description={`Yakin ingin menghapus lamaran "${application.position}" di ${application.companyName}?`}
        confirmLabel="Hapus"
        isLoading={deleteMutation.isPending}
        variant="danger"
      />
    </div>
  );
}
