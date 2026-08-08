package com.nirmal.momentum.repository;

import com.nirmal.momentum.entity.Topic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TopicRepository extends JpaRepository<Topic, Long> {

    List<Topic> findByUserIdOrderByCreatedAtDesc(Long userId);

    @Query("select distinct t from Topic t left join fetch t.subtopics where t.user.id = :userId")
    List<Topic> findAllWithSubtopicsByUserId(@Param("userId") Long userId);
}