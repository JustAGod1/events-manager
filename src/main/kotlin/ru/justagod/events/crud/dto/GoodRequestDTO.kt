package ru.justagod.events.crud.dto

import kotlinx.serialization.Serializable

@Serializable
class GoodRequestDTO(
    val id: Int,
    val name: String,
    val count: Int,
    val cost: Double,
    val importancy: Int,
    val author: ParticipantDTO.ParticipantDTOSafe
)