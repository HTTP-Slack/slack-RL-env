import User from "../models/user.model.js";
import jwt from 'jsonwebtoken';

// @desc signup user
// @route POST /api/auth/register
// @access public
export const register = async (req, res) => {
  const {username, email, password } = req.body;

  try {
    // 1. Basic Validation
    if ( !username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a username, email, and password',
      });
    }

    // 2. Check for existing user
    const emailExists = await User.findOne({ email })
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: 'Email already in use',
      })
    }

    const usernameExists = await User.findOne({ username })
    if (usernameExists) {
      return res.status(400).json({
        success: false,
        message: 'Username already taken',
      })
    }

    // 3. Create user (password will be hashed by the pre-save hook)
    const user = await User.create({
      username,
      email,
      password
    });

    // 4. Create Token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '10d', // Token expires in 10 day
    })

    // 5. Send token in an httpOnly cookie
    res.cookie('token', token, {
      httpOnly: true, // Makes it inaccessible to client-side JS
      secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
      sameSite: 'lax', // CSRF protection
      maxAge: 10 * 24 * 60 * 60 * 1000, // 10 days
    })

    // 6. Send success response
    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.log("Error in auth controller", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error
    });
  }
}

// @desc sign in user
// @route POST /api/auth/signin
// @access public
export const signin = async (req, res) => {
  const {email, password} = req.body;

  try {
    // 1. Basic Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a email and password',
      });
    }

    // 2. Find user and explicitly select password field
    const user = await User.findOne({ email }).select('+password');

    // 3. Check user and password using bcrypt
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // 4. Create Token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '10d', // Token expires in 10 days
    })

    // 5. Send token in an httpOnly cookie
    res.cookie('token', token, {
      httpOnly: true, // Makes it inaccessible to client-side JS
      secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
      sameSite: 'lax', // CSRF protection
      maxAge: 10 * 24 * 60 * 60 * 1000, // 10 days
    })

    // 6. Send success response
    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.log("Error in auth controller", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error
    });
  }
}