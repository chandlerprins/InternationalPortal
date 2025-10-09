const fs = require('fs');
const path = require('path');
require('dotenv').config();

const certPath = path.join(__dirname, '../certs');

module.exports = {
    port: process.env.API_PORT || 3443,
    mongoUri: process.env.CONN_STRING,
    jwtSecret: process.env.JWT_SECRET || '158e5a8c9378ca1a7fffa21dabddd77fcabe74e3736df2a76e398c0617579c9586dfb9f3478934ffdb6f46196924e226841ef40b2807974c3bb262f0978a2968',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshSecret: process.env.REFRESH_TOKEN_SECRET || 'b3ff0c8fbbb7feccfbcd20b5adbfd7eb1920c10aab38397acfbe2c932e3cf482d3af986f943172b29dd1cd24dd36798cddacd0f66aec59721ac3272103a00307',
    refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
    csrfCookieName: process.env.CSRF_COOKIE_NAME || 'csrf_token',
    saltRounds: parseInt(process.env.SALT_ROUNDS || '12', 10),
    frontendOrigin: process.env.FRONTEND_ORIGIN || 'https://localhost:5173',
    cert: {
        key: fs.existsSync(path.join(certPath, 'server.key')) 
            ? fs.readFileSync(path.join(certPath, 'server.key')) 
            : null,
        cert: fs.existsSync(path.join(certPath, 'server.crt')) 
            ? fs.readFileSync(path.join(certPath, 'server.crt')) 
            : null
    }
};
