import express from 'express'
import { getProductDetail, getProducts } from './api/products.js';
import Redis from 'ioredis'
import { getCachedData } from './middleware/redis.js';

const app = express();

export const redis = new Redis({
    host: "redis-12527.c258.us-east-1-4.ec2.redns.redis-cloud.com",
    port: 12527,
    password: "nMehrjysfsGz2ml4JH4atBoT8YwITDfk"
})

redis.on('connect', () => {
    console.log("Redis Connected....")
})


app.get('/', async (req, res) => {
    const client_ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress);

    const count = await redis.incr(`${client_ip}:request_count`)

    if (count === 1) {
        await redis.expire(`${client_ip}:request_count`, 60)
    }  
    
    const expireTime = await redis.ttl(`${client_ip}:request_count`)

    if (count > 10) {
        return res.send(`Too many request please try again after ${expireTime}` )
    }

    return res.send({ "Working": count })
})

app.get('/products', getCachedData("products"), async (req, res) => {


    const products = await getProducts();
    // await redis.set("products", JSON.stringify(products))
    await redis.setex("products", 20, JSON.stringify(products))
    return res.json(products)


})

app.get('/products/:id', async (req, res) => {

    const id = req.params.id;
    const key = `product_${id}`

    let product = await redis.get(key)
    if (product) return res.json({ product: JSON.parse(product) })

    product = await getProductDetail(id)
    await redis.set(key, JSON.stringify(product))

    return res.json({
        product
    })
})

app.get('/orders/:id', async (req, res) => {

    const productId = req.params.id
    const key = `product_${productId}`

    await redis.del(key)
    return res.json({
        message: `Order placed Succesfully , product id:${productId} is ordered`
    })

})

app.listen(80, () => {
    console.log("Server Running .....")
})