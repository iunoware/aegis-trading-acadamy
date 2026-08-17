-- AlterEnum
BEGIN;
CREATE TYPE "PaymentMethod_new" AS ENUM ('CRYPTO');
ALTER TABLE "Payment" ALTER COLUMN "method" TYPE "PaymentMethod_new" USING ("method"::text::"PaymentMethod_new");
DROP TYPE "PaymentMethod";
ALTER TYPE "PaymentMethod_new" RENAME TO "PaymentMethod";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "PaymentGateway_new" AS ENUM ('NOWPAYMENTS');
ALTER TABLE "Payment" ALTER COLUMN "gateway" TYPE "PaymentGateway_new" USING ("gateway"::text::"PaymentGateway_new");
ALTER TABLE "Subscription" ALTER COLUMN "gateway" TYPE "PaymentGateway_new" USING ("gateway"::text::"PaymentGateway_new");
DROP TYPE "PaymentGateway";
ALTER TYPE "PaymentGateway_new" RENAME TO "PaymentGateway";
COMMIT;
