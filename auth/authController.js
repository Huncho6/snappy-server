const User = require("../model/userModel");
const nodemailer = require("nodemailer"); //importing nodemailer to get email when account is created
const crypto = require("crypto"); //crypto is a random token generator that help to generate otp for for the forget password function
const bcrypt = require("bcrypt"); //importing bcrypt after installation
const jwt = require("jsonwebtoken"); //importing jsonwebtoken
const dotenv = require("dotenv"); //importing dotenv
dotenv.config();

const tempUserStore = new Map(); // Temporary storage for user data

exports.createAccount = async (req, res) => {
  try {
    const { account } = req.params;
    const { email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    req.body.password = hashedPassword;

    if (account === "user") {
      try {
        const isUserExist = await User.findOne({ email });
        if (isUserExist) {
          return res.status(400).send({
            status: "error",
            message: "User already exists",
          });
        }

        // Generate and store confirmation code along with user data in temporary storage
        const confirmationCode = crypto.randomBytes(3).toString("hex");
        tempUserStore.set(email, { ...req.body, confirmationCode });

        // Send confirmation email
        const transporter = nodemailer.createTransport({
          service: "Gmail",
          host: "smtp.gmail.com",
          port: 465,
          secure: true,
          auth: {
            user: "ibrahimabodunrin3@gmail.com",
            pass: process.env.GOOGLE_APP_PASSWORD,
          },
        });

        const mailOptions = {
          from: process.env.EMAIL,
          to: email,
          subject: "Account Confirmation",
          text: `Your confirmation code is: ${confirmationCode}`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            return res
              .status(500)
              .json({ message: "Error sending email", error });
          } else {
            return res.status(201).json({
              status: "success",
              message:
                "Account created successfully. Please check your email for the confirmation code.",
            });
          }
        });
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.verifyAccount = async (req, res) => {
  try {
    const { email, confirmationCode } = req.body;

    // Retrieve user data from temporary storage
    const storedUser = tempUserStore.get(email);
    if (!storedUser || storedUser.confirmationCode !== confirmationCode) {
      return res
        .status(400)
        .json({ message: "Invalid confirmation code or email." });
    }

    // Clear the confirmation code and save the user to the database
    const user = new User({
      ...storedUser,
      confirmationCode: null,
    });
    await user.save();

    // Remove user data from temporary storage after saving to the database
    tempUserStore.delete(email);

    // Send congratulatory email
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: "ibrahimabodunrin3@gmail.com",
        pass: process.env.GOOGLE_APP_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Account Verified",
      text: "Congratulations! Your account has been successfully created and verified.",
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).json({ message: "Error sending email", error });
      } else {
        return res.status(200).json({
          status: "success",
          message: "Account verified successfully. Congratulations email sent.",
        });
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//function to login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body; //destructuring email and password
    const { account } = req.params;
    if (!email || !password) {
      //for if user doesn't provide one of the email or password
      return res
        .status(404)
        .json({ message: "Please provide an email and password" });
    }
    if (account === "user") {
      //if account is user validation
      const user = await User.findOne({ email }); //for correct email
      if (!user) {
        return res.status(404).json({ message: "Invalid credentials" }); //if email is not correct
      }
      const isCorrectPassword = await bcrypt.compare(
        //for correct password
        password,
        user.password
      );
      if (!isCorrectPassword) {
        //incorrect password
        return res.status(404).json({ message: "Invaild credentials" });
      }
      //token/access for instructor if password is correct
      const token = jwt.sign(
        {
          id: user._id,
          role: "user",
        },
        process.env.SECRET_KEY, //secret key from our dotenv file
        { expiresIn: "1h" } //expiration time
      );
      res.status(200).json({
        //for when all fields are correct
        status: "success",
        data: {
          token,
          userInfo: {
            _id: user._id,
            name: user.name,
            email: user.email,
          },
        },
        message: "User logged in successfully",
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
