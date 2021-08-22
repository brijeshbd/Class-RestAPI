const mongoose = require("mongoose");
mongoose
  .connect(process.env.DB, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connection is established.");
  })
  .catch((e) => {
    console.warn(e);
  });
