import mongoose from 'mongoose'

const organisationSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    name: {
      type: String,
    },
    coWorkers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    sections: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Section",
      },
    ],
    joinLink: String,
    url: String,
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

// Generate organisation join link
organisationSchema.methods.generateJoinLink = function () {
  const url =
    process.env.NODE_ENV === 'development'
      ? process.env.STAGING_URL
      : process.env.PRODUCTION_URL
  this.joinLink = `${url}/${this._id}`
  this.url = `${url}/${this.name}`
}

export default mongoose.model('Organisation', organisationSchema)