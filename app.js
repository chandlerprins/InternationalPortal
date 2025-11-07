const express = require('express');

const testRoutes = require('./routes/testRoutes.js');


const app = express();


app.use(express.json());


app.use((req, res, next) => {
    
    console.log(`${req.method} ${req.url}`)
    
    next();
});


app.use('/v1/test', testRoutes);


app.listen(3000, () => {
    console.log(`The API is now listening on port 3000.`)
});
