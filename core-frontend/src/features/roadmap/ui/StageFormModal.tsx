import { useEffect, useState } from "react";
import { Modal } from "../../../components/ui/modal";
import { Input, Textarea } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import {
  useAddStage,
  useUpdateStage,
  type StagePatchRequest,
} from "../api/roadmap-api";
import { getApiMessage } from "../../../lib/api-client";
import { ApiErrorAlert } from "../../../components/ui/api-error-alert";
import type { StageResponse } from "../../../types/api";

type Props = {
  open: boolean;
  onClose: () => void;
  applicationId: string;
  /** Pass an existing stage to edit; omit or null to add new */
  stage?: StageResponse | null;
};

type FormState = {
  name: string;
  description: string;
  scheduledDate: string;
  notes: string;
};

const empty: FormState = {
  name: "",
  description: "",
  scheduledDate: "",
  notes: "",
};

export function StageFormModal({ open, onClose, applicationId, stage }: Props) {
  const isEdit = Boolean(stage);
  const [form, setForm] = useState<FormState>(empty);
  const [error, setError] = useState("");

  const addStage = useAddStage(applicationId);
  const updateStage = useUpdateStage(applicationId);
  const isPending = addStage.isPending || updateStage.isPending;

  // Populate form when editing
  useEffect(() => {
    if (stage) {
      setForm({
        name: stage.name,
        description: stage.description ?? "",
        scheduledDate: stage.scheduledDate ?? "",
        notes: stage.notes ?? "",
      });
    } else {
      setForm(empty);
    }
    setError("");
  }, [stage, open]);

  const set = <K extends keyof FormState>(k: K, v: string) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (isEdit && stage) {
        const patch: StagePatchRequest = {
          name: form.name || undefined,
          description: form.description || undefined,
          scheduledDate: form.scheduledDate || undefined,
          notes: form.notes || undefined,
        };
        await updateStage.mutateAsync({ stageId: stage.id, body: patch });
      } else {
        await addStage.mutateAsync({
          name: form.name,
          description: form.description || undefined,
          scheduledDate: form.scheduledDate || undefined,
          notes: form.notes || undefined,
          stageOrder: undefined, // auto-append
        });
      }
      onClose();
    } catch (err) {
      setError(getApiMessage(err));
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Tahap" : "Tambah Tahap"}
      description={
        isEdit
          ? "Perbarui detail tahap rekrutmen ini."
          : "Tambahkan tahap baru ke roadmap. Tahap akan ditempatkan di akhir urutan."
      }
      size="sm"
      footer={
        <>
          <Button
            className="text-black"
            variant="outline"
            onClick={onClose}
            disabled={isPending}
          >
            Batal
          </Button>
          <Button
            form="stage-form"
            type="submit"
            disabled={isPending}
            className="bg-[#256b4d] text-white hover:bg-[#1b563d]"
          >
            {isPending ? "Menyimpan..." : isEdit ? "Simpan" : "Tambah Tahap"}
          </Button>
        </>
      }
    >
      <form
        id="stage-form"
        onSubmit={(e) => void handleSubmit(e)}
        className="grid gap-4"
      >
        <Input
          label="Nama Tahap *"
          required
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="Technical Interview"
        />
        <Textarea
          label="Deskripsi"
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="Keterangan singkat tentang tahap ini..."
          rows={2}
        />
        <Input
          label="Tanggal Jadwal"
          type="date"
          value={form.scheduledDate}
          onChange={(e) => set("scheduledDate", e.target.value)}
        />
        <Textarea
          label="Catatan Tahap"
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          placeholder="Catatan tambahan..."
          rows={2}
        />
        {error && (
          <ApiErrorAlert error={error} />
        )}
      </form>
    </Modal>
  );
}
