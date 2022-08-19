require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const userRoute = require("./routes/user-route");
const categoryRoute = require("./routes/category-route");
const cardRoute = require("./routes/card-route");
const HttpError = require("./models/http-error");

const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Cache-Control", "s-max-age=5, stale-while-revalidate");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  next();
});

app.use("/api/user", userRoute);
app.use("/api/category", categoryRoute);
app.use("/api/card", cardRoute);

app.use((req, res, next) => {
  const error = new HttpError("Could not find a route", 404);
  throw error;
});

app.use((error, req, res, next) => {
  if (res.headerSent) return next(error);
  res.status(error.code || 500);
  res.json({ message: error.message || "Something went wrong!" });
});

mongoose
  .connect(
    `mongodb+srv://admin:${process.env.MONGO_DB_PASSWORD}@cluster0.hors6.mongodb.net/${process.env.MONGO_DB_DATABASE}?retryWrites=true&w=majority`
  )
  .then(() => {
    app.listen(5000);
  })
  .catch((err) => {});
