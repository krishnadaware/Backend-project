import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config({ path: "./.env" });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null;
        // Upload the file to Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, { resource_type: "auto" })
        // file uploaded successfully
        console.log("File uploaded successfully:", response.url);
        return response;
    } 
    catch(error) {
        fs.unlinkSync(localFilePath);
        //remove the temporary file from local storage if any error occurs during upload
    }
}

export default uploadOnCloudinary;