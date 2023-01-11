require("dotenv").config();

let cookieToken = (user, res) => {
   const token = user.createJwtToken();

   user.password=undefined;
   
   const options = {
      expires: new Date(Date.now() + process.env.COOKIE_TIME * 24 * 60 * 60 * 1000),
      httpOnly: true
   }

   //user.password=undefined;

   res.cookie("token", token, options).json({
      token,
      user
   });
}

module.exports = cookieToken;