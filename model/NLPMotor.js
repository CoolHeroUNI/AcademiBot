class NLPMotor {
    constructor() {
        const methods = [
            "procesaIntencion",
        ];
        for (const method of methods) {
            if (!this[method]) {
                throw new Error("Must include method " + method);
            }
        }
    }
}
module.exports = NLPMotor;