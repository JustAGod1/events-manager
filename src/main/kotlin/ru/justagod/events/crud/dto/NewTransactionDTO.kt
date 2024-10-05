package ru.justagod.events.crud.dto

import kotlinx.serialization.Serializable

@Serializable
class NewTransactionDTO(
    val author: Int,
    val amount: Double
)