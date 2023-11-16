GO
IF OBJECT_ID('sp_GetAllVouchers') IS NOT NULL
	DROP PROC sp_GetAllVouchers
GO
CREATE PROCEDURE sp_GetAllVouchers
AS
BEGIN TRANSACTION
	BEGIN TRY
        SELECT [VOUCHER_ID] 'voucherId', vt.VOUCHER_TYPE_ID voucherTypeId, vt.VOUCHER_TYPE 'voucherType', 
            [STARTED_DATE] 'startDate', [END_DATE] 'endDate', 
            [MAXIMUM_AMOUNT] 'maxAmount', [REMAINING_AMOUNT] 'remainingAmount',
            [MINIMUM_PRICE] 'minPrice', [MAXIMUM_DISCOUNT_PRICE] 'maxPrice', [PERCENTAGE_DISCOUNT] 'percentageDiscount'
        from VOUCHER v join VOUCHER_TYPE vt on v.VOUCHER_TYPE_ID = vt.VOUCHER_TYPE_ID
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
IF OBJECT_ID('sp_GetAllUserVouchers') IS NOT NULL
	DROP PROC sp_GetAllUserVouchers
GO
CREATE PROCEDURE sp_GetAllUserVouchers (
    @email NVARCHAR(100)
)
AS
BEGIN TRANSACTION
	BEGIN TRY
        SELECT v.[VOUCHER_ID] 'voucherId', vt.VOUCHER_TYPE_ID voucherTypeId, vt.VOUCHER_TYPE 'voucherType', [STARTED_DATE] 'startDate', [END_DATE] 'endDate', 
            [MAXIMUM_AMOUNT] 'maxAmount', [REMAINING_AMOUNT] 'remainingAmount',
            [MINIMUM_PRICE] 'minPrice', [MAXIMUM_DISCOUNT_PRICE] 'maxPrice', [PERCENTAGE_DISCOUNT] 'percentageDiscount'
        from VOUCHER v join VOUCHER_TYPE vt on v.VOUCHER_TYPE_ID = vt.VOUCHER_TYPE_ID
            join user_voucher uv on uv.VOUCHER_ID = v.VOUCHER_ID
        where uv.EMAIL = @email and v.STARTED_DATE <= GETDATE() and v.END_DATE >= GETDATE() and v.REMAINING_AMOUNT > 0
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
IF OBJECT_ID('sp_GetVouchersByOrderId') IS NOT NULL
	DROP PROC sp_GetVouchersByOrderId
GO
CREATE PROCEDURE sp_GetVouchersByOrderId (
    @orderId CHAR(7)
)
AS
BEGIN TRANSACTION
	BEGIN TRY
        SELECT VOUCHER_ID voucherId
        from ORDER_VOUCHER
        where ORDER_ID = @orderId
	END TRY

	BEGIN CATCH
		PRINT N'Bị lỗi'
		ROLLBACK 
		RETURN 0
	END CATCH
COMMIT
RETURN 1
GO

go
IF OBJECT_ID('f_CreateVoucherId') IS NOT NULL
	DROP FUNCTION f_CreateVoucherId
GO
CREATE FUNCTION f_CreateVoucherId()
returns CHAR(7)
    BEGIN
        DECLARE @i INT = 1
        DECLARE @id char(7) = 'VC00001'
        WHILE(EXISTS(SELECT 1
                    FROM VOUCHER
                    WHERE VOUCHER_ID = @id))
        BEGIN
            SET @i += 1
            SET @id = 'VC' + REPLICATE('0', 5 - LEN(@i)) + CAST(@i AS CHAR(5))
        END
        return @id
    END
GO

GO
IF OBJECT_ID('sp_CreateVoucher') IS NOT NULL
	DROP PROC sp_CreateVoucher
GO
CREATE PROCEDURE sp_CreateVoucher (
    @voucherTypeId char(4),
    @percentageDiscount int,
    @minPrice int,
    @maxDiscountPrice int,
    @startDate DATETIME,
    @endDate DATETIME,
    @maxAmount int
)
AS
BEGIN TRANSACTION
	BEGIN TRY
        DECLARE @voucherId char(7) = dbo.f_CreateVoucherId()
        INSERT into VOUCHER (VOUCHER_ID, VOUCHER_TYPE_ID, STARTED_DATE, END_DATE, MAXIMUM_AMOUNT, REMAINING_AMOUNT, MINIMUM_PRICE, MAXIMUM_DISCOUNT_PRICE, PERCENTAGE_DISCOUNT)
            VALUES (@voucherId, @voucherTypeId, @startDate, @endDate, @maxAmount, @maxAmount, @minPrice, @maxDiscountPrice, @percentageDiscount)
	END TRY

	BEGIN CATCH
		PRINT N'Bị lỗi'
		ROLLBACK 
		RETURN 0
	END CATCH
COMMIT
RETURN 1
GO
