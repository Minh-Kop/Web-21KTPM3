GO
IF OBJECT_ID('sp_GetStatistic') IS NOT NULL
	DROP PROC sp_GetStatistic
GO
CREATE PROCEDURE sp_GetStatistic
AS
BEGIN TRANSACTION
	BEGIN TRY
        select o.ORDER_DATE orderDate, count(o.ORDER_ID) dailyOrder 
        FROM H_ORDER o
        JOIN (
            SELECT ORDER_ID, ORDER_STATE,
                ROW_NUMBER() OVER (PARTITION BY ORDER_ID ORDER BY CREATED_TIME DESC) AS rn
            FROM ORDER_STATE
        ) os ON os.ORDER_ID = o.ORDER_ID AND os.rn = 1
        GROUP BY o.ORDER_DATE

        select MONTH(os.CREATED_TIME) orderMonth, YEAR(os.CREATED_TIME) orderYear, sum(TOTAL_PAYMENT) monthlyRevenue 
        FROM H_ORDER o
        JOIN (
            SELECT ORDER_ID, ORDER_STATE,CREATED_TIME,
                ROW_NUMBER() OVER (PARTITION BY ORDER_ID ORDER BY CREATED_TIME DESC) AS rn
            FROM ORDER_STATE
        ) os ON os.ORDER_ID = o.ORDER_ID AND os.rn = 1
        WHERE os.ORDER_STATE = 3
        GROUP BY MONTH(os.CREATED_TIME), YEAR(os.CREATED_TIME)
	END TRY

	BEGIN CATCH
		PRINT N'Bị lỗi'
		ROLLBACK 
		RETURN 0
	END CATCH
COMMIT
RETURN 1
GO