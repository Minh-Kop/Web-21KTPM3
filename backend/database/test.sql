GO
DELETE from BOOK_IMAGES where BOOK_ID = 'BK00034'
go
delete from WRITTEN_BY where BOOK_ID = 'BK00034'
go
delete from BOOK_DETAIL where BOOK_ID = 'BK00034'
go
delete from BOOK where BOOK_ID = 'BK00034'

select BOOK_ID, STOCK, AVG_RATING, COUNT_RATING from BOOK where BOOK_ID = 'BK00034'
select * from BOOK_DETAIL where BOOK_ID = 'BK00034'
select w.*, a.AUTHOR_NAME from WRITTEN_BY w join AUTHOR a on w.AUTHOR_ID = a.AUTHOR_ID where BOOK_ID = 'BK00034'
SELECT * from BOOK_IMAGES where BOOK_ID = 'BK00034'

select * from WRITTEN_BY where BOOK_ID = 'BK00034'

update BOOK set SOFT_DELETE = 0 where BOOK_ID = 'BK00034'

select * from ACCOUNT where EMAIL = 'khoiminhtrannguyen@gmail.com'
select * from ACCOUNT_DETAIL where EMAIL = 'khoiminhtrannguyen@gmail.com'
select * from HPOINT_ACCUMULATION_YEAR where EMAIL = 'khoiminhtrannguyen@gmail.com'

update ACCOUNT set HROLE = 2 where EMAIL = 'khoiminhtrannguyen@gmail.com'
update ACCOUNT_DETAIL set TIER = 2 where EMAIL = 'khoiminhtrannguyen@gmail.com'

-- ALTER TABLE ACCOUNT
-- ADD CONSTRAINT UniquePhoneNumber UNIQUE (Phone_number);

select GETDATE() as date, DATEADD(second, -1, GETDATE())
select DATEADD(second, -1, GETDATE()) as date

insert into HPOINT_HISTORY (EMAIL, CHANGED_TIME, CHANGED_POINTS, CHANGED_TYPE) values ('khoiminhtrannguyen@gmail.com', GETDATE(), 10000, 1)
insert into HPOINT_HISTORY (EMAIL, CHANGED_TIME, CHANGED_POINTS, CHANGED_TYPE) values ('khoiminhtrannguyen@gmail.com', GETDATE(), 100, -1)

select * from HPOINT_HISTORY where EMAIL = 'khoiminhtrannguyen@gmail.com' order by CHANGED_TIME desc

delete from user_voucher where VOUCHER_ID = ''

SELECT * from VOUCHER_TYPE
select * from VOUCHER
select * from user_voucher

INSERT into user_voucher (VOUCHER_ID, EMAIL) values ('VC00001', 'khoiminhtrannguyen@gmail.com')
INSERT into user_voucher (VOUCHER_ID, EMAIL) values ('VC00002', 'khoiminhtrannguyen@gmail.com')
INSERT into user_voucher (VOUCHER_ID, EMAIL) values ('VC00003', 'khoiminhtrannguyen@gmail.com')
INSERT into user_voucher (VOUCHER_ID, EMAIL) values ('VC00004', 'khoiminhtrannguyen@gmail.com')

delete from ORDER_STATE where ORDER_ID in (select ORDER_ID from H_ORDER where EMAIL = 'khoiminhtrannguyen@gmail.com')
delete from ORDER_DETAIL where ORDER_ID in (select ORDER_ID from H_ORDER where EMAIL = 'khoiminhtrannguyen@gmail.com')
delete from H_ORDER where ORDER_ID in (select ORDER_ID from H_ORDER where EMAIL = 'khoiminhtrannguyen@gmail.com')
delete from ORDER_VOUCHER where ORDER_ID in (select ORDER_ID from H_ORDER where EMAIL = 'khoiminhtrannguyen@gmail.com')

SELECT * from H_ORDER
select * from ORDER_STATE
select * from ORDER_DETAIL
select * from ORDER_VOUCHER

select *
from ACCOUNT_DETAIL
SELECT *
from HPOINT_ACCUMULATION_YEAR
SELECT [EMAIL] email, [CHANGED_TYPE] changedType, [CHANGED_TIME] changedTime, [CHANGED_POINTS] changedPoints,
[CHANGED_REASON] changedReason from HPOINT_HISTORY

select * from ORDER_REVIEW

delete from ORDER_REVIEW

select * from CATEGORY

SELECT FULLTEXTSERVICEPROPERTY('IsFullTextInstalled') AS [FULLTEXTSERVICE]

select * from HPOINT_ACCUMULATION_YEAR