package com.fdev.core_backend.productivity.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fdev.core_backend.productivity.domain.ItemCategory;

public interface ItemCategoryRepository extends JpaRepository<ItemCategory, UUID> {
    List<ItemCategory> findByIdIn(List<UUID> ids);

    List<ItemCategory> findAllByIsActiveTrueOrderByGroupAscSortOrderAsc();
}
