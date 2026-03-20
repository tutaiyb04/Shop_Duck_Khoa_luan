const userRouter = require("./userRouter");
const productRouter = require("./productRouter");
function Route(app) {
  app.use("/user", userRouter);
  app.use("/api/products", productRouter);
}

module.exports = Route;
