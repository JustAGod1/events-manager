package ru.justagod.events.crud.dto

import kotlinx.serialization.Serializable

@Serializable
class EventInfoDTO(
    val name: String,
    val info: String
)