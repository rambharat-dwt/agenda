const mongoose = require("mongoose");

const { Schema } = mongoose;

const userSchema = new Schema({
  _id: {
    type: Schema.Types.ObjectId,
    default: mongoose.Types.ObjectId,
  },
  email: {
    type: String,
    unique: true,
  },
  password: String,
  role: String,
  name: String,
  lastname: String,
  address: String,
  phone: String,
  bio: String,
  isVerified: {
    type: Boolean,
    default: false,
  },
  isGoogleAuth: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: false,
  },
  organizationId: {
    type: Schema.Types.ObjectId,
    unique: true,
  },
  isPersonal: {
    type: Boolean,
    default: false,
  },
  isInOrganization: {
    type: Boolean,
    default: false,
  },
});

const UserModel = mongoose.model("User", userSchema, "User");

module.exports = UserModel;
