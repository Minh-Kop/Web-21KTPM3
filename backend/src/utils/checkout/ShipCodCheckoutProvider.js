const config = require('../../config');

class ShipCodCheckoutProvider {
    /**
     * Create payment link for Ship COD
     *
     * @example
     * const amount = 50000;
     * const userInfo = {
     *  fullName: "Do Vuong Phuc",
     *  phoneNumber: "0707953475",
     *  email: "phuc16102001@gmail.com"
     * }
     * const [paymentOrderId, payUrl] = createLink(amount, userInfo)
     *
     * @type {UserInfo} {
     *  @type {String} fullName
     *  @type {String} phoneNumber
     *  @type {String} email
     * }
     *
     * @param {Long} amount The total amount user need to pay
     * @param {UserInfo} userInfo The user's information
     *
     * @return {[String, String]} The paymentOrderId and the URL to pay for the request
     */
    async createLink(amount, userInfo, redirectUrl) {
        const paymentOrderId = null;
        const payUrl = null;
        return [paymentOrderId, payUrl];
    }

    getCurrency() {
        return config.currency.VND;
    }
}

module.exports = ShipCodCheckoutProvider;
