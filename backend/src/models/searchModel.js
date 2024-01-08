const sql = require('mssql');

const database = require('../utils/database');

exports.getBooks = async ({
    keyword,
    priceRange,
    publisherId,
    bookFormat,
    limit,
    offset,
    sortType,
}) => {
    let sqlString = '';
    if (priceRange) {
        sqlString += ` and b.BOOK_DISCOUNTED_PRICE >= ${priceRange[0]}`;
        sqlString += ` and b.BOOK_DISCOUNTED_PRICE < ${priceRange[1]}`;
    }
    if (publisherId) {
        let strList = '';
        for (let i = 0; i < publisherId.length; i++) {
            strList += `'${publisherId[i]}'`;
            if (i !== publisherId.length - 1) {
                strList += ',';
            }
        }
        sqlString += ` and bd.PUB_ID in (${strList})`;
    }
    if (bookFormat) {
        let strList = '';
        for (let i = 0; i < bookFormat.length; i++) {
            strList += `N'${bookFormat[i]}'`;
            if (i !== bookFormat.length - 1) {
                strList += ',';
            }
        }
        sqlString += ` and bd.book_format in (${strList})`;
    }
    const check = sortType[0] === '-';
    if (check) {
        sortType = sortType.substring(1);
    }
    sqlString += ' and b.stock > 0 and b.SOFT_DELETE = 0';
    sqlString += ` order by b.${sortType} ${check ? 'desc' : 'asc'}`;
    sqlString += ` OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`;

    sqlString = `SELECT b.BOOK_ID bookId, b.BOOK_NAME bookName, b.BOOK_PRICE originalPrice, b.BOOK_DISCOUNTED_PRICE discountedPrice,
                    b.DISCOUNTED_NUMBER discountedNumber, b.AVG_RATING avgRating, b.COUNT_RATINGS countRating,
                    img.book_path image
                from BOOK b join CATEGORY c on b.CATE_ID = c.CATE_ID
                    join BOOK_DETAIL bd on b.BOOK_ID = bd.BOOK_ID
                    join CATEGORY pc on pc.CATE_ID = c.PARENT_ID
                    join BOOK_IMAGES img on img.BOOK_ID = b.BOOK_ID
                WHERE img.IMAGE_ID = 1 and (CONTAINS(b.BOOK_NAME, N'${keyword}') or CONTAINS(bd.BOOK_DESC, N'${keyword}') or CONTAINS(c.CATE_NAME, N'${keyword}') or CONTAINS(pc.CATE_NAME, N'${keyword}'))
                    ${sqlString}`;

    const pool = await database.getConnectionPool();
    const request = new sql.Request(pool);
    const result = await request.query(sqlString);
    return result.recordset;
};

exports.countBooks = async ({
    keyword,
    priceRange,
    publisherId,
    bookFormat,
}) => {
    let sqlString = '';
    if (priceRange) {
        sqlString += ` and b.BOOK_DISCOUNTED_PRICE >= ${priceRange[0]}`;
        sqlString += ` and b.BOOK_DISCOUNTED_PRICE < ${priceRange[1]}`;
    }
    if (publisherId) {
        let strList = '';
        for (let i = 0; i < publisherId.length; i++) {
            strList += `'${publisherId[i]}'`;
            if (i !== publisherId.length - 1) {
                strList += ',';
            }
        }
        sqlString += ` and bd.PUB_ID in (${strList})`;
    }
    if (bookFormat) {
        let strList = '';
        for (let i = 0; i < bookFormat.length; i++) {
            strList += `N'${bookFormat[i]}'`;
            if (i !== bookFormat.length - 1) {
                strList += ',';
            }
        }
        sqlString += ` and bd.book_format in (${strList})`;
    }

    sqlString = `SELECT count(*) countedNumber
                from BOOK b join CATEGORY c on b.CATE_ID = c.CATE_ID
                    join BOOK_DETAIL bd on b.BOOK_ID = bd.BOOK_ID
                    join CATEGORY pc on pc.CATE_ID = c.PARENT_ID
                    join BOOK_IMAGES img on img.BOOK_ID = b.BOOK_ID
                WHERE img.IMAGE_ID = 1 and (CONTAINS(b.BOOK_NAME, N'${keyword}') or CONTAINS(bd.BOOK_DESC, N'${keyword}') or CONTAINS(c.CATE_NAME, N'${keyword}') or CONTAINS(pc.CATE_NAME, N'${keyword}'))
                    ${sqlString}`;

    const pool = await database.getConnectionPool();
    const request = new sql.Request(pool);
    const result = await request.query(sqlString);
    return result.recordset[0].countedNumber;
};
