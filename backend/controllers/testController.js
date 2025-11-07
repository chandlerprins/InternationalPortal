// we declare a new asyncronous method called "healthCheck", that returns 200 OK when called
const healthCheck = async (req, res) => {
    console.log("Everything is OK :)")
    // res.status() expects a http response code. in this case we use 200, which mean OK
    // .json then expects data that we will pass back to the calling browswer/application
    res.status(200).json({status: "OK"})
};

const greeter = async (req, res) => {
    // we get the userName from the request body for POST requests or query parameters for GET requests
    const userName = req.body.userName || req.query.userName
    // if the userName is not valid, we log to the console that the input was invalid
    if (!userName) {
        console.log("Please enter something valid");
        // if the userName is not valid, we return a 418 error code (I'm a teapot) with an error message
        res.status(418).json({error: "Invalid or missing input"});
    }
    // if the userName is valid, we log to the console that the input was valid
    res.status(200).json({message: `Hello, ${userName}!`});
};

// by exporting out methods, we make them accessible in any other file that we call this file in
// think public, from c#/java
module.exports = {
    healthCheck,
    greeter
}