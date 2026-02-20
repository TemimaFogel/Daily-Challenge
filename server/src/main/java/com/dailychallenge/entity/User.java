package com.dailychallenge.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "email", nullable = false, unique = true, length = 255)
    private String email;

    @Column(name = "password", nullable = false, length = 255)
    private String password;

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "timezone", nullable = false, length = 100)
    private String timezone;

    @Column(name = "profile_image_url", length = 512)
    private String profileImageUrl;

    @OneToMany(mappedBy = "owner")
    private List<Group> groups = new ArrayList<>();

    @OneToMany(mappedBy = "creator")
    private List<Challenge> challenges = new ArrayList<>();

    @OneToMany(mappedBy = "user")
    private List<ChallengeCompletion> completions = new ArrayList<>();
}

