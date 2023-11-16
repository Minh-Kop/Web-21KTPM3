use DB_hachiko
go
IF OBJECT_ID('f_CreateAuthorId') IS NOT NULL
	DROP FUNCTION f_CreateAuthorId
GO
CREATE FUNCTION f_CreateAuthorId()
returns CHAR(4)
    BEGIN
        DECLARE @i INT = 1
        DECLARE @id char(4) = 'AU01'
        WHILE(EXISTS(SELECT 1
                    FROM AUTHOR
                    WHERE AUTHOR_ID = @id))
        BEGIN
            SET @i += 1
            SET @id = 'AU' + REPLICATE('0', 2 - LEN(@i)) + CAST(@i AS CHAR(2))
        END
        return @id
    END

GO
IF OBJECT_ID('sp_CreateAuthor') IS NOT NULL
	DROP PROC sp_CreateAuthor
GO
CREATE PROCEDURE sp_CreateAuthor
	@author_name NVARCHAR(50)
AS
BEGIN TRANSACTION
	BEGIN TRY
		if exists(select AUTHOR_ID from AUTHOR where AUTHOR_NAME = @author_name)
		BEGIN
			PRINT N'The author name is already existed!'
			ROLLBACK  
			RETURN -1
		END
		declare @au_id char(4) = dbo.f_CreateAuthorId()
        INSERT into AUTHOR (AUTHOR_ID, AUTHOR_NAME) values (@au_id, @author_name)
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
IF OBJECT_ID('sp_GetAuthors') IS NOT NULL
	DROP proc sp_GetAuthors
GO
CREATE proc sp_GetAuthors (@BookId CHAR(7))
AS
BEGIN
    select a.AUTHOR_NAME 
	from WRITTEN_BY w join AUTHOR a on a.AUTHOR_ID = w.AUTHOR_ID
	where w.BOOK_ID = @BookId
END;
go

