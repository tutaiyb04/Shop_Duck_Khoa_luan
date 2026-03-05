const userRouter = require("./userRouter");

function Route(app) {
  app.use("/user", userRouter);
}

module.exports = Route;
