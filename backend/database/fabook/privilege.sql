USE fabook_db
GO

DROP FULLTEXT INDEX ON BOOK
go
DROP FULLTEXT INDEX ON BOOK_DETAIL
go
DROP FULLTEXT INDEX ON category
go
DROP FULLTEXT CATALOG book_catalog
go

DROP USER [fabook_admin]
exec sp_droplogin [fabook_admin]
go

CREATE LOGIN [fabook_admin] WITH PASSWORD = 'Webktpm23$'
GO

CREATE USER [fabook_admin] for LOGIN [fabook_admin]
EXEC sp_addrolemember 'db_owner', 'fabook_admin'
go