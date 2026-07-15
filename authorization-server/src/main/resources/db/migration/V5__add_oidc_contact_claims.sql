ALTER TABLE app_user_profile ADD COLUMN email varchar(320);
ALTER TABLE app_user_profile ADD COLUMN email_verified boolean NOT NULL DEFAULT false;
ALTER TABLE app_user_profile ADD COLUMN address_formatted varchar(500);
ALTER TABLE app_user_profile ADD COLUMN address_street varchar(200);
ALTER TABLE app_user_profile ADD COLUMN address_locality varchar(100);
ALTER TABLE app_user_profile ADD COLUMN address_region varchar(100);
ALTER TABLE app_user_profile ADD COLUMN address_postal_code varchar(20);
ALTER TABLE app_user_profile ADD COLUMN address_country varchar(2);
ALTER TABLE app_user_profile ADD COLUMN phone_number varchar(30);
ALTER TABLE app_user_profile ADD COLUMN phone_number_verified boolean NOT NULL DEFAULT false;

UPDATE app_user_profile
SET email = 'demo.user@example.com',
    email_verified = true,
    address_formatted = '〒100-0001 東京都千代田区千代田1-1',
    address_street = '千代田1-1',
    address_locality = '千代田区',
    address_region = '東京都',
    address_postal_code = '100-0001',
    address_country = 'JP',
    phone_number = '+81-90-1234-5678',
    phone_number_verified = true,
    updated_at = CURRENT_TIMESTAMP
WHERE username = 'user';
