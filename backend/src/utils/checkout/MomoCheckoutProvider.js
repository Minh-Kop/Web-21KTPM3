const axios = require('axios');

const config = require('../../config/config');
const { createHmacString, encryptBase64 } = require('../crypto');

let partnerCode = config.MOMO_PARTNER_CODE;
const accessKey = config.MOMO_ACCESS_KEY;
const secretKey = config.MOMO_SECRET_KEY;

class MomoCheckoutProvider {
    async createLink(amount, userInfo, redirectHost, ipnHost, extraData = '') {
        // const redirectUrl = `${redirectHost}/account/order`;
        const ipnUrl = `${ipnHost}/api/checkout/notifyMomo`;
        const redirectUrl = `https://www.fahasa.com/`;
        // const ipnUrl =
        //     'https://c6f9-123-20-134-12.ngrok-free.app/api/checkout/notifyMomo';
        // const ipnUrl =
        //     'https://webhook.site/4d84ac14-b238-49d0-8ecc-8034de57ec5f';

        let { orderId } = userInfo;
        orderId = `${orderId}_${new Date().getTime()}`;
        const orderInfo = `Pay for order ID ${orderId} with MoMo`;
        const requestId = partnerCode + new Date().getTime();
        const requestType = 'captureWallet';
        const { email } = userInfo;
        extraData = encryptBase64(JSON.stringify({ email }));

        const rawSignature = [
            `accessKey=${accessKey}`,
            `amount=${amount}`,
            `extraData=${extraData}`,
            `ipnUrl=${ipnUrl}`,
            `orderId=${orderId}`,
            `orderInfo=${orderInfo}`,
            `partnerCode=${partnerCode}`,
            `redirectUrl=${redirectUrl}`,
            `requestId=${requestId}`,
            `requestType=${requestType}`,
        ].join('&');

        const signature = createHmacString(rawSignature, secretKey);

        const requestBody = {
            accessKey,
            amount,
            extraData,
            ipnUrl,
            orderId,
            orderInfo,
            partnerCode,
            redirectUrl,
            requestId,
            requestType,
            signature,
        };

        try {
            const response = await axios.post(
                'https://test-payment.momo.vn:443/v2/gateway/api/create',
                requestBody,
            );
            const { payUrl } = response.data;
            return [requestId, payUrl];
        } catch (error) {
            console.log(error);
        }
    }

    async queryPayment(requestId, orderId) {
        const lang = 'en';

        const rawSignature = [
            `accessKey=${accessKey}`,
            `orderId=${orderId}`,
            `partnerCode=${partnerCode}`,
            `requestId=${requestId}`,
        ].join('&');

        const signature = createHmacString(rawSignature, secretKey);

        const requestBody = {
            partnerCode: partnerCode,
            requestId: requestId,
            orderId: orderId,
            lang: lang,
            signature: signature,
        };

        try {
            const response = await axios.post(
                'https://test-payment.momo.vn:443/v2/gateway/api/query',
                requestBody,
            );

            const { data } = response;
            return data;
        } catch (error) {
            console.error(error.response.data);
        }
    }

    verifyIpnSignature(body) {
        const {
            orderId,
            requestId,
            amount,
            orderInfo,
            orderType,
            transId,
            resultCode,
            message,
            payType,
            responseTime,
            extraData,
            signature,
        } = body;
        ({ partnerCode } = body);

        const rawSignature = [
            `accessKey=${accessKey}`,
            `amount=${amount}`,
            `extraData=${extraData}`,
            `message=${message}`,
            `orderId=${orderId}`,
            `orderInfo=${orderInfo}`,
            `orderType=${orderType}`,
            `partnerCode=${partnerCode}`,
            `payType=${payType}`,
            `requestId=${requestId}`,
            `responseTime=${responseTime}`,
            `resultCode=${resultCode}`,
            `transId=${transId}`,
        ].join('&');

        const correctSignature = createHmacString(rawSignature, secretKey);
        return correctSignature === signature;
    }

    async capturePayment(requestId, orderId, amount) {
        const requestType = 'capture';
        const description = '';
        const lang = 'en';

        const rawSignature = [
            `accessKey=${accessKey}`,
            `amount=${amount}`,
            `description=${description}`,
            `orderId=${orderId}`,
            `partnerCode=${partnerCode}`,
            `requestId=${requestId}`,
            `requestType=${requestType}`,
        ].join('&');

        const signature = createHmacString(rawSignature, secretKey);

        const requestBody = {
            partnerCode: partnerCode,
            requestId: requestId,
            orderId: orderId,
            requestType: requestType,
            amount: amount,
            lang: lang,
            description: description,
            signature: signature,
        };

        try {
            const response = await axios.post(
                'https://test-payment.momo.vn:443/v2/gateway/api/confirm',
                requestBody,
            );

            const { data } = response;
            return data;
        } catch (error) {
            console.error(error.response.data);
        }
    }

    getCurrency() {
        return config.currency.VND;
    }
}

module.exports = MomoCheckoutProvider;
