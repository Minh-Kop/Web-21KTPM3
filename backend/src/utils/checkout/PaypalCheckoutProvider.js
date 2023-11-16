const axios = require('axios');

const config = require('../../config');
const { encryptBase64 } = require('../crypto');

const endpointUrl = 'https://api-m.sandbox.paypal.com';

class PaypalCheckoutProvider {
    async getAccessToken() {
        const clientId = config.PAYPAL_CLIENT_ID;
        const clientSecret = config.PAYPAL_SECRET;
        const auth = encryptBase64(`${clientId}:${clientSecret}`);

        const url = `${endpointUrl}/v1/oauth2/token`;
        const requestBody = {
            grant_type: 'client_credentials',
        };
        const configHeader = {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Basic ${auth}`,
            },
        };

        const { data } = await axios.post(url, requestBody, configHeader);
        return data.access_token;
    }

    async createAuthorizedHeader() {
        const accessToken = await this.getAccessToken();
        const configHeader = {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
        };
        return configHeader;
    }

    /**
     * Create payment link for PayPal
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
    async createLink(amount, userInfo, redirectHost) {
        try {
            // const description = 'Pay with PayPal';
            const redirectUrl = `${redirectHost}/api/checkout/notifyPaypal`;

            const purchaseUnits = [
                {
                    amount: {
                        currency_code: 'USD',
                        value: amount,
                    },
                },
            ];

            const paymentSource = {
                paypal: {
                    experience_context: {
                        return_url: redirectUrl,
                    },
                    email_address: userInfo.email,
                    name: {
                        given_name: userInfo.fullName,
                    },
                    phone: {
                        phone_number: {
                            national_number: userInfo.phoneNumber,
                        },
                    },
                    // attributes: {
                    //     vault: {
                    //         usage_type: 'MERCHANT',
                    //         description,
                    //     },
                    // },
                },
            };

            const requestBody = {
                intent: 'CAPTURE',
                purchase_units: purchaseUnits,
                payment_source: paymentSource,
            };

            const configHeader = await this.createAuthorizedHeader();

            const response = await axios.post(
                `${endpointUrl}/v2/checkout/orders`,
                requestBody,
                configHeader,
            );

            const { id, links } = response.data;
            const [{ href }] = links;
            return [id, href];
        } catch (err) {
            console.log(err.response.data);
        }
    }

    async getDetail(paymentOrderId) {
        const configHeader = await this.createAuthorizedHeader();

        const response = await axios.get(
            `${endpointUrl}/v2/checkout/orders/${paymentOrderId}`,
            configHeader,
        );

        const { data } = response;
        return data;
    }

    async capturePayment(paymentOrderId) {
        const requestBody = {};
        const configHeader = await this.createAuthorizedHeader();

        const response = await axios.post(
            `${endpointUrl}/v2/checkout/orders/${paymentOrderId}/capture`,
            requestBody,
            configHeader,
        );

        const { data } = response;
        return data;
    }

    getCurrency() {
        return config.currency.USD;
    }
}

module.exports = PaypalCheckoutProvider;
