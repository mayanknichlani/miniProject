import jwt from "jsonwebtoken";
const secret = "MiniProject@12345";
const sessionIdToUserMap = new Map();
function setUser(user){
   return jwt.sign({
    _id:user._id,
    email : user.email
   },secret);
}
function getUser(token){
    try{
    if(!token)return null
    return jwt.verify(token,secret);
    }
    catch{
        return null;
    }
}
export default {
    setUser,
    getUser
};