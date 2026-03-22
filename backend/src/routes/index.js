const userRouter = require("./userRouter");
const reviewRouter = require("./reviewRoutes");
const productRouter = require("./productRouter");
function Route(app) {
  app.use("/user", userRouter);
  app.use("/products", productRouter);
  app.use("/reviews", reviewRouter);
}

module.exports = Route;
