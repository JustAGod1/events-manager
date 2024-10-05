package ru.justagod.events.crud

import io.ktor.http.HttpStatusCode
import io.ktor.server.application.Application
import io.ktor.server.auth.UnauthorizedResponse
import io.ktor.server.auth.authenticate
import io.ktor.server.auth.principal
import io.ktor.server.request.receive
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.get
import io.ktor.server.routing.post
import io.ktor.server.routing.route
import io.ktor.server.routing.routing
import org.jetbrains.exposed.sql.SqlExpressionBuilder
import org.jetbrains.exposed.sql.update
import ru.justagod.events.crud.dto.CreateGoodRequestDTO
import ru.justagod.events.crud.dto.EventInfoDTO
import ru.justagod.events.crud.dto.NewTransactionDTO
import ru.justagod.events.crud.dto.ParticipantDTO
import ru.justagod.events.crud.dto.PatchGoodRequestDTO
import ru.justagod.events.db.DatabaseService
import ru.justagod.events.db.GoodLog
import ru.justagod.events.db.GoodRequest
import ru.justagod.events.db.GoodRequests
import ru.justagod.events.db.MoneyTransaction
import ru.justagod.events.db.Participant

private fun logGood(author: Participant, target: GoodRequest, message: String) {
    GoodLog.new {
        this.author = author
        this.target = target
        this.message = message
    }
}

private fun Route.doCruding() {
    route("/api") {
        get("info") {
            val info = """
                Ну крч тоси боси барбадоси
            """.trimIndent()
            call.respond(EventInfoDTO("Юрин др 2024", info))
        }
        route("me") {

            get {
                val user = call.principal<ParticipantDTO>()!!
                call.respond(user.safe())
            }
            post {
                val body = call.receive<ParticipantDTO.ParticipantDTOSafe>()
                val user = call.principal<ParticipantDTO>()!!
                if (user.id != body.id && !user.admin) {
                    call.respond(UnauthorizedResponse())
                    return@post
                }

                DatabaseService.transaction {
                    Participant.findByIdAndUpdate(body.id) {
                        it.name = body.name
                        it.whois = body.whois
                    }
                }

                call.respond(HttpStatusCode.OK, "{}")
            }
        }
        post("create_transaction") {
            val user = call.principal<ParticipantDTO>()!!
            if (!user.admin) {
                call.respond(UnauthorizedResponse())
                return@post
            }
            val request = call.receive<NewTransactionDTO>()

            DatabaseService.transaction {
                MoneyTransaction.new {
                    this.amount = request.amount
                    this.author = Participant.findById(request.author)!!
                }
            }

            call.respond(HttpStatusCode.OK, "{}")
        }
        get("transactions") {
            val transactions = DatabaseService.transaction {
                MoneyTransaction.all().sortedByDescending { it.creationTime }.map { it.dto() }
            }

            call.respond(transactions)
        }
        route("goods") {
            get {
                val requests = DatabaseService.transaction {
                    GoodRequest.all().filter { !it.deleted }.sortedByDescending { it.creationTime }.map { it.dto() }
                }

                call.respond(requests)
            }
            post("new") {
                val user = call.principal<ParticipantDTO>()!!
                val data = call.receive<CreateGoodRequestDTO>()

                DatabaseService.transaction {
                    val author = Participant.findById(user.id)!!
                    val target = GoodRequest.new {
                        this.author = author
                        this.name = data.name
                        this.importancy = data.importancy
                        this.cost = data.cost
                        this.count = data.count
                    }
                    logGood(author, target, "Создал")
                }

                call.respond("{}")
            }

            suspend fun addToImportancy(userInfo: ParticipantDTO, id: Int, v: Int) {
                DatabaseService.transaction {
                    GoodRequests.update({
                        GoodRequests.id.eq(id)
                    }) {
                        with(SqlExpressionBuilder) {
                            it.update(GoodRequests.importancy, GoodRequests.importancy + v)
                        }
                    }

                    val user = Participant.findById(userInfo.id)!!
                    val target = GoodRequest.findById(id)!!

                    logGood(user, target, "Изменил важность на $v")
                }
            }

            suspend fun addToCount(userInfo: ParticipantDTO, id: Int, v: Int) {
                DatabaseService.transaction {
                    GoodRequests.update({
                        GoodRequests.id.eq(id)
                    }) {
                        with(SqlExpressionBuilder) {
                            it.update(GoodRequests.count, GoodRequests.count + v)
                        }
                    }

                    val user = Participant.findById(userInfo.id)!!
                    val target = GoodRequest.findById(id)!!

                    logGood(user, target, "Изменил количество на $v")
                }
            }

            post("inc_imp") {
                val id = call.receive<Int>()
                addToImportancy(call.principal<ParticipantDTO>()!!, id, 1)

                call.respond("{}")
            }

            post("dec_imp") {
                val id = call.receive<Int>()
                addToImportancy(call.principal<ParticipantDTO>()!!, id, -1)

                call.respond("{}")
            }

            post("inc_cnt") {
                val id = call.receive<Int>()
                addToCount(call.principal<ParticipantDTO>()!!, id, 1)

                call.respond("{}")
            }

            post("dec_cnt") {
                val id = call.receive<Int>()
                addToCount(call.principal<ParticipantDTO>()!!, id, -1)

                call.respond("{}")
            }

            post("del") {
                val id = call.receive<Int>()
                DatabaseService.transaction {
                    val target = GoodRequest.findById(id)!!
                    target.deleted = true
                    val author = Participant.findById(call.principal<ParticipantDTO>()!!.id)!!
                    logGood(
                        author,
                        target,
                        "Удалил"
                    )
                    target.flush()
                }

                call.respond("{}")
            }

            post("patch") {
                val data = call.receive<PatchGoodRequestDTO>()

                DatabaseService.transaction {
                    val target = GoodRequest.findById(data.id)!!
                    val prevCost = target.cost
                    val prevCount = target.count

                    target.cost = data.info.cost
                    target.count = data.info.count
                    target.flush()

                    val author = Participant.findById(call.principal<ParticipantDTO>()!!.id)!!

                    logGood(
                        author,
                        target,
                        "Стоимость: $prevCost -> ${target.cost}; Количество: $prevCount -> ${target.count}"
                    )
                }

                call.respond("{}")
            }

            get("logs") {
                val r = DatabaseService.transaction {
                    GoodLog.all().sortedByDescending { it.creationTime }.map { it.dto() }
                }
                call.respond(r)
            }

        }
    }
}

fun Application.configureAuthorizedCrud() {
    routing {
        authenticate {
            doCruding()
        }
    }
}
