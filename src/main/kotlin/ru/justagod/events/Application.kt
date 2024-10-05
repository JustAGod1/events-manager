package ru.justagod.events

import io.ktor.server.application.*
import ru.justagod.events.plugins.*

fun main(args: Array<String>) {
    io.ktor.server.netty.EngineMain.main(args)
}

fun Application.module() {
    configureSecurity()
    configureHTTP()
    configureSerialization()
    configureRouting()
}
