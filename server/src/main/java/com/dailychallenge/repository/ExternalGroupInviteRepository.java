package com.dailychallenge.repository;

import com.dailychallenge.entity.ExternalGroupInvite;
import com.dailychallenge.entity.ExternalGroupInviteStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ExternalGroupInviteRepository extends JpaRepository<ExternalGroupInvite, UUID> {

    List<ExternalGroupInvite> findByInvitedEmailIgnoreCaseAndStatus(
            String invitedEmail,
            ExternalGroupInviteStatus status);
}
