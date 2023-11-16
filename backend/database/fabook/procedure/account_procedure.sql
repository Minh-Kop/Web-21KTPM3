GO
IF OBJECT_ID('sp_VerifyAccount') IS NOT NULL
	DROP PROC sp_VerifyAccount
GO
CREATE PROCEDURE sp_VerifyAccount (
    @token char(64)
)
AS
BEGIN TRANSACTION
	BEGIN TRY
		DECLARE @email NVARCHAR(100) = (SELECT EMAIL from ACCOUNT where TOKEN = @token)
		IF @email is NULL
		BEGIN
			PRINT N'Token not found.'
			ROLLBACK 
			RETURN -1
		END

		-- Check if this newest account's HPoint accumulated year is older than current year
		DECLARE @year INT
		select @year = SAVED_YEAR
		from HPOINT_ACCUMULATION_YEAR
		where EMAIL = @email
		ORDER by SAVED_YEAR

		IF @year < YEAR(GETDATE())
		BEGIN
			INSERT into HPOINT_ACCUMULATION_YEAR (EMAIL, SAVED_YEAR, HPOINT) VALUES (@email, YEAR(GETDATE()), 0)
		END

		-- Update verified status
		UPDATE ACCOUNT set VERIFIED = 1 where TOKEN = @token
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
IF OBJECT_ID('sp_CreateAccount') IS NOT NULL
	DROP PROC sp_CreateAccount
GO
CREATE PROCEDURE sp_CreateAccount (
    @email NVARCHAR(100), 
    @phoneNumber CHAR(10), 
    @fullName NVARCHAR(100), 
    @password NVARCHAR(100), 
    @verified bit, 
    @token char(64), 
    @role int
)
AS
BEGIN TRANSACTION
	BEGIN TRY
		if exists(select 1 from ACCOUNT where EMAIL = @email)
		BEGIN
			PRINT N'The email is already used!'
			ROLLBACK  
			RETURN -1
		END
		
        if exists(select 1 from ACCOUNT where PHONE_NUMBER = @phoneNumber)
		BEGIN
			PRINT N'The phone is already used!'
			ROLLBACK  
			RETURN -2
		END

        declare @cartId char(10) = (select dbo.f_CreateCartId())

        INSERT into ACCOUNT (EMAIL, PHONE_NUMBER, FULLNAME, ENC_PWD, VERIFIED, TOKEN, HROLE) values 
            (@email, @phoneNumber, @fullName, @password, @verified, @token, @role)
        INSERT into ACCOUNT_DETAIL (EMAIL, TIER, HPOINT) VALUES (@email, 1, 0)
        INSERT into HPOINT_ACCUMULATION_YEAR (EMAIL, SAVED_YEAR, HPOINT, ISRECEIVEDBIRTHDAYGIFT) VALUES 
			(@email, YEAR(GETDATE()), 0, 0)
        INSERT into CART (CART_ID, EMAIL, CART_COUNT, CART_TOTAL) values (@cartId, @email, 0, 0)
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
IF OBJECT_ID('sp_GetDetailedAccount') IS NOT NULL
	DROP PROC sp_GetDetailedAccount
GO
CREATE PROCEDURE sp_GetDetailedAccount (
    @email NVARCHAR(100),
    @year int
)
AS
BEGIN TRANSACTION
	BEGIN TRY
		if not exists(select 1 from ACCOUNT where EMAIL = @email)
		BEGIN
			PRINT N'The email is not existed!'
			ROLLBACK  
			RETURN -1
		END

        select [a].[EMAIL] as email, [a].[FULLNAME] as fullName, [a].[PHONE_NUMBER] as phoneNumber,
            [a].[AVATAR_PATH] as avatarPath, [a].[AVATAR_FILENAME] as avatarFilename, [a].[HROLE] as role,
            ad.GENDER as gender, ad.BIRTHDAY as birthday, ad.HPOINT as HPoint, ad.TIER as tier, hy.HPOINT accumulatedHPoint
        from ACCOUNT a LEFT join ACCOUNT_DETAIL ad on a.EMAIL = ad.EMAIL
            LEFT join HPOINT_ACCUMULATION_YEAR hy on hy.EMAIL = a.EMAIL
        where a.EMAIL = @email and hy.SAVED_YEAR = @year
	END TRY

	BEGIN CATCH
		PRINT N'Bị lỗi'
		ROLLBACK  
		RETURN 0
	END CATCH
COMMIT
RETURN 1
GO
