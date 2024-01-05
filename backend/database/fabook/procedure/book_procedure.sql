-- use fabook_db

IF OBJECT_ID('f_GetSoldNumber') IS NOT NULL
	DROP FUNCTION f_GetSoldNumber
GO
CREATE FUNCTION f_GetSoldNumber (@BookId CHAR(7))
RETURNS int
	BEGIN
		DECLARE @sold_number int = 0;
		set @sold_number = (select sum(od.ORDER_QUANTITY)
							from order_detail od join order_state os on os.order_id = od.ORDER_ID
							where od.book_id = @BookId and os.order_state = 3
							group by od.BOOK_ID)
		RETURN @sold_number;
	END;
go

go
IF OBJECT_ID('f_CreateBookId') IS NOT NULL
	DROP FUNCTION f_CreateBookId
GO
CREATE FUNCTION f_CreateBookId()
returns CHAR(5)
    BEGIN
        DECLARE @i INT = 1
        DECLARE @id char(5) = 'BK001'
        WHILE(EXISTS(SELECT 1
                    FROM BOOK
                    WHERE BOOK_ID = @id))
        BEGIN
            SET @i += 1
            SET @id = 'BK' + REPLICATE('0', 3 - LEN(@i)) + CAST(@i AS CHAR(3))
        END
        return @id
    END
GO

IF OBJECT_ID('sp_CreateBook') IS NOT NULL
	DROP proc sp_CreateBook
GO
CREATE proc sp_CreateBook (
		@categoryId char(4),
        @bookName NVARCHAR(100),
        @originalPrice int,
        @stock int,
        @discountedNumber int,
        @publisherId char(5),
		@publishedYear int,
        @weight int,
        @dimensions NVARCHAR(30),
        @numberPage int,
        @bookFormat NVARCHAR(50),
        @description NVARCHAR(2000))
AS
BEGIN TRANSACTION
	BEGIN TRY
		DECLARE @bookId CHAR(5) = dbo.f_CreateBookId()
		
		INSERT into BOOK (BOOK_ID, CATE_ID, BOOK_NAME, BOOK_PRICE, AVG_RATING, COUNT_RATINGS, STOCK, DISCOUNTED_NUMBER, ADDED_TIME, SOFT_DELETE) VALUES
			(@bookId, @categoryId, @bookName, @originalPrice, 0, 0, @stock, @discountedNumber, GETDATE(), 0)
		INSERT into BOOK_DETAIL (BOOK_ID, PUB_ID, BOOK_FORMAT, PUBLISHED_YEAR, NUMBER_PAGE, DIMENSIONS, BOOK_WEIGHT, BOOK_DESC) VALUES
			(@bookId, @publisherId, @bookFormat, @publishedYear, @numberPage, @dimensions, @weight, @description)
		
		select @bookId as id
	END TRY

	BEGIN CATCH
		PRINT N'Bị lỗi'
		ROLLBACK 
		RETURN 0
	END CATCH
COMMIT
RETURN 1
GO

GO
IF OBJECT_ID('sp_GetBooksByCartId') IS NOT NULL
	DROP PROC sp_GetBooksByCartId
GO
CREATE PROCEDURE sp_GetBooksByCartId
	@cartId CHAR(10)
AS
BEGIN TRANSACTION
	BEGIN TRY
		if not exists(select 1 from CART where CART_ID = @cartId)
		BEGIN
			PRINT N'Cart ID isn''t valid!'
			ROLLBACK
			RETURN -1
		END
		
		SELECT b.BOOK_ID 'bookId', b.BOOK_NAME 'bookName', b.BOOK_PRICE 'originalPrice', 
			b.BOOK_DISCOUNTED_PRICE 'discountedPrice', cd.CART_PRICE 'cartPrice', b.STOCK 'stock', cd.CART_QUANTITY 'quantity',
			cd.IS_CLICKED 'isClicked'
		from CART_DETAIL cd LEFT join BOOK b on b.BOOK_ID = cd.BOOK_ID
		where cd.CART_ID = @cartId
	END TRY

	BEGIN CATCH
		PRINT N'Bị lỗi'
		ROLLBACK 
		RETURN 0
	END CATCH
COMMIT
RETURN 1
GO

GO
IF OBJECT_ID('sp_GetRelatedBooks') IS NOT NULL
	DROP PROC sp_GetRelatedBooks
GO
CREATE PROCEDURE sp_GetRelatedBooks
	@bookId CHAR(7),
	@limit INT,
	@offset INT
AS
BEGIN TRANSACTION
	BEGIN TRY
		DECLARE @cateId CHAR(4), @parentId CHAR(4)
		select @cateId = c.CATE_ID, @parentId = c.PARENT_ID
		from BOOK b join CATEGORY c on b.CATE_ID = c.CATE_ID
		where b.BOOK_ID = @bookId

		SELECT b.BOOK_ID bookId, b.BOOK_NAME bookName, b.BOOK_PRICE originalPrice, b.BOOK_DISCOUNTED_PRICE discountedPrice,
			b.DISCOUNTED_NUMBER discountedNumber, b.AVG_RATING avgRating, b.COUNT_RATINGS countRating
		from BOOK b join CATEGORY c on b.CATE_ID = c.CATE_ID
		where (b.BOOK_ID <> @bookId) AND (c.CATE_ID = @cateId or c.PARENT_ID = @parentId)
		ORDER by b.BOOK_DISCOUNTED_PRICE
		OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
	END TRY

	BEGIN CATCH
		PRINT N'Bị lỗi'
		ROLLBACK 
		RETURN 0
	END CATCH
COMMIT
RETURN 1
GO

GO
IF OBJECT_ID('sp_GetNewestArrival') IS NOT NULL
	DROP PROC sp_GetNewestArrival
GO
CREATE PROCEDURE sp_GetNewestArrival
	@limit INT,
	@offset INT
AS
BEGIN TRANSACTION
	BEGIN TRY
		SELECT b.BOOK_ID bookId, b.BOOK_NAME bookName, b.BOOK_PRICE originalPrice, b.BOOK_DISCOUNTED_PRICE discountedPrice,
			b.DISCOUNTED_NUMBER discountedNumber, b.AVG_RATING avgRating, b.COUNT_RATINGS countRating
		from BOOK b
		ORDER by b.ADDED_TIME DESC
		OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
	END TRY

	BEGIN CATCH
		PRINT N'Bị lỗi'
		ROLLBACK 
		RETURN 0
	END CATCH
COMMIT
RETURN 1
GO

GO
IF OBJECT_ID('sp_GetBestSeller') IS NOT NULL
	DROP PROC sp_GetBestSeller
GO
CREATE PROCEDURE sp_GetBestSeller
	@limit INT,
	@offset INT
AS
BEGIN TRANSACTION
	BEGIN TRY
		SELECT b.BOOK_ID bookId, b.BOOK_NAME bookName, b.BOOK_PRICE originalPrice, b.BOOK_DISCOUNTED_PRICE discountedPrice,
			b.DISCOUNTED_NUMBER discountedNumber, b.AVG_RATING avgRating, b.COUNT_RATINGS countRating
		from BOOK b
		where b.BOOK_ID IN (select od.BOOK_ID
							from ORDER_DETAIL od join ORDER_STATE os on os.ORDER_ID = od.ORDER_ID
							where os.ORDER_STATE = 3
							GROUP by od.BOOK_ID
							order BY SUM(od.ORDER_QUANTITY) DESC
							OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY)
	END TRY

	BEGIN CATCH
		PRINT N'Bị lỗi'
		ROLLBACK 
		RETURN 0
	END CATCH
COMMIT
RETURN 1
GO

GO
IF OBJECT_ID('sp_GetBook') IS NOT NULL
	DROP PROC sp_GetBook
GO
CREATE PROCEDURE sp_GetBook
	@BookId CHAR(7)
AS
BEGIN TRANSACTION
	BEGIN TRY
		if not exists(select 1 from BOOK where BOOK_ID = @BookId) or exists(select 1 from BOOK where BOOK_ID = @BookId and SOFT_DELETE = 1)
		BEGIN
			PRINT N'Book ID isn''t valid!'
			ROLLBACK
			RETURN -1
		END
		
		select [b].[BOOK_ID], [b].[CATE_ID], [b].[BOOK_NAME], [b].[BOOK_PRICE], [b].[AVG_RATING], 
			[b].[COUNT_RATINGS], [b].[STOCK], [b].[DISCOUNTED_NUMBER], [b].[BOOK_DISCOUNTED_PRICE],
			p.PUB_NAME, [bd].[BOOK_FORMAT], [bd].[PUBLISHED_YEAR], [bd].[NUMBER_PAGE], bd.DIMENSIONS, [bd].[BOOK_WEIGHT], [bd].[BOOK_DESC],
			dbo.f_GetSoldNumber(b.BOOK_ID) as 'Sold_number'
		from BOOK b join BOOK_DETAIL bd on bd.BOOK_ID = b.BOOK_ID
			join PUBLISHER p on p.PUB_ID = bd.PUB_ID
		where b.BOOK_ID = @BookId and b.SOFT_DELETE = 0
	END TRY

	BEGIN CATCH
		PRINT N'Bị lỗi'
		ROLLBACK 
		RETURN 0
	END CATCH
COMMIT
RETURN 1
GO

GO
IF OBJECT_ID('sp_GetBooksByOrderId') IS NOT NULL
	DROP PROC sp_GetBooksByOrderId
GO
CREATE PROCEDURE sp_GetBooksByOrderId
	@orderId CHAR(7)
AS
BEGIN TRANSACTION
	BEGIN TRY
		if not exists (select 1 from H_ORDER where ORDER_ID = @orderId)
        BEGIN
            PRINT N'Order not found.'
            ROLLBACK 
            RETURN -1
        END
		
		SELECT od.BOOK_ID bookId, b.BOOK_NAME bookName, b.BOOK_PRICE originalPrice,
			b.BOOK_DISCOUNTED_PRICE unitPrice, od.ORDER_QUANTITY amount
        from ORDER_DETAIL od join BOOK b on od.BOOK_ID = b.BOOK_ID
        where od.ORDER_ID = @orderId 
	END TRY

	BEGIN CATCH
		PRINT N'Bị lỗi'
		ROLLBACK 
		RETURN 0
	END CATCH
COMMIT
RETURN 1
GO
