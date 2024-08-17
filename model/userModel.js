const mongoose = require("mongoose");

const { Schema } = mongoose;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
    min: [13],
    max: [65],
  },
  password: {
    type: String,
    required: true,
    validate: (v) => v.length > 6,
  },
  confirmationCode: {
    type: String,
    required: false,
  },
  resetToken: String,
  expireToken: Date,
});

const User = mongoose.model("User", userSchema);

module.exports = User;
