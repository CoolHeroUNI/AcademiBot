class CacheHandler{
    /**
     *
     * @param {Number} [time]
     */
    constructor(time) {
        this.storage = new Map();
        this.timeHandler = new Map();
        this.timeLimit = time || 300000;
    }
}

/**
 *
 * @param {*} k
 * @param {*} v
 * @returns {CacheHandler}
 */
CacheHandler.prototype.set = function (k, v) {
    this.storage.set(k, v);
    this.refresh(k);
    return this;
};
/**
 *
 * @param {*} k
 * @returns {*}
 */
CacheHandler.prototype.get = function (k) {
    const value = this.storage.get(k);
    if (value !== undefined) this.refresh(k);
    return value;
};
/**
 *
 * @param {*} k
 */
CacheHandler.prototype.setDisposal = function (k) {
    const caller = setTimeout(() => {
        this.storage.delete(k);
        this.timeHandler.delete(k);
    }, this.timeLimit);
    this.timeHandler.set(k, caller);
};
/**
 *
 * @param {*} k
 */
CacheHandler.prototype.cancelDisposal = function (k) {
    const previousCaller = this.timeHandler.get(k);
    if (previousCaller !== undefined) clearTimeout(previousCaller);
};
/**
 *
 * @param {*} k
 */
CacheHandler.prototype.refresh = function (k) {
    this.cancelDisposal(k);
    this.setDisposal(k);
};
CacheHandler.prototype.delete = function (k) {
    this.cancelDisposal(k);
    this.storage.delete(k);
};
module.exports = CacheHandler;