go
DROP USER [hachiko_admin]
exec sp_droplogin [hachiko_admin]
go
CREATE LOGIN [hachiko_admin] WITH PASSWORD = 'Kohachi123', DEFAULT_DATABASE = DB_Hachiko
CREATE USER [hachiko_admin] FROM LOGIN [hachiko_admin]
EXEC sp_addrolemember 'db_owner', 'hachiko_admin'
