var mongoose = require("mongoose");
require("dotenv").config();
const connect = () => {
  if (process.env.NODE_ENV !== "production") {
    mongoose.set("debug", true);
  }

  mongoose.connect(
    process.env.mong,
    // "mongodb+srv://hello:hello123@cluster0.0k542js.mongodb.net/?retryWrites=true&w=majority",
    { dbName: "project" }, // dbName 은 데이터베이스 이름
    (error) => {
      if (error) {
        console.log("몽고디비 연결 에러", error);
      } else {
        console.log("몽고디비 연결 성공");
      }
    }
  );
};

mongoose.connection.on("error", (error) => {
  console.error("몽고디비 연결 에러", error);
});

mongoose.connection.on("disconnected", () => {
  console.error("몽고디비 연결이 끊겼습니다.");
  connect();
});

module.exports = connect;
