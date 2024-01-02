IF OBJECT_ID('f_CreateTransactionId') IS NOT NULL
	DROP FUNCTION f_CreateTransactionId
GO
CREATE FUNCTION f_CreateTransactionId(
    @abbreviation char(2)
)
returns CHAR(5)
    BEGIN
        DECLARE @i INT = 1
        DECLARE @id char(5) = @abbreviation + '001'
        WHILE(EXISTS(SELECT 1
                    FROM [TRANSACTION]
                    WHERE TRANSACTIONID = @id))
        BEGIN
            SET @i += 1
            SET @id = @abbreviation + REPLICATE('0', 3 - LEN(@i)) + CAST(@i AS CHAR(3))
        END
        return @id
    END
GO

IF OBJECT_ID('sp_CreateDeposit') IS NOT NULL
	DROP PROC sp_CreateDeposit
GO
CREATE PROCEDURE sp_CreateDeposit (
    @accountId CHAR(5),
    @deposit INT
)
AS
BEGIN TRANSACTION
	BEGIN TRY
        declare @transactionId char(5) = (select dbo.f_CreateTransactionId('TR'))
        PRINT @transactionId

		INSERT into [TRANSACTION] (TRANSACTIONID, PAYEE, CHANGED_TIME, CHANGED_MONEY, CHANGED_REASON, TRANS_STATE)
            VALUES (@transactionId, @accountId, GETDATE(), @deposit, N'Nạp tiền vào tài khoản', 'complete')
        
        UPDATE ACCOUNT
        SET BALANCE = BALANCE + @deposit
        WHERE ACCOUNTID = @accountId
	END TRY

	BEGIN CATCH
		PRINT N'Bị lỗi'
		ROLLBACK  
		RETURN 0
	END CATCH
COMMIT
RETURN 1
GO