-- Remove forgot password functionality from database
-- This removes the reset_token and reset_token_expiry columns from users table

-- Remove reset token fields from users table
ALTER TABLE users 
DROP COLUMN IF EXISTS reset_token,
DROP COLUMN IF EXISTS reset_token_expiry;

-- Add comment for documentation
COMMENT ON TABLE users IS 'Users table - forgot password functionality removed';
