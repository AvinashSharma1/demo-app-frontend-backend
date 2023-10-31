const express = require('express');
const { signup,login,verifyToken,getUser,refreshToken,logout } = require('../controllers/user-controller');
const upload = require("../Utils/upload");
const { uploadController } = require('../controllers/upload-controller');
const { searchController } = require('../controllers/search-controller');
const { verifyJWTToken } = require('../middleware/verifyJWT');
const { handleRefreshToken } = require('../controllers/refreshTokenController');
const router = express.Router();

/* router.get('/', (req,res,next) => {
    res.send('Hello world !...');
}); */
router.post('/signup',signup);
router.post('/login',login);
router.get('/user',verifyJWTToken,getUser);
//router.get('/refresh',refreshToken,verifyToken,getUser);
router.get("/refresh",handleRefreshToken);
router.post('/logout',verifyJWTToken,logout);
//router.post('/upload',upload);
router.post("/upload", upload.single("excelFile"), uploadController);
router.get('/search', searchController);
module.exports = router;