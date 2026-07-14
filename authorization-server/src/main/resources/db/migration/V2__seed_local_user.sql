INSERT INTO app_user (username, password, enabled)
VALUES ('user', '{bcrypt}$2y$10$7W4iU6iBrcY3rZJgcF/e8uUwyerauIPUcDaSgerMASCqcHRJOcOXW', true);

INSERT INTO app_authority (username, authority)
VALUES ('user', 'ROLE_USER');
