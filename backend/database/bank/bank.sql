/*==============================================================*/
/* DBMS name:      Microsoft SQL Server 2008                    */
/* Created on:     16/11/2023 11:14:13 am                       */
/*==============================================================*/
USE master
go
if DB_ID('bank') is not null
	drop database bank
GO 
CREATE DATABASE bank
GO
USE bank
GO

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('"TRANSACTION"') and o.name = 'FK_HAS_TRANSFERS_IN')
alter table "TRANSACTION"
   drop constraint FK_HAS_TRANSFERS_IN
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('"TRANSACTION"') and o.name = 'FK_HAS_TRANSFERS_OUT')
alter table "TRANSACTION"
   drop constraint FK_HAS_TRANSFERS_OUT
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ACCOUNT')
            and   type = 'U')
   drop table ACCOUNT
go

if exists (select 1
            from  sysindexes
           where  id    = object_id('"TRANSACTION"')
            and   name  = 'HAS_TRANSFERS_IN_FK'
            and   indid > 0
            and   indid < 255)
   drop index "TRANSACTION".HAS_TRANSFERS_IN_FK
go

if exists (select 1
            from  sysindexes
           where  id    = object_id('"TRANSACTION"')
            and   name  = 'HAS_TRANSFERS_OUT_FK'
            and   indid > 0
            and   indid < 255)
   drop index "TRANSACTION".HAS_TRANSFERS_OUT_FK
go

if exists (select 1
            from  sysobjects
           where  id = object_id('"TRANSACTION"')
            and   type = 'U')
   drop table "TRANSACTION"
go

/*==============================================================*/
/* Table: ACCOUNT                                               */
/*==============================================================*/
create table ACCOUNT (
   ACCOUNTID            char(5)              not null,
   BALANCE              float                null,
   FULL_NAME            varchar(100)         null,
   CREATED_TIME         datetime             null,
   ENC_PWD              varchar(300)         null,
   constraint PK_ACCOUNT primary key nonclustered (ACCOUNTID)
)
go

/*==============================================================*/
/* Table: "TRANSACTION"                                         */
/*==============================================================*/
create table "TRANSACTION" (
   TRANSACTIONID        char(5)              not null,
   PAYER                char(5)              not null,
   PAYEE                char(5)              not null,
   CHANGED_TIME         datetime             null,
   CHANGED_MONEY        int                  null,
   CHANGED_REASON       varchar(100)         null,
   TRANS_STATE          varchar(20)          null,
   constraint PK_TRANSACTION primary key nonclustered (TRANSACTIONID)
)
go

/*==============================================================*/
/* Index: HAS_TRANSFERS_OUT_FK                                  */
/*==============================================================*/
create index HAS_TRANSFERS_OUT_FK on "TRANSACTION" (
PAYER ASC
)
go

/*==============================================================*/
/* Index: HAS_TRANSFERS_IN_FK                                   */
/*==============================================================*/
create index HAS_TRANSFERS_IN_FK on "TRANSACTION" (
PAYEE ASC
)
go

alter table "TRANSACTION"
   add constraint FK_HAS_TRANSFERS_IN foreign key (PAYEE)
      references ACCOUNT (ACCOUNTID)
go

alter table "TRANSACTION"
   add constraint FK_HAS_TRANSFERS_OUT foreign key (PAYER)
      references ACCOUNT (ACCOUNTID)
go

