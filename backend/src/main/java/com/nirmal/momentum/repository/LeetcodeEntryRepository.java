package com.nirmal.momentum.repository;

import com.nirmal.momentum.entity.LeetcodeEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface LeetcodeEntryRepository extends JpaRepository<LeetcodeEntry, Long> {

    List<LeetcodeEntry> findByUserIdOrderByCreatedAtDesc(Long userId);

    @Query("select e.entryDate from LeetcodeEntry e where e.user.id = :userId")
    List<LocalDate> findEntryDatesByUserId(@Param("userId") Long userId);
}