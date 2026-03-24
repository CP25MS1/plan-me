CREATE TABLE basic_checklist_item
(
    bci_id  INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    th_name VARCHAR(30) NOT NULL,
    en_name VARCHAR(30) NOT NULL,

    UNIQUE (th_name, en_name)
);
