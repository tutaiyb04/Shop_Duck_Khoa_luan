const userRouter = require("./userRouter");
const reviewRouter = require("./reviewRoutes");

function Route(app) {
  app.use("/user", userRouter);
  app.use("/reviews", reviewRouter);
}

module.exports = Route;
