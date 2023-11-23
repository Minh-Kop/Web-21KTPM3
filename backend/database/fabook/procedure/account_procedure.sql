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

IF OBJECT_ID('f_CreateUserId') IS NOT NULL
	DROP FUNCTION f_CreateUserId
GO
CREATE FUNCTION f_CreateUserId(
    @abbreviation char(2)
)
returns CHAR(5)
    BEGIN
        DECLARE @i INT = 1
        DECLARE @id char(5) = @abbreviation + '001'
        WHILE(EXISTS(SELECT 1
                    FROM ACCOUNT
                    WHERE USERID = @id))
        BEGIN
            SET @i += 1
            SET @id = @abbreviation + REPLICATE('0', 3 - LEN(@i)) + CAST(@i AS CHAR(3))
        END
        return @id
    END
GO

IF OBJECT_ID('sp_CreateAccount') IS NOT NULL
	DROP PROC sp_CreateAccount
GO
CREATE PROCEDURE sp_CreateAccount (
    @email NVARCHAR(100), 
    @phoneNumber CHAR(10), 
    @username NVARCHAR(100), 
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

        declare @userId char(5) = (select dbo.f_CreateUserId('UR'))
        declare @cartId char(5) = (select dbo.f_CreateCartId('CT'))

        INSERT into ACCOUNT (USERID , EMAIL, PHONE_NUMBER, USERNAME, ENC_PWD, VERIFIED, TOKEN, HROLE) values 
            (@userId, @email, @phoneNumber, @username, @password, @verified, @token, @role)
        INSERT into CART (CART_ID, USERID, CART_COUNT, CART_TOTAL) values (@cartId, @userId, 0, 0)
	END TRY

	BEGIN CATCH
		PRINT N'Bị lỗi'
		ROLLBACK  
		RETURN 0
	END CATCH
COMMIT
RETURN 1
GO

IF OBJECT_ID('sp_GetDetailedAccount') IS NOT NULL
	DROP PROC sp_GetDetailedAccount
GO
CREATE PROCEDURE sp_GetDetailedAccount (
	@userId CHAR(5)
)
AS
BEGIN TRANSACTION
	BEGIN TRY
		if not exists(select 1 from ACCOUNT where USERID = @userId)
		BEGIN
			PRINT N'This user is not existed!'
			ROLLBACK  
			RETURN -1
		END

        select a.USERID userId, a.USERNAME userName, [a].[EMAIL] as email, [a].[FULLNAME] as fullName, [a].[PHONE_NUMBER] as phoneNumber,
            [a].[AVATAR_PATH] as avatarPath, [a].[HROLE] as role,
            a.GENDER as gender, a.BIRTHDAY as birthday
        from ACCOUNT a 
        where a.USERID = @userId
	END TRY

	BEGIN CATCH
		PRINT N'Bị lỗi'
		ROLLBACK  
		RETURN 0
	END CATCH
COMMIT
RETURN 1
GO
