CREATE TABLE owners (
	owner_id serial primary key,
	firstname varchar(100) NOT NULL,
	lastname varchar(100) NOT NULL,
	email varchar(100),
	phone varchar(20) NOT NULL
);

CREATE TABLE locations (
	location_id serial primary key,
	place varchar(255) NOT NULL,
	city varchar(255) NOT NULL,
	state varchar(255) NOT NULL,
	seats numeric(10) NOT NULL
);

CREATE TABLE events (
    id serial primary key,
    title character varying NOT NULL,
    price numeric(10,2),
    startDate timestamp with time zone NOT NULL,
    endDate timestamp with time zone NOT NULL,
    active boolean DEFAULT 't',
	location_id integer references locations(location_id),
	owner_id integer references owners(owner_id),
   	CONSTRAINT fk_location FOREIGN KEY(location_id) REFERENCES locations(location_id),
   	CONSTRAINT fk_owners FOREIGN KEY(owner_id) REFERENCES owners(owner_id)
);

INSERT INTO owners (firstname, lastname, email, phone) VALUES ('Bob', 'Arcter', 'bob.arcter@madisonsq.com', '123456789');
INSERT INTO owners (firstname, lastname, email, phone) VALUES ('Alan', 'Dual', '', '0222333444');

INSERT INTO locations (place, city, state, seats) VALUES ('Madison Square Garden', 'New York City', 'NY', 2000);
INSERT INTO locations (place, city, state, seats) VALUES ('Microsoft Theatre', 'Los Angeles', 'CA', 4000);

INSERT INTO events(title, price, startdate, enddate, active, location_id, owner_id) VALUES ('Bullet Train to Paducah', '55.00', '2022-09-18 18:00', '2022-09-18 20:00', 't', 1, 1);
INSERT INTO events(title, price, startdate, enddate, active, location_id, owner_id) VALUES ('Bullet Train to Paducah', '65.00', '2022-09-20 18:00', '2022-09-20 20:00', 't', 2, 2);
INSERT INTO events(title, price, startdate, enddate, active, location_id, owner_id) VALUES ('Bullet Train to Paducah - Special event', '100.00', '2022-09-22 18:00', '2022-09-22 20:00', 't', 1, 2);
INSERT INTO events(title, price, startdate, enddate, active, location_id, owner_id) VALUES ('Bullet Train to Paducah - Special event', '100.00', '2022-09-19 18:00', '2022-09-19 20:00', 'f', 1, 2);
