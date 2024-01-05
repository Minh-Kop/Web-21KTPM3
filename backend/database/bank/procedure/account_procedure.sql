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
                    WHERE ACCOUNTID = @id))
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
    @username NVARCHAR(100), 
    @password NVARCHAR(100)
)
AS
BEGIN TRANSACTION
	BEGIN TRY
		if exists(select 1 from ACCOUNT where USERNAME = @username)
		BEGIN
			PRINT N'The username is already used!'
			ROLLBACK  
			RETURN -1
		END

        declare @accountId char(5) = (select dbo.f_CreateUserId('UB'))

        INSERT into ACCOUNT (ACCOUNTID, USERNAME, ENC_PWD, BALANCE) values 
            (@accountId, @username, @password, 0)
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
	@accountId CHAR(5)
)
AS
BEGIN TRANSACTION
	BEGIN TRY
		if not exists(select 1 from ACCOUNT where ACCOUNTID = @accountId)
		BEGIN
			PRINT N'This user is not existed!'
			ROLLBACK  
			RETURN -1
		END

        select a.ACCOUNTID userId, a.USERNAME userName, a.BALANCE balance
        from ACCOUNT a
        where a.ACCOUNTID = @accountId
	END TRY

	BEGIN CATCH
		PRINT N'Bị lỗi'
		ROLLBACK  
		RETURN 0
	END CATCH
COMMIT
RETURN 1
GO
