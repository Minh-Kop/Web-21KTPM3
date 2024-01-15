// const sql = require('mssql/msnodesqlv8');
const sql = require('mssql');

const database = require('../utils/database');

exports.insertImages = async (bookId, images) => {
    const pool = await database.getConnectionPool();
    const request1 = new sql.Request(pool);
    let maxId = await request1.query(
        `SELECT max(IMAGE_ID) as max_id from BOOK_IMAGES where BOOK_ID = '${bookId}'`,
    );
    if (maxId.recordset[0].max_id) {
        maxId = maxId.recordset[0].max_id;
    } else {
        maxId = 0;
    }

    let sqlString = `insert into BOOK_IMAGES (BOOK_ID, IMAGE_ID, BOOK_PATH) values `;
    for (let i = 0; i < images.length; i++) {
        sqlString += `('${bookId}', ${maxId + 1 + i}, '${images[i].path}')${
            i !== images.length - 1 ? ', ' : ''
        }`;
    }
    const request2 = new sql.Request(pool);
    await request2.query(sqlString);
};

exports.updateCoverImage = async (bookId, coverImagePath) => {
    const sqlString = `update BOOK_IMAGES set BOOK_PATH = '${coverImagePath}' where BOOK_ID = '${bookId}' and IMAGE_ID = 1`;
    const pool = await database.getConnectionPool();
    const request = new sql.Request(pool);
    const result = await request.query(sqlString);
    return result.rowsAffected[0];
};

exports.deleteBookImage = async ({ bookId, imageId }) => {
    const sqlString = `delete from BOOK_IMAGES where book_id = '${bookId}' and image_id = ${imageId}`;
    const pool = await database.getConnectionPool();
    const request = new sql.Request(pool);
    const result = await request.query(sqlString);
    return result.rowsAffected[0];
};

exports.getNewBookId = async () => {
    const sqlString = `select dbo.f_CreateBookId()`;
    const pool = await database.getConnectionPool();
    const request = new sql.Request(pool);
    const result = await request.query(sqlString);
    return result.recordset[0][''];
};

exports.getBookImages = async (bookId) => {
    const sqlString = `select IMAGE_ID, BOOK_PATH from BOOK_IMAGES where BOOK_ID = '${bookId}' order by IMAGE_ID`;
    const pool = await database.getConnectionPool();
    const request = new sql.Request(pool);
    const result = await request.query(sqlString);
    return result.recordset;
};

exports.getCoverImage = async (bookId) => {
    const sqlString = `select BOOK_PATH image from BOOK_IMAGES where BOOK_ID = '${bookId}' and IMAGE_ID = 1`;
    const pool = await database.getConnectionPool();
    const request = new sql.Request(pool);
    const result = await request.query(sqlString);
    return result.recordset[0];
};

exports.countBooks = async ({
    categoryIdList,
    priceRange,
    publisherId,
    bookFormat,
    sortType,
}) => {
    let sqlString =
        'select count(*) totalNumber from BOOK b join BOOK_DETAIL d on d.BOOK_ID = b.BOOK_ID';

    if (categoryIdList) {
        let strList = '';
        for (let i = 0; i < categoryIdList.length; i++) {
            strList += `'${categoryIdList[i]}'`;
            if (i !== categoryIdList.length - 1) {
                strList += ',';
            }
        }
        sqlString += ` where b.CATE_ID in (${strList})`;
    }
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
        sqlString += ` and d.PUB_ID in (${strList})`;
    }
    if (bookFormat) {
        let strList = '';
        for (let i = 0; i < bookFormat.length; i++) {
            strList += `N'${bookFormat[i]}'`;
            if (i !== bookFormat.length - 1) {
                strList += ',';
            }
        }
        sqlString += ` and d.book_format in (${strList})`;
    }
    if (!/\bwhere\b/i.test(sqlString)) {
        sqlString = sqlString.replace(/\band\b/i, 'where');
    }
    const check = sortType[0] === '-';
    if (check) {
        sortType = sortType.substring(1);
    }
    sqlString += ' and b.stock > 0 and b.SOFT_DELETE = 0';

    const pool = await database.getConnectionPool();
    const request = new sql.Request(pool);
    const result = await request.query(sqlString);
    const { totalNumber } = result.recordset[0];
    return totalNumber;
};

exports.getAllBooks = async ({
    categoryIdList,
    priceRange,
    publisherId,
    bookFormat,
    limit,
    offset,
    sortType,
}) => {
    let sqlString =
        'select b.* from BOOK b join BOOK_DETAIL d on d.BOOK_ID = b.BOOK_ID';

    if (categoryIdList) {
        let strList = '';
        for (let i = 0; i < categoryIdList.length; i++) {
            strList += `'${categoryIdList[i]}'`;
            if (i !== categoryIdList.length - 1) {
                strList += ',';
            }
        }
        sqlString += ` where b.CATE_ID in (${strList})`;
    }
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
        sqlString += ` and d.PUB_ID in (${strList})`;
    }
    if (bookFormat) {
        let strList = '';
        for (let i = 0; i < bookFormat.length; i++) {
            strList += `N'${bookFormat[i]}'`;
            if (i !== bookFormat.length - 1) {
                strList += ',';
            }
        }
        sqlString += ` and d.book_format in (${strList})`;
    }
    if (!/\bwhere\b/i.test(sqlString)) {
        sqlString = sqlString.replace(/\band\b/i, 'where');
    }
    const check = sortType[0] === '-';
    if (check) {
        sortType = sortType.substring(1);
    }
    sqlString += ' and b.stock > 0 and b.SOFT_DELETE = 0';
    sqlString += ` order by ${sortType} ${check ? 'desc' : 'asc'}`;
    sqlString += ` OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`;

    const pool = await database.getConnectionPool();
    const request = new sql.Request(pool);
    const result = await request.query(sqlString);
    return result.recordset;
};

exports.getRelatedBooks = async ({ bookId, limit, offset }) => {
    const pool = await database.getConnectionPool();
    const request = new sql.Request(pool);
    request.input('bookId', sql.Char, bookId);
    request.input('limit', sql.Int, limit);
    request.input('offset', sql.Int, offset);
    const result = await request.execute('sp_GetRelatedBooks');
    return result.recordset;
};

exports.getNewestArrival = async ({ limit, offset }) => {
    const pool = await database.getConnectionPool();
    const request = new sql.Request(pool);
    request.input('limit', sql.Int, limit);
    request.input('offset', sql.Int, offset);
    const result = await request.execute('sp_GetNewestArrival');
    return result.recordset;
};

exports.getBestSeller = async ({ limit, offset }) => {
    const pool = await database.getConnectionPool();
    const request = new sql.Request(pool);
    request.input('limit', sql.Int, limit);
    request.input('offset', sql.Int, offset);
    const result = await request.execute('sp_GetBestSeller');
    return result.recordset;
};

exports.getBookById = async (bookId) => {
    const pool = await database.getConnectionPool();

    const request1 = new sql.Request(pool);
    request1.input('BookId', sql.Char, bookId);
    let result = await request1.execute('sp_GetBook');
    if (result.returnValue !== 1) {
        return null;
    }
    result = result.recordset[0];

    const request2 = new sql.Request(pool);
    request2.input('BookId', sql.Char, bookId);
    let authors = await request2.execute('sp_GetAuthors');
    // authors = authors.recordsets[0].map((el) => el.AUTHOR_NAME);
    authors = authors.recordset.map((el) => el.AUTHOR_NAME).join(', ');
    result.author = authors;
    return result;
};

exports.getBooksByCartId = async (cartId) => {
    const pool = await database.getConnectionPool();
    const request = new sql.Request(pool);
    request.input('cartId', sql.Char, cartId);
    const result = await request.execute('sp_GetBooksByCartId');
    return result.recordset;
};

exports.getBooksByOrderId = async (orderId) => {
    const pool = await database.getConnectionPool();
    const request = new sql.Request(pool);
    request.input('orderId', sql.Char, orderId);
    const result = await request.execute('sp_GetBooksByOrderId');
    return result.recordset;
};

exports.createBook = async (bookEntity) => {
    const {
        categoryId,
        bookName,
        originalPrice,
        stock,
        discountedNumber,
        authorId,
        publisherId,
        publishedYear,
        weight,
        dimensions,
        numberPage,
        bookFormat,
        description,
    } = bookEntity;

    const pool = await database.getConnectionPool();

    const request = new sql.Request(pool);
    request.input('categoryId', sql.Char, categoryId);
    request.input('bookName', sql.NVarChar, bookName);
    request.input('originalPrice', sql.Int, originalPrice);
    request.input('stock', sql.Int, stock);
    request.input('discountedNumber', sql.Int, discountedNumber);
    request.input('publisherId', sql.Char, publisherId);
    request.input('publishedYear', sql.Int, publishedYear);
    request.input('weight', sql.Int, weight);
    request.input('dimensions', sql.NVarChar, dimensions);
    request.input('numberPage', sql.Int, numberPage);
    request.input('bookFormat', sql.NVarChar, bookFormat);
    request.input('description', sql.NVarChar, description);
    let result = await request.execute('sp_CreateBook');

    if (result.returnValue === 0) {
        return null;
    }

    const bookId = result.recordset[0].id;
    let sqlString = `insert into WRITTEN_BY (BOOK_ID, AUTHOR_ID) values `;
    for (let i = 0; i < authorId.length; i++) {
        sqlString += `('${bookId}', '${authorId[i]}')${
            i !== authorId.length - 1 ? ', ' : ''
        }`;
    }
    const request2 = new sql.Request(pool);
    result = await request2.query(sqlString);

    return bookId;
};

exports.updateBook = async (bookEntity) => {
    const {
        bookId,
        categoryId,
        bookName,
        originalPrice,
        stock,
        discountedNumber,
        authorId,
        publisherId,
        publishedYear,
        weight,
        dimensions,
        numberPage,
        bookFormat,
        description,
        softDelete,
    } = bookEntity;

    const pool = await database.getConnectionPool();
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    let checkBook = false;
    let checkBookDetail = false;
    let checkInsertAuthor = false;
    let checkDeleteAuthor = false;
    let sqlStringBook = ``;
    let sqlStringBookDetail = ``;
    let sqlStringInsertAuthor = ``;
    let sqlStringDeleteAuthor = ``;

    // Create Book update string
    if (categoryId) {
        checkBook = true;
        sqlStringBook += `CATE_ID = '${categoryId}',`;
    }
    if (bookName) {
        checkBook = true;
        sqlStringBook += `BOOK_NAME = N'${bookName}',`;
    }
    if (originalPrice) {
        checkBook = true;
        sqlStringBook += `BOOK_PRICE = ${+originalPrice},`;
    }
    if (discountedNumber) {
        checkBook = true;
        sqlStringBook += `DISCOUNTED_NUMBER = ${+discountedNumber},`;
    }
    if (stock) {
        checkBook = true;
        sqlStringBook += `STOCK = ${+stock},`;
    }
    if (softDelete) {
        checkBook = true;
        sqlStringBook += `SOFT_DELETE = ${+softDelete},`;
    }

    // Create Book Detail update string
    if (publisherId) {
        checkBookDetail = true;
        sqlStringBookDetail += `PUB_ID = '${publisherId}',`;
    }
    if (publishedYear) {
        checkBookDetail = true;
        sqlStringBookDetail += `PUBLISHED_YEAR = ${+publishedYear},`;
    }
    if (weight) {
        checkBookDetail = true;
        sqlStringBookDetail += `BOOK_WEIGHT = ${+weight},`;
    }
    if (dimensions) {
        checkBookDetail = true;
        sqlStringBookDetail += `dimensions = '${dimensions}',`;
    }
    if (numberPage) {
        checkBookDetail = true;
        sqlStringBookDetail += `NUMBER_PAGE = ${+numberPage},`;
    }
    if (bookFormat) {
        checkBookDetail = true;
        sqlStringBookDetail += `BOOK_FORMAT = N'${bookFormat}',`;
    }
    if (description) {
        checkBookDetail = true;
        sqlStringBookDetail += `BOOK_DESC = N'${description}',`;
    }

    if (checkBook) {
        sqlStringBook = `update BOOK set ${sqlStringBook} where BOOK_ID = '${bookId}'`;
        sqlStringBook = sqlStringBook.replace(/, w/, ' w');
        const bookRequest = new sql.Request(transaction);
        await bookRequest.query(sqlStringBook);
    }
    if (checkBookDetail) {
        sqlStringBookDetail = `update BOOK_DETAIL set ${sqlStringBookDetail} where BOOK_ID = '${bookId}'`;
        sqlStringBookDetail = sqlStringBookDetail.replace(/, w/, ' w');
        const bookDetailRequest = new sql.Request(transaction);
        await bookDetailRequest.query(sqlStringBookDetail);
    }

    if (authorId) {
        const listAuthorId = authorId.split(',').map((el) => el.trim());
        for (let i = 0; i < listAuthorId.length; i++) {
            if (listAuthorId[i][0] === '-') {
                checkDeleteAuthor = true;
                sqlStringDeleteAuthor += `AUTHOR_ID = '${listAuthorId[i].slice(
                    1,
                )}' `;
            } else {
                checkInsertAuthor = true;
                sqlStringInsertAuthor += `('${bookId}', '${listAuthorId[i]}')`;
            }
        }
        if (checkDeleteAuthor) {
            sqlStringDeleteAuthor = `delete from WRITTEN_BY where BOOK_ID = '${bookId}' AND (${sqlStringDeleteAuthor})`;
            sqlStringDeleteAuthor = sqlStringDeleteAuthor.replace(
                / AU/g,
                ' or AU',
            );
            const deleteAuthorRequest = new sql.Request(transaction);
            await deleteAuthorRequest.query(sqlStringDeleteAuthor);
        }
        if (checkInsertAuthor) {
            sqlStringInsertAuthor = `insert into WRITTEN_BY (BOOK_ID, AUTHOR_ID) values ${sqlStringInsertAuthor}`;
            sqlStringInsertAuthor = sqlStringInsertAuthor.replace(
                /\)\(/g,
                '),(',
            );
            const insertBookRequest = new sql.Request(transaction);
            await insertBookRequest.query(sqlStringInsertAuthor);
        }
    }
    await transaction.commit();
};

exports.deleteBook = async (bookId) => {
    const sqlString = `update BOOK set SOFT_DELETE = 1 where BOOK_ID = '${bookId}'`;
    const pool = await database.getConnectionPool();
    const request = new sql.Request(pool);
    const result = await request.query(sqlString);
    return result.rowsAffected[0];
};
