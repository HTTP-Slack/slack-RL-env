import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      default() {
        return this.email.split('@')[0];
      },
    },
    email: {
      type: String,
      required: [true, 'Please enter your email'],
      unique: true,
      match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Please enter a password'],
      select: false,
      minlength: [8, 'Password must be at least 8 characters long']
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple null values
    },
    isOnline: Boolean,
    role: String,
    phone: String,

    profilePicture: {
      type: Buffer, // Stores the image as binary data
      select: false, // Prevents sending the large image buffer on every user query by default
      validate: [
        {
          validator: function (v) {
            // v is the Buffer. v.length is its size in bytes.
            // 4 * 1024 * 1024 = 4,194,304 bytes (4MB)
            return v.length <= 4194304;
          },
          message: (props) =>
            `Profile picture size (${(
              props.value.length /
              1024 /
              1024
            ).toFixed(
              2
            )}MB) exceeds the 4MB limit!`,
        },
      ],
    },
    profilePictureMimeType: {
      type: String, // e.g., 'image/png' or 'image/jpeg'
      select: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  // We need to re-select the password here since it's { select: false }
  const user = await mongoose
    .model('User')
    .findById(this._id)
    .select('+password');
  if (!user) {
    // Handle case where user might not be found (though unlikely in this method)
    return false;
  }
  return await bcrypt.compare(candidatePassword, user.password);
};

export default mongoose.model('User', userSchema);