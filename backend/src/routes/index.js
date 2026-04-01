const userRouter = require("./userRouter");
const reviewRouter = require("./reviewRoutes");
const productRouter = require("./productRouter");
const categoryRouter = require("./categoryRouter");
function Route(app) {
  app.use("/user", userRouter);
  app.use("/products", productRouter);
  app.use("/reviews", reviewRouter);
  app.use("/categories", categoryRouter);
}

module.exports = Route;
