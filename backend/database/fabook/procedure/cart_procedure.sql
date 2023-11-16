use DB_hachiko

go
IF OBJECT_ID('f_CreateCartId') IS NOT NULL
	DROP FUNCTION f_CreateCartId
GO
CREATE FUNCTION f_CreateCartId()
returns CHAR(10)
    BEGIN
        DECLARE @i INT = 1
        DECLARE @id char(10) = 'CR00000001'
        WHILE(EXISTS(SELECT 1
                    FROM CART
                    WHERE CART_ID = @id))
        BEGIN
            SET @i += 1
            SET @id = 'CR' + REPLICATE('0', 8 - LEN(@i)) + CAST(@i AS CHAR(8))
        END
        return @id
    END

GO
IF OBJECT_ID('sp_GetBookByCartId') IS NOT NULL
	DROP PROC sp_GetBookByCartId
GO
CREATE PROCEDURE sp_GetBookByCartId (
    @cartId char(10), 
    @bookId CHAR(7)
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
    @cartId char(10), 
    @bookId CHAR(7), 
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
    @cartId char(10)
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

GO
IF OBJECT_ID('sp_UpdateCart') IS NOT NULL
	DROP PROC sp_UpdateCart
GO
CREATE PROCEDURE sp_UpdateCart (
    @cartId char(10), 
    @bookId CHAR(7), 
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

GO
IF OBJECT_ID('sp_DeleteBookFromCart') IS NOT NULL
	DROP PROC sp_DeleteBookFromCart
GO
CREATE PROCEDURE sp_DeleteBookFromCart (
    @cartId char(10), 
    @bookId CHAR(7)
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
    @email NVARCHAR(100),
    @orderId CHAR(7)
)
AS
BEGIN TRANSACTION
	BEGIN TRY
        -- Update order date
        UPDATE H_ORDER
        SET ORDER_DATE = GETDATE()
        WHERE ORDER_ID = @orderId

        -- Update user's HPoint if he/she used
        DECLARE @hPoint INT = (SELECT HPOINTS_REDEEMED from H_ORDER where ORDER_ID = @orderId)
        IF @hPoint is NOT NULL
        BEGIN
            UPDATE ACCOUNT_DETAIL
            set HPOINT = 0
            where EMAIL = @email
        END

        -- Delete user's vouchers
        DELETE from USER_VOUCHER where EMAIL = @email and VOUCHER_ID IN (select uv.VOUCHER_ID 
                                                                        from USER_VOUCHER uv join ORDER_VOUCHER ov on ov.VOUCHER_ID = uv.VOUCHER_ID 
                                                                        where ORDER_ID = @orderId)

        -- Delete each book in cart
        DECLARE @cartId CHAR(10) = (select CART_ID from CART where EMAIL = @email)
        WHILE EXISTS (select 1 from CART_DETAIL where CART_ID = @cartId and IS_CLICKED = 1)
        BEGIN
            declare @bookId CHAR(7), @quantity INT
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
