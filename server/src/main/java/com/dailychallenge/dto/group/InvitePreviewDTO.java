package com.dailychallenge.dto.group;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvitePreviewDTO {

    private InvitePreviewGroupDTO group;
    private List<InvitePreviewMemberDTO> members;
}
