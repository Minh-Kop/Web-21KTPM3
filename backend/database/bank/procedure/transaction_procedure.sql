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
    @deposit bigint
)
AS
BEGIN TRANSACTION
	BEGIN TRY
        declare @transactionId char(5) = (select dbo.f_CreateTransactionId('TR'))
        DECLARE @balance bigint = (select BALANCE from ACCOUNT where ACCOUNTID = @accountId)
        set @balance = @balance + @deposit

		INSERT into [TRANSACTION] (TRANSACTIONID, CHANGED_TIME, CHANGED_MONEY, CHANGED_REASON)
            VALUES (@transactionId, GETDATE(), @deposit, N'Nạp tiền vào tài khoản')

        INSERT into TRANSFER (ACCOUNTID, TRANSACTIONID, TRANSFER_TYPE, BALANCE) values 
            (@accountId, @transactionId, 2, @balance)
        
        UPDATE ACCOUNT
        SET BALANCE = @balance
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

IF OBJECT_ID('sp_GetTransactions') IS NOT NULL
	DROP PROC sp_GetTransactions
GO
CREATE PROCEDURE sp_GetTransactions (
    @accountId CHAR(5)
)
AS
BEGIN TRANSACTION
	BEGIN TRY
        SELECT t.TRANSACTIONID transactionId, a.USERNAME username, t.CHANGED_TIME changedTime,
            CASE 
                WHEN tf.TRANSFER_TYPE = 1 THEN '-'
                WHEN tf.TRANSFER_TYPE = 2 THEN '+'
            END AS changedType,
            t.CHANGED_MONEY changedMoney, t.CHANGED_REASON changedReason, tf.BALANCE balance
        from [TRANSACTION] t LEFT join TRANSFER tf on tf.TRANSACTIONID = t.TRANSACTIONID
            left join ACCOUNT a on a.ACCOUNTID = tf.ACCOUNTID
        where a.ACCOUNTID = @accountId
        ORDER by CHANGED_TIME DESC
	END TRY

	BEGIN CATCH
		PRINT N'Bị lỗi'
		ROLLBACK  
		RETURN 0
	END CATCH
COMMIT
RETURN 1
GO

IF OBJECT_ID('sp_GetTransactionById') IS NOT NULL
	DROP PROC sp_GetTransactionById
GO
CREATE PROCEDURE sp_GetTransactionById (
    @accountId CHAR(5),
    @transactionId CHAR(5)
)
AS
BEGIN TRANSACTION
	BEGIN TRY
        SELECT t.TRANSACTIONID transactionId, a.USERNAME username, t.CHANGED_TIME changedTime,
            CASE 
                WHEN tf.TRANSFER_TYPE = 1 THEN '-'
                WHEN tf.TRANSFER_TYPE = 2 THEN '+'
            END AS changedType,
            t.CHANGED_MONEY changedMoney, t.CHANGED_REASON changedReason, tf.BALANCE balance
        from [TRANSACTION] t LEFT join TRANSFER tf on tf.TRANSACTIONID = t.TRANSACTIONID
            left join ACCOUNT a on a.ACCOUNTID = tf.ACCOUNTID
        where a.ACCOUNTID = @accountId and t.TRANSACTIONID = @transactionId
	END TRY

	BEGIN CATCH
		PRINT N'Bị lỗi'
		ROLLBACK  
		RETURN 0
	END CATCH
COMMIT
RETURN 1
GO

IF OBJECT_ID('sp_CreatePaymentTransaction') IS NOT NULL
	DROP PROC sp_CreatePaymentTransaction
GO
CREATE PROCEDURE sp_CreatePaymentTransaction (
    @payerId CHAR(5),
    @total bigint,
    @changedReason NVARCHAR(300)
)
AS
BEGIN TRANSACTION
	BEGIN TRY
        DECLARE @payerBalance bigint = (select BALANCE from ACCOUNT where ACCOUNTID = @payerId)
        if(@payerBalance < @total)
        BEGIN
            PRINT N'Not have enough money to pay'
            ROLLBACK  
            RETURN -1
        END

        declare @payeeId char(5) = 'UB000'
        DECLARE @payeeBalance bigint = (select BALANCE from ACCOUNT where ACCOUNTID = @payeeId)
        set @payerBalance = @payerBalance - @total
        set @payeeBalance = @payeeBalance + @total

        declare @transactionId char(5) = (select dbo.f_CreateTransactionId('TR'))
        INSERT into [TRANSACTION] (TRANSACTIONID, CHANGED_TIME, CHANGED_MONEY, CHANGED_REASON) VALUES
            (@transactionId, GETDATE(), @total, @changedReason)
        INSERT into TRANSFER (ACCOUNTID, TRANSACTIONID, TRANSFER_TYPE, BALANCE) VALUES
            (@payerId, @transactionId, 1, @payerBalance),
            (@payeeId, @transactionId, 2, @payeeBalance)

        UPDATE ACCOUNT set BALANCE = @payerBalance WHERE ACCOUNTID = @payerId
        UPDATE ACCOUNT set BALANCE = @payeeBalance WHERE ACCOUNTID = @payeeId

        select @transactionId 'transactionId'
	END TRY

	BEGIN CATCH
		PRINT N'Bị lỗi'
		ROLLBACK  
		RETURN 0
	END CATCH
COMMIT
RETURN 1
GO

IF OBJECT_ID('sp_CreateRefundTransaction') IS NOT NULL
	DROP PROC sp_CreateRefundTransaction
GO
CREATE PROCEDURE sp_CreateRefundTransaction (
    @transactionId CHAR(5)
)
AS
BEGIN TRANSACTION
	BEGIN TRY
        -- Get refund money
        declare @refundMoney bigint = (select CHANGED_MONEY from [TRANSACTION] where TRANSACTIONID = @transactionId)
        if @refundMoney is NULL
        BEGIN
            PRINT N'Non-existed transaction'
            ROLLBACK  
            RETURN -1
        END

        -- Get customer info
        declare @customerId CHAR(5) = (select ACCOUNTID from TRANSFER where TRANSACTIONID = @transactionId and TRANSFER_TYPE = 1)
        DECLARE @customerBalance bigint = (select BALANCE from ACCOUNT where ACCOUNTID = @customerId)

        -- Shop info
        declare @shopId char(5) = 'UB000'
        DECLARE @shopBalance bigint = (select BALANCE from ACCOUNT where ACCOUNTID = @shopId)
        
        set @shopBalance = @shopBalance - @refundMoney
        set @customerBalance = @customerBalance + @refundMoney

        declare @refundTransactionId char(5) = (select dbo.f_CreateTransactionId('TR'))
        INSERT into [TRANSACTION] (TRANSACTIONID, CHANGED_TIME, CHANGED_MONEY, CHANGED_REASON) VALUES
            (@refundTransactionId, GETDATE(), @refundMoney, N'Trả lại tiền đã thanh toán do đơn hàng bị hủy vì gặp vấn đề')
        INSERT into TRANSFER (ACCOUNTID, TRANSACTIONID, TRANSFER_TYPE, BALANCE) VALUES
            (@shopId, @refundTransactionId, 1, @shopBalance),
            (@customerId, @refundTransactionId, 2, @customerBalance)

        UPDATE ACCOUNT set BALANCE = @shopBalance WHERE ACCOUNTID = @shopId
        UPDATE ACCOUNT set BALANCE = @customerBalance WHERE ACCOUNTID = @customerId
	END TRY

	BEGIN CATCH
		PRINT N'Bị lỗi'
		ROLLBACK  
		RETURN 0
	END CATCH
COMMIT
RETURN 1
GO