import User from "../models/userModel.js";
import ApiError from "../utils/ApiError.js";
import AsyncHandler from "../utils/AsyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { uploadFileonCloudinary } from "../utils/cloudinary.js";
import { validationResult } from "express-validator";
import UserInfo from "../models/userInfoModel.js";
import mongoose from "mongoose";

const updateAccountDetails = AsyncHandler(async (req, res) => {
  const { username, email } = req.body;
  const user = await User.findByIdAndUpdate(
    req?.user?._id,
    {
      $set: {
        username,
        email,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User Details updated successfully"));
});

const updateAvatar = AsyncHandler(async (req, res) => {
  const avatarLocalPath = req?.file?.path;
  if (!avatarLocalPath)
    throw new ApiError(402, "No Local Path found for avatar");
  const avatar = await uploadFileonCloudinary(avatarLocalPath);
  if (!avatar) throw new ApiError(402, "Avatar failed to upload");
  const user = await User.findByIdAndUpdate(req.user._id, {
    $set: {
      avatar: avatar.url,
    },
  }).select("-password -refreshToken -accessToken");
  res
    .status(200)
    .json(new ApiResponse(200, user, "User Avatar updated Successfully"));
});

const updateUserInfo = AsyncHandler(async (req, res) => {
  const { fullName, dateOfBirth, aboutDescription, country, city } =
    req.body;
  // const result = validationResult(req.body);
  // if (!result) throw new ApiError(402, "Invalid details");
  const infoExists = await UserInfo.findOne({ user: req.user._id });
  if (!infoExists) {
    const userInfo = await UserInfo.create({
      user: req.user._id,
      fullName,
      dateOfBirth,
      aboutDescription,
      country,
      city,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, userInfo, "User Info created Successfully"));
  }
  const userInfo = await UserInfo.findByIdAndUpdate(req.user._id, {
    $set: {
      fullName,
      dateOfBirth,
      aboutDescription,
      country,
      city,
    },
  });

  res
    .status(200)
    .json(new ApiResponse(200, userInfo, "User Info updated Successfully"));
});

const addUserEducation = AsyncHandler(async (req, res) => {
  const {
    instituteName,
    degreeName,
    duration,
    cgpa,
    grade,
    percentage,
  } = req.body;
  // const result = validationResult(req.body);
  // if (!result) throw new ApiError(402, "Invalid details");
  const userInfo = await UserInfo.findOneAndUpdate(
    { user: req.user._id },
    {
      $push: {
        education: {
          _id: new mongoose.Types.ObjectId(),
          instituteName,
          degreeName,
          duration,
          cgpa,
          grade,
          percentage,
        },
      },
    },
    { new: true }
  );
  res
    .status(200)
    .json(
      new ApiResponse(200, userInfo, "User Education updated Successfully")
    );
});

const editUserEducation = AsyncHandler(async (req, res) => {
  const {
    instituteName,
    degreeName,
    duration,
    cgpa,
    grade,
    percentage,
    educationId,
  } = req.body;
  const result = validationResult(req.body);
  if (!result) throw new ApiError(402, "Invalid details");
  await UserInfo.findOneAndUpdate(
    { user: req.user._id, "education._id": educationId },
    {
      $set: {
        "education.$.instituteName": instituteName,
        "education.$.degreeName": degreeName,
        "education.$.duration": duration,
        "education.$.cgpa": cgpa,
        "education.$.grade": grade,
        "education.$.percentage": percentage,
      },
    },
    { new: true }
  );
  res
    .status(200)
    .json(new ApiResponse(200, "User Education updated Successfully"));
});

const deleteUserEducation = AsyncHandler(async (req, res) => {
  const { educationId } = req.body;
  const result = validationResult(req.body);
  if (!result) throw new ApiError(402, "Invalid details");
  await UserInfo.findOneAndUpdate(
    { user: req.user._id },
    {
      $pull: {
        education: {
          _id: educationId,
        },
      },
    },
    { new: true }
  );

  res
    .status(200)
    .json(new ApiResponse(200, "User Education deleted Successfully"));
});
const addUserExperience = AsyncHandler(async (req, res) => {
  const {
    title,
    companyName,
    industry,
    duration,
    description,
    role,
  } = req.body;
  // const result = validationResult(req.body);
  // if (!result) throw new ApiError(402, "Invalid details");
  const userInfo = await UserInfo.findOneAndUpdate(
    { user: req.user._id },
    {
      $push: {
        experience: {
          _id: new mongoose.Types.ObjectId(),
          title,
          companyName,
          industry,
          duration,
          description,
          role,
        },
      },
    },
    { new: true }
  );
  res
    .status(200)
    .json(
      new ApiResponse(200, userInfo, "User Experience updated Successfully")
    );
});

const editUserExperience = AsyncHandler(async (req, res) => {
  const {
    title,
    companyName,
    industry,
    duration,
    description,
    role,
    experienceId,
  } = req.body;
  const result = validationResult(req.body);
  if (!result) throw new ApiError(402, "Invalid details");
  await UserInfo.findOneAndUpdate(
    { user: req.user._id, "experience._id": experienceId },
    {
      $set: {
        "experience.$.title": title,
        "experience.$.companyName": companyName,
        "experience.$.industry": industry,
        "experience.$.duration": duration,
        "experience.$.description": description,
        "experience.$.role": role,
      },
    },
    { new: true }
  );
  res
    .status(200)
    .json(new ApiResponse(200, "User Education updated Successfully"));
});

const deleteUserExperience = AsyncHandler(async (req, res) => {
  const { experienceId } = req.body;
  const result = validationResult(req.body);
  if (!result) throw new ApiError(402, "Invalid details");
  await UserInfo.findOneAndUpdate(
    { user: req.user._id },
    {
      $pull: {
        experience: {
          _id: experienceId,
        },
      },
    },
    { new: true }
  );

  res
    .status(200)
    .json(new ApiResponse(200, "User Experience deleted Successfully"));
});
const addUserCertification = AsyncHandler(async (req, res) => {
  const {
    title,
    institute,
    duration,
    description,
  } = req.body;
  // const result = validationResult(req.body);
  // if (!result) throw new ApiError(402, "Invalid details");
  const userInfo = await UserInfo.findOneAndUpdate(
    { user: req.user._id },
    {
      $push: {
        certifications: {
          _id: new mongoose.Types.ObjectId(),
          title,
          institute,
          duration,
          description,
        },
      },
    },
    { new: true }
  );
  res
    .status(200)
    .json(
      new ApiResponse(200, userInfo, "User Certifications updated Successfully")
    );
});

const editUserCertification = AsyncHandler(async (req, res) => {
  const {
    title,
    institute,
    duration,
    description,
    certificationId,
  } = req.body;
  const result = validationResult(req.body);
  if (!result) throw new ApiError(402, "Invalid details");
  await UserInfo.findOneAndUpdate(
    { user: req.user._id, "certification._id": certificationId },
    {
      $set: {
        "certification.$.title": title,
        "certification.$.institute": institute,
        "certification.$.duration": duration,
        "certification.$.description": description,
      },
    },
    { new: true }
  );
  res
    .status(200)
    .json(new ApiResponse(200, "User Certification updated Successfully"));
});

const deleteUserCertification = AsyncHandler(async (req, res) => {
  const { certificationId } = req.body;
  const result = validationResult(req.body);
  if (!result) throw new ApiError(402, "Invalid details");
  await UserInfo.findOneAndUpdate(
    { user: req.user._id },
    {
      $pull: {
        certification: {
          _id: certificationId,
        },
      },
    },
    { new: true }
  );

  res
    .status(200)
    .json(new ApiResponse(200, "User Certification deleted Successfully"));
});
const addUserLanguage = AsyncHandler(async (req, res) => {
  const {
    name, level
  } = req.body;
  // const result = validationResult(req.body);
  // if (!result) throw new ApiError(402, "Invalid details");
  const userInfo = await UserInfo.findOneAndUpdate(
    { user: req.user._id },
    {
      $push: {
        languages: {
          _id: new mongoose.Types.ObjectId(),
          name,
          level,
        },
      },
    },
    { new: true }
  );
  res
    .status(200)
    .json(
      new ApiResponse(200, userInfo, "User Language updated Successfully")
    );
});

const editUserLanguage = AsyncHandler(async (req, res) => {
  const {
    name,
    level,
    languageId,
  } = req.body;
  const result = validationResult(req.body);
  if (!result) throw new ApiError(402, "Invalid details");
  await UserInfo.findOneAndUpdate(
    { user: req.user._id, "language._id": languageId },
    {
      $set: {
        "language.$.name": name,
        "language.$.level": level,
      },
    },
    { new: true }
  );
  res
    .status(200)
    .json(new ApiResponse(200, "User level updated Successfully"));
});

const deleteUserLanguage = AsyncHandler(async (req, res) => {
  const { languageId } = req.body;
  const result = validationResult(req.body);
  if (!result) throw new ApiError(402, "Invalid details");
  await UserInfo.findOneAndUpdate(
    { user: req.user._id },
    {
      $pull: {
        language: {
          _id: languageId,
        },
      },
    },
    { new: true }
  );

  res
    .status(200)
    .json(new ApiResponse(200, "User language deleted Successfully"));
});

const getUserInfo = AsyncHandler(async (req, res) => {
  const userInfo = await UserInfo.aggregate([
    {
      $match: { user: new mongoose.Types.ObjectId(req?.user?._id) }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'userObj'
      },
    },
    {
      $addFields: {
        role: { $arrayElemAt: ["$userObj.role", 0] },
        avatar: { $arrayElemAt: ["$userObj.avatar", 0] }
      }
    },
    {
      $project: {
        userObj: 0
      }
    }
  ])
  const fetchedInfo = userInfo[0];
  if (!userInfo) throw new ApiError(402, "No user found with this id");
  res.status(200).json(new ApiResponse(200, fetchedInfo, "User Information fetched successfully"));
})

const updateUserRole = AsyncHandler(async (req, res) => {
  const { role } = req.body;
 const user = await User.findByIdAndUpdate(req.user._id, {
    $set: { role }
  },
    { new: true }
  )
  // const options = {
  //   secure: true,
  //   sameSite: 'None'
  // };
  res
  .status(200)
  // .cookie('role',role, options)
  .json(new ApiResponse(200, user, "User Role Updated Successfully"))
})


export {
  updateAccountDetails,
  updateAvatar,
  updateUserInfo,
  addUserEducation,
  editUserEducation,
  deleteUserEducation,
  addUserExperience,
  editUserExperience,
  deleteUserExperience,
  addUserCertification,
  editUserCertification,
  deleteUserCertification,
  addUserLanguage,
  editUserLanguage,
  deleteUserLanguage,
  getUserInfo,
  updateUserRole
};
