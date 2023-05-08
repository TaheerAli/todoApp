import mongoose from "mongoose";

export const connectDatabase = async ()=>{
    try {
        const {connection} = await mongoose.connect("mongodb+srv://taha:Tahaaara4%40mbl4@taha.onwdrxu.mongodb.net/MyFirstDatabase");
        console.log("Connected to Mongo DB : " + connection.host);    
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
    
}