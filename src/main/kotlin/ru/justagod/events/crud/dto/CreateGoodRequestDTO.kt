package ru.justagod.events.crud.dto

import kotlinx.serialization.Serializable

@Serializable
class CreateGoodRequestDTO(
    val name: String,
    val count: Int,
    val cost: Double,
    val importancy: Int,
)