const userRouter = require("./userRouter");
const reviewRouter = require("./reviewRoutes");
const productRouter = require("./productRouter");
const categoryRouter = require("./categoryRouter");
const reportRouter = require("./reportRouter");
const chatRouter = require("./chatRouter");
const paymentRouter = require("./paymentRouter");
const adminRouter = require("./adminRouter");
const orderRouter = require("./orderRouter");

function Route(app) {
  app.use("/user", userRouter);
  app.use("/products", productRouter);
  app.use("/orders", orderRouter);
  app.use("/reviews", reviewRouter);
  app.use("/categories", categoryRouter);
  app.use("/reports", reportRouter);
  app.use("/chat", chatRouter);
  app.use("/payment", paymentRouter);
  app.use("/admin", adminRouter);
}

module.exports = Route;
