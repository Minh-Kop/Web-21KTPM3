IF OBJECT_ID('f_CreateCategoryId') IS NOT NULL
	DROP FUNCTION f_CreateCategoryId
GO
CREATE FUNCTION f_CreateCategoryId()
returns CHAR(5)
    BEGIN
        DECLARE @i INT = 1
        DECLARE @id char(4) = 'CA' + '01'
        WHILE(EXISTS(SELECT 1
                    FROM CATEGORY
                    WHERE CATE_ID = @id))
        BEGIN
            SET @i += 1
            SET @id = 'CA' + REPLICATE('0', 2 - LEN(@i)) + CAST(@i AS CHAR(2))
        END
        return @id
    END
GO

IF OBJECT_ID('sp_createCategory') IS NOT NULL
	DROP PROC sp_createCategory
GO
CREATE PROCEDURE sp_createCategory(
    @curr NVARCHAR(50), 
    @parent CHAR(4)
)
AS
BEGIN TRANSACTION
    BEGIN TRY
        IF EXISTS (SELECT C.CATE_NAME FROM CATEGORY C WHERE C.CATE_NAME=@curr)
        BEGIN
			PRINT N'The category is already exists!'
			ROLLBACK  
			RETURN -1
		END
        
        DECLARE @id char(4) = dbo.f_CreateCategoryId()
        DECLARE @nparent CHAR(4)
        
        IF (@parent = 'null')
        BEGIN
            SET @nparent = NULL
        END
        ELSE
        BEGIN
            SET @nparent = @parent
        END

        INSERT INTO category (CATE_ID, PARENT_ID, CATE_NAME, SOFT_DELETE) VALUES (@id, @nparent, @curr, 0)

    END TRY

    BEGIN CATCH
        PRINT N'Bị lỗi'
        ROLLBACK  
        RETURN 0
	END CATCH
COMMIT
RETURN 1
GO


IF OBJECT_ID('sp_deleteCategory') IS NOT NULL
    DROP PROC sp_deleteCategory
GO
CREATE PROC sp_deleteCategory (@id CHAR(4))
AS
BEGIN TRANSACTION
    BEGIN TRY
        IF NOT EXISTS (SELECT C.CATE_ID FROM CATEGORY C WHERE C.CATE_ID = @id)
        BEGIN
            PRINT N'The category is NOT exists!'
			ROLLBACK  
			RETURN -1
        END

        UPDATE CATEGORY
        SET SOFT_DELETE = 1
        WHERE CATE_ID = @id
    END TRY

        BEGIN CATCH
            PRINT N'Bị lỗi'
            ROLLBACK  
            RETURN 0
        END CATCH
COMMIT
RETURN 1
GO

IF OBJECT_ID('sp_updateCategory') IS NOT NULL
    DROP PROC sp_updateCategory
GO
CREATE PROC sp_updateCategory (@id CHAR(4), @name NVARCHAR(50), @parent CHAR(4))
AS
BEGIN TRANSACTION
    BEGIN TRY
        IF NOT EXISTS (SELECT C.CATE_ID FROM CATEGORY C WHERE C.CATE_ID = @id)
        BEGIN
            PRINT N'The category is NOT exists!'
			ROLLBACK  
			RETURN -1
        END

        UPDATE CATEGORY
        SET CATE_NAME = @name, PARENT_ID = @parent
        WHERE CATE_ID = @id
    END TRY

    BEGIN CATCH
        PRINT N'Bị lỗi'
        ROLLBACK  
        RETURN 0
    END CATCH
COMMIT
RETURN 1
GO