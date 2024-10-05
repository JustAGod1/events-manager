package ru.justagod.events.crud.dto

import kotlinx.serialization.Serializable

@Serializable
class PatchGoodRequestDTO(
    val id: Int,
    val info: CreateGoodRequestDTO
)