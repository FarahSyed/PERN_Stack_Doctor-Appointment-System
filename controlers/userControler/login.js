import asyncHandler from "../../utils/asyncHandler.js";
import CustomError from "../../utils/CustomError.js";
import Joi from "joi";
import bcrypt from "bcryptjs";
import {sanitizeData }from "./createAccount.js"
import { CheckUserExists } from "./createAccount.js";
import { generateAndSetAccessAndRefreshTokens } from "./createAccount.js";
import { userLoginSchema } from "../../validationSchema/user.schema.js";


const login = asyncHandler(async (req, res) => {

// input validation 
  const { error } = userLoginSchema.validate(req.body);
  if (error) throw new CustomError(error.message, error.code);

  // data senitization
  const senitizedata = sanitizeData(req.body)
  // checking user existance in db records
  const User = await CheckUserExists(senitizedata.email);
  //throw error if user not found 
  if (!User)
    throw new CustomError( "you entered wrong email ",400,"log in func line 41");

  const checkpass = await bcrypt.compare(senitizedata.password, User?.password);

  if (!checkpass) throw new CustomError("you enterd wrong password", 401);

  if (checkpass) {
    var {AccessToken , RefreshToken} = await generateAndSetAccessAndRefreshTokens(res, User)

    }


  res.status(200).json({
    success: true,
    data: {
      id : User.id,
      name: User.name,
      email: User.email,
      loggedIn: true,
      tokens : {AccessToken, RefreshToken} 
    },
  });
});


export {
    login
}