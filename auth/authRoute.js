const { Router } = require("express");

const { createAccount, login, verifyAccount } = require("./authController");
const router = Router();

router.post("/auth/create-account/:account", createAccount); // Create account function
router.post("/auth/login/:account", login); // Login function
router.post("/auth/verify-account", verifyAccount);

module.exports = router;
