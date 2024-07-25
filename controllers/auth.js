const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, UnauthenticatedError } = require("../errors");

// Register user and send token as HTTP-only cookie
const register = async (req, res) => {
  const user = await User.create({ ...req.body });
  const token = user.createJWT();

  // Set token as HTTP-only cookie
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Set secure flag based on environment
    maxAge: 1000 * 60 * 60 * 24, // Cookie expires in 24 hours
  });

  res.status(StatusCodes.CREATED).json({ user: { name: user.name } });
};

// Login user and send token as HTTP-only cookie
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestError("Please provide email and password");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new UnauthenticatedError("Invalid Credentials");
  }

  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError("Invalid Credentials");
  }

  const token = user.createJWT();

  // Set token as HTTP-only cookie
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Set secure flag based on environment
    maxAge: 1000 * 60 * 60 * 24, // Cookie expires in 24 hours
  });

  res.status(StatusCodes.OK).json({ user: { name: user.name } });
};

module.exports = {
  register,
  login,
};
