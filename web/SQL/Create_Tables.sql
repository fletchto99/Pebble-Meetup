CREATE TABLE Users (
User_ID INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
User_Token VARCHAR(32) NOT NULL,
UNIQUE (User_Token)
)ENGINE=InnoDB CHARACTER SET UTF8;

CREATE TABLE Events (
Event_ID INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
Event_Token INT UNSIGNED NOT NULL,
UNIQUE(Event_Token)
)ENGINE=InnoDB CHARACTER SET UTF8;

CREATE TABLE User_Events (
User_ID INT UNSIGNED NOT NULL,
Event_ID INT UNSIGNED NOT NULL,
FOREIGN KEY (User_ID) REFERENCES Users(User_ID) ,
FOREIGN KEY (Event_ID) REFERENCES Events(Event_ID),
UNIQUE (User_ID, Event_ID)
)ENGINE=InnoDB CHARACTER SET UTF8;

CREATE TABLE Properties (
Property_ID INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
Property_Name VARCHAR(64) NOT NULL,
Property_Value VARCHAR(64),
UNIQUE(Property_Name)
)ENGINE=InnoDB CHARACTER SET UTF8;

