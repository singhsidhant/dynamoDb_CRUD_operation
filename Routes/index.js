const express = require("express");
const router = express.Router();
router.get("/", (req, res) => {
  res.send("hello world");
  return;
});
router.use("/api", require("./api"));
module.exports = router;
