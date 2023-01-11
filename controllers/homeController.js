const BigPromise = require("../middlewares/bigPromise");

exports.home = BigPromise(async (req, res) => {
    //let db=await something();
    res.json({
        success: true,
        greeting: "Hello from home page"
    });
});
