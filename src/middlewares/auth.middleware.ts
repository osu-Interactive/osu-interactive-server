import { FastifyReply, FastifyRequest } from 'fastify'

export async function authMiddleware(
    request: FastifyRequest,
    reply: FastifyReply
) {
    try {
        await request.jwtVerify()
    } catch (err) {
        reply.code(401).send({ error: 'Unauthorized' })
    }
}
