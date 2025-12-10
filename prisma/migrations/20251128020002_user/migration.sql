-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "Name" TEXT NOT NULL,
    "Password" TEXT NOT NULL,
    "Role" TEXT NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);
