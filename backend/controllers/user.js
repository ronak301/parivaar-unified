const { sequelize } = require("../config/database");
const { createAddress } = require("../services/address");
const { createBusiness } = require("../services/business");
const {
  insertUser,
  getUsersWithAll,
  updateUser,
  searchUser,
  getUserById,
  getUserWithCommunities,
  deleteUser,
  getUserEvents,
  wishBirthday,
  getUsersByX,
  getUserByPhone,
} = require("../services/user");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const { QueryTypes } = require("sequelize");
const crypto = require("crypto");
const redis = require("../config/redis");

const createUserController = async (req, res) => {
  const body = req.body;
  const transaction = await sequelize.transaction();

  try {
    const user = await insertUser(body, transaction);

    await transaction.commit();

    return res.json({
      success: true,
      message: "User created successfully",
      id: user.id,
    });
  } catch (err) {
    console.log("🚀 ~ file: user.js:28 ~ createUserController ~ err:", err);
    await transaction.rollback();
    return res.status(500).json({
      success: false,
      error: err.message,
      message: err.errors[0]?.message || "Failed to insert user",
    });
  }
};

const getUserEventsController = async (req, res) => {
  const { skip, limit } = req.query;
  const { communityId } = req.params;

  try {
    const data = await getUserEvents({ communityId, skip, limit });
    return res.json({ success: true, data });
  } catch (err) {
    console.log("🚀 ~ file: user.js:44 ~ getUserEventsController ~ err:", err);
    res.status(500).json({ success: false, error: err?.message });
  }
};

const getUserEventsWishBirthdayController = async (req, res) => {
  // const { skip, limit } = req.query;
  // const { communityId } = req.params;

  const { from, to, communityId } = req.body;

  try {
    const data = await wishBirthday({ from, to, communityId });
    return res.json({ success: true, data });
  } catch (err) {
    console.log(
      "🚀 ~ file: user.js:68 ~ getUserEventsWishBirthdayController ~ err:",
      err
    );
    res.status(500).json({ success: false, error: err?.message });
  }
};

const getUserCommunityController = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await getUserWithCommunities(id);
    return res.json({ success: true, data });
  } catch (err) {
    console.log(
      "🚀 ~ file: user.js:61 ~ getUserCommunityController ~ err:",
      err
    );
    return res.status(500).json({ success: false, error: err?.message });
  }
};

const deleteUserController = async (req, res) => {
  const { id } = req.params;
  try {
    await deleteUser(id);
    return res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (err) {
    console.log("🚀 ~ file: user.js:56 ~ deleteUserController ~ err:", err);
    return res.status(500).json({ success: false, error: err?.message });
  }
};

const checkSuperAdminController = async (req, res) => {
  const { phone } = req.body;
  try {
    const data = await getUsersByX({
      phone,
      isSuperAdmin: true,
    });

    return res.json({ success: true, permission: data.length > 0 });
  } catch (err) {
    console.log(
      "🚀 ~ file: user.js:68 ~ checkSuperAdminController ~ err:",
      err
    );
    return res.status(500).json({ success: false, error: err?.message });
  }
};

const getUsersController = async (req, res) => {
  try {
    const users = await getUsersWithAll();

    return res.json({ success: true, data: users });
  } catch (err) {
    console.log("🚀 ~ file: user.js:107 ~ getUsersController ~ err:", err);
    return res.status(500).json({ success: false, error: err?.message });
  }
};

const getUserByIdController = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await getUserById(id);

    return res.json({ success: true, data: user });
  } catch (error) {
    console.log(
      "🚀 ~ file: user.js:120 ~ getUserByIdController ~ error:",
      error
    );
    return res.status(500).json({ success: false, error: error?.message });
  }
};

const updateUserController = async (req, res) => {
  try {
    const user = await updateUser(req.params.id, req.body);
    return res.json({ success: true, message: "User updated successfully" });
  } catch (err) {
    console.log("🚀 ~ file: user.js:133 ~ updateUserController ~ err:", err);
    return res.status(500).json({ success: false, error: err?.message });
  }
};

const searchUserController = async (req, res) => {
  const { query, filter, skip, limit, order } = req.body;
  try {
    const users = await searchUser({
      query,
      filter,
      skip,
      limit,
      order,
    });

    return res.json({ success: true, data: users });
  } catch (error) {
    console.log(
      "🚀 ~ file: user.js:151 ~ searchUserController ~ error:",
      error
    );
    return res.status(500).json({ success: false, error: error?.message });
  }
};

const sendOTPController = async (req, res) => {
  try {
    const { number } = req.body;
    if (!number) {
      return res.json({ success: false, error: "Invalid Number" });
    }

    let user = await getUserByPhone(number);

    if (!user) {
      return res.json({
        success: false,
        error: "Number does not exist, Signups are disabled",
      });
      // Create New users here if signups are enabled
    }

    // Check rate limiting (max 1 SMS every 30 seconds)
    let otpInfo = await redis.getOTP(number);
    let currTime = Date.now();

    if (!!otpInfo && currTime < otpInfo.sentAt + 30 * 1000) {
      // If OTP already exists, check if last SMS was sent not very soon
      return res.json({ success: false, error: "Max 1 SMS every 30 secs" });
    }

    // Message Central API configuration
    const messageCentralAuthToken = process.env.MESSAGE_CENTRAL_AUTH_TOKEN;
    const messageCentralCustomerId = process.env.MESSAGE_CENTRAL_CUSTOMER_ID;
    const countryCode = process.env.MESSAGE_CENTRAL_COUNTRY_CODE || "91";
    const otpLength = process.env.MESSAGE_CENTRAL_OTP_LENGTH || "6";

    if (!messageCentralAuthToken || !messageCentralCustomerId) {
      console.error("Message Central credentials not configured");
      return res.status(500).json({
        success: false,
        error: "OTP service configuration error",
      });
    }

    // Send OTP using Message Central API
    const sendOtpUrl = `https://cpaas.messagecentral.com/verification/v3/send`;
    const sendOtpParams = new URLSearchParams({
      countryCode: countryCode,
      customerId: messageCentralCustomerId,
      flowType: "SMS",
      mobileNumber: number,
      otpLength: otpLength,
    });

    let sendOtpResponse;
    try {
      sendOtpResponse = await axios.post(
        `${sendOtpUrl}?${sendOtpParams.toString()}`,
        {},
        {
          headers: {
            authToken: messageCentralAuthToken,
          },
        }
      );
    } catch (apiError) {
      console.error(
        "Message Central API error:",
        apiError.response?.data || apiError.message
      );
      return res.status(500).json({
        success: false,
        error: "Failed to send OTP. Please try again later.",
      });
    }

    // Extract verificationId from response
    // Message Central API returns verificationId nested in data.data
    const verificationId =
      sendOtpResponse.data?.data?.verificationId ||
      sendOtpResponse.data?.verificationId ||
      sendOtpResponse.data?.verification_id ||
      sendOtpResponse.data?.id;
    if (!verificationId) {
      console.error(
        "Failed to get verificationId from Message Central:",
        sendOtpResponse.data
      );
      return res.status(500).json({
        success: false,
        error: "Failed to send OTP",
      });
    }

    // Store verificationId in Redis with expiry (3 minutes = 180 seconds)
    otpInfo = {
      verificationId: verificationId,
      sentAt: currTime,
    };
    await redis.setOTP(number, otpInfo, 180);

    console.log(
      `OTP sent via Message Central for user:${number} id:${user.id} verificationId:${verificationId}`
    );

    return res.json({ success: true });

    /* ========== OLD IMPLEMENTATION (COMMENTED FOR FUTURE REFERENCE) ==========
    // Old TextLocal implementation
    if (!otpInfo || otpInfo.expires < currTime) {
      // Create a new otpInfo if no otp exists or already expired
      otpInfo = {
        value: crypto.randomInt(100000, 999999),
      };
    }

    otpInfo["sentAt"] = currTime;
    redis.setOTP(number, otpInfo, 300);
    console.log(
      `Generating otp for user:${number} id:${user.id} otp:${otpInfo.value}`
    );
    var message = `OTP for login into parivaar app is ${otpInfo.value}. Please don't share with anyone.%n %nRonak Kothari%nTeam Parivaar App`;
    // await axios.get(`https://eo6kr15fiajj13t.m.pipedream.net?apiKey=Mzk1ODQ0NjQ0NDQyNmY3ODMwNTk1MDc2NTU2NjZiNDM=&sender=PARVR&numbers=91${number}&message=OTP for login into parivaar app is ${otpInfo.value}. Please don't share with anyone.%n %nRonak Kothari%nTeam Parivaar App`)
    var response = await axios.get(
      `https://api.textlocal.in/send/?apiKey=Mzk1ODQ0NjQ0NDQyNmY3ODMwNTk1MDc2NTU2NjZiNDM=&sender=PARVR&numbers=91${number}&message=${message}`
    );
    // await axios.get(`https://api.textlocal.in/send/?apiKey=${txtlocalAPIKey}=&sender=PARVR&numbers=91${number}&message=${otpInfo.value}`)
    console.log(response.data);

    return res.json({ success: true });
    ========== END OF OLD IMPLEMENTATION ========== */
  } catch (error) {
    console.log("🚀 ~ file: user.js:190 ~ sendOTPController ~ error:", error);
    return res.status(500).json({ success: false, error: error?.message });
  }
};

const verifyOTPController = async (req, res) => {
  try {
    const { number, otp } = req.body;

    if (!number || !otp) {
      return res.status(401).json({ success: false });
    }

    let otpInfo = await redis.getOTP(number);
    let user = await getUserByPhone(number);

    if (!user || !otpInfo) {
      return res.status(401).json({ success: false });
    }

    // Message Central API configuration
    const messageCentralAuthToken = process.env.MESSAGE_CENTRAL_AUTH_TOKEN;
    const messageCentralCustomerId = process.env.MESSAGE_CENTRAL_CUSTOMER_ID;
    const countryCode = process.env.MESSAGE_CENTRAL_COUNTRY_CODE || "91";

    if (!messageCentralAuthToken || !messageCentralCustomerId) {
      console.error("Message Central credentials not configured");
      return res.status(500).json({
        success: false,
        error: "OTP service configuration error",
      });
    }

    // Verify OTP using Message Central API
    const verificationId = otpInfo.verificationId;
    if (!verificationId) {
      return res.status(401).json({ success: false });
    }

    const verifyOtpUrl = `https://cpaas.messagecentral.com/verification/v3/validateOtp`;
    const verifyOtpParams = new URLSearchParams({
      countryCode: countryCode,
      mobileNumber: number,
      verificationId: verificationId,
      customerId: messageCentralCustomerId,
      code: otp,
    });

    let verifyOtpResponse;
    try {
      verifyOtpResponse = await axios.get(
        `${verifyOtpUrl}?${verifyOtpParams.toString()}`,
        {
          headers: {
            authToken: messageCentralAuthToken,
          },
        }
      );
    } catch (apiError) {
      // Handle API errors (invalid OTP, expired, etc.)
      if (
        apiError.response?.status === 401 ||
        apiError.response?.status === 400
      ) {
        return res.status(401).json({ success: false });
      }
      console.error(
        "Message Central API error:",
        apiError.response?.data || apiError.message
      );
      return res.status(500).json({
        success: false,
        error: "Failed to verify OTP. Please try again.",
      });
    }

    // Check if OTP verification was successful
    // Message Central API may return different response formats
    const responseData = verifyOtpResponse.data;
    const isVerified =
      responseData?.verified === true ||
      responseData?.status === "VERIFIED" ||
      responseData?.status === "SUCCESS" ||
      (verifyOtpResponse.status === 200 && responseData && !responseData.error);

    if (isVerified) {
      // Done with the OTP - delete from Redis
      await redis.deleteOTP(number);

      const userjwt = jwt.sign(
        {
          aud: "authenticated",
          exp: 1920072200,
          sub: user.id,
          role: "authenticated",
          phone: "91" + number,
          app_metadata: {
            provider: "phone",
            providers: ["phone"],
          },
          user_metadata: null,
        },
        "r52dRNfbeSAGrK0AsR+ZxAAjgSIvmmhkpDn93ZevM1pyy8qk9L+3R4yfFaH/YH0UqG9kIoDhHLTs3YQQqsHBxQ=="
      );

      return res.json({
        success: true,
        data: {
          jwt: userjwt,
          userId: user.id,
        },
      });
    } else {
      return res.status(401).json({ success: false });
    }

    /* ========== OLD IMPLEMENTATION (COMMENTED FOR FUTURE REFERENCE) ==========
    // Old OTP verification implementation
    if (!user || !otpInfo || otpInfo.expires < Date.now()) {
      return res.status(401).json({ success: false });
    }

    if (otpInfo.value == otp) {
      // Done with the otp
      redis.deleteOTP(number);

      const userjwt = jwt.sign(
        {
          aud: "authenticated",
          exp: 1920072200,
          sub: user.id,
          role: "authenticated",
          phone: "91" + number,
          app_metadata: {
            provider: "phone",
            providers: ["phone"],
          },
          user_metadata: null,
        },
        "r52dRNfbeSAGrK0AsR+ZxAAjgSIvmmhkpDn93ZevM1pyy8qk9L+3R4yfFaH/YH0UqG9kIoDhHLTs3YQQqsHBxQ=="
      );

      return res.json({
        success: true,
        data: {
          jwt: userjwt,
          userId: user.id,
        },
      });
    } else {
      return res.status(401).json({ success: false });
    }
    ========== END OF OLD IMPLEMENTATION ========== */
  } catch (error) {
    console.log("🚀 ~ file: user.js:120 ~ verifyOTPController ~ error:", error);

    // Handle specific error cases
    if (error.response?.status === 401 || error.response?.status === 400) {
      return res.status(401).json({ success: false });
    }

    return res.status(500).json({ success: false, error: error?.message });
  }
};

module.exports = {
  getUsersController,
  createUserController,
  getUserByIdController,
  checkSuperAdminController,
  updateUserController,
  searchUserController,
  getUserCommunityController,
  deleteUserController,
  getUserEventsController,
  sendOTPController,
  verifyOTPController,
  getUserEventsWishBirthdayController,
};
