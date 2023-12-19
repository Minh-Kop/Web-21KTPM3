IF OBJECT_ID('sp_GetAllUserShippingAddressesByUserId') IS NOT NULL
	DROP PROC sp_GetAllUserShippingAddressesByUserId
GO
CREATE PROCEDURE sp_GetAllUserShippingAddressesByUserId (
    @userId CHAR(5)
)
AS
BEGIN TRANSACTION
	BEGIN TRY
        SELECT sa.ADDR_ID 'addrId', sa.DETAILED_ADDR 'address', w.WARD_NAME wardName, d.DIST_NAME distName, p.PROV_NAME provName,
            sa.DETAILED_ADDR + ', ' + w.WARD_NAME + ', ' + d.DIST_NAME + ', ' + p.PROV_NAME detailedAddress,
            sa.RECEIVER_NAME fullName, sa.RECEIVER_PHONE phoneNumber, sa.LATITUDE lat, sa.LONGITUDE lng,
            sa.IS_DEFAULT isDefault
        from SHIPPING_ADDRESS sa join PROVINCE p on p.PROV_ID = sa.PROV_ID
            join DISTRICT d on d.DIST_ID = sa.DIST_ID
            join WARD w on w.WARD_ID = sa.WARD_ID
        where sa.USERID = @userId
	END TRY

	BEGIN CATCH
		PRINT N'Bị lỗi'
		ROLLBACK 
		RETURN 0
	END CATCH
COMMIT
RETURN 1
GO

IF OBJECT_ID('sp_GetShippingAddressById') IS NOT NULL
	DROP PROC sp_GetShippingAddressById
GO
CREATE PROCEDURE sp_GetShippingAddressById (
    @id CHAR(10)
)
AS
BEGIN TRANSACTION
	BEGIN TRY
        SELECT sa.ADDR_ID 'addrId', sa.DETAILED_ADDR 'address', w.WARD_NAME wardName, d.DIST_NAME distName, p.PROV_NAME provName,
            sa.RECEIVER_NAME fullName, sa.RECEIVER_PHONE phoneNumber, sa.LATITUDE lat, sa.LONGITUDE lng,
            sa.IS_DEFAULT isDefault
        from SHIPPING_ADDRESS sa join PROVINCE p on p.PROV_ID = sa.PROV_ID
            join DISTRICT d on d.DIST_ID = sa.DIST_ID
            join WARD w on w.WARD_ID = sa.WARD_ID
        where sa.ADDR_ID = @id
	END TRY

	BEGIN CATCH
		PRINT N'Bị lỗi'
		ROLLBACK 
		RETURN 0
	END CATCH
COMMIT
RETURN 1
GO

IF OBJECT_ID('f_CreateShippingAddressId') IS NOT NULL
	DROP FUNCTION f_CreateShippingAddressId
GO
CREATE FUNCTION f_CreateShippingAddressId()
returns CHAR(10)
    BEGIN
        DECLARE @i INT = 1
        DECLARE @id char(10) = 'AD001'
        WHILE(EXISTS(SELECT 1
                    FROM SHIPPING_ADDRESS
                    WHERE ADDR_ID = @id))
        BEGIN
            SET @i += 1
            SET @id = 'AD' + REPLICATE('0', 3 - LEN(@i)) + CAST(@i AS CHAR(3))
        END
        return @id
    END
GO

IF OBJECT_ID('sp_CreateShippingAddress') IS NOT NULL
	DROP PROC sp_CreateShippingAddress
GO
CREATE PROCEDURE sp_CreateShippingAddress (
    @userId CHAR(5),
    @address NVARCHAR(100),
    @wardId char(5),
    @distId char(5),
    @provId char(5),
    @fullName NVARCHAR(60),
    @phoneNumber CHAR(10),
    @isDefault bit,
    @lat float,
    @lng float
)
AS
BEGIN TRANSACTION
	BEGIN TRY
        DECLARE @id char(10) = dbo.f_CreateShippingAddressId()
        if @isDefault = 1
        BEGIN
            update SHIPPING_ADDRESS
            set IS_DEFAULT = 0
            WHERE USERID = @userId
        END
        INSERT into SHIPPING_ADDRESS (ADDR_ID, USERID, DETAILED_ADDR, WARD_ID, DIST_ID, PROV_ID, RECEIVER_NAME, RECEIVER_PHONE, LATITUDE, LONGITUDE, IS_DEFAULT)
            VALUES (@id, @userId, @address, @wardId, @distId, @provId, @fullName, @phoneNumber, @lat, @lng, @isDefault)
	END TRY

	BEGIN CATCH
		PRINT N'Bị lỗi'
		ROLLBACK 
		RETURN 0
	END CATCH
COMMIT
RETURN 1
GO

IF OBJECT_ID('sp_UpdateShippingAddress') IS NOT NULL
	DROP PROC sp_UpdateShippingAddress
GO
CREATE PROCEDURE sp_UpdateShippingAddress (
    @addrId CHAR(10),
    @userId CHAR(5),
    @address NVARCHAR(100),
    @wardId char(8),
    @distId char(6),
    @provId char(4),
    @fullName NVARCHAR(60),
    @phoneNumber CHAR(10),
    @isDefault bit,
    @lat float,
    @lng float
)
AS
BEGIN TRANSACTION
	BEGIN TRY
        if @isDefault = 1
        BEGIN
            update SHIPPING_ADDRESS
            set IS_DEFAULT = 0
            WHERE USERID = @userId

            update SHIPPING_ADDRESS
            set IS_DEFAULT = 1
            WHERE ADDR_ID = @addrId
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
