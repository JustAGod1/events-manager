package ru.justagod.events.security

import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
import io.ktor.resources.Resource
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.auth.jwt.*
import io.ktor.server.resources.Resources
import io.ktor.server.response.respond
import io.ktor.server.response.respondRedirect
import io.ktor.server.response.respondText
import io.ktor.server.routing.get
import io.ktor.server.routing.post
import io.ktor.server.routing.routing
import kotlinx.serialization.Serializable
import org.apache.commons.codec.digest.DigestUtils
import org.jetbrains.exposed.sql.and
import ru.justagod.events.db.DatabaseService
import ru.justagod.events.db.Participant
import ru.justagod.events.db.Participants
import ru.justagod.events.env
import java.time.Duration
import java.time.Instant
import java.time.temporal.ChronoUnit

private const val JWT_USER_ID = "user_id"

private val secret = env.get("JWT_SECRET")
private val issuer = env.get("JWT_ISSUER")
private val audience = env.get("JWT_AUDIENCE")

private fun sha1(src: String) = DigestUtils.sha1Hex(src)

@Serializable
@Resource("/api/login")
private class Login(val name: String, val password: String? = null)

fun Application.configureSecurity() {
    install(Resources)
    routing {
        post<Login>("/api/login") {
            val targetPass = if (it.password == null) null else sha1(it.password)
            val user = DatabaseService.transaction {
                Participant.find {
                    Participants.name.eq(it.name)
                        .and(Participants.password.eq(targetPass))
                }.limit(1).firstOrNull()
            }

            if (user == null) {
                call.respond(UnauthorizedResponse())
                return@post
            }

            val token = JWT.create()
                .withAudience(audience)
                .withIssuer(issuer)
                .withClaim(JWT_USER_ID, user.id.value)
                .withExpiresAt(Instant.now() + Duration.of(3, ChronoUnit.DAYS))
                .sign(Algorithm.HMAC256(secret))

            call.respond(token)
        }
    }
    install(Authentication) {
        jwt {
            realm = "all"
            verifier(
                JWT
                    .require(Algorithm.HMAC256(secret))
                    .withAudience(audience)
                    .withIssuer(issuer)
                    .build()
            )
            validate { creds ->
                val userId = creds.payload.getClaim(JWT_USER_ID).asInt() ?: return@validate null

                DatabaseService.transaction {
                    Participant.find {
                        Participants.id.eq(userId)
                    }.limit(1).firstOrNull()?.dto()
                }

            }
            challenge { defaultScheme, realm ->
                call.respond(UnauthorizedResponse())
            }
        }
    }
}
