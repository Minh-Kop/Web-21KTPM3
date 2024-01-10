/*==============================================================*/
/* DBMS name:      Microsoft SQL Server 2008                    */
/* Created on:     9/1/2024 6:43:46 pm                          */
/*==============================================================*/
USE master
go
if DB_ID('fabook_db') is not null
	drop database fabook_db
GO 
CREATE DATABASE fabook_db
GO
USE fabook_db
GO

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('BOOK') and o.name = 'FK_BOOK_HAS_CATEG_CATEGORY')
alter table BOOK
   drop constraint FK_BOOK_HAS_CATEG_CATEGORY
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('BOOK_DETAIL') and o.name = 'FK_BOOK_DET_INCLUDE_B_BOOK')
alter table BOOK_DETAIL
   drop constraint FK_BOOK_DET_INCLUDE_B_BOOK
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('BOOK_DETAIL') and o.name = 'FK_BOOK_DET_PUBLISHED_PUBLISHE')
alter table BOOK_DETAIL
   drop constraint FK_BOOK_DET_PUBLISHED_PUBLISHE
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('BOOK_IMAGES') and o.name = 'FK_BOOK_IMA_HAS_IMAGE_BOOK')
alter table BOOK_IMAGES
   drop constraint FK_BOOK_IMA_HAS_IMAGE_BOOK
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('CART') and o.name = 'FK_CART_HAS_CART_ACCOUNT')
alter table CART
   drop constraint FK_CART_HAS_CART_ACCOUNT
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('CART_DETAIL') and o.name = 'FK_CART_DET_CART_DETA_CART')
alter table CART_DETAIL
   drop constraint FK_CART_DET_CART_DETA_CART
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('CART_DETAIL') and o.name = 'FK_CART_DET_CART_DETA_BOOK')
alter table CART_DETAIL
   drop constraint FK_CART_DET_CART_DETA_BOOK
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('CATEGORY') and o.name = 'FK_CATEGORY_HAVE_PARE_CATEGORY')
alter table CATEGORY
   drop constraint FK_CATEGORY_HAVE_PARE_CATEGORY
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('DISTRICT') and o.name = 'FK_DISTRICT_HAS_DISTR_PROVINCE')
alter table DISTRICT
   drop constraint FK_DISTRICT_HAS_DISTR_PROVINCE
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('H_ORDER') and o.name = 'FK_H_ORDER_HAS_ORDER_ACCOUNT')
alter table H_ORDER
   drop constraint FK_H_ORDER_HAS_ORDER_ACCOUNT
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('H_ORDER') and o.name = 'FK_H_ORDER_HAS_SHIPP_SHIPPING')
alter table H_ORDER
   drop constraint FK_H_ORDER_HAS_SHIPP_SHIPPING
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('ORDER_DETAIL') and o.name = 'FK_ORDER_DE_ORDER_DET_BOOK')
alter table ORDER_DETAIL
   drop constraint FK_ORDER_DE_ORDER_DET_BOOK
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('ORDER_DETAIL') and o.name = 'FK_ORDER_DE_ORDER_DET_H_ORDER')
alter table ORDER_DETAIL
   drop constraint FK_ORDER_DE_ORDER_DET_H_ORDER
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('ORDER_REVIEW') and o.name = 'FK_ORDER_RE_ORDER_REV_H_ORDER')
alter table ORDER_REVIEW
   drop constraint FK_ORDER_RE_ORDER_REV_H_ORDER
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('ORDER_REVIEW') and o.name = 'FK_ORDER_RE_ORDER_REV_BOOK')
alter table ORDER_REVIEW
   drop constraint FK_ORDER_RE_ORDER_REV_BOOK
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('ORDER_STATE') and o.name = 'FK_ORDER_ST_HAS_STATE_H_ORDER')
alter table ORDER_STATE
   drop constraint FK_ORDER_ST_HAS_STATE_H_ORDER
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('SHIPPING_ADDRESS') and o.name = 'FK_SHIPPING_INCLUDE_D_DISTRICT')
alter table SHIPPING_ADDRESS
   drop constraint FK_SHIPPING_INCLUDE_D_DISTRICT
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('SHIPPING_ADDRESS') and o.name = 'FK_SHIPPING_INCLUDE_P_PROVINCE')
alter table SHIPPING_ADDRESS
   drop constraint FK_SHIPPING_INCLUDE_P_PROVINCE
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('SHIPPING_ADDRESS') and o.name = 'FK_SHIPPING_INCLUDE_W_WARD')
alter table SHIPPING_ADDRESS
   drop constraint FK_SHIPPING_INCLUDE_W_WARD
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('SHIPPING_ADDRESS') and o.name = 'FK_SHIPPING_OF_ACCOUN_ACCOUNT')
alter table SHIPPING_ADDRESS
   drop constraint FK_SHIPPING_OF_ACCOUN_ACCOUNT
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('WARD') and o.name = 'FK_WARD_HAS_WARD_DISTRICT')
alter table WARD
   drop constraint FK_WARD_HAS_WARD_DISTRICT
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('WRITTEN_BY') and o.name = 'FK_WRITTEN__WRITTEN_B_BOOK_DET')
alter table WRITTEN_BY
   drop constraint FK_WRITTEN__WRITTEN_B_BOOK_DET
go

if exists (select 1
   from sys.sysreferences r join sys.sysobjects o on (o.id = r.constid and o.type = 'F')
   where r.fkeyid = object_id('WRITTEN_BY') and o.name = 'FK_WRITTEN__WRITTEN_B_AUTHOR')
alter table WRITTEN_BY
   drop constraint FK_WRITTEN__WRITTEN_B_AUTHOR
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ACCOUNT')
            and   type = 'U')
   drop table ACCOUNT
go

if exists (select 1
            from  sysobjects
           where  id = object_id('AUTHOR')
            and   type = 'U')
   drop table AUTHOR
go

if exists (select 1
            from  sysindexes
           where  id    = object_id('BOOK')
            and   name  = 'HAS_CATEGORY_FK'
            and   indid > 0
            and   indid < 255)
   drop index BOOK.HAS_CATEGORY_FK
go

if exists (select 1
            from  sysobjects
           where  id = object_id('BOOK')
            and   type = 'U')
   drop table BOOK
go

if exists (select 1
            from  sysindexes
           where  id    = object_id('BOOK_DETAIL')
            and   name  = 'PUBLISHED_BY_FK'
            and   indid > 0
            and   indid < 255)
   drop index BOOK_DETAIL.PUBLISHED_BY_FK
go

if exists (select 1
            from  sysobjects
           where  id = object_id('BOOK_DETAIL')
            and   type = 'U')
   drop table BOOK_DETAIL
go

if exists (select 1
            from  sysindexes
           where  id    = object_id('BOOK_IMAGES')
            and   name  = 'HAS_IMAGES_FK'
            and   indid > 0
            and   indid < 255)
   drop index BOOK_IMAGES.HAS_IMAGES_FK
go

if exists (select 1
            from  sysobjects
           where  id = object_id('BOOK_IMAGES')
            and   type = 'U')
   drop table BOOK_IMAGES
go

if exists (select 1
            from  sysindexes
           where  id    = object_id('CART')
            and   name  = 'HAS_CART2_FK'
            and   indid > 0
            and   indid < 255)
   drop index CART.HAS_CART2_FK
go

if exists (select 1
            from  sysobjects
           where  id = object_id('CART')
            and   type = 'U')
   drop table CART
go

if exists (select 1
            from  sysindexes
           where  id    = object_id('CART_DETAIL')
            and   name  = 'CART_DETAIL2_FK'
            and   indid > 0
            and   indid < 255)
   drop index CART_DETAIL.CART_DETAIL2_FK
go

if exists (select 1
            from  sysindexes
           where  id    = object_id('CART_DETAIL')
            and   name  = 'CART_DETAIL_FK'
            and   indid > 0
            and   indid < 255)
   drop index CART_DETAIL.CART_DETAIL_FK
go

if exists (select 1
            from  sysobjects
           where  id = object_id('CART_DETAIL')
            and   type = 'U')
   drop table CART_DETAIL
go

if exists (select 1
            from  sysindexes
           where  id    = object_id('CATEGORY')
            and   name  = 'HAVE_PARENT_CATEGORY_FK'
            and   indid > 0
            and   indid < 255)
   drop index CATEGORY.HAVE_PARENT_CATEGORY_FK
go

if exists (select 1
            from  sysobjects
           where  id = object_id('CATEGORY')
            and   type = 'U')
   drop table CATEGORY
go

if exists (select 1
            from  sysindexes
           where  id    = object_id('DISTRICT')
            and   name  = 'HAS_DISTRICT_FK'
            and   indid > 0
            and   indid < 255)
   drop index DISTRICT.HAS_DISTRICT_FK
go

if exists (select 1
            from  sysobjects
           where  id = object_id('DISTRICT')
            and   type = 'U')
   drop table DISTRICT
go

if exists (select 1
            from  sysindexes
           where  id    = object_id('H_ORDER')
            and   name  = 'HAS_SHIPPING_ADDRESS_FK'
            and   indid > 0
            and   indid < 255)
   drop index H_ORDER.HAS_SHIPPING_ADDRESS_FK
go

if exists (select 1
            from  sysindexes
           where  id    = object_id('H_ORDER')
            and   name  = 'HAS_ORDER_FK'
            and   indid > 0
            and   indid < 255)
   drop index H_ORDER.HAS_ORDER_FK
go

if exists (select 1
            from  sysobjects
           where  id = object_id('H_ORDER')
            and   type = 'U')
   drop table H_ORDER
go

if exists (select 1
            from  sysindexes
           where  id    = object_id('ORDER_DETAIL')
            and   name  = 'ORDER_DETAIL2_FK'
            and   indid > 0
            and   indid < 255)
   drop index ORDER_DETAIL.ORDER_DETAIL2_FK
go

if exists (select 1
            from  sysindexes
           where  id    = object_id('ORDER_DETAIL')
            and   name  = 'ORDER_DETAIL_FK'
            and   indid > 0
            and   indid < 255)
   drop index ORDER_DETAIL.ORDER_DETAIL_FK
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ORDER_DETAIL')
            and   type = 'U')
   drop table ORDER_DETAIL
go

if exists (select 1
            from  sysindexes
           where  id    = object_id('ORDER_REVIEW')
            and   name  = 'ORDER_REVIEW2_FK'
            and   indid > 0
            and   indid < 255)
   drop index ORDER_REVIEW.ORDER_REVIEW2_FK
go

if exists (select 1
            from  sysindexes
           where  id    = object_id('ORDER_REVIEW')
            and   name  = 'ORDER_REVIEW_FK'
            and   indid > 0
            and   indid < 255)
   drop index ORDER_REVIEW.ORDER_REVIEW_FK
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ORDER_REVIEW')
            and   type = 'U')
   drop table ORDER_REVIEW
go

if exists (select 1
            from  sysindexes
           where  id    = object_id('ORDER_STATE')
            and   name  = 'HAS_STATE_FK'
            and   indid > 0
            and   indid < 255)
   drop index ORDER_STATE.HAS_STATE_FK
go

if exists (select 1
            from  sysobjects
           where  id = object_id('ORDER_STATE')
            and   type = 'U')
   drop table ORDER_STATE
go

if exists (select 1
            from  sysobjects
           where  id = object_id('PROVINCE')
            and   type = 'U')
   drop table PROVINCE
go

if exists (select 1
            from  sysobjects
           where  id = object_id('PUBLISHER')
            and   type = 'U')
   drop table PUBLISHER
go

if exists (select 1
            from  sysindexes
           where  id    = object_id('SHIPPING_ADDRESS')
            and   name  = 'INCLUDE_WARD_FK'
            and   indid > 0
            and   indid < 255)
   drop index SHIPPING_ADDRESS.INCLUDE_WARD_FK
go

if exists (select 1
            from  sysindexes
           where  id    = object_id('SHIPPING_ADDRESS')
            and   name  = 'INCLUDE_DISTRICT_FK'
            and   indid > 0
            and   indid < 255)
   drop index SHIPPING_ADDRESS.INCLUDE_DISTRICT_FK
go

if exists (select 1
            from  sysindexes
           where  id    = object_id('SHIPPING_ADDRESS')
            and   name  = 'INCLUDE_PROVINCE_FK'
            and   indid > 0
            and   indid < 255)
   drop index SHIPPING_ADDRESS.INCLUDE_PROVINCE_FK
go

if exists (select 1
            from  sysindexes
           where  id    = object_id('SHIPPING_ADDRESS')
            and   name  = 'OF_ACCOUNT_FK'
            and   indid > 0
            and   indid < 255)
   drop index SHIPPING_ADDRESS.OF_ACCOUNT_FK
go

if exists (select 1
            from  sysobjects
           where  id = object_id('SHIPPING_ADDRESS')
            and   type = 'U')
   drop table SHIPPING_ADDRESS
go

if exists (select 1
            from  sysindexes
           where  id    = object_id('WARD')
            and   name  = 'HAS_WARD_FK'
            and   indid > 0
            and   indid < 255)
   drop index WARD.HAS_WARD_FK
go

if exists (select 1
            from  sysobjects
           where  id = object_id('WARD')
            and   type = 'U')
   drop table WARD
go

if exists (select 1
            from  sysindexes
           where  id    = object_id('WRITTEN_BY')
            and   name  = 'WRITTEN_BY2_FK'
            and   indid > 0
            and   indid < 255)
   drop index WRITTEN_BY.WRITTEN_BY2_FK
go

if exists (select 1
            from  sysindexes
           where  id    = object_id('WRITTEN_BY')
            and   name  = 'WRITTEN_BY_FK'
            and   indid > 0
            and   indid < 255)
   drop index WRITTEN_BY.WRITTEN_BY_FK
go

if exists (select 1
            from  sysobjects
           where  id = object_id('WRITTEN_BY')
            and   type = 'U')
   drop table WRITTEN_BY
go

/*==============================================================*/
/* Table: ACCOUNT                                               */
/*==============================================================*/
create table ACCOUNT (
   USERID               char(5)              not null,
   USERNAME             nvarchar(50)          not null,
   EMAIL                nvarchar(100)         not null,
   FULLNAME             nvarchar(50)          null,
   PHONE_NUMBER         char(10)             null,
   ENC_PWD              nvarchar(300)         null,
   AVATAR_PATH          nvarchar(500)         null,
   HROLE                int                  null,
   VERIFIED             bit                  null,
   TOKEN                char(64)             null,
   PASSWORD_CHANGED_AT  datetime             null,
   BIRTHDAY             datetime             null,
   GENDER               bit                  null,
   SOFT_DELETE          bit                  null,
   IS_OAUTH2            bit                  null,
   constraint PK_ACCOUNT primary key nonclustered (USERID)
)
go

/*==============================================================*/
/* Table: AUTHOR                                                */
/*==============================================================*/
create table AUTHOR (
   AUTHOR_ID            char(5)              not null,
   AUTHOR_NAME          nvarchar(50)          null,
   constraint PK_AUTHOR primary key nonclustered (AUTHOR_ID)
)
go

/*==============================================================*/
/* Table: BOOK                                                  */
/*==============================================================*/
create table BOOK (
   BOOK_ID              char(5)              not null,
   CATE_ID              char(4)              not null,
   BOOK_NAME            nvarchar(100)         null,
   BOOK_PRICE           int                  null,
   DISCOUNTED_NUMBER    int                  null,
   BOOK_DISCOUNTED_PRICE int                  null,
   AVG_RATING           float                null,
   COUNT_RATINGS        int                  null,
   STOCK                int                  null,
   ADDED_TIME           datetime             null,
   SOFT_DELETE          bit                  null,
   constraint PK_BOOK primary key nonclustered (BOOK_ID)
)
go

/*==============================================================*/
/* Index: HAS_CATEGORY_FK                                       */
/*==============================================================*/
create index HAS_CATEGORY_FK on BOOK (
CATE_ID ASC
)
go

/*==============================================================*/
/* Table: BOOK_DETAIL                                           */
/*==============================================================*/
create table BOOK_DETAIL (
   BOOK_ID              char(5)              not null,
   PUB_ID               char(5)              not null,
   BOOK_FORMAT          nvarchar(50)          null,
   PUBLISHED_YEAR       int                  null,
   NUMBER_PAGE          int                  null,
   DIMENSIONS           nvarchar(30)          null,
   BOOK_WEIGHT          int                  null,
   BOOK_DESC            nvarchar(2000)        null,
   constraint PK_BOOK_DETAIL primary key (BOOK_ID)
)
go

/*==============================================================*/
/* Index: PUBLISHED_BY_FK                                       */
/*==============================================================*/
create index PUBLISHED_BY_FK on BOOK_DETAIL (
PUB_ID ASC
)
go

/*==============================================================*/
/* Table: BOOK_IMAGES                                           */
/*==============================================================*/
create table BOOK_IMAGES (
   BOOK_ID              char(5)              not null,
   IMAGE_ID             int                  not null,
   BOOK_PATH            nvarchar(500)         null,
   constraint PK_BOOK_IMAGES primary key nonclustered (BOOK_ID, IMAGE_ID)
)
go

/*==============================================================*/
/* Index: HAS_IMAGES_FK                                         */
/*==============================================================*/
create index HAS_IMAGES_FK on BOOK_IMAGES (
BOOK_ID ASC
)
go

/*==============================================================*/
/* Table: CART                                                  */
/*==============================================================*/
create table CART (
   CART_ID              char(5)              not null,
   USERID               char(5)              not null,
   CART_TOTAL           int                  null,
   CART_COUNT           int                  null,
   constraint PK_CART primary key nonclustered (CART_ID)
)
go

/*==============================================================*/
/* Index: HAS_CART2_FK                                          */
/*==============================================================*/
create index HAS_CART2_FK on CART (
USERID ASC
)
go

/*==============================================================*/
/* Table: CART_DETAIL                                           */
/*==============================================================*/
create table CART_DETAIL (
   CART_ID              char(5)              not null,
   BOOK_ID              char(5)              not null,
   CART_QUANTITY        int                  null,
   CART_PRICE           int                  null,
   IS_CLICKED           bit                  null,
   constraint PK_CART_DETAIL primary key (CART_ID, BOOK_ID)
)
go

/*==============================================================*/
/* Index: CART_DETAIL_FK                                        */
/*==============================================================*/
create index CART_DETAIL_FK on CART_DETAIL (
CART_ID ASC
)
go

/*==============================================================*/
/* Index: CART_DETAIL2_FK                                       */
/*==============================================================*/
create index CART_DETAIL2_FK on CART_DETAIL (
BOOK_ID ASC
)
go

/*==============================================================*/
/* Table: CATEGORY                                              */
/*==============================================================*/
create table CATEGORY (
   CATE_ID              char(4)              not null,
   PARENT_ID            char(4)              null,
   CATE_NAME            nvarchar(50)          null,
   SOFT_DELETE          bit                  null,
   constraint PK_CATEGORY primary key nonclustered (CATE_ID)
)
go

/*==============================================================*/
/* Index: HAVE_PARENT_CATEGORY_FK                               */
/*==============================================================*/
create index HAVE_PARENT_CATEGORY_FK on CATEGORY (
PARENT_ID ASC
)
go

/*==============================================================*/
/* Table: DISTRICT                                              */
/*==============================================================*/
create table DISTRICT (
   DIST_ID              char(5)              not null,
   PROV_ID              char(5)              not null,
   DIST_NAME            nvarchar(50)          null,
   constraint PK_DISTRICT primary key nonclustered (DIST_ID)
)
go

/*==============================================================*/
/* Index: HAS_DISTRICT_FK                                       */
/*==============================================================*/
create index HAS_DISTRICT_FK on DISTRICT (
PROV_ID ASC
)
go

/*==============================================================*/
/* Table: H_ORDER                                               */
/*==============================================================*/
create table H_ORDER (
   ORDER_ID             char(5)              not null,
   USERID               char(5)              not null,
   ADDR_ID              char(5)              not null,
   ORDER_DATE           datetime             null,
   MERCHANDISE_SUBTOTAL int                  null,
   SHIPPING_FEE         int                  null,
   SHIPPING_DISCOUNT_SUBTOTAL int                  null,
   HACHIKO_VOUCHER_APPLIED int                  null,
   HPOINTS_REDEEMED     int                  null,
   TOTAL_PAYMENT        int                  null,
   SOFT_DELETE          bit                  null,
   constraint PK_H_ORDER primary key nonclustered (ORDER_ID)
)
go

/*==============================================================*/
/* Index: HAS_ORDER_FK                                          */
/*==============================================================*/
create index HAS_ORDER_FK on H_ORDER (
USERID ASC
)
go

/*==============================================================*/
/* Index: HAS_SHIPPING_ADDRESS_FK                               */
/*==============================================================*/
create index HAS_SHIPPING_ADDRESS_FK on H_ORDER (
ADDR_ID ASC
)
go

/*==============================================================*/
/* Table: ORDER_DETAIL                                          */
/*==============================================================*/
create table ORDER_DETAIL (
   BOOK_ID              char(5)              not null,
   ORDER_ID             char(5)              not null,
   ORDER_QUANTITY       int                  null,
   ORDER_PRICE          int                  null,
   constraint PK_ORDER_DETAIL primary key (BOOK_ID, ORDER_ID)
)
go

/*==============================================================*/
/* Index: ORDER_DETAIL_FK                                       */
/*==============================================================*/
create index ORDER_DETAIL_FK on ORDER_DETAIL (
BOOK_ID ASC
)
go

/*==============================================================*/
/* Index: ORDER_DETAIL2_FK                                      */
/*==============================================================*/
create index ORDER_DETAIL2_FK on ORDER_DETAIL (
ORDER_ID ASC
)
go

/*==============================================================*/
/* Table: ORDER_REVIEW                                          */
/*==============================================================*/
create table ORDER_REVIEW (
   ORDER_ID             char(5)              not null,
   BOOK_ID              char(5)              not null,
   RATING               int                  null,
   REVIEW               nvarchar(800)         null,
   CREATED_TIME         datetime             null,
   constraint PK_ORDER_REVIEW primary key (ORDER_ID, BOOK_ID)
)
go

/*==============================================================*/
/* Index: ORDER_REVIEW_FK                                       */
/*==============================================================*/
create index ORDER_REVIEW_FK on ORDER_REVIEW (
ORDER_ID ASC
)
go

/*==============================================================*/
/* Index: ORDER_REVIEW2_FK                                      */
/*==============================================================*/
create index ORDER_REVIEW2_FK on ORDER_REVIEW (
BOOK_ID ASC
)
go

/*==============================================================*/
/* Table: ORDER_STATE                                           */
/*==============================================================*/
create table ORDER_STATE (
   ORDER_ID             char(5)              not null,
   ORDER_STATE          int                  not null,
   CREATED_TIME         datetime             null,
   constraint PK_ORDER_STATE primary key nonclustered (ORDER_ID, ORDER_STATE)
)
go

/*==============================================================*/
/* Index: HAS_STATE_FK                                          */
/*==============================================================*/
create index HAS_STATE_FK on ORDER_STATE (
ORDER_ID ASC
)
go

/*==============================================================*/
/* Table: PROVINCE                                              */
/*==============================================================*/
create table PROVINCE (
   PROV_ID              char(5)              not null,
   PROV_NAME            nvarchar(100)         null,
   constraint PK_PROVINCE primary key nonclustered (PROV_ID)
)
go

/*==============================================================*/
/* Table: PUBLISHER                                             */
/*==============================================================*/
create table PUBLISHER (
   PUB_ID               char(5)              not null,
   PUB_NAME             nvarchar(50)          null,
   constraint PK_PUBLISHER primary key nonclustered (PUB_ID)
)
go

/*==============================================================*/
/* Table: SHIPPING_ADDRESS                                      */
/*==============================================================*/
create table SHIPPING_ADDRESS (
   ADDR_ID              char(5)              not null,
   USERID               char(5)              not null,
   DIST_ID              char(5)              not null,
   WARD_ID              char(5)              not null,
   PROV_ID              char(5)              not null,
   DETAILED_ADDR        nvarchar(100)         null,
   IS_DEFAULT           bit                  null,
   RECEIVER_NAME        nvarchar(60)          null,
   RECEIVER_PHONE       char(10)             null,
   LATITUDE             float                null,
   LONGITUDE            float                null,
   SOFT_DELETE          bit                  null,
   constraint PK_SHIPPING_ADDRESS primary key nonclustered (ADDR_ID)
)
go

/*==============================================================*/
/* Index: OF_ACCOUNT_FK                                         */
/*==============================================================*/
create index OF_ACCOUNT_FK on SHIPPING_ADDRESS (
USERID ASC
)
go

/*==============================================================*/
/* Index: INCLUDE_PROVINCE_FK                                   */
/*==============================================================*/
create index INCLUDE_PROVINCE_FK on SHIPPING_ADDRESS (
PROV_ID ASC
)
go

/*==============================================================*/
/* Index: INCLUDE_DISTRICT_FK                                   */
/*==============================================================*/
create index INCLUDE_DISTRICT_FK on SHIPPING_ADDRESS (
DIST_ID ASC
)
go

/*==============================================================*/
/* Index: INCLUDE_WARD_FK                                       */
/*==============================================================*/
create index INCLUDE_WARD_FK on SHIPPING_ADDRESS (
WARD_ID ASC
)
go

/*==============================================================*/
/* Table: WARD                                                  */
/*==============================================================*/
create table WARD (
   WARD_ID              char(5)              not null,
   DIST_ID              char(5)              not null,
   WARD_NAME            nvarchar(50)          null,
   constraint PK_WARD primary key nonclustered (WARD_ID)
)
go

/*==============================================================*/
/* Index: HAS_WARD_FK                                           */
/*==============================================================*/
create index HAS_WARD_FK on WARD (
DIST_ID ASC
)
go

/*==============================================================*/
/* Table: WRITTEN_BY                                            */
/*==============================================================*/
create table WRITTEN_BY (
   BOOK_ID              char(5)              not null,
   AUTHOR_ID            char(5)              not null,
   constraint PK_WRITTEN_BY primary key (BOOK_ID, AUTHOR_ID)
)
go

/*==============================================================*/
/* Index: WRITTEN_BY_FK                                         */
/*==============================================================*/
create index WRITTEN_BY_FK on WRITTEN_BY (
BOOK_ID ASC
)
go

/*==============================================================*/
/* Index: WRITTEN_BY2_FK                                        */
/*==============================================================*/
create index WRITTEN_BY2_FK on WRITTEN_BY (
AUTHOR_ID ASC
)
go

alter table BOOK
   add constraint FK_BOOK_HAS_CATEG_CATEGORY foreign key (CATE_ID)
      references CATEGORY (CATE_ID)
go

alter table BOOK_DETAIL
   add constraint FK_BOOK_DET_INCLUDE_B_BOOK foreign key (BOOK_ID)
      references BOOK (BOOK_ID)
go

alter table BOOK_DETAIL
   add constraint FK_BOOK_DET_PUBLISHED_PUBLISHE foreign key (PUB_ID)
      references PUBLISHER (PUB_ID)
go

alter table BOOK_IMAGES
   add constraint FK_BOOK_IMA_HAS_IMAGE_BOOK foreign key (BOOK_ID)
      references BOOK (BOOK_ID)
go

alter table CART
   add constraint FK_CART_HAS_CART_ACCOUNT foreign key (USERID)
      references ACCOUNT (USERID)
go

alter table CART_DETAIL
   add constraint FK_CART_DET_CART_DETA_CART foreign key (CART_ID)
      references CART (CART_ID)
go

alter table CART_DETAIL
   add constraint FK_CART_DET_CART_DETA_BOOK foreign key (BOOK_ID)
      references BOOK (BOOK_ID)
go

alter table CATEGORY
   add constraint FK_CATEGORY_HAVE_PARE_CATEGORY foreign key (PARENT_ID)
      references CATEGORY (CATE_ID)
go

alter table DISTRICT
   add constraint FK_DISTRICT_HAS_DISTR_PROVINCE foreign key (PROV_ID)
      references PROVINCE (PROV_ID)
go

alter table H_ORDER
   add constraint FK_H_ORDER_HAS_ORDER_ACCOUNT foreign key (USERID)
      references ACCOUNT (USERID)
go

alter table H_ORDER
   add constraint FK_H_ORDER_HAS_SHIPP_SHIPPING foreign key (ADDR_ID)
      references SHIPPING_ADDRESS (ADDR_ID)
go

alter table ORDER_DETAIL
   add constraint FK_ORDER_DE_ORDER_DET_BOOK foreign key (BOOK_ID)
      references BOOK (BOOK_ID)
go

alter table ORDER_DETAIL
   add constraint FK_ORDER_DE_ORDER_DET_H_ORDER foreign key (ORDER_ID)
      references H_ORDER (ORDER_ID)
go

alter table ORDER_REVIEW
   add constraint FK_ORDER_RE_ORDER_REV_H_ORDER foreign key (ORDER_ID)
      references H_ORDER (ORDER_ID)
go

alter table ORDER_REVIEW
   add constraint FK_ORDER_RE_ORDER_REV_BOOK foreign key (BOOK_ID)
      references BOOK (BOOK_ID)
go

alter table ORDER_STATE
   add constraint FK_ORDER_ST_HAS_STATE_H_ORDER foreign key (ORDER_ID)
      references H_ORDER (ORDER_ID)
go

alter table SHIPPING_ADDRESS
   add constraint FK_SHIPPING_INCLUDE_D_DISTRICT foreign key (DIST_ID)
      references DISTRICT (DIST_ID)
go

alter table SHIPPING_ADDRESS
   add constraint FK_SHIPPING_INCLUDE_P_PROVINCE foreign key (PROV_ID)
      references PROVINCE (PROV_ID)
go

alter table SHIPPING_ADDRESS
   add constraint FK_SHIPPING_INCLUDE_W_WARD foreign key (WARD_ID)
      references WARD (WARD_ID)
go

alter table SHIPPING_ADDRESS
   add constraint FK_SHIPPING_OF_ACCOUN_ACCOUNT foreign key (USERID)
      references ACCOUNT (USERID)
go

alter table WARD
   add constraint FK_WARD_HAS_WARD_DISTRICT foreign key (DIST_ID)
      references DISTRICT (DIST_ID)
go

alter table WRITTEN_BY
   add constraint FK_WRITTEN__WRITTEN_B_BOOK_DET foreign key (BOOK_ID)
      references BOOK_DETAIL (BOOK_ID)
go

alter table WRITTEN_BY
   add constraint FK_WRITTEN__WRITTEN_B_AUTHOR foreign key (AUTHOR_ID)
      references AUTHOR (AUTHOR_ID)
go

