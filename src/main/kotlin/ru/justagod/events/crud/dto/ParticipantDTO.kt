package ru.justagod.events.crud.dto

import kotlinx.datetime.Instant
import kotlinx.serialization.Serializable

@Serializable
class ParticipantDTO(
    val id: Int,
    val creationTime: Instant,

    val name: String,
    val password: String?,

    val status: String?,
    val whois: String?,

    val admin: Boolean

) {

    @Serializable
    class ParticipantDTOSafe(
        val id: Int,
        val name: String,

        val status: String?,
        val whois: String?,

        val admin: Boolean?
    )

    fun safe() = ParticipantDTOSafe(id, name, status, whois, admin)
}