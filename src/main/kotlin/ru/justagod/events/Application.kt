package ru.justagod.events

import io.github.cdimascio.dotenv.dotenv
import io.ktor.server.application.*
import ru.justagod.events.crud.configureAuthorizedCrud
import ru.justagod.events.crud.configureUnauthorizedCrud
import ru.justagod.events.db.DatabaseService
import ru.justagod.events.plugins.*
import ru.justagod.events.security.configureSecurity

val env = dotenv()

fun main(args: Array<String>) {
    io.ktor.server.netty.EngineMain.main(args)
}

fun Application.module() {
    DatabaseService.start()
    configureSecurity()
    configureHTTP()
    configureSerialization()
    configureRouting()
    configureUnauthorizedCrud()
    configureAuthorizedCrud()
}
