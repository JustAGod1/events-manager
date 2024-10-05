package ru.justagod.events.db

import org.jetbrains.exposed.dao.IntEntity
import org.jetbrains.exposed.dao.IntEntityClass
import org.jetbrains.exposed.dao.id.EntityID
import org.jetbrains.exposed.dao.id.IntIdTable
import org.jetbrains.exposed.sql.Op
import org.jetbrains.exposed.sql.kotlin.datetime.CurrentTimestamp
import org.jetbrains.exposed.sql.kotlin.datetime.timestamp
import ru.justagod.events.crud.dto.GoodLogDTO
import ru.justagod.events.crud.dto.GoodRequestDTO
import ru.justagod.events.crud.dto.MoneyTransactionDTO
import ru.justagod.events.crud.dto.ParticipantDTO
import kotlin.math.cos

abstract class ManagerTable(name: String) : IntIdTable(name) {
    val creationTime = timestamp("created_at").defaultExpression(CurrentTimestamp)

}

abstract class ManagerEntity<T>(id: EntityID<Int>) : IntEntity(id) {

    abstract fun dto(): T
}

object Participants : ManagerTable("participants") {
    val name = varchar("name", 64).index()
    val password = text("password_sha1").nullable()

    val status = text("status").nullable()
    val whois = text("whois").nullable()

    val admin = bool("admin").defaultExpression(Op.FALSE)
}

class Participant(id: EntityID<Int>) : ManagerEntity<ParticipantDTO>(id) {
    companion object : IntEntityClass<Participant>(Participants)

    var creationTime by Participants.creationTime

    var name by Participants.name
    var password by Participants.password

    var status by Participants.status
    var whois by Participants.whois

    var admin by Participants.admin


    override fun dto(): ParticipantDTO = ParticipantDTO(
        id.value, creationTime, name, password, status, whois, admin
    )
}

object MoneyTransactions : ManagerTable("money_transactions") {
    val author = reference("author", Participants)
    val amount = double("amount")
}

class MoneyTransaction(id: EntityID<Int>) : ManagerEntity<MoneyTransactionDTO>(id) {
    companion object : IntEntityClass<MoneyTransaction>(MoneyTransactions)

    var creationTime by MoneyTransactions.creationTime
    var author by Participant referencedOn MoneyTransactions.author
    var amount by MoneyTransactions.amount

    override fun dto(): MoneyTransactionDTO = MoneyTransactionDTO(
        id.value,
        creationTime,
        author.dto().safe(),
        amount
    )

}

object GoodRequests : ManagerTable("goods_requests") {
    val name = text("name")
    val count = integer("amount")
    val cost = double("cost")
    val importancy = integer("importancy")
    val author = reference("author", Participants)
    val deleted = bool("deleted").defaultExpression(Op.FALSE)
}

class GoodRequest(id: EntityID<Int>) : ManagerEntity<GoodRequestDTO>(id) {
    companion object : IntEntityClass<GoodRequest>(GoodRequests)

    var creationTime by GoodRequests.creationTime
    var name by GoodRequests.name
    var count by GoodRequests.count
    var cost by GoodRequests.cost
    var importancy by GoodRequests.importancy
    var deleted by GoodRequests.deleted

    var author by Participant referencedOn GoodRequests.author

    override fun dto(): GoodRequestDTO = GoodRequestDTO(
        id.value, name, count, cost, importancy, author.dto().safe()
    )
}

object GoodLogs : ManagerTable("good_logs") {
    val message = text("message")
    val author = reference("author", Participants)
    val target = reference("target", GoodRequests)
}

class GoodLog(id: EntityID<Int>) : ManagerEntity<GoodLogDTO>(id) {
    companion object : IntEntityClass<GoodLog>(GoodLogs)

    var creationTime by GoodLogs.creationTime
    var message by GoodLogs.message
    var author by Participant referencedOn GoodLogs.author
    var target by GoodRequest referencedOn GoodLogs.target

    override fun dto(): GoodLogDTO = GoodLogDTO(
        id.value, creationTime, author.dto().safe(), message, target.dto()
    )
}

