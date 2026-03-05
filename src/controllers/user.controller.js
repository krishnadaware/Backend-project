import ApiError from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { User } from '../models/user.model.js';
import uploadOnCloudinary from '../utils/Cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const generateAccessTokenAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave : false }); // This will save the refresh token in the database without running validation,

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Token generation failed");
    }
}

        const registerUser = asyncHandler(async  (req , res) => {
    // return res.status(200).json( {
    //     message :  "User registered successfully"
    // })
    // REAL WORLD EXAMPLE


    // GET THE USER DATA FROM THE FRONTEND OR REQUEST BODY
    // VALIDATION - NOT EMPTY,
    // CHECK IF THE USER ALREADY EXISTS IN THE DATABASE , USERNAME OR EMAIL
    // CHECK FOR IMAGES,  CHECK FOR AVATAR,
    // UPLOAD THEM TO CLOUDINARY, AVATAR OR COVER IMAGE
    // CREATE THE USER OBJECT , I MEAN CREATE ENTRY IN THE DATABASE
    // remove password and refresh token fields from the response
    // check if the user is created successfully, if not throw an error

    const {fullName, email, username, password} = req.body
    console.log("fullName", fullName);
    console.log("email", email);

    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
        
    ) // field?.trim() ? - IT Removes spaces from start and end.
    {
        throw new ApiError(400, "All fields are required and must not be empty")
        } // If any input field is empty or only spaces, stop execution and send error."

        const existingUser = await User.findOne({
            $or : [{ username }, { email }]
        })

        if(existingUser){
            throw new ApiError(409, "User with the same username or email already exists")
        }

        const avatarlocalPath = req.files?.avatar[0]?.path;
        // const coverImageLocalPath = req.files?.coverImage[0]?.path;

        let coverImageLocalPath;
        if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
           coverImageLocalPath = req.files.coverImage[0].path;
        }

        if (!avatarlocalPath) {
            throw new ApiError(400, "Avatar image is required")
        }
    
        const avatar = await uploadOnCloudinary(avatarlocalPath);
        const coverImage = await uploadOnCloudinary(coverImageLocalPath);

        if (!avatar){
            throw new ApiError(400, "Avatar image is required")
        }

      const user = await User.create({
            fullName,
            avatar : avatar.url,
            coverImage : coverImage?.url || "",
            email,
            username : username.toLowerCase(),
            password
        })  // this code is for database entry, it will create a new user in the database with the provided data and return the created user object.

         const createdUser  = await User.findById(user._id).select("-password -refreshToken") 

         if (!createdUser) {
            throw new ApiError(500, "User registration failed")
         }

           return res.status(201).json(
            new ApiResponse(201, "User registered successfully", createdUser)
           )
        })

        const loginUser = asyncHandler(async (req, res) => {
            
            // req.body -> email, password
            // username or email
            // find the user in the database using email or username
            // if user not found, throw an error
            // if user found, compare the password using bcrypt
            // if password does not match, throw an error
            // access token and refresh token generation logic
            // send cookies in the response with refresh token, and access token in the response body

             const { email, username, password } = req.body;

             if (!(email || username)) {
                throw new ApiError(400, "Email or username is required")
             }

                const user = await User.findOne({
                    $or : [ {email}, {username}]
                })

                if (!user) {
                    throw new ApiError(404, "User not found")
                }

                const isPasswordValid = await user.isPasswordCorrect(password)
                 
                  if (!isPasswordValid) {
                    throw new ApiError(401, "Invalid password")
                  }
                  
             const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user._id)

             const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

             const options = {
                httpOnly : true,
                secure : true, // Set to true in production (HTTPS)
             }

              return res
    .status(200)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json({
        user: loggedInUser,
        accessToken,
        refreshToken,
        message: "User logged in successfully"
    });
        })
    

        const logoutUser = asyncHandler(async (req, res) => {
            // get the user id from the req.user which is set in the verifyJWT middleware
            // find the user in the database using the user id
                await User.findByIdAndUpdate(req.user._id, 
                    {
                        $set : {
                            refreshToken : undefined
                        }
                    }, 
                    {
                        new : true
                    }
                )

                const options = {
                    httpOnly : true,
                    secure : true, 
                }

                return res
                .status(200)
                .clearCookie("refreshToken", options)
                .clearCookie("accessToken", options)
                .json(new ApiResponse(200, "User logged out successfully"))
        });
            // Clear the refresh token from the database and cookies
        
        const refreshAccessToken = asyncHandler(async (req, res) => {
            // get the refresh token from cookies
            // if refresh token is not present, throw an error
            const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
            if (!incomingRefreshToken) {
                throw new ApiError(401, "Refresh token is required")
            }

            try { const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

            const user = await User.findById(decodedToken._id)

            if (!user) {
                throw new ApiError(401, "Invalid refresh token")
            }

            if (user.refreshToken !== incomingRefreshToken) {
                throw new ApiError(401, "Refresh token does not match")
            }

            const options = {
                httpOnly : true,
                secure : true,
            }
           const{ accessToken, newrefreshToken } = await generateAccessTokenAndRefreshToken(user._id)

                return res
                .status(200)
                .cookie("refreshToken", newrefreshToken, options)
                .cookie("accessToken", accessToken, options)
                .json (
                    new ApiResponse
                    (200, { accessToken, refreshToken : newrefreshToken},
                    "Access token refreshed successfully")
                ) }
                catch (error) {
                    throw new ApiError(401, error?.message || "Invalid refresh token")
                }
         });

         


export{ registerUser, loginUser, logoutUser, refreshAccessToken };