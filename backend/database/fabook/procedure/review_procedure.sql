GO
IF OBJECT_ID('sp_CreateReview') IS NOT NULL
	DROP PROC sp_CreateReview
GO
CREATE PROCEDURE sp_CreateReview (
    @orderId char(7),
    @bookId char(7),
    @rating INT,
    @comment NVARCHAR(800)
)
AS
BEGIN TRANSACTION
	BEGIN TRY
        if not exists (select 1 from ORDER_DETAIL where ORDER_ID = @orderId and BOOK_ID = @bookId)
        BEGIN
            PRINT N'This item is not in this order.'
            ROLLBACK 
            RETURN -1
        END
        
        if exists (select 1 from ORDER_REVIEW where ORDER_ID = @orderId and BOOK_ID = @bookId)
        BEGIN
            PRINT N'This order''s item is already reviewed.'
            ROLLBACK 
            RETURN -2
        END
        
        if exists (select 1 from BOOK where BOOK_ID = @bookId and SOFT_DELETE = 1)
        BEGIN
            PRINT N'This order''s item is no longer existed.'
            ROLLBACK 
            RETURN -3
        END

        INSERT into ORDER_REVIEW (ORDER_ID, BOOK_ID, RATING, REVIEW, CREATED_TIME) VALUES
            (@orderId, @bookId, @rating, @comment, GETDATE())

        -- Increase 200 HPoint for user
        declare @email NVARCHAR(100) = (SELECT EMAIL from H_ORDER where ORDER_ID = @orderId)
        update ACCOUNT_DETAIL
        set HPOINT = HPOINT + 200
        where EMAIL = @email

        -- Update HPoint history
        INSERT into HPOINT_HISTORY (EMAIL, CHANGED_TIME, CHANGED_TYPE, CHANGED_POINTS, CHANGED_REASON) VALUES
            (@email, GETDATE(), 1, 200, N'Tăng HPoint từ việc đánh giá cho sản phẩm ' + @bookId +  N' của đơn hàng ' + @orderId + '.')
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
IF OBJECT_ID('sp_UpdateBookRating') IS NOT NULL
	DROP PROC sp_UpdateBookRating
GO
CREATE PROCEDURE sp_UpdateBookRating (
    @bookId char(7)
)
AS
BEGIN TRANSACTION
	BEGIN TRY
        DECLARE @countRatings INT = 0, @avgRatings FLOAT = 0
        SELECT @countRatings = COUNT(*), @avgRatings = AVG(RATING)
        from ORDER_REVIEW
        where BOOK_ID = @bookId
        GROUP BY BOOK_ID

        -- Update book
        UPDATE BOOK
        SET AVG_RATING = @avgRatings, COUNT_RATING = @countRatings
        WHERE BOOK_ID = @bookId
	END TRY

	BEGIN CATCH
		PRINT N'Bị lỗi'
		ROLLBACK 
		RETURN 0
	END CATCH
COMMIT
RETURN 1
GO
