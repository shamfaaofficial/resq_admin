module.exports=(req,res,next)=>{
 if(!global.userToken) return res.redirect("/login");
 next();
}