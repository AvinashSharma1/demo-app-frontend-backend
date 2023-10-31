const User = require('../model/user-model');

const searchController = async (req,res,next) => {
    const query = req.query.q; // Search query from the client
    const results = await User.find({
      $or: [
        { name: { $regex: query, $options: 'i' } }, // Case-insensitive name search
        { email: { $regex: query, $options: 'i' } }, // Case-insensitive email search
      ],
    });
    
  
    res.status(200).json(results);

}
exports.searchController = searchController;