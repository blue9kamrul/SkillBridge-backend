-- Manual migration to change emailVerified from Boolean to DateTime
-- Run this SQL directly in your Neon database console

-- Step 1: Add temporary column
ALTER TABLE "user" ADD COLUMN "emailVerified_new" TIMESTAMP(3);

-- Step 2: Copy data - if true, set to now(), if false, set to null
UPDATE "user" SET "emailVerified_new" = 
  CASE 
    WHEN "emailVerified" = true THEN NOW()
    ELSE NULL
  END;

-- Step 3: Drop old column
ALTER TABLE "user" DROP COLUMN "emailVerified";

-- Step 4: Rename new column
ALTER TABLE "user" RENAME COLUMN "emailVerified_new" TO "emailVerified";

-- Step 5: Set default
ALTER TABLE "user" ALTER COLUMN "emailVerified" SET DEFAULT NOW();
