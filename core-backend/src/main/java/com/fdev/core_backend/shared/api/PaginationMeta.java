package com.fdev.core_backend.shared.api;

public record PaginationMeta(int page, int pageSize, long totalItems, int totalPages, boolean hasNext, boolean hasPrevious) { }