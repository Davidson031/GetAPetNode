const express = require("express")
const cors = require("cors")
const UserRoutes = require("./routes/UserRoutes")

const app = express()

//configurando json
app.use(express.json())

//Cors
app.use(cors({credentials: true, origin: "http://localhost:3000"}))


//asssets
app.use(express.static("public"))

//routes
app.use("/users", UserRoutes)

//run app
app.listen(5000)