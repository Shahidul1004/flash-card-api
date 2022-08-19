const jwt = require("jsonwebtoken");
const HttpError = require("../models/http-error");

const login = async (req, res, next) => {
  const { userName, password } = req.body;

  if (userName === "shahidul" && password === "shahidul1004") {
    let token;
    try {
      token = jwt.sign(
        {
          userName: userName,
          password: password,
        },
        "jwt_token"
      );
    } catch (err) {
      const error = new HttpError("login user failed", 500);
      return next(error);
    }
    res.status(200).json({
      token: token,
    });
  } else {
    const error = new HttpError("login in failed", 500);
    return next(error);
  }
};

exports.login = login;
