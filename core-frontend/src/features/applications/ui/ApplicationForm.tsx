import { useEffect, useState } from "react";
import { Modal } from "../../../components/ui/modal";
import { Input, Select } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { useCompanies } from "../api/companies-api";
import {
  useCreateApplication,
  useUpdateApplication,
} from "../api/applications-api";
import { getApiMessage } from "../../../lib/api-client";
import { ApiErrorAlert } from "../../../components/ui/api-error-alert";
import type {
  ApplicationPatchRequest,
  ApplicationRequest,
  ApplicationResponse,
  ApplicationSource,
  ApplicationStatus,
  EmploymentType,
  PriorityLevel,
  WorkArrangement,
} from "../../../types/api";
import { CompanyForm } from "../../applications/ui/CompanyForm";
import { Plus } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  application?: ApplicationResponse | null;
};

const emptyForm: ApplicationRequest = {
  companyId: "",
  position: "",
  appliedDate: new Date().toISOString().split("T")[0],
  status: "APPLIED",
  priority: "MEDIUM",
};

export function ApplicationForm({ open, onClose, application }: Props) {
  const isEdit = Boolean(application);
  const [form, setForm] = useState<ApplicationRequest>(emptyForm);
  const [error, setError] = useState("");
  const [showCompanyForm, setShowCompanyForm] = useState(false);

  const { data: companies = [] } = useCompanies("");
  const createMutation = useCreateApplication();
  const updateMutation = useUpdateApplication(application?.id ?? "");
  const isPending = createMutation.isPending || updateMutation.isPending;

  // Populate form when editing
  useEffect(() => {
    if (application) {
      setForm({
        companyId: application.companyId,
        position: application.position,
        appliedDate: application.appliedDate,
        status: application.status,
        location: application.location ?? undefined,
        employmentType: application.employmentType ?? undefined,
        workArrangement: application.workArrangement ?? undefined,
        salaryRangeMin: application.salaryRangeMin ?? undefined,
        salaryRangeMax: application.salaryRangeMax ?? undefined,
        source: application.source ?? undefined,
        priority: application.priority,
        jobUrl: application.jobUrl ?? undefined,
        applicationUrl: application.applicationUrl ?? undefined,
      });
    } else {
      setForm(emptyForm);
    }
    setError("");
  }, [application, open]);

  const set = <K extends keyof ApplicationRequest>(
    k: K,
    v: ApplicationRequest[K],
  ) => setForm((prev) => ({ ...prev, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (isEdit) {
        const patch: ApplicationPatchRequest = { ...form };
        await updateMutation.mutateAsync(patch);
      } else {
        await createMutation.mutateAsync(form);
      }
      onClose();
    } catch (err) {
      setError(getApiMessage(err));
    }
  };

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title={isEdit ? "Edit Lamaran" : "Tambah Lamaran"}
        size="lg"
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
              form="application-form"
              type="submit"
              disabled={isPending}
              className="bg-[#256b4d] text-white hover:bg-[#1b563d]"
            >
              {isPending
                ? "Menyimpan..."
                : isEdit
                  ? "Simpan Perubahan"
                  : "Tambah Lamaran"}
            </Button>
          </>
        }
      >
        <form
          id="application-form"
          onSubmit={(e) => void handleSubmit(e)}
          className="grid gap-4"
        >
          {/* Company */}
          <div className="grid gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[13px] font-semibold text-[#39453c]">
                Perusahaan <span className="text-[#ba442d]">*</span>
              </label>
              <button
                type="button"
                onClick={() => setShowCompanyForm(true)}
                className="flex items-center gap-1 text-[12px] text-[#256b4d] hover:underline"
              >
                <Plus size={12} /> Perusahaan baru
              </button>
            </div>
            <div className="relative">
              <select
                required
                value={form.companyId}
                onChange={(e) => set("companyId", e.target.value)}
                className="w-full rounded-md border border-[#d9dfd5] bg-white px-3 py-2 text-sm text-[#17211b] outline-none focus:border-[#256b4d] focus:ring-4 focus:ring-[#256b4d1f]"
              >
                <option value="" disabled>
                  Pilih perusahaan...
                </option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Position */}
          <Input
            label="Posisi *"
            required
            value={form.position}
            onChange={(e) => set("position", e.target.value)}
            placeholder="Backend Engineer"
          />

          <div className="grid grid-cols-2 gap-3">
            {/* Applied date */}
            <Input
              label="Tanggal Lamaran *"
              type="date"
              required
              value={form.appliedDate}
              onChange={(e) => set("appliedDate", e.target.value)}
            />

            {/* Status */}
            <Select
              label="Status"
              value={form.status ?? "APPLIED"}
              onChange={(e) =>
                set("status", e.target.value as ApplicationStatus)
              }
            >
              {(
                [
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
                ] as ApplicationStatus[]
              ).map((s) => (
                <option key={s} value={s}>
                  {s.replace("_", " ")}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Priority */}
            <Select
              label="Prioritas"
              value={form.priority ?? "MEDIUM"}
              onChange={(e) => set("priority", e.target.value as PriorityLevel)}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </Select>

            {/* Source */}
            <Select
              label="Sumber"
              value={form.source ?? ""}
              onChange={(e) =>
                set(
                  "source",
                  (e.target.value as ApplicationSource) || undefined,
                )
              }
            >
              <option value="">— Pilih sumber —</option>
              <option value="LINKEDIN">LinkedIn</option>
              <option value="JOBSTREET">Jobstreet</option>
              <option value="GLINTS">Glints</option>
              <option value="KALIBRR">Kalibrr</option>
              <option value="COMPANY_CAREER_PAGE">Career Page</option>
              <option value="REFERRAL">Referral</option>
              <option value="RECRUITER">Recruiter</option>
              <option value="UNIVERSITY_CAMPUS">Campus</option>
              <option value="OTHER">Other</option>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Employment type */}
            <Select
              label="Tipe Pekerjaan"
              value={form.employmentType ?? ""}
              onChange={(e) =>
                set(
                  "employmentType",
                  (e.target.value as EmploymentType) || undefined,
                )
              }
            >
              <option value="">— Pilih tipe —</option>
              <option value="FULL_TIME">Full Time</option>
              <option value="PART_TIME">Part Time</option>
              <option value="CONTRACT">Contract</option>
              <option value="INTERNSHIP">Internship</option>
              <option value="FREELANCE">Freelance</option>
            </Select>

            {/* Work arrangement */}
            <Select
              label="Work Arrangement"
              value={form.workArrangement ?? ""}
              onChange={(e) =>
                set(
                  "workArrangement",
                  (e.target.value as WorkArrangement) || undefined,
                )
              }
            >
              <option value="">— Pilih —</option>
              <option value="ONSITE">Onsite</option>
              <option value="HYBRID">Hybrid</option>
              <option value="REMOTE">Remote</option>
            </Select>
          </div>

          {/* Location */}
          <Input
            label="Lokasi"
            value={form.location ?? ""}
            onChange={(e) => set("location", e.target.value || undefined)}
            placeholder="Jakarta, Indonesia"
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Gaji Min (Rp)"
              type="number"
              min={0}
              value={form.salaryRangeMin ?? ""}
              onChange={(e) =>
                set(
                  "salaryRangeMin",
                  e.target.value ? Number(e.target.value) : undefined,
                )
              }
              placeholder="15000000"
            />
            <Input
              label="Gaji Max (Rp)"
              type="number"
              min={0}
              value={form.salaryRangeMax ?? ""}
              onChange={(e) =>
                set(
                  "salaryRangeMax",
                  e.target.value ? Number(e.target.value) : undefined,
                )
              }
              placeholder="22000000"
            />
          </div>

          {/* URLs */}
          <Input
            label="URL Lowongan"
            type="url"
            value={form.jobUrl ?? ""}
            onChange={(e) => set("jobUrl", e.target.value || undefined)}
            placeholder="https://..."
          />
          <Input
            label="URL Lamaran"
            type="url"
            value={form.applicationUrl ?? ""}
            onChange={(e) => set("applicationUrl", e.target.value || undefined)}
            placeholder="https://..."
          />

          {error && (
            <ApiErrorAlert error={error} />
          )}
        </form>
      </Modal>

      {/* Inline company creation */}
      <CompanyForm
        open={showCompanyForm}
        onClose={() => setShowCompanyForm(false)}
        onCreated={(company) => {
          set("companyId", company.id);
          setShowCompanyForm(false);
        }}
      />
    </>
  );
}
