import { useState } from "react";
import {
  BriefcaseBusiness,
  Eye,
  GraduationCap,
  Lightbulb,
  Plus,
  Sparkles,
  Upload,
} from "lucide-react";
import { ApiErrorAlert } from "../../../components/ui/api-error-alert";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Modal } from "../../../components/ui/modal";
import { Spinner } from "../../../components/ui/spinner";
import { getApiMessage } from "../../../lib/api-client";
import type {
  CvProfileDetailResponse,
  CvProfileResponse,
} from "../../../types/api";
import {
  useAnalyzeCv,
  useCvProfileDetail,
  useCvProfiles,
  useUploadCv,
} from "../api/cv-api";

type Props = { applicationId: string };
type DetailTab = "extraction" | "analysis";

function isProcessing(status: CvProfileResponse["status"]) {
  return status === "PENDING" || status === "IN_PROGRESS";
}

function StatusLabel({
  profile,
}: {
  profile: Pick<CvProfileResponse, "status" | "stage">;
}) {
  const processing = isProcessing(profile.status);
  let label: string;
  if (profile.status === "FAILED") label = "Gagal";
  else if (processing)
    label = profile.stage === "ANALYZE" ? "Menganalisis" : "Mengekstrak";
  else if (profile.stage === "ANALYZE") label = "Analisis selesai";
  else label = "Ekstraksi selesai";

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f0f4ed] px-2.5 py-1 text-xs font-medium text-[#4a5c4e]">
      {processing && <Spinner className="size-3.5 border-[1.5px]" />}
      {label}
    </span>
  );
}

function ResultList({
  title,
  items,
  icon: Icon,
}: {
  title: string;
  items: string[];
  icon: typeof BriefcaseBusiness;
}) {
  return (
    <section>
      <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#17211b]">
        <Icon size={16} className="text-[#256b4d]" />
        {title}
      </h4>
      {items.length > 0 ? (
        <ul className="space-y-1.5 pl-6 text-sm text-[#4a5c4e]">
          {items.map((item, index) => (
            <li key={`${item}-${index}`} className="list-disc">
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-[#9aaa9e]">Belum ada data.</p>
      )}
    </section>
  );
}

function SkillList({ items }: { items: string[] }) {
  return (
    <section>
      <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#17211b]">
        <Sparkles size={16} className="text-[#256b4d]" />
        Keahlian
      </h4>
      {items.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {items.map((item, index) => (
            <Badge
              key={`${item}-${index}`}
              variant="neutral"
              className="normal-case tracking-normal"
            >
              {item}
            </Badge>
          ))}
        </div>
      ) : (
        <p className="text-sm text-[#9aaa9e]">Belum ada data.</p>
      )}
    </section>
  );
}

function ExtractionSection({ profile }: { profile: CvProfileDetailResponse }) {
  const skills =
    profile.skills?.flatMap((skillSet) => [
      ...(skillSet.technicalSkills ?? []),
      ...(skillSet.softSkills ?? []),
      ...(skillSet.tools ?? []),
    ]) ?? [];

  return (
    <section className="space-y-5 rounded-lg border border-[#e7ebe3] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold text-[#17211b]">Hasil ekstraksi</h3>
        {profile.stage === "EXTRACTION" && <StatusLabel profile={profile} />}
      </div>
      {isProcessing(profile.status) && profile.stage === "EXTRACTION" && (
        <div
          className="flex items-center gap-3 rounded-lg bg-[#f8faf6] p-3 text-sm text-[#4a5c4e]"
          role="status"
        >
          <Spinner />
          <span>Ekstraksi CV sedang diproses. Hasil diperbarui otomatis.</span>
        </div>
      )}
      {profile.status === "FAILED" && profile.stage === "EXTRACTION" && (
        <p
          className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
          role="alert"
        >
          Ekstraksi CV gagal. Upload CV baru untuk memulai proses kembali.
        </p>
      )}

      <div className="grid gap-y-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-[#9aaa9e]">
            Nama
          </p>
          <p className="mt-1 text-sm text-[#17211b]">
            {profile.name || "Belum tersedia"}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[#9aaa9e]">
            Email
          </p>
          <p className="mt-1 break-all text-sm text-[#17211b]">
            {profile.email || "Belum tersedia"}
          </p>
        </div>
      </div>

      <div className="grid gap-5">
        <section>
          <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#17211b]">
            <BriefcaseBusiness size={16} className="text-[#256b4d]" />{" "}
            Pengalaman
          </h4>
          {profile.experiences?.length ? (
            <ul className="space-y-3">
              {profile.experiences.map((experience) => {
                const responsibilities = experience.responsibilities ?? [];
                const technologies = experience.technologiesUsed ?? [];
                return (
                  <li key={experience.id} className="text-sm">
                    <p className="font-medium text-[#17211b]">
                      {experience.position || "Posisi tidak disebutkan"}
                    </p>
                    <p className="text-[#68736a]">
                      {experience.company || "Perusahaan tidak disebutkan"}
                      {(experience.startDate || experience.endDate) &&
                        ` · ${experience.startDate || "?"} – ${experience.endDate || "Sekarang"}`}
                    </p>
                    {responsibilities.length > 0 && (
                      <ul className="mt-1 space-y-1 pl-5 text-[#4a5c4e]">
                        {responsibilities.map((responsibility, index) => (
                          <li
                            key={`${responsibility}-${index}`}
                            className="list-disc"
                          >
                            {responsibility}
                          </li>
                        ))}
                      </ul>
                    )}
                    {technologies.length > 0 && (
                      <p className="mt-1 text-xs text-[#68736a]">
                        Teknologi: {technologies.join(", ")}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-sm text-[#9aaa9e]">Belum ada data pengalaman.</p>
          )}
        </section>

        <section>
          <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#17211b]">
            <GraduationCap size={16} className="text-[#256b4d]" /> Pendidikan
          </h4>
          {profile.educations?.length ? (
            <ul className="space-y-3">
              {profile.educations.map((education) => (
                <li key={education.id} className="text-sm">
                  <p className="font-medium text-[#17211b]">
                    {[education.degree, education.fieldOfStudy]
                      .filter(Boolean)
                      .join(" · ") || "Pendidikan"}
                  </p>
                  <p className="text-[#68736a]">
                    {education.institution || "Institusi tidak disebutkan"}
                    {(education.startDate || education.endDate) &&
                      ` · ${education.startDate || "?"} – ${education.endDate || "Sekarang"}`}
                  </p>
                  {education.gpa && (
                    <p className="text-xs text-[#68736a]">
                      IPK: {education.gpa}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[#9aaa9e]">Belum ada data pendidikan.</p>
          )}
        </section>
      </div>

      <div className="grid gap-5">
        <section>
          <h4 className="mb-2 text-sm font-semibold text-[#17211b]">Proyek</h4>
          {profile.projects?.length ? (
            <ul className="space-y-3">
              {profile.projects.map((project) => {
                const technologies = project.technologiesUsed ?? [];
                return (
                  <li key={project.id} className="text-sm">
                    <p className="font-medium text-[#17211b]">
                      {project.name || "Proyek"}
                      {project.role ? ` · ${project.role}` : ""}
                    </p>
                    {project.description && (
                      <p className="text-[#68736a]">{project.description}</p>
                    )}
                    {technologies.length > 0 && (
                      <p className="text-xs text-[#68736a]">
                        Teknologi: {technologies.join(", ")}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-sm text-[#9aaa9e]">Belum ada data proyek.</p>
          )}
        </section>
        <SkillList items={skills} />
      </div>
    </section>
  );
}

function AnalysisSection({ profile }: { profile: CvProfileDetailResponse }) {
  const analysisPending =
    isProcessing(profile.status) && profile.stage === "ANALYZE";

  return (
    <section className="space-y-4 rounded-lg border border-[#e7ebe3] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold text-[#17211b]">Hasil analisis</h3>
        {profile.stage === "ANALYZE" && <StatusLabel profile={profile} />}
      </div>
      {analysisPending && (
        <div
          className="flex items-center gap-3 rounded-lg bg-[#f8faf6] p-3 text-sm text-[#4a5c4e]"
          role="status"
        >
          <Spinner />
          <span>Analisis CV sedang diproses. Hasil diperbarui otomatis.</span>
        </div>
      )}
      {profile.status === "FAILED" && profile.stage === "ANALYZE" && (
        <p
          className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
          role="alert"
        >
          Analisis CV gagal diproses.
        </p>
      )}
      {profile.stage === "EXTRACTION" && (
        <p className="rounded-lg bg-[#f8faf6] p-3 text-sm text-[#68736a]">
          Hasil analisis tersedia setelah proses ekstraksi selesai dan analisis
          dijalankan.
        </p>
      )}

      <div>
        <h4 className="mb-1 text-sm font-semibold text-[#17211b]">Summary</h4>
        <p className="whitespace-pre-wrap text-sm leading-6 text-[#4a5c4e]">
          {profile.summary || "Summary belum tersedia."}
        </p>
      </div>
      <div className="grid gap-4">
        <ResultList
          title="Strengths"
          items={profile.strengths ?? []}
          icon={Sparkles}
        />
        <ResultList
          title="Weaknesses"
          items={profile.weaknesses ?? []}
          icon={Lightbulb}
        />
      </div>
    </section>
  );
}

export function CvSection({ applicationId }: Props) {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [detailProfileId, setDetailProfileId] = useState("");
  const [detailTab, setDetailTab] = useState<DetailTab>("extraction");
  const [file, setFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [analysisError, setAnalysisError] = useState("");

  const {
    data: profiles = [],
    isLoading,
    isError: profilesIsError,
    error: profilesError,
  } = useCvProfiles(applicationId);
  const {
    data: detail,
    isLoading: detailLoading,
    isError: detailIsError,
    error: detailError,
  } = useCvProfileDetail(applicationId, detailProfileId);
  const upload = useUploadCv(applicationId);
  const analyze = useAnalyzeCv(applicationId, detailProfileId);
  const selectedProfile = profiles.find(
    (profile) => profile.id === detailProfileId,
  );
  const canAnalyze =
    detail?.stage === "EXTRACTION" && detail.status === "COMPLETED";

  const closeUpload = () => {
    setUploadOpen(false);
    setFile(null);
    setUploadError("");
  };

  const closeDetail = () => {
    setDetailProfileId("");
    setAnalysisError("");
    setDetailTab("extraction");
  };

  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) return;
    setUploadError("");
    try {
      await upload.mutateAsync(file);
      closeUpload();
    } catch (requestError) {
      setUploadError(getApiMessage(requestError));
    }
  };

  const handleAnalyze = async () => {
    setAnalysisError("");
    setDetailTab("analysis");
    try {
      await analyze.mutateAsync();
    } catch (requestError) {
      setAnalysisError(getApiMessage(requestError));
    }
  };

  return (
    <div className="min-w-0 space-y-4">
      {profilesIsError && <ApiErrorAlert error={profilesError} />}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold text-[#17211b]">CV Kandidat</h2>
          <p className="mt-1 text-sm text-[#68736a]">
            Kelola CV yang digunakan untuk lamaran ini.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => setUploadOpen(true)}
          className="gap-2 bg-[#256b4d] text-white hover:bg-[#1b563d]"
        >
          <Plus size={15} /> Upload CV
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : profiles.length === 0 ? (
        <div className="rounded-lg border border-[#e7ebe3] py-10 text-center">
          <p className="font-medium text-[#17211b]">Belum ada CV</p>
          <p className="mt-1 text-sm text-[#68736a]">
            Gunakan tombol Upload CV untuk menambahkan CV.
          </p>
        </div>
      ) : (
        <div className="max-w-full min-w-0 overflow-x-auto rounded-lg border border-[#d9dfd5]">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="bg-[#f8faf6] text-xs uppercase tracking-wide text-[#68736a]">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Nama
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Email
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  File CV
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Status
                </th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e7ebe3]">
              {profiles.map((profile) => (
                <tr key={profile.id} className="text-[#4a5c4e]">
                  <td className="px-4 py-3 font-medium text-[#17211b]">
                    {profile.name || "Belum tersedia"}
                  </td>
                  <td className="px-4 py-3">
                    {profile.email || "Belum tersedia"}
                  </td>
                  <td
                    className="max-w-56 truncate px-4 py-3"
                    title={profile.fileName}
                  >
                    {profile.fileName}
                  </td>
                  <td className="px-4 py-3">
                    <StatusLabel profile={profile} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => {
                        setAnalysisError("");
                        setDetailTab("extraction");
                        setDetailProfileId(profile.id);
                      }}
                    >
                      <Eye size={14} /> Detail
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={uploadOpen}
        onClose={closeUpload}
        title="Upload CV"
        description="Unggah file CV dalam format PDF. Ekstraksi akan diproses otomatis."
        size="md"
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={closeUpload}
              disabled={upload.isPending}
            >
              Batal
            </Button>
            <Button
              type="submit"
              form="cv-upload-form"
              disabled={!file || upload.isPending}
              className="gap-2 bg-[#256b4d] text-white hover:bg-[#1b563d]"
            >
              {upload.isPending ? (
                <>
                  <Spinner className="size-4 border-white/40 border-t-white" />{" "}
                  Mengunggah...
                </>
              ) : (
                <>
                  <Upload size={15} /> Upload & ekstrak
                </>
              )}
            </Button>
          </>
        }
      >
        <form
          id="cv-upload-form"
          onSubmit={(event) => void handleUpload(event)}
          className="space-y-4"
        >
          {uploadError && <ApiErrorAlert error={uploadError} />}
          <label className="block text-sm font-medium text-[#17211b]">
            File CV (PDF)
            <input
              type="file"
              accept="application/pdf,.pdf"
              required
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              className="mt-2 block w-full text-sm text-[#68736a] file:mr-3 file:rounded-md file:border-0 file:bg-[#e7eee3] file:px-3 file:py-2 file:text-sm file:font-medium file:text-[#256b4d] hover:file:bg-[#dce8d7]"
            />
          </label>
        </form>
      </Modal>

      <Modal
        open={Boolean(detailProfileId)}
        onClose={closeDetail}
        title="Detail CV"
        description={
          selectedProfile?.fileName ?? "Hasil ekstraksi dan analisis CV"
        }
        size="xl"
        footer={
          <>
            <Button type="button" variant="outline" onClick={closeDetail}>
              Tutup
            </Button>
            {canAnalyze && (
              <Button
                type="button"
                onClick={() => void handleAnalyze()}
                disabled={analyze.isPending}
                className="gap-2 bg-[#256b4d] text-white hover:bg-[#1b563d]"
              >
                {analyze.isPending ? (
                  <>
                    <Spinner className="size-4 border-white/40 border-t-white" />{" "}
                    Memulai analisis...
                  </>
                ) : (
                  <>
                    <Sparkles size={15} /> Analisis CV
                  </>
                )}
              </Button>
            )}
          </>
        }
      >
        <div className="space-y-4">
          {analysisError && <ApiErrorAlert error={analysisError} />}
          {detailIsError && <ApiErrorAlert error={detailError} />}
          {detailLoading ? (
            <div className="flex items-center justify-center gap-3 py-12 text-sm text-[#68736a]">
              <Spinner /> Memuat detail CV...
            </div>
          ) : detail ? (
            <>
              {detail.status === "FAILED" &&
                selectedProfile?.stage === "ANALYZE" && (
                  <p
                    className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
                    role="alert"
                  >
                    Proses analisis gagal. Kamu dapat mengunggah CV baru untuk
                    memulai proses kembali.
                  </p>
                )}
              <div
                role="tablist"
                aria-label="Bagian detail CV"
                className="flex border-b border-[#d9dfd5]"
              >
                {(
                  [
                    { id: "extraction", label: "Hasil ekstraksi" },
                    { id: "analysis", label: "Hasil analisis" },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    id={`cv-detail-tab-${tab.id}`}
                    aria-selected={detailTab === tab.id}
                    aria-controls="cv-detail-panel"
                    onClick={() => setDetailTab(tab.id)}
                    className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                      detailTab === tab.id
                        ? "border-[#256b4d] text-[#256b4d]"
                        : "border-transparent text-[#68736a] hover:text-[#17211b]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <div
                id="cv-detail-panel"
                role="tabpanel"
                aria-labelledby={`cv-detail-tab-${detailTab}`}
                className="pt-1"
              >
                {detailTab === "extraction" ? (
                  <ExtractionSection profile={detail} />
                ) : (
                  <AnalysisSection profile={detail} />
                )}
              </div>
            </>
          ) : !detailIsError ? (
            <p className="py-8 text-center text-sm text-[#9aaa9e]">
              Detail CV belum tersedia.
            </p>
          ) : null}
        </div>
      </Modal>
    </div>
  );
}
