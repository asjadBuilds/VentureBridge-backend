import express from "express";
import upload from "../middlewares/multer.middleware.js";
import { query } from "express-validator";
import {
  addUserCertification,
  addUserEducation,
  addUserExperience,
  addUserLanguage,
  deleteUserCertification,
  deleteUserEducation,
  deleteUserExperience,
  deleteUserLanguage,
  editUserCertification,
  editUserEducation,
  editUserExperience,
  editUserLanguage,
  getUserInfo,
  updateAccountDetails,
  updateAvatar,
  updateUserInfo,
  updateUserRole,
} from "../controllers/userControllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const route = express.Router();

route.post(
  "/updateUserDetails",
  verifyJWT,
  updateAccountDetails
);

route.post('/updateUserInfo',verifyJWT,updateUserInfo);

route.post('/addUserEducation',addUserEducation);

route.post('/editUserEducation',editUserEducation);

route.post('/deleteUserEducation',deleteUserEducation);

route.post('/addUserExperience',addUserExperience);

route.post('/editUserExperience',editUserExperience);

route.post('/deleteUserExperience',deleteUserExperience);

route.post('/addUserCertification',addUserCertification);

route.post('/editUserCertification',editUserCertification);

route.post('/deleteUserCertification',deleteUserCertification);

route.post('/addUserLanguage',addUserLanguage);

route.post('/editUserLanguage',editUserLanguage);

route.post('/deleteUserLanguage',deleteUserLanguage);

route.post('/getUserInfo',verifyJWT,getUserInfo)

route.post("/updateAvatar",verifyJWT, upload.single("avatar"), updateAvatar);

route.post('/updateUserRole', updateUserRole)

export default route;
