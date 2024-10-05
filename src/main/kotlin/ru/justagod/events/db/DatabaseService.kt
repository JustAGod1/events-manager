package ru.justagod.events.db

import kotlinx.coroutines.Dispatchers
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.transactions.experimental.newSuspendedTransaction
import ru.justagod.events.env

object DatabaseService  {

    val tables = arrayOf(Participants, MoneyTransactions, GoodRequests, GoodLogs)

    private val database = Database.connect(
        url = env.get("DB_URL"),
        user = env.get("DB_USER"),
        driver = "org.postgresql.Driver",
        password = env.get("DB_PASSWORD"),
    )

    suspend fun <T> transaction(block: () -> T): T {
        return newSuspendedTransaction(context = Dispatchers.IO, db = database) {
            block()
        }
    }

    fun start() {
        org.jetbrains.exposed.sql.transactions.transaction(database) {
            SchemaUtils.create(*tables)
        }
    }
}
