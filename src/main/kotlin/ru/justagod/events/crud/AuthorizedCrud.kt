package ru.justagod.events.crud

import io.ktor.server.application.Application
import io.ktor.server.response.respond
import io.ktor.server.routing.get
import io.ktor.server.routing.routing
import ru.justagod.events.crud.dto.LoginUserDTO
import ru.justagod.events.db.DatabaseService
import ru.justagod.events.db.Participant
import ru.justagod.events.db.Participants

fun Application.configureUnauthorizedCrud() {
    routing {
        get("/api/login/users") {
            val r = DatabaseService.transaction {
                Participant.all()
                    .map { LoginUserDTO(it.name, it.password != null) }
            }

            call.respond(r)
        }
    }
}
