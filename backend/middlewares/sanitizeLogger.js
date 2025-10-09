function redactSensitive(obj) {
    try {
        const copy = JSON.parse(JSON.stringify(obj));
        
        function redact(v) {
            if (typeof v === 'string') {
                // redact sequences of digits longer than 4
                return v.replace(/\d{5,}/g, (m) => '****' + m.slice(-4));
            }
            return v;
        }
        
        function walk(o) {
            if (Array.isArray(o)) return o.map(walk);
            if (o && typeof o === 'object') {
                const r = {};
                for (const k of Object.keys(o)) {
                    if (/(password|account|ssn|secret|token)/i.test(k)) {
                        r[k] = 'REDACTED';
                        continue;
                    }
                    r[k] = walk(o[k]);
                }
                return r;
            }
            return redact(o);
        }
        
        return walk(copy);
    } catch (err) {
        return { redactionError: true };
    }
}

module.exports = { redactSensitive };
