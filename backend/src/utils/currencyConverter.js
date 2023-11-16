const config = require('../config');

exports.getRate = (toCurrency, fromCurrency = config.currency.VND) => {
    switch (toCurrency) {
        case config.currency.USD:
            return 1 / 24005;
        case config.currency.VND:
            return 1;
        default:
            throw new Error(`Unsupported currency: ${toCurrency}`);
    }
};
