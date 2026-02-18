import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";
import connectDB from "./db/index.js";
import app from "./app.js";
import dotenv from "dotenv";


dotenv.config({ path: "./.env" });


/* import express from "express"; const app = express(); (async () => { try { await mongoose.connect( ${process.env.MONGODB_URL}/${DB_NAME}) app.on("error", (error) => { console.log("ERROR", error); }) app.listen(process.env.PORT, () => { console.log(App is listening on port ${process.env.PORT}); }) } catch (error) { console.log("error", error) throw error } })() */

connectDB()
.then(() => {
     app.listen(process.env.PORT || 8000 , () => {
        console.log(`Server is running on port : ${process.env.PORT || 8000}`)
     })
})
.catch((error) => {
 console.log("MongodB connection (server) error", error);
})
 
