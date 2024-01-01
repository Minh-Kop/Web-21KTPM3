IF OBJECT_ID('f_CreateOrderId') IS NOT NULL
	DROP FUNCTION f_CreateOrderId
GO
CREATE FUNCTION f_CreateOrderId()
returns CHAR(7)
    BEGIN
        DECLARE @i INT = 1
        DECLARE @id char(7) = 'OD001'
        WHILE(EXISTS(SELECT 1
                    FROM H_ORDER
                    WHERE ORDER_ID = @id))
        BEGIN
            SET @i += 1
            SET @id = 'OD' + REPLICATE('0', 3 - LEN(@i)) + CAST(@i AS CHAR(3))
        END
        return @id
    END
GO

IF OBJECT_ID('sp_CreateOrder') IS NOT NULL
	DROP PROC sp_CreateOrder
GO
CREATE PROCEDURE sp_CreateOrder (
    @userId CHAR(5),
    @addrId CHAR(5),
    @merchandiseSubtotal int,
    @shippingFee int
)
AS
BEGIN TRANSACTION
	BEGIN TRY
        DECLARE @id char(5) = dbo.f_CreateOrderId()

        INSERT into H_ORDER (ORDER_ID, USERID, ADDR_ID, ORDER_DATE, MERCHANDISE_SUBTOTAL, SHIPPING_FEE, TOTAL_PAYMENT, SOFT_DELETE) values 
            (@id, @userId, @addrId, GETDATE(), @merchandiseSubtotal, @shippingFee, @merchandiseSubtotal + @shippingFee, 0)
        INSERT into ORDER_STATE (ORDER_ID, ORDER_STATE, CREATED_TIME) values (@id, 1, GETDATE())

        select @id orderId
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
IF OBJECT_ID('sp_CreateOrderDetail') IS NOT NULL
	DROP PROC sp_CreateOrderDetail
GO
CREATE PROCEDURE sp_CreateOrderDetail (
    @orderId CHAR(5),
    @bookId CHAR(5),
    @quantity int,
    @price int
)
AS
BEGIN TRANSACTION
	BEGIN TRY
        if @quantity > (select STOCK
                        from BOOK
                        where BOOK_ID = @bookId)
        BEGIN
            PRINT N'Quantity exceeds stock.'
            ROLLBACK 
            RETURN -1
        END

        if exists(select 1 
                  from BOOK
                  where BOOK_ID = @bookId and SOFT_DELETE = 1)
        BEGIN
            PRINT N'Book no longer exists.'
            ROLLBACK 
            RETURN -2
        END

        INSERT into ORDER_DETAIL (ORDER_ID, BOOK_ID, ORDER_QUANTITY, ORDER_PRICE) VALUES (@orderId, @bookId, @quantity, @price)
	END TRY

	BEGIN CATCH
		PRINT N'Bị lỗi'
		ROLLBACK 
		RETURN 0
	END CATCH
COMMIT
RETURN 1
GO

IF OBJECT_ID('sp_DeleteOrder') IS NOT NULL
	DROP PROC sp_DeleteOrder
GO
CREATE PROCEDURE sp_DeleteOrder (
    @orderId CHAR(5)
)
AS
BEGIN TRANSACTION
	BEGIN TRY
        delete from ORDER_STATE where ORDER_ID = @orderId
        delete from ORDER_DETAIL where ORDER_ID = @orderId
        delete from H_ORDER where ORDER_ID = @orderId
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
IF OBJECT_ID('sp_GetInitialOrder') IS NOT NULL
	DROP PROC sp_GetInitialOrder
GO
CREATE PROCEDURE sp_GetInitialOrder (
    @orderId CHAR(7)
)
AS
BEGIN TRANSACTION
	BEGIN TRY
        select sa.ADDR_ID addrId, sa.RECEIVER_NAME fullName, sa.RECEIVER_PHONE phoneNumber, 
            sa.DETAILED_ADDR + ', ' + w.WARD_NAME + ', ' + d.DIST_NAME + ', ' + p.PROV_NAME detailedAddress
        from SHIPPING_ADDRESS sa join WARD w on w.WARD_ID = sa.WARD_ID
            join DISTRICT d on d.DIST_ID = sa.DIST_ID
            join PROVINCE p on p.PROV_ID = sa.PROV_ID
        where sa.ADDR_ID = (select ADDR_ID from H_ORDER where ORDER_ID = @orderId)

        SELECT od.BOOK_ID bookId, b.BOOK_NAME bookName, bi.BOOK_PATH bookImage, b.BOOK_DISCOUNTED_PRICE unitPrice,
            od.ORDER_QUANTITY amount, od.ORDER_PRICE itemSubtotal
        from ORDER_DETAIL od join BOOK b on od.BOOK_ID = b.BOOK_ID join BOOK_IMAGES bi on b.BOOK_ID = bi.BOOK_ID
        where od.ORDER_ID = @orderId 
        
        select [ORDER_ID] orderId,
            [MERCHANDISE_SUBTOTAL] merchandiseSubtotal, [SHIPPING_FEE] shippingFee, 
            [SHIPPING_DISCOUNT_SUBTOTAL] shippingDiscountSubtotal, [HACHIKO_VOUCHER_APPLIED] hachikoVoucherApplied, 
            o.HPOINTS_REDEEMED hPointsRedeemed, [TOTAL_PAYMENT] totalPayment
        from H_ORDER o
            JOIN ACCOUNT ad on ad.USERID = o.USERID
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

GO
IF OBJECT_ID('sp_GetPrice') IS NOT NULL
	DROP PROC sp_GetPrice
GO
CREATE PROCEDURE sp_GetPrice (
    @orderId CHAR(7)
)
AS
BEGIN TRANSACTION
	BEGIN TRY
        select [ORDER_ID] orderId,
            [MERCHANDISE_SUBTOTAL] merchandiseSubtotal, [SHIPPING_FEE] shippingFee, 
            [SHIPPING_DISCOUNT_SUBTOTAL] shippingDiscountSubtotal, [HACHIKO_VOUCHER_APPLIED] hachikoVoucherApplied, 
            o.HPOINTS_REDEEMED hPointsRedeemed, [TOTAL_PAYMENT] totalPayment
        from H_ORDER o
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

GO
IF OBJECT_ID('sp_GetDetailedOrder') IS NOT NULL
	DROP PROC sp_GetDetailedOrder
GO
CREATE PROCEDURE sp_GetDetailedOrder (
    @orderId CHAR(7)
)
AS
BEGIN TRANSACTION
	BEGIN TRY
        if not exists (select 1 from H_ORDER where ORDER_ID = @orderId)
        BEGIN
            PRINT N'Order not found.'
            ROLLBACK 
            RETURN -1
        END

        select sa.RECEIVER_NAME fullName, sa.RECEIVER_PHONE phoneNumber, 
            sa.DETAILED_ADDR + ', ' + w.WARD_NAME + ', ' + d.DIST_NAME + ', ' + p.PROV_NAME detailedAddress
        from SHIPPING_ADDRESS sa join WARD w on w.WARD_ID = sa.WARD_ID
            join DISTRICT d on d.DIST_ID = sa.DIST_ID
            join PROVINCE p on p.PROV_ID = sa.PROV_ID
        where sa.ADDR_ID = (select ADDR_ID from H_ORDER where ORDER_ID = @orderId)

        SELECT ORDER_STATE orderState, CREATED_TIME createdTime
        from ORDER_STATE
        where ORDER_ID = @orderId and ORDER_STATE != 0
        ORDER by CREATED_TIME DESC

        SELECT od.BOOK_ID bookId, b.BOOK_NAME bookName, bi.BOOK_PATH bookImage, b.BOOK_DISCOUNTED_PRICE unitPrice,
            od.ORDER_QUANTITY amount, od.ORDER_PRICE itemSubtotal
        from ORDER_DETAIL od join BOOK b on od.BOOK_ID = b.BOOK_ID join BOOK_IMAGES bi on b.BOOK_ID = bi.BOOK_ID
        where od.ORDER_ID = @orderId 
        
        select [ORDER_ID] orderId, o.USERID userId,
            [MERCHANDISE_SUBTOTAL] merchandiseSubtotal, [SHIPPING_FEE] shippingFee, 
            [SHIPPING_DISCOUNT_SUBTOTAL] shippingDiscountSubtotal, [HACHIKO_VOUCHER_APPLIED] hachikoVoucherApplied, 
            o.HPOINTS_REDEEMED hPointsRedeemed, [TOTAL_PAYMENT] totalPayment
        from H_ORDER o
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

GO
IF OBJECT_ID('sp_GetUserOrders') IS NOT NULL
	DROP PROC sp_GetUserOrders
GO
CREATE PROCEDURE sp_GetUserOrders (
    @userId NVARCHAR(100),
    @orderState INT,
    @limit INT,
    @offset INT    
)
AS
BEGIN TRANSACTION
	BEGIN TRY
        if @orderState IS NULL
        BEGIN
            SELECT o.ORDER_ID orderId, os.ORDER_STATE orderState, o.TOTAL_PAYMENT totalPayment
            FROM H_ORDER o
            JOIN (
                SELECT ORDER_ID, ORDER_STATE,
                    ROW_NUMBER() OVER (PARTITION BY ORDER_ID ORDER BY CREATED_TIME DESC) AS rn
                FROM ORDER_STATE
            ) os ON os.ORDER_ID = o.ORDER_ID AND os.rn = 1
            WHERE o.USERID = @userId and os.ORDER_STATE <> 0
            ORDER BY o.ORDER_DATE DESC, o.ORDER_ID DESC
            OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
        END
        ELSE
        BEGIN
            SELECT o.ORDER_ID orderId, os.ORDER_STATE orderState, o.TOTAL_PAYMENT totalPayment
            FROM H_ORDER o
            JOIN (
                SELECT ORDER_ID, ORDER_STATE,
                    ROW_NUMBER() OVER (PARTITION BY ORDER_ID ORDER BY CREATED_TIME DESC) AS rn
                FROM ORDER_STATE
            ) os ON os.ORDER_ID = o.ORDER_ID AND os.rn = 1
            WHERE o.USERID = @userId and os.ORDER_STATE = @orderState and os.ORDER_STATE <> 0
            ORDER BY o.ORDER_DATE DESC, o.ORDER_ID DESC
            OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
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

GO
IF OBJECT_ID('sp_GetAllOrders') IS NOT NULL
	DROP PROC sp_GetAllOrders
GO
CREATE PROCEDURE sp_GetAllOrders (
    @orderState INT,
    @limit INT,
    @offset INT    
)
AS
BEGIN TRANSACTION
	BEGIN TRY
        if @orderState IS NULL
        BEGIN
            SELECT o.ORDER_ID orderId, os.ORDER_STATE orderState, o.TOTAL_PAYMENT totalPayment
            FROM H_ORDER o
            JOIN (
                SELECT ORDER_ID, ORDER_STATE,
                    ROW_NUMBER() OVER (PARTITION BY ORDER_ID ORDER BY CREATED_TIME DESC) AS rn
                FROM ORDER_STATE
            ) os ON os.ORDER_ID = o.ORDER_ID AND os.rn = 1
            WHERE os.ORDER_STATE <> 0
            ORDER BY o.ORDER_DATE DESC, o.ORDER_ID DESC
            OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
        END
        ELSE
        BEGIN
            SELECT o.ORDER_ID orderId, os.ORDER_STATE orderState, o.TOTAL_PAYMENT totalPayment
            FROM H_ORDER o
            JOIN (
                SELECT ORDER_ID, ORDER_STATE,
                    ROW_NUMBER() OVER (PARTITION BY ORDER_ID ORDER BY CREATED_TIME DESC) AS rn
                FROM ORDER_STATE
            ) os ON os.ORDER_ID = o.ORDER_ID AND os.rn = 1
            WHERE os.ORDER_STATE = @orderState and os.ORDER_STATE <> 0
            ORDER BY o.ORDER_DATE DESC, o.ORDER_ID DESC
            OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
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

IF OBJECT_ID('sp_DeleteAllInitialOrders') IS NOT NULL
	DROP PROC sp_DeleteAllInitialOrders
GO
CREATE PROCEDURE sp_DeleteAllInitialOrders (
    @userId NVARCHAR(100)
)
AS
BEGIN TRANSACTION
	BEGIN TRY
        WHILE(exists(SELECT 1
					 from ORDER_STATE os join H_ORDER o on o.ORDER_ID = os.ORDER_ID
					 where o.USERID = @userId
                     group by os.ORDER_ID
                     having count(*) = 1))
        BEGIN
            declare @id char(7)
            
            SELECT @id = os.ORDER_ID
            from ORDER_STATE os join H_ORDER o on o.ORDER_ID = os.ORDER_ID
            where o.USERID = @userId
            group by os.ORDER_ID
            having count(*) = 1
            
            delete from ORDER_STATE where ORDER_ID = @id
            delete from ORDER_DETAIL where ORDER_ID = @id
            delete from H_ORDER where ORDER_ID = @id
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

IF OBJECT_ID('sp_UpdateOrder') IS NOT NULL
	DROP PROC sp_UpdateOrder
GO
CREATE PROCEDURE sp_UpdateOrder (
    @orderId char(7),
    @addrId char(10),
    @shippingFee INT,
    @paymentId CHAR(4),
    @useHPoint BIT,
    @hPoint INT
)
AS
BEGIN TRANSACTION
	BEGIN TRY
        IF @addrId IS NOT NULL
        BEGIN
            UPDATE H_ORDER
            SET ADDR_ID = @addrId, SHIPPING_FEE = @shippingFee, 
                TOTAL_PAYMENT = MERCHANDISE_SUBTOTAL + @shippingFee - SHIPPING_DISCOUNT_SUBTOTAL - HACHIKO_VOUCHER_APPLIED
            WHERE ORDER_ID = @orderId
        END

        IF @useHPoint IS NOT NULL
        BEGIN
            if @useHPoint = 1
            BEGIN
                UPDATE H_ORDER
                SET HPOINTS_REDEEMED = @hPoint, 
                    TOTAL_PAYMENT = MERCHANDISE_SUBTOTAL + SHIPPING_FEE - SHIPPING_DISCOUNT_SUBTOTAL - HACHIKO_VOUCHER_APPLIED - @hPoint
                WHERE ORDER_ID = @orderId
            END
            ELSE
            BEGIN
                UPDATE H_ORDER
                SET HPOINTS_REDEEMED = null, 
                    TOTAL_PAYMENT = MERCHANDISE_SUBTOTAL + SHIPPING_FEE - SHIPPING_DISCOUNT_SUBTOTAL - HACHIKO_VOUCHER_APPLIED
                WHERE ORDER_ID = @orderId
            END
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

GO
IF OBJECT_ID('sp_CreateNewState') IS NOT NULL
	DROP PROC sp_CreateNewState
GO
CREATE PROCEDURE sp_CreateNewState (
    @orderId char(7),
    @orderState INT
)
AS
BEGIN TRANSACTION
	BEGIN TRY
        if EXISTS (select 1 from ORDER_STATE where ORDER_ID = @orderId and ORDER_STATE = @orderState)
        BEGIN
            PRINT N'This state is already existed.'
            ROLLBACK 
            RETURN -1
        END
        INSERT into ORDER_STATE (ORDER_ID, ORDER_STATE, CREATED_TIME) values (@orderId, @orderState, GETDATE())

        -- Update stock after order has been canceled or refunded
        IF @orderState IN (-1, -3)
        BEGIN
            -- Create temp table to store BookId
            DECLARE @ResultTable TABLE (
                bookId char(7),
                quantity INT,
                rn int
            )
            INSERT INTO @ResultTable (bookId, quantity, rn)
            SELECT BOOK_ID bookId, ORDER_QUANTITY quantity, ROW_NUMBER() OVER(order by book_id) rn
            from ORDER_DETAIL
            WHERE ORDER_ID = @orderId

            -- Create index i to loop all temp table
            DECLARE @i int = 1

            -- Loop for all temp table
            WHILE EXISTS (select 1 from @ResultTable where rn = @i)
            BEGIN
                declare @bookId CHAR(7), @quantity INT
                SELECT @bookId = bookId, @quantity = quantity 
                from @ResultTable 
                where rn = @i

                -- Add stock
                UPDATE BOOK
                set STOCK = STOCK + @quantity
                where BOOK_ID = @bookId

                -- Increase index by 1
                set @i = @i + 1
            END
        END
        -- If success
        else IF @orderState IN (3) 
        BEGIN
            DECLARE @userId NVARCHAR(100), @totalPayment INT
            select @userId = USERID, @totalPayment = TOTAL_PAYMENT from H_ORDER where ORDER_ID = @orderId
            -- DECLARE @tier INT = (select TIER from ACCOUNT_DETAIL where EMAIL = @email)
            DECLARE @percentage FLOAT = 0

            -- IF @tier = 1
            -- BEGIN
            --     SET @percentage = 0.005
            -- END
            -- ELSE IF @tier = 2
            -- BEGIN
            --     SET @percentage = 0.01
            -- END
            -- ELSE IF @tier = 3
            -- BEGIN
            --     SET @percentage = 0.02
            -- END

            -- Calculate HPoint
            DECLARE @hPoint INT = ROUND(@totalPayment * @percentage, 0)

            -- Update HPoint
            -- UPDATE ACCOUNT_DETAIL set HPOINT = HPOINT + @hPoint WHERE EMAIL = @email
            -- UPDATE HPOINT_ACCUMULATION_YEAR set HPOINT = HPOINT + @hPoint WHERE EMAIL = @email and SAVED_YEAR = YEAR(GETDATE())
            
            -- Insert a new row in HPoint History
            -- INSERT into HPOINT_HISTORY (EMAIL, CHANGED_TIME, CHANGED_TYPE, CHANGED_POINTS, CHANGED_REASON) VALUES
            --     (@email, GETDATE(), 2, @hPoint, N'Tích lũy HPoint từ đơn hàng ' + @orderId + '.')
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

GO
IF OBJECT_ID('sp_IsPlacedOrder') IS NOT NULL
	DROP PROC sp_IsPlacedOrder
GO
CREATE PROCEDURE sp_IsPlacedOrder (
    @orderId char(7)
)
AS
BEGIN TRANSACTION
	BEGIN TRY
        if EXISTS (select 1 from ORDER_STATE where ORDER_ID = @orderId and ORDER_STATE = 1)
        BEGIN
            PRINT N'This order is already placed.'
            ROLLBACK 
            RETURN -1
        END
        SELECT TOTAL_PAYMENT totalPayment from H_ORDER where ORDER_ID = @orderId
	END TRY

	BEGIN CATCH
		PRINT N'Bị lỗi'
		ROLLBACK 
		RETURN 0
	END CATCH
COMMIT
RETURN 1
GO
