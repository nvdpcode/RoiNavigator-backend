const express = require('express');
const app = express();
const {sequelize} = require('./dbConfig')
const cors = require('cors');

//Import Routers
const configRouter = require('./Routes/configRoute')
const userRouter = require('./Routes/userRoute')
const customerRouter = require('./Routes/customerRoute')
const productRouter = require('./Routes/productRoute')

app.use(cors())
app.use(express.json());

//Set up Routers
app.use('/api/config',configRouter)
app.use('/api/user',userRouter)
app.use('/api/customer',customerRouter)
app.use('/api/product',productRouter)

const PORT = 8000

//Start Server
app.listen(PORT,(()=>{
    console.log(`Server started on port ${PORT}`)
}))

async function connectToDb() {
  try {
    await sequelize.authenticate();
    console.log('Database Connected');
    await sequelize.sync({ force: false });
    console.log('Database synchronized');
  } catch (error) {
    console.error('Error Connecting/Syncing Database:', error);
  }
}

connectToDb();
