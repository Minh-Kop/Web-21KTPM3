USE fabank_db
go

DROP USER [fabank_admin]
GO

CREATE USER [fabank_admin] for LOGIN [fabook_admin]
EXEC sp_addrolemember 'db_owner', 'fabank_admin'
go