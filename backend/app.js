const express = require('express');
const mongoose = require('mongoose');
const router = require('./routes/user-routes');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const {MONGODB_PASSWORD, PORT, DB_NAME} = require('./Utils/Config');

const app = express();
app.use(cors({credentials:true,origin:"http://localhost:3000"}));
app.use(cookieParser());
app.use(express.json());


app.use("/api", router);

//mongodb+srv://bank-app-admin:<password>@bank-app-cluster1.rn9w47e.mongodb.net/?retryWrites=true&w=majority
mongoose.connect(`mongodb+srv://bank-app-admin:${MONGODB_PASSWORD}@bank-app-cluster1.rn9w47e.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`).then(()=>{
    app.listen(PORT,() => console.log(`Application is running on ${PORT}....`));
}).catch((err) => {console.log(err)});
