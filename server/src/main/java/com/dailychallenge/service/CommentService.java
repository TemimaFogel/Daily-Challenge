package com.dailychallenge.service;

import com.dailychallenge.dto.challenge.CommentDTO;
import com.dailychallenge.dto.challenge.CreateCommentRequestDTO;
import com.dailychallenge.entity.ChallengeComment;
import com.dailychallenge.entity.User;
import com.dailychallenge.repository.ChallengeCommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final ChallengeCommentRepository commentRepository;
    private final ChallengeService challengeService;

    private static final int MAX_CONTENT_LENGTH = 500;

    /**
     * Returns all comments for a challenge, newest first. Caller must be allowed to view the challenge.
     */
    public List<CommentDTO> listComments(UUID authUserId, UUID challengeId) {
        challengeService.assertUserCanJoin(authUserId, challengeId);
        return commentRepository.findByChallengeIdWithUserOrderByCreatedAtDesc(challengeId).stream()
                .map(this::toCommentDTO)
                .collect(Collectors.toList());
    }

    /**
     * Adds a comment. Content is trimmed; must be non-blank and at most 500 characters.
     */
    @Transactional
    public CommentDTO addComment(UUID authUserId, UUID challengeId, CreateCommentRequestDTO request) {
        challengeService.assertUserCanJoin(authUserId, challengeId);
        String content = request.getContent() != null ? request.getContent().trim() : "";
        if (content.isEmpty()) {
            throw new IllegalArgumentException("Comment content cannot be blank");
        }
        if (content.length() > MAX_CONTENT_LENGTH) {
            throw new IllegalArgumentException("Comment must be at most " + MAX_CONTENT_LENGTH + " characters");
        }
        ChallengeComment comment = ChallengeComment.builder()
                .challengeId(challengeId)
                .userId(authUserId)
                .content(content)
                .build();
        comment = commentRepository.save(comment);
        return commentRepository.findByIdWithUser(comment.getId())
                .map(this::toCommentDTO)
                .orElseThrow();
    }

    private CommentDTO toCommentDTO(ChallengeComment c) {
        User user = c.getUser();
        String displayName = user != null && user.getName() != null ? user.getName().trim() : null;
        if (displayName == null || displayName.isEmpty()) {
            displayName = user != null && user.getEmail() != null ? user.getEmail().trim() : "—";
        }
        String profileImageUrl = user != null ? user.getProfileImageUrl() : null;
        return CommentDTO.builder()
                .id(c.getId())
                .challengeId(c.getChallengeId())
                .userId(c.getUserId())
                .userDisplayName(displayName)
                .userProfileImageUrl(profileImageUrl)
                .content(c.getContent())
                .createdAt(c.getCreatedAt())
                .build();
    }
}
