class FileStorage {
    constructor() {
        const methods = [
            "listObjects",
            "listObjectsDirectlyUnder",
            "getObject",
            "getJSON",
            "putObject",
            "copyObject",
            "moveObject",
            "deleteObject",
            "renameObject",
            "getPublicUrl"
        ];

        for (const method of methods) {
            if (!this[method]) {
                throw new Error("Must include method " + method);
            }
        }
    }
}
module.exports = FileStorage;