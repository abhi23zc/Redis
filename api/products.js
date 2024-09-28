export const getProducts = () => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve([
                {
                    id: 1,
                    name: 'Apple',
                    price: 100,
                }
            ])
        }, 2000)
    })
}

export const getProductDetail = (id) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve([
                {
                    id: id,
                    name: `Product ${id}`,
                    price: Math.random(100) * 100,
                }
            ])
        }, 2000)
    })
}