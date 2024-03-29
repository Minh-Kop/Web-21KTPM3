GO
IF OBJECT_ID('t_UpdateDiscountedPrice') IS NOT NULL
	DROP TRIGGER t_UpdateDiscountedPrice
GO
CREATE TRIGGER t_UpdateDiscountedPrice
ON book
AFTER INSERT, UPDATE
AS
BEGIN
    UPDATE BOOK
    SET BOOK_DISCOUNTED_PRICE = i.BOOK_PRICE * (1 - i.DISCOUNTED_NUMBER / 100.0)
    FROM BOOK b
    JOIN inserted i ON b.BOOK_ID = i.BOOK_ID;
END;

GO
IF OBJECT_ID('t_UpdatePasswordChangedAt') IS NOT NULL
	DROP TRIGGER t_UpdatePasswordChangedAt
GO
CREATE TRIGGER t_UpdatePasswordChangedAt
ON ACCOUNT
AFTER UPDATE
AS
BEGIN
    if UPDATE(ENC_PWD)
    BEGIN
        UPDATE ACCOUNT
        SET PASSWORD_CHANGED_AT = DATEADD(second, -1, GETDATE())
        FROM ACCOUNT a
        JOIN inserted i ON a.EMAIL = i.EMAIL;
    END
END;
