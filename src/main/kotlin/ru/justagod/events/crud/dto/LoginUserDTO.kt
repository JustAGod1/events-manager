package ru.justagod.events.crud.dto

import kotlinx.serialization.Serializable

@Serializable
class LoginUserDTO(
    val name: String,
    val hasPassword: Boolean,
    val id: Int
)