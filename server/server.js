import {app} from "./app.js";
import {config} from "dotenv";
import { connectDatabase } from "./config/database.js";
import cloudinary from 'cloudinary';

config({
    path: "./config/config.env"
});
cloudinary.config({
    cloud_name: "dwlzgfgkn",
    api_key: "224841663973988",
    api_Secret: "BAKVjeOvHHiTDsk0gUdtUdiCM68"
});
connectDatabase();

app.listen(4400, ()=>{
    console.log('server is running on port ' + 4400);
});
