package ru.justagod.events.crud.dto

import kotlinx.datetime.Instant
import kotlinx.serialization.Serializable

@Serializable
class GoodLogDTO(
    val id: Int,
    val creationTime: Instant,
    val author: ParticipantDTO.ParticipantDTOSafe,
    val message: String,
    val target: GoodRequestDTO
)
