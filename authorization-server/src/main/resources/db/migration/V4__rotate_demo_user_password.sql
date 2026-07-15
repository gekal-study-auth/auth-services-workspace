UPDATE app_user
SET password = '{bcrypt}$2y$12$kY5dm0xr2Lncr4vOROvqMuBpV6FmhqjrmVZXkFVVOJ85WntjQqETC',
    updated_at = CURRENT_TIMESTAMP
WHERE username = 'user';
