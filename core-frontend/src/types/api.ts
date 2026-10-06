// ─── Global envelope ────────────────────────────────────────────────────────

export type ApiError = {
  code: string
  message: string
  details: { field: string; issue: string; message: string }[] | null
  requestId: string
}

export type ApiResponse<T> = {
  success: boolean
  data: T | null
  error: ApiError | null
  meta: PaginationMeta | null
}

export type PaginationMeta = {
  pagination: {
    page: number
    pageSize: number
    totalItems: number
    totalPages: number
    hasNext: boolean
    hasPrevious: boolean
  }
}

// ─── Identity ────────────────────────────────────────────────────────────────

export type User = {
  id: string
  email: string
  name: string
  createdAt: string
}

export type TokenResponse = {
  accessToken: string
  refreshToken: string
  expiresIn: number
  user: User
}

// ─── Enums ───────────────────────────────────────────────────────────────────

export type ApplicationStatus =
  | 'WISHLIST'
  | 'APPLIED'
  | 'IN_REVIEW'
  | 'ASSESSMENT'
  | 'INTERVIEW'
  | 'OFFER'
  | 'HIRED'
  | 'REJECTED'
  | 'WITHDRAWN'
  | 'ON_HOLD'
  | 'GHOSTED'

export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'FREELANCE'

export type WorkArrangement = 'ONSITE' | 'HYBRID' | 'REMOTE'

export type ApplicationSource =
  | 'LINKEDIN'
  | 'JOBSTREET'
  | 'GLINTS'
  | 'KALIBRR'
  | 'COMPANY_CAREER_PAGE'
  | 'REFERRAL'
  | 'RECRUITER'
  | 'UNIVERSITY_CAMPUS'
  | 'OTHER'

export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export type StageStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED'

// ─── Application ─────────────────────────────────────────────────────────────

export type ApplicationResponse = {
  id: string
  companyId: string
  companyName: string
  position: string
  appliedDate: string
  status: ApplicationStatus
  location: string | null
  employmentType: EmploymentType | null
  workArrangement: WorkArrangement | null
  salaryRangeMin: number | null
  salaryRangeMax: number | null
  source: ApplicationSource | null
  priority: PriorityLevel
  jobUrl: string | null
  applicationUrl: string | null
  archived: boolean
  createdAt: string
  updatedAt: string
}

export type ApplicationRequest = {
  companyId: string
  position: string
  appliedDate: string
  status?: ApplicationStatus
  location?: string
  employmentType?: EmploymentType
  workArrangement?: WorkArrangement
  salaryRangeMin?: number
  salaryRangeMax?: number
  source?: ApplicationSource
  priority?: PriorityLevel
  jobUrl?: string
  applicationUrl?: string
}

export type ApplicationPatchRequest = Omit<ApplicationRequest, 'companyId' | 'position' | 'appliedDate'> & {
  companyId?: string
  position?: string
  appliedDate?: string
}

export type StatusRequest = {
  status: ApplicationStatus
  note?: string
}

export type StatusResponse = {
  id: string
  status: ApplicationStatus
  previousStatus: ApplicationStatus
  statusChangedAt: string
}

export type ArchiveResponse = {
  id: string
  archived: boolean
}

// ─── Company ─────────────────────────────────────────────────────────────────

export type CompanyResponse = {
  id: string
  name: string
  website: string | null
  careerUrl: string | null
  industry: string | null
  location: string | null
  description: string | null
  logoUrl: string | null
  notes: string | null
  createdAt: string
}

export type CompanyRequest = {
  name: string
  website?: string
  careerUrl?: string
  industry?: string
  location?: string
  description?: string
  logoUrl?: string
  notes?: string
}

// ─── Roadmap ─────────────────────────────────────────────────────────────────

export type StageResponse = {
  id: string
  name: string
  description: string | null
  stageOrder: number
  status: StageStatus
  scheduledDate: string | null
  completedDate: string | null
  notes: string | null
}

export type RoadmapResponse = {
  id: string
  jobApplicationId: string
  isCustom: boolean
  progressPercentage: number
  stages: StageResponse[]
}

export type StageRequest = {
  name: string
  description?: string
  stageOrder?: number
  scheduledDate?: string   // ISO date: YYYY-MM-DD
  notes?: string
}

export type StageItemGroup = 'INTERVIEW' | 'TASK' | 'PREPARATION'
export type StageItemStatus = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED'

export type StageItemCategoryResponse = {
  id: string
  code: string
  label: string
  group: StageItemGroup
  icon: string | null
  sortOrder: number
}

export type StageItemResponse = {
  id: string
  roadmapStageId: string
  jobApplicationId: string
  userId: string
  categoryId: string
  categoryCode: string
  categoryLabel: string
  categoryGroup: StageItemGroup
  title: string
  content: string | null
  scheduledAt: string | null
  startTime: string | null
  endTime: string | null
  timezone: string | null
  url: string | null
  assignee: string | null
  location: string | null
  priority: PriorityLevel | null
  status: StageItemStatus
}

export type StageItemRequest = {
  roadmapStageId: string
  categoryId: string
  title: string
  content?: string
  scheduledAt: string
  startTime: string
  endTime: string
  timezone?: string
  url?: string
  assignee?: string
  location?: string
  priority: PriorityLevel
}

export type StageItemPatchRequest = Partial<Omit<StageItemRequest, 'roadmapStageId'>> & {
  roadmapStageId?: string
  status?: StageItemStatus
}

// ─── Timeline ────────────────────────────────────────────────────────────────

export type TimelineResponse = {
  id: string
  eventType: string
  description: string | null
  actorType: string
  /** Populated only when eventType = 'STATUS_CHANGED' */
  previousStatus: ApplicationStatus | null
  /** Populated only when eventType = 'STATUS_CHANGED' */
  newStatus: ApplicationStatus | null
  eventDate: string
}

export type TimelineCreateRequest = {
  eventType: string
  description?: string
}

// ─── Notes ───────────────────────────────────────────────────────────────────

export type NoteResponse = {
  id: string
  content: string
  pinned: boolean
  authorId: string
  createdAt: string
  updatedAt: string
}

export type NoteRequest = {
  content: string
  pinned?: boolean
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export type DashboardSummary = {
  totalApplications: number
  activeApplications: number
  interviews: number
  assessments: number
  offers: number
  hired: number
  rejected: number
  ghosted: number
}

export type FunnelStage = {
  stage: string
  count: number
  rate: number
}

export type DashboardFunnel = {
  totalApplied: number
  stages: FunnelStage[]
}

export type UpcomingItem = {
  id: string
  companyName: string
  position: string
  status: ApplicationStatus
  appliedDate: string
  updatedAt: string
}

export type DashboardUpcoming = {
  items: UpcomingItem[]
}

// ─── Productivity ────────────────────────────────────────────────────────────

export type ContactResponse = {
  id: string
  name: string
  role: string | null
  companyId: string | null
  email: string | null
  linkedinUrl: string | null
  phone: string | null
  notes: string | null
  createdAt: string
}

export type ContactRequest = {
  name: string
  role?: string
  companyId?: string
  email?: string
  linkedinUrl?: string
  phone?: string
  notes?: string
}

export type InterviewType = 'HR' | 'TECHNICAL' | 'USER' | 'MANAGER' | 'FINAL'

export type InterviewResponse = {
  id: string
  applicationId: string
  roadmapStageId: string | null
  type: InterviewType
  interviewDate: string
  startTime: string
  endTime: string
  timezone: string
  interviewer: string | null
  meetingUrl: string | null
  location: string | null
  notes: string | null
  createdAt: string
}

export type InterviewRequest = {
  type: InterviewType
  interviewDate: string
  startTime: string
  endTime: string
  timezone?: string
  roadmapStageId?: string
  interviewer?: string
  meetingUrl?: string
  location?: string
  notes?: string
}

export type FollowUpChannel = 'EMAIL' | 'LINKEDIN' | 'WHATSAPP' | 'PHONE' | 'OTHER'
export type FollowUpStatus = 'PLANNED' | 'COMPLETED' | 'CANCELLED'

export type FollowUpResponse = {
  id: string
  applicationId: string
  contactId: string | null
  followUpDate: string
  channel: FollowUpChannel
  message: string | null
  result: string | null
  nextFollowUpDate: string | null
  status: FollowUpStatus
  createdAt: string
}

export type FollowUpRequest = {
  followUpDate: string
  channel: FollowUpChannel
  contactId?: string
  message?: string
}

export type FollowUpPatchRequest = {
  followUpDate?: string
  channel?: FollowUpChannel
  contactId?: string
  message?: string
  result?: string
  nextFollowUpDate?: string
}

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED'

export type TaskResponse = {
  id: string
  applicationId: string | null
  roadmapStageId: string | null
  title: string
  description: string | null
  status: TaskStatus
  priority: PriorityLevel | null
  dueDate: string | null
  completedAt: string | null
  createdAt: string
}

export type TaskRequest = {
  title: string
  description?: string
  priority?: PriorityLevel
  dueDate?: string
  applicationId?: string
  roadmapStageId?: string
}

export type TaskPatchRequest = {
  title?: string
  description?: string
  status?: TaskStatus
  priority?: PriorityLevel
  dueDate?: string
  roadmapStageId?: string
}

export type PreparationCategory =
  | 'STUDY_TOPIC'
  | 'INTERVIEW_QUESTION'
  | 'COMPANY_RESEARCH'
  | 'TECHNICAL_PRACTICE'
  | 'QUESTION_FOR_INTERVIEWER'
  | 'REFLECTION'

export type PreparationResponse = {
  id: string
  roadmapStageId: string
  category: PreparationCategory
  content: string
  completed: boolean
  resourceUrl: string | null
  createdAt: string
}

export type PreparationRequest = {
  content: string
  category: PreparationCategory
  resourceUrl?: string
}

export type ReminderType =
  | 'INTERVIEW'
  | 'ASSESSMENT_DEADLINE'
  | 'FOLLOW_UP'
  | 'APPLICATION_DEADLINE'
  | 'RECRUITMENT_STAGE'
  | 'CUSTOM'
  | 'NO_UPDATE'

export type ReminderResponse = {
  id: string
  applicationId: string | null
  type: ReminderType
  message: string | null
  dueAt: string
  completed: boolean
  snoozedUntil: string | null
  createdAt: string
}

export type ReminderRequest = {
  type: ReminderType
  dueAt: string
  applicationId?: string
  message?: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  WISHLIST: 'Wishlist',
  APPLIED: 'Applied',
  IN_REVIEW: 'In Review',
  ASSESSMENT: 'Assessment',
  INTERVIEW: 'Interview',
  OFFER: 'Offer',
  HIRED: 'Hired',
  REJECTED: 'Rejected',
  WITHDRAWN: 'Withdrawn',
  ON_HOLD: 'On Hold',
  GHOSTED: 'Ghosted',
}

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  FULL_TIME: 'Full Time',
  PART_TIME: 'Part Time',
  CONTRACT: 'Contract',
  INTERNSHIP: 'Internship',
  FREELANCE: 'Freelance',
}

export const WORK_ARRANGEMENT_LABELS: Record<WorkArrangement, string> = {
  ONSITE: 'Onsite',
  HYBRID: 'Hybrid',
  REMOTE: 'Remote',
}

export const APPLICATION_SOURCE_LABELS: Record<ApplicationSource, string> = {
  LINKEDIN: 'LinkedIn',
  JOBSTREET: 'Jobstreet',
  GLINTS: 'Glints',
  KALIBRR: 'Kalibrr',
  COMPANY_CAREER_PAGE: 'Career Page',
  REFERRAL: 'Referral',
  RECRUITER: 'Recruiter',
  UNIVERSITY_CAMPUS: 'Campus',
  OTHER: 'Other',
}

export const PRIORITY_LABELS: Record<PriorityLevel, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
}
