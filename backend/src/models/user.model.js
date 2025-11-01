import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      default() {
        return this.email.split('@')[0]
      },
    },
    email: {
      type: String,
      required: [true, 'Please enter your email'],
      unique: true,
      match: [/^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/, 'Please enter a valid email'],
    },
    isOnline: Boolean,
    role: String,
    phone: String,
    profilePicture: String,
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.model('User', userSchema)