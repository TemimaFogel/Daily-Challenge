package com.dailychallenge.controller;

import com.dailychallenge.entity.Group;
import com.dailychallenge.entity.GroupMember;
import com.dailychallenge.entity.User;
import com.dailychallenge.repository.GroupMemberRepository;
import com.dailychallenge.repository.GroupRepository;
import com.dailychallenge.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.junit.jupiter.api.extension.ExtendWith;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Testcontainers
@ExtendWith(EnabledIfDockerCondition.class)
class ProfileImageIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15-alpine")
            .withDatabaseName("testdb")
            .withUsername("test")
            .withPassword("test");

    private static Path tempUploadsDir;

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        try {
            tempUploadsDir = Files.createTempDirectory("dc-profile-test-uploads");
            registry.add("app.uploads.dir", () -> tempUploadsDir.toAbsolutePath().toString());
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private GroupRepository groupRepository;
    @Autowired
    private GroupMemberRepository groupMemberRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    private static final byte[] MINIMAL_PNG = java.util.Base64.getDecoder().decode(
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==");

    @BeforeEach
    void setUp() {
        groupMemberRepository.deleteAll();
        groupRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void uploadProfileImage_validPng_returns200AndProfileImageUrl() throws Exception {
        String token = registerAndGetToken("owner@test.com", "Owner", "pass");
        MockMultipartFile file = new MockMultipartFile("file", "pic.png", "image/png", MINIMAL_PNG);

        ResultActions result = mockMvc.perform(
                multipart("/api/users/me/profile-image")
                        .file(file)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token));

        result.andExpect(status().isOk());
        String body = result.andReturn().getResponse().getContentAsString();
        JsonNode json = objectMapper.readTree(body);
        assertThat(json.has("profileImageUrl")).isTrue();
        assertThat(json.get("profileImageUrl").asText()).isNotBlank();
    }

    @Test
    void uploadProfileImage_validJpeg_returns200AndProfileImageUrl() throws Exception {
        String token = registerAndGetToken("jpeg@test.com", "Jpeg", "pass");
        byte[] jpeg = minimalJpegBytes();
        MockMultipartFile file = new MockMultipartFile("file", "pic.jpg", "image/jpeg", jpeg);

        ResultActions result = mockMvc.perform(
                multipart("/api/users/me/profile-image")
                        .file(file)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token));

        result.andExpect(status().isOk());
        String body = result.andReturn().getResponse().getContentAsString();
        JsonNode json = objectMapper.readTree(body);
        assertThat(json.get("profileImageUrl").asText()).isNotBlank();
    }

    @Test
    void uploadProfileImage_invalidContentType_returns400() throws Exception {
        String token = registerAndGetToken("bad@test.com", "Bad", "pass");
        MockMultipartFile file = new MockMultipartFile("file", "file.txt", "text/plain", "not an image".getBytes());

        mockMvc.perform(
                multipart("/api/users/me/profile-image")
                        .file(file)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isBadRequest());
    }

    @Test
    void groupMembersEndpoint_includesProfileImageUrlForMemberWithImage() throws Exception {
        String ownerToken = registerAndGetToken("owner@test.com", "Owner", "pass");
        UUID groupId = createGroupAndGetId(ownerToken, "My Group");

        User memberWithImage = User.builder()
                .email("member@test.com")
                .password(passwordEncoder.encode("pass"))
                .name("Member")
                .timezone("UTC")
                .profileImageUrl("/uploads/profile-images/test.png")
                .build();
        memberWithImage = userRepository.save(memberWithImage);

        GroupMember membership = GroupMember.builder()
                .groupId(groupId)
                .userId(memberWithImage.getId())
                .build();
        groupMemberRepository.save(membership);

        String membersJson = mockMvc.perform(
                get("/api/groups/" + groupId + "/members")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + ownerToken))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode members = objectMapper.readTree(membersJson);
        assertThat(members.isArray()).isTrue();
        JsonNode memberB = null;
        for (JsonNode m : members) {
            if (m.get("userId").asText().equals(memberWithImage.getId().toString())) {
                memberB = m;
                break;
            }
        }
        assertThat(memberB).isNotNull();
        assertThat(memberB.has("profileImageUrl")).isTrue();
        assertThat(memberB.get("profileImageUrl").asText()).isEqualTo("/uploads/profile-images/test.png");
    }

    private String registerAndGetToken(String email, String name, String password) throws Exception {
        String registerBody = String.format(
                "{\"email\":\"%s\",\"name\":\"%s\",\"password\":\"%s\",\"timezone\":\"UTC\"}",
                email, name, password);
        String response = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerBody))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        JsonNode json = objectMapper.readTree(response);
        return json.get("token").asText();
    }

    private UUID createGroupAndGetId(String token, String name) throws Exception {
        String body = mockMvc.perform(post("/api/groups")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"" + name + "\",\"description\":\"\"}"))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        return UUID.fromString(objectMapper.readTree(body).get("id").asText());
    }

    private static byte[] minimalJpegBytes() {
        byte[] jpegMagic = new byte[]{(byte) 0xFF, (byte) 0xD8, (byte) 0xFF};
        byte[] rest = new byte[100];
        java.util.Arrays.fill(rest, (byte) 0);
        byte[] result = new byte[jpegMagic.length + rest.length];
        System.arraycopy(jpegMagic, 0, result, 0, jpegMagic.length);
        System.arraycopy(rest, 0, result, jpegMagic.length, rest.length);
        return result;
    }
}
