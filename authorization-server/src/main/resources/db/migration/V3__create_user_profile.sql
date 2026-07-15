CREATE TABLE app_user_profile (
    username varchar(100) PRIMARY KEY,
    display_name varchar(200) NOT NULL,
    given_name varchar(100),
    family_name varchar(100),
    locale varchar(20),
    picture_url varchar(1000),
    created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_app_user_profile_user
        FOREIGN KEY (username) REFERENCES app_user (username) ON DELETE CASCADE
);

INSERT INTO app_user_profile (
    username,
    display_name,
    given_name,
    family_name,
    locale,
    picture_url
)
VALUES (
    'user',
    'Demo User',
    'Demo',
    'User',
    'ja-JP',
    'https://api.dicebear.com/9.x/initials/svg?seed=Demo%20User'
);
