package ru.justagod.events.crud.dto

import kotlinx.datetime.Instant
import kotlinx.serialization.Serializable
import ru.justagod.events.crud.dto.ParticipantDTO.ParticipantDTOSafe

@Serializable
class MoneyTransactionDTO(
    val id: Int,
    val creationTime: Instant,

    val author: ParticipantDTOSafe,
    val amount: Double
)
