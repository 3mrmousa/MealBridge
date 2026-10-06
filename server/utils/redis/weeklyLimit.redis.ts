import redis from "../../config/redis.js"


export const setWeeklyLimit = async (key: string, limit: number, ttl: number) => {
    await redis.set(`weeklyLimit:${key}`, limit, "EX", ttl)
}

export const getWeeklyLimit = async (key: string) => {
    const data = await redis.get(`weeklyLimit:${key}`)
    return data !== null ? Number(data) : null
}

export const deleteWeeklyLimit = async (key: string) => {
    await redis.del(`weeklyLimit:${key}`)
}