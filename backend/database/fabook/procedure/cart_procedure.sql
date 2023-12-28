-- use fabook_db

IF OBJECT_ID('f_CreateCartId') IS NOT NULL
	DROP FUNCTION f_CreateCartId
GO
CREATE FUNCTION f_CreateCartId(
    @abbreviation char(2)
)
returns CHAR(5)
    BEGIN
        DECLARE @i INT = 1
        DECLARE @id char(5) = @abbreviation + '001'
        WHILE(EXISTS(SELECT 1
                    FROM CART
                    WHERE CART_ID = @id))
        BEGIN
            SET @i += 1
            SET @id = @abbreviation + REPLICATE('0', 3 - LEN(@i)) + CAST(@i AS CHAR(3))
        END
        return @id
    END
GO

IF OBJECT_ID('sp_GetBookByCartId') IS NOT NULL
	DROP PROC sp_GetBookByCartId
GO
CREATE PROCEDURE sp_GetBookByCartId (
    @cartId char(5), 
    @bookId CHAR(5)
)
AS
BEGIN TRANSACTION
	BEGIN TRY
        select BOOK_ID bookId, CART_QUANTITY quantity 
        from CART_DETAIL 
        where CART_ID = @cartId and BOOK_ID = @bookId
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
IF OBJECT_ID('sp_AddBookToCart') IS NOT NULL
	DROP PROC sp_AddBookToCart
GO
CREATE PROCEDURE sp_AddBookToCart (
    @cartId char(5), 
    @bookId CHAR(5), 
    @quantity int,
    @isClicked BIT
)
AS
BEGIN TRANSACTION
	BEGIN TRY
        DECLARE @price INT, @stock INT
        select @price = BOOK_DISCOUNTED_PRICE, @stock = STOCK 
        from BOOK 
        where BOOK_ID = @bookId and SOFT_DELETE = 0

        if @price IS NULL
        BEGIN
            PRINT N'This product is no longer exists.'
            ROLLBACK  
            RETURN -1
        END
        
        if @quantity > @stock
        BEGIN
            set @quantity = @stock
        END

        INSERT into CART_DETAIL (CART_ID, BOOK_ID, CART_QUANTITY, IS_CLICKED, CART_PRICE) values (@cartId, @bookId, @quantity, @isClicked, @quantity * @price)
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
IF OBJECT_ID('sp_UpdateCartQuantityCartTotal') IS NOT NULL
	DROP PROC sp_UpdateCartQuantityCartTotal
GO
CREATE PROCEDURE sp_UpdateCartQuantityCartTotal (
    @cartId char(5)
)
AS
BEGIN TRANSACTION
	BEGIN TRY
        declare @cartCount int = 0
        select @cartCount = COUNT(BOOK_ID)
        from CART_DETAIL
        where CART_ID = @cartId
        GROUP by CART_ID

        DECLARE @total int = 0;
        select @total = sum(CART_PRICE)
        from CART_DETAIL
        where CART_ID = @cartId and IS_CLICKED = 1
        group BY CART_ID
        
        UPDATE CART
        set CART_COUNT = @cartCount, CART_TOTAL = @total
        where CART_ID = @cartId
	END TRY

	BEGIN CATCH
		PRINT N'Bị lỗi'
		ROLLBACK  
		RETURN 0
	END CATCH
COMMIT
RETURN 1
GO

IF OBJECT_ID('sp_UpdateCart') IS NOT NULL
	DROP PROC sp_UpdateCart
GO
CREATE PROCEDURE sp_UpdateCart (
    @cartId char(5), 
    @bookId CHAR(5), 
    @quantity int,
    @isClicked BIT
)
AS
BEGIN TRANSACTION
	BEGIN TRY
        if @quantity IS NOT NULL
        BEGIN
            DECLARE @price INT, @stock INT
            select @price = BOOK_DISCOUNTED_PRICE, @stock = STOCK 
            from BOOK 
            where BOOK_ID = @bookId and SOFT_DELETE = 0

            if @price IS NULL
            BEGIN
                PRINT N'This product is no longer exists.'
                ROLLBACK  
                RETURN -1
            END

            if @quantity > @stock
            BEGIN
                set @quantity = @stock
            END

            UPDATE CART_DETAIL
            set CART_QUANTITY = @quantity, CART_PRICE = @price * @quantity
            where CART_ID = @cartId and BOOK_ID = @bookId
        END

        if @isClicked is NOT NULL
        BEGIN
            UPDATE CART_DETAIL
            set IS_CLICKED = @isClicked
            where CART_ID = @cartId and BOOK_ID = @bookId
        END
	END TRY

	BEGIN CATCH
		PRINT N'Bị lỗi'
		ROLLBACK  
		RETURN 0
	END CATCH
COMMIT
RETURN 1
GO

IF OBJECT_ID('sp_UpdateBooksInCart') IS NOT NULL
	DROP PROC sp_UpdateBooksInCart
GO
CREATE PROCEDURE sp_UpdateBooksInCart (
    @cartId char(5),
    @isClicked BIT
)
AS
BEGIN TRANSACTION
	BEGIN TRY
        if @isClicked is NOT NULL
        BEGIN
            UPDATE CART_DETAIL
            set IS_CLICKED = @isClicked
            where CART_ID = @cartId
        END
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
IF OBJECT_ID('sp_DeleteBookFromCart') IS NOT NULL
	DROP PROC sp_DeleteBookFromCart
GO
CREATE PROCEDURE sp_DeleteBookFromCart (
    @cartId char(5), 
    @bookId CHAR(5)
)
AS
BEGIN TRANSACTION
	BEGIN TRY
        delete from CART_DETAIL where CART_ID = @cartId and BOOK_ID = @bookId
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
IF OBJECT_ID('sp_DeleteClickedBooksFromCart') IS NOT NULL
	DROP PROC sp_DeleteClickedBooksFromCart
GO
CREATE PROCEDURE sp_DeleteClickedBooksFromCart (
    @userId CHAR(5),
    @orderId CHAR(5)
)
AS
BEGIN TRANSACTION
	BEGIN TRY
        -- Update order date
        UPDATE H_ORDER
        SET ORDER_DATE = GETDATE()
        WHERE ORDER_ID = @orderId

        -- Delete user's vouchers
        DELETE from USER_VOUCHER where USERID = @userId and VOUCHER_ID IN (select uv.VOUCHER_ID 
                                                                            from USER_VOUCHER uv join ORDER_VOUCHER ov on ov.VOUCHER_ID = uv.VOUCHER_ID 
                                                                            where ORDER_ID = @orderId)

        -- Delete each book in cart
        DECLARE @cartId CHAR(5) = (select CART_ID from CART where USERID = @userId)
        WHILE EXISTS (select 1 from CART_DETAIL where CART_ID = @cartId and IS_CLICKED = 1)
        BEGIN
            declare @bookId CHAR(5), @quantity INT
            SELECT @bookId = BOOK_ID, @quantity = CART_QUANTITY 
            from CART_DETAIL 
            where CART_ID = @cartId and IS_CLICKED = 1

            -- Substract stock
            UPDATE BOOK
            set STOCK = STOCK - @quantity
            where BOOK_ID = @bookId

            delete from CART_DETAIL where CART_ID = @cartId and BOOK_ID = @bookId
        END

        -- Count books
        declare @cartCount int = 0
        select @cartCount = COUNT(*)
        from CART_DETAIL
        where CART_ID = @cartId
        GROUP by CART_ID
        
        UPDATE CART
        set CART_COUNT = @cartCount, CART_TOTAL = 0
        where CART_ID = @cartId
	END TRY

	BEGIN CATCH
		PRINT N'Bị lỗi'
		ROLLBACK  
		RETURN 0
	END CATCH
COMMIT
RETURN 1
GO
