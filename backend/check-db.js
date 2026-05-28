const { PrismaClient } = require('@prisma/client')
const p = new PrismaClient()
p.user.findMany().then(u => {
  console.log('Users:', u.length, JSON.stringify(u.map(x => x.email)))
  return p.$disconnect()
}).catch(e => {
  console.error(e.message)
  p.$disconnect()
})
