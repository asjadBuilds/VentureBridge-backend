import User from "../models/userModel.js";
import { validationResult } from "express-validator";
import AsyncHandler from "../utils/AsyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { uploadFileonCloudinary } from "../utils/cloudinary.js";
import { decryptToken, encryptToken } from "../utils/encyptDecryptToken.js";
import jwt from "jsonwebtoken";
import {twilioClient} from '../app.js'

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);

    if (!user) throw ApiError(404, "User Not Found");
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong");
  }
};

const createUser = AsyncHandler(async (req, res) => {
  const { username, email, password, role } = req.body;
  const result = validationResult(req.body);
  if (!result.isEmpty()) throw ApiError(402, "Invalid credentials");
  const isUser = await User.findOne({ email });
  if (isUser) throw new ApiError(402, "User Already Exists");
  const avatarLocalPath = req.file?.path;
  const avatar = await uploadFileonCloudinary(avatarLocalPath);
  if (!avatar) throw new ApiError(400, "Avatar file is required");
  const user = await User.create({
    username,
    email,
    password,
    avatar: avatar.url,
    role,
  });
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken -accessToken"
  );
  res.json(new ApiResponse(200, createdUser, "User Created Successfully"));
});

const signIn = AsyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = validationResult(req.body);
  if (!result.isEmpty()) {
    res.status(400).json("Invalid credentials");
  }
  const isValidUser = await User.findOne({
    $or: [{ email }],
  });
  if (!isValidUser) {
    throw new ApiError(402, "User Not Found");
  }
  const matchedPass = await isValidUser.isPasswordCorrect(password);
  if (!matchedPass) {
    res.status(400).json("User has enetered incorrect password");
  }
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    isValidUser._id
  );
  const encryptedAccessToken = encryptToken(
    accessToken,
    process.env.ACCESS_TOKEN_SECRET
  );
  const encryptedRefreshToken = encryptToken(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );
  const loggedInUser = await User.findByIdAndUpdate(
    isValidUser._id,
    {
      $set: {
        accessToken:encryptedAccessToken,
        refreshToken:encryptedRefreshToken,
      },
    },
    { new: true }
  ).select("-password -refreshToken -resetToken -accessToken");
  const options = {
    secure: true,
    sameSite: 'none',
    httpOnly: false,
    // domain: 'https://venturebridge-backend-production.up.railway.app', // Omit for localhost testing
    path: '/',
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .cookie("userDetails",loggedInUser, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User Logged in Successfully"
      )
    );
});

const logout = AsyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
        accessToken:1
      },
    },
    {
      new: true,
    }
  );
  const options = {
    secure: true,
    sameSite: 'None'
  };
  res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out Successfully"));
});

const refreshAccessToken = AsyncHandler(async (req, res) => {
  const incomingToken = req?.cookies?.refreshToken || req?.body?.refreshToken;
  if (!incomingToken) throw new ApiError(402, "No Refresh Token Found");
  const decodedToken = jwt.verify(
    incomingToken,
    process.env.REFRESH_TOKEN_SECRET
  );

  const user = await User.findById(decodedToken._id);
  if (!user) throw new ApiError(402, "User Not Found");
  const decryptedToken = decryptToken(
    user.refreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );

  if (decryptedToken !== incomingToken) throw new ApiError(402, "Invalid Refresh Token");
  const options = {
    secure: true,
    sameSite: 'None'
  };
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { accessToken, refreshToken },
        "Access Token Refreshed Successfully"
      )
    );
});

const sendForgetMail = AsyncHandler(async (req, res) => {
  const { email } = req.body;
  const result = validationResult(req.body);
  if (!result.isEmpty()) throw ApiError(402, "Invalid credentials");

  const user = await User.findOne({ email });
  if (!user) throw ApiError(402, "User Not Found");
  const resetToken = user.generateResetToken();
  if (!resetToken)
    throw new ApiError(
      500,
      "Something went wrong while generating reset token"
    );
  await User.findByIdAndUpdate(user._id, {
    $set: {
      resetToken,
    },
  });
  let otpResponse;
 
    otpResponse = twilioClient.verify.v2.services(process.env.TWILIO_SERVICE_SID)
      .verifications
      .create({to: '+923170770434', channel: 'sms'})
      .then(verification => console.log(verification.sid));

      if(!otpResponse) throw new ApiError(500, "otp failed")
 
  // const response = await sendMail(email, user.username, resetToken);
  // if (!response.success) throw new ApiError(500, "Error sending email");
  res
    .status(200)
    .json(new ApiResponse(200, JSON.stringify(otpResponse), "Reset Password Link Sent Successfully"));
});

const verifyOTP = AsyncHandler(async (req, res)=>{
  let verifyStatus;
  const {countryCode, phoneNumber, otp} = req.body;
  const verifiedResponse = await twilioClient.verify.v2.services(process.env.TWILIO_SERVICE_SID)
  .verificationChecks
  .create({to: `${countryCode}${phoneNumber}`, code:otp})
  .then(verification => verifyStatus=verification.status);
  if(verifyStatus !== 'approved') throw new ApiError(401,"OTP not Verified");
  res
    .status(200)
    .json(new ApiResponse(200, JSON.stringify(verifiedResponse), "OTP VERIFIED Successfully"));
})

const resetPassword = AsyncHandler(async (req, res) => {
  const { newPassword } = req.body;
  const resetToken = req?.params?.token;
  if (!resetToken) throw new ApiError(401, "No reset token found");
  const validTokenUser = await User.findOne({ resetToken });
  if (!validTokenUser) throw new ApiError(402, "Invalid token");
  await User.findByIdAndUpdate(validTokenUser._id, {
    $set: {
      password: newPassword,
    },
  });
  res.status(200).json(new ApiResponse(200, "Password Successfully Resetted"));
});

const changePassword = AsyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const result = validationResult(req.body);
  if (!result) throw new ApiError(400, "invalid password details");
  const validUser = await User.findById(req._id);
  if (!validUser) throw new ApiError(401, "Invalid User");
  const confirmPass = validUser.isPasswordCorrect(oldPassword);
  if (!confirmPass) throw new ApiError(401, "Incorrect Password");
  await User.findByIdAndUpdate(validUser._id, {
    $set: {
      password: newPassword,
    },
  });
  res
    .status(200)
    .json(new ApiResponse(200, "User Password Changed Successfully"));
});

export {
  createUser,
  signIn,
  logout,
  refreshAccessToken,
  sendForgetMail,
  resetPassword,
  changePassword,
  verifyOTP
};
