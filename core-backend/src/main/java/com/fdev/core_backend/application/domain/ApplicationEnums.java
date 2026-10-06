package com.fdev.core_backend.application.domain;

public final class ApplicationEnums {
    private ApplicationEnums() {
    }

    public enum Status {
        WISHLIST, APPLIED, IN_REVIEW, ASSESSMENT, INTERVIEW, OFFER, HIRED, REJECTED, WITHDRAWN, ON_HOLD, GHOSTED
    }

    public enum EmploymentType {
        FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP, FREELANCE
    }

    public enum WorkArrangement {
        ONSITE, HYBRID, REMOTE
    }

    public enum Source {
        LINKEDIN, JOBSTREET, GLINTS, KALIBRR, COMPANY_CAREER_PAGE, REFERRAL, RECRUITER, UNIVERSITY_CAMPUS, OTHER
    }

    public enum Priority {
        LOW, MEDIUM, HIGH, CRITICAL
    }
}