package com.fdev.core_backend.shared.application;

import java.util.UUID;

public interface ApplicationAccess {
    void requireOwner(UUID userId, UUID applicationId);
}