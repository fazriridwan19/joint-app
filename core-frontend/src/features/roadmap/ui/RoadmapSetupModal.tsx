import { useState } from "react";
import { CheckCircle2, ListOrdered, Pencil } from "lucide-react";
import { Modal } from "../../../components/ui/modal";
import { Button } from "../../../components/ui/button";
import { useCreateRoadmap } from "../api/roadmap-api";
import { getApiMessage } from "../../../lib/api-client";
import { ApiErrorAlert } from "../../../components/ui/api-error-alert";
import { cn } from "cn";

type Props = {
  open: boolean;
  onClose: () => void;
  applicationId: string;
};

type Mode = "default" | "custom";

const OPTIONS: {
  mode: Mode;
  icon: typeof ListOrdered;
  title: string;
  description: string;
}[] = [
  {
    mode: "default",
    icon: ListOrdered,
    title: "Default Roadmap",
    description:
      "Gunakan 8 tahap standar: Applied → CV Screening → HR Interview → Assessment → Technical Interview → User Interview → Offering → Hired.",
  },
  {
    mode: "custom",
    icon: Pencil,
    title: "Custom Roadmap",
    description:
      "Mulai dari kosong dan tambahkan tahap sesuai proses rekrutmen perusahaan ini.",
  },
];

export function RoadmapSetupModal({ open, onClose, applicationId }: Props) {
  const [selected, setSelected] = useState<Mode>("default");
  const [error, setError] = useState("");
  const createRoadmap = useCreateRoadmap(applicationId);

  const handleCreate = async () => {
    setError("");
    try {
      await createRoadmap.mutateAsync(selected === "custom");
      onClose();
    } catch (err) {
      setError(getApiMessage(err));
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Buat Recruitment Roadmap"
      description="Pilih bagaimana kamu ingin menyusun tahapan rekrutmen untuk lamaran ini."
      size="md"
      footer={
        <>
          <Button
            className="text-black"
            variant="outline"
            onClick={onClose}
            disabled={createRoadmap.isPending}
          >
            Batal
          </Button>
          <Button
            onClick={() => void handleCreate()}
            disabled={createRoadmap.isPending}
            className="bg-[#256b4d] text-white hover:bg-[#1b563d]"
          >
            {createRoadmap.isPending ? "Membuat..." : "Buat Roadmap"}
          </Button>
        </>
      }
    >
      <div className="grid gap-3">
        {OPTIONS.map(({ mode, icon: Icon, title, description }) => (
          <button
            key={mode}
            type="button"
            onClick={() => setSelected(mode)}
            className={cn(
              "flex items-start gap-4 rounded-xl border-2 p-4 text-left transition-colors",
              selected === mode
                ? "border-[#256b4d] bg-[#f0f9f4]"
                : "border-[#d9dfd5] bg-white hover:border-[#a8c9b5]",
            )}
          >
            {/* Icon */}
            <div
              className={cn(
                "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg",
                selected === mode
                  ? "bg-[#256b4d] text-white"
                  : "bg-[#e7eee3] text-[#68736a]",
              )}
            >
              <Icon size={18} />
            </div>

            {/* Text */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#17211b]">{title}</span>
                {selected === mode && (
                  <CheckCircle2 size={15} className="text-[#256b4d]" />
                )}
              </div>
              <p className="mt-1 text-sm leading-relaxed text-[#68736a]">
                {description}
              </p>
            </div>
          </button>
        ))}

        {/* Preview default stages */}
        {selected === "default" && (
          <div className="rounded-lg border border-[#d9dfd5] bg-[#f8faf6] px-4 py-3">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#9aaa9e]">
              Tahapan yang akan dibuat
            </p>
            <ol className="space-y-1">
              {[
                "Applied",
                "CV Screening",
                "HR Interview",
                "Assessment",
                "Technical Interview",
                "User Interview",
                "Offering",
                "Hired",
              ].map((s, i) => (
                <li
                  key={s}
                  className="flex items-center gap-2 text-sm text-[#4a5c4e]"
                >
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#e7eee3] text-[10px] font-bold text-[#256b4d]">
                    {i + 1}
                  </span>
                  {s}
                </li>
              ))}
            </ol>
          </div>
        )}

        {selected === "custom" && (
          <div className="rounded-lg border border-[#d9dfd5] bg-[#f8faf6] px-4 py-3">
            <p className="text-sm text-[#68736a]">
              Roadmap akan dibuat kosong. Setelah dibuat, kamu bisa menambahkan
              tahapan sesuai kebutuhan.
            </p>
          </div>
        )}

        {error && (
          <ApiErrorAlert error={error} />
        )}
      </div>
    </Modal>
  );
}
