const userRouter = require("./userRouter");
const reviewRouter = require("./reviewRoutes");
const productRouter = require("./productRouter");
const categoryRouter = require("./categoryRouter");
const reportRouter = require("./reportRouter");
function Route(app) {
  app.use("/user", userRouter);
  app.use("/products", productRouter);
  app.use("/reviews", reviewRouter);
  app.use("/categories", categoryRouter);
  app.use("/reports", reportRouter);
}

module.exports = Route;
