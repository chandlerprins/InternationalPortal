
const healthCheck = async (req, res) => {
    console.log("Everything is OK :)")
    
    res.status(200).json({status: "OK"})
};


module.exports = {
    healthCheck
}
