// cors - configurations options for API
// csurf = how it helps for CSRF attacks, and how it is configured 
// helmet - header protections and clickjacking
// rate limiting, brute force prevention

const helmet = require('helmet');
const cors = require('cors');

const corsOptions = {
    // allow requests from any origin
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,// allow cookies to be sent
}

const securityMiddleware = (app) => {
   app.use(helmet({
        contentSecurityPolicy:{
            useDefaults: true,
            directives: {
                //allow scripts and styles from same origin only
                'default-src': ["'self"],
                //prevent our websites from being framed (clickjacking)
                'frame-ancestors': ["'none'"],
            }
        },
        featurePolicy: {
            features: {
                //block any access to any location APIs, be it the built in Windows ones, or mobile oriented ones
                geolocation: ["'none'"],
                microphone: ["'none'"],
            }
        },
        hidePoweredBy: true,
        frameguard: {
            action: 'deny'
        },
        // prevent IE users
        isNoOpen: true,
   }));

   app.use(cors(corsOptions));
}

module.exports = {securityMiddleware}