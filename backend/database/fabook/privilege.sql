go
DROP USER [fabook_admin]
exec sp_droplogin [fabook_admin]
go

CREATE LOGIN [fabook_admin] WITH PASSWORD = 'Webktpm23$'
USE fabook_db
CREATE USER [fabook_admin] for LOGIN [fabook_admin]
EXEC sp_addrolemember 'db_owner', 'fabook_admin'
