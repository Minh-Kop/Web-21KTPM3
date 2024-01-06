/*==============================================================*/
/* DBMS name:      Microsoft SQL Server 2008                    */
/* Created on:     3/1/2024 10:06:40 pm                         */
/*==============================================================*/
USE master
go
if DB_ID('fabank_db') is not null
	drop database fabank_db
GO 
CREATE DATABASE fabank_db
GO
USE fabank_db
GO

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('TRANSFER') and o.name = 'FK_TRANSFER_TRANSFER_ACCOUNT')
alter table TRANSFER
   drop constraint FK_TRANSFER_TRANSFER_ACCOUNT
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('TRANSFER') and o.name = 'FK_TRANSFER_TRANSFER2_TRANSACT')
alter table TRANSFER
   drop constraint FK_TRANSFER_TRANSFER2_TRANSACT
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ACCOUNT')
            and   type = 'U')
   drop table ACCOUNT
go

if exists (select 1
            from  sysobjects
           where  id = object_id('"TRANSACTION"')
            and   type = 'U')
   drop table "TRANSACTION"
go

if exists (select 1
            from  sysindexes
           where  id    = object_id('TRANSFER')
            and   name  = 'TRANSFER2_FK'
            and   indid > 0
            and   indid < 255)
   drop index TRANSFER.TRANSFER2_FK
go

if exists (select 1
            from  sysindexes
           where  id    = object_id('TRANSFER')
            and   name  = 'TRANSFER_FK'
            and   indid > 0
            and   indid < 255)
   drop index TRANSFER.TRANSFER_FK
go

if exists (select 1
            from  sysobjects
           where  id = object_id('TRANSFER')
            and   type = 'U')
   drop table TRANSFER
go

/*==============================================================*/
/* Table: ACCOUNT                                               */
/*==============================================================*/
create table ACCOUNT (
   ACCOUNTID            char(5)              not null,
   USERNAME             varchar(50)          null,
   ENC_PWD              varchar(300)         null,
   BALANCE              bigint               null,
   constraint PK_ACCOUNT primary key nonclustered (ACCOUNTID)
)
go

/*==============================================================*/
/* Table: "TRANSACTION"                                         */
/*==============================================================*/
create table "TRANSACTION" (
   TRANSACTIONID        char(5)              not null,
   CHANGED_TIME         datetime             null,
   CHANGED_MONEY        bigint               null,
   CHANGED_REASON       nvarchar(300)         null,
   constraint PK_TRANSACTION primary key nonclustered (TRANSACTIONID)
)
go

/*==============================================================*/
/* Table: TRANSFER                                              */
/*==============================================================*/
create table TRANSFER (
   ACCOUNTID            char(5)              not null,
   TRANSACTIONID        char(5)              not null,
   TRANSFER_TYPE        int                  null,
   BALANCE              bigint               null,
   constraint PK_TRANSFER primary key (ACCOUNTID, TRANSACTIONID)
)
go

/*==============================================================*/
/* Index: TRANSFER_FK                                           */
/*==============================================================*/
create index TRANSFER_FK on TRANSFER (
ACCOUNTID ASC
)
go

/*==============================================================*/
/* Index: TRANSFER2_FK                                          */
/*==============================================================*/
create index TRANSFER2_FK on TRANSFER (
TRANSACTIONID ASC
)
go

alter table TRANSFER
   add constraint FK_TRANSFER_TRANSFER_ACCOUNT foreign key (ACCOUNTID)
      references ACCOUNT (ACCOUNTID)
go

alter table TRANSFER
   add constraint FK_TRANSFER_TRANSFER2_TRANSACT foreign key (TRANSACTIONID)
      references "TRANSACTION" (TRANSACTIONID)
go

