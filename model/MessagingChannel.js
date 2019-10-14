class MessagingChannel {
    constructor() {
        const methods = [
            "startInteraction",
            "sendText",
            "sendURL",
            "sendTextWithURLs",
            "sendAttachment",
            "sendSecuentialAttachments",
            "getUserInfo",
            "sendReplyButtons",
            "sendOptionsMenu"
        ];
        for (const method of methods) {
            if (!this[method]) {
                throw new Error("Must include method " + method);
            }
        }
    }
}

module.exports = MessagingChannel;