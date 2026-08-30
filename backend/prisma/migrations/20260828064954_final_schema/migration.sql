-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CITIZEN', 'RELIEF_CAMP_MANAGER', 'CONTROL_CENTRE_OPERATOR', 'DMA_SUPERVISOR', 'RELIEF_TEAM');

-- CreateEnum
CREATE TYPE "CampOperationalStatus" AS ENUM ('OPERATIONAL', 'LIMITED', 'FULL', 'TEMPORARILY_CLOSED', 'CLOSED');

-- CreateEnum
CREATE TYPE "RequestChannel" AS ENUM ('ONLINE', 'PHONE', 'SMS');

-- CreateEnum
CREATE TYPE "RequestVerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ResourceRequestStatus" AS ENUM ('PENDING', 'ASSIGNED', 'IN_PROGRESS', 'PARTIALLY_FULFILLED', 'FULFILLED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "TeamStatus" AS ENUM ('AVAILABLE', 'BUSY', 'OFFLINE');

-- CreateEnum
CREATE TYPE "TaskType" AS ENUM ('RESCUE', 'EVACUATION', 'MEDICAL_ASSISTANCE', 'RESOURCE_DELIVERY');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('ASSIGNED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "InventoryTransactionType" AS ENUM ('RECEIPT', 'DELIVERY', 'CONSUMPTION', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "DuplicateDecision" AS ENUM ('PENDING', 'CONFIRMED_DUPLICATE', 'NOT_DUPLICATE', 'DISMISSED');

-- CreateEnum
CREATE TYPE "DeliveryStatus" AS ENUM ('PLANNED', 'IN_TRANSIT', 'DELIVERED', 'PARTIALLY_DELIVERED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'VERIFY', 'REJECT', 'ASSIGN', 'OVERRIDE', 'STATUS_CHANGE', 'DUPLICATE_DECISION');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT,
    "role" "UserRole" NOT NULL,
    "managedCampId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReliefCamp" (
    "id" SERIAL NOT NULL,
    "officialCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "capacity" INTEGER NOT NULL,
    "operationalStatus" "CampOperationalStatus" NOT NULL DEFAULT 'OPERATIONAL',
    "currentOccupancy" INTEGER NOT NULL DEFAULT 0,
    "operationalNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReliefCamp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReliefTeam" (
    "id" SERIAL NOT NULL,
    "teamName" TEXT NOT NULL,
    "contactNumber" TEXT NOT NULL,
    "status" "TeamStatus" NOT NULL DEFAULT 'AVAILABLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReliefTeam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReliefTeamMember" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "teamId" INTEGER NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReliefTeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resource" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "unit" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Resource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampInventory" (
    "id" SERIAL NOT NULL,
    "campId" INTEGER NOT NULL,
    "resourceId" INTEGER NOT NULL,
    "quantity" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CampInventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryTransaction" (
    "id" SERIAL NOT NULL,
    "campId" INTEGER NOT NULL,
    "resourceId" INTEGER NOT NULL,
    "type" "InventoryTransactionType" NOT NULL,
    "quantity" DECIMAL(65,30) NOT NULL,
    "referenceType" TEXT,
    "referenceId" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InventoryTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResourceRequest" (
    "id" SERIAL NOT NULL,
    "campId" INTEGER NOT NULL,
    "createdById" INTEGER,
    "channel" "RequestChannel" NOT NULL,
    "description" TEXT,
    "verificationStatus" "RequestVerificationStatus" NOT NULL DEFAULT 'PENDING',
    "verifiedById" INTEGER,
    "verifiedAt" TIMESTAMP(3),
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "status" "ResourceRequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResourceRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResourceRequestItem" (
    "id" SERIAL NOT NULL,
    "requestId" INTEGER NOT NULL,
    "resourceId" INTEGER NOT NULL,
    "quantity" DECIMAL(65,30) NOT NULL,
    "notes" TEXT,

    CONSTRAINT "ResourceRequestItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResourceRequestAssignment" (
    "id" SERIAL NOT NULL,
    "requestId" INTEGER NOT NULL,
    "teamId" INTEGER NOT NULL,
    "assignedById" INTEGER NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unassignedAt" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "ResourceRequestAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequestDuplicateCheck" (
    "id" SERIAL NOT NULL,
    "originalRequestId" INTEGER NOT NULL,
    "possibleDuplicateRequestId" INTEGER NOT NULL,
    "decision" "DuplicateDecision" NOT NULL DEFAULT 'PENDING',
    "reviewedById" INTEGER,
    "reviewedAt" TIMESTAMP(3),
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RequestDuplicateCheck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" SERIAL NOT NULL,
    "teamId" INTEGER NOT NULL,
    "assignedById" INTEGER NOT NULL,
    "resourceRequestId" INTEGER,
    "type" "TaskType" NOT NULL,
    "status" "TaskStatus" NOT NULL DEFAULT 'ASSIGNED',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "locationAddress" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "outcome" TEXT,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskUpdate" (
    "id" SERIAL NOT NULL,
    "taskId" INTEGER NOT NULL,
    "updatedById" INTEGER NOT NULL,
    "status" "TaskStatus" NOT NULL,
    "outcome" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "clientEventId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskUpdate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskSyncEvent" (
    "id" SERIAL NOT NULL,
    "taskId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "clientEventId" TEXT NOT NULL,
    "clientVersion" INTEGER,
    "serverVersion" INTEGER,
    "payload" JSONB NOT NULL,
    "processedAt" TIMESTAMP(3),
    "conflictDetected" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskSyncEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResourceDelivery" (
    "id" SERIAL NOT NULL,
    "requestId" INTEGER NOT NULL,
    "campId" INTEGER NOT NULL,
    "teamId" INTEGER NOT NULL,
    "status" "DeliveryStatus" NOT NULL DEFAULT 'PLANNED',
    "dispatchedAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResourceDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResourceDeliveryItem" (
    "id" SERIAL NOT NULL,
    "deliveryId" INTEGER NOT NULL,
    "resourceId" INTEGER NOT NULL,
    "quantity" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "ResourceDeliveryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmergencyContact" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "serviceType" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmergencyContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" SERIAL NOT NULL,
    "action" "AuditAction" NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" INTEGER NOT NULL,
    "performedById" INTEGER,
    "beforeData" JSONB,
    "afterData" JSONB,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_managedCampId_idx" ON "User"("managedCampId");

-- CreateIndex
CREATE UNIQUE INDEX "ReliefCamp_officialCode_key" ON "ReliefCamp"("officialCode");

-- CreateIndex
CREATE INDEX "ReliefCamp_name_idx" ON "ReliefCamp"("name");

-- CreateIndex
CREATE INDEX "ReliefCamp_operationalStatus_idx" ON "ReliefCamp"("operationalStatus");

-- CreateIndex
CREATE INDEX "ReliefTeam_status_idx" ON "ReliefTeam"("status");

-- CreateIndex
CREATE INDEX "ReliefTeamMember_teamId_idx" ON "ReliefTeamMember"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "ReliefTeamMember_userId_teamId_key" ON "ReliefTeamMember"("userId", "teamId");

-- CreateIndex
CREATE UNIQUE INDEX "Resource_name_key" ON "Resource"("name");

-- CreateIndex
CREATE INDEX "CampInventory_resourceId_idx" ON "CampInventory"("resourceId");

-- CreateIndex
CREATE UNIQUE INDEX "CampInventory_campId_resourceId_key" ON "CampInventory"("campId", "resourceId");

-- CreateIndex
CREATE INDEX "InventoryTransaction_campId_resourceId_idx" ON "InventoryTransaction"("campId", "resourceId");

-- CreateIndex
CREATE INDEX "InventoryTransaction_referenceType_referenceId_idx" ON "InventoryTransaction"("referenceType", "referenceId");

-- CreateIndex
CREATE INDEX "InventoryTransaction_createdAt_idx" ON "InventoryTransaction"("createdAt");

-- CreateIndex
CREATE INDEX "ResourceRequest_campId_idx" ON "ResourceRequest"("campId");

-- CreateIndex
CREATE INDEX "ResourceRequest_status_idx" ON "ResourceRequest"("status");

-- CreateIndex
CREATE INDEX "ResourceRequest_priority_idx" ON "ResourceRequest"("priority");

-- CreateIndex
CREATE INDEX "ResourceRequest_verificationStatus_idx" ON "ResourceRequest"("verificationStatus");

-- CreateIndex
CREATE INDEX "ResourceRequest_createdAt_idx" ON "ResourceRequest"("createdAt");

-- CreateIndex
CREATE INDEX "ResourceRequestItem_resourceId_idx" ON "ResourceRequestItem"("resourceId");

-- CreateIndex
CREATE UNIQUE INDEX "ResourceRequestItem_requestId_resourceId_key" ON "ResourceRequestItem"("requestId", "resourceId");

-- CreateIndex
CREATE INDEX "ResourceRequestAssignment_requestId_idx" ON "ResourceRequestAssignment"("requestId");

-- CreateIndex
CREATE INDEX "ResourceRequestAssignment_teamId_idx" ON "ResourceRequestAssignment"("teamId");

-- CreateIndex
CREATE INDEX "RequestDuplicateCheck_decision_idx" ON "RequestDuplicateCheck"("decision");

-- CreateIndex
CREATE UNIQUE INDEX "RequestDuplicateCheck_originalRequestId_possibleDuplicateRe_key" ON "RequestDuplicateCheck"("originalRequestId", "possibleDuplicateRequestId");

-- CreateIndex
CREATE INDEX "Task_teamId_idx" ON "Task"("teamId");

-- CreateIndex
CREATE INDEX "Task_status_idx" ON "Task"("status");

-- CreateIndex
CREATE INDEX "Task_type_idx" ON "Task"("type");

-- CreateIndex
CREATE INDEX "Task_resourceRequestId_idx" ON "Task"("resourceRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "TaskUpdate_clientEventId_key" ON "TaskUpdate"("clientEventId");

-- CreateIndex
CREATE INDEX "TaskUpdate_taskId_idx" ON "TaskUpdate"("taskId");

-- CreateIndex
CREATE INDEX "TaskUpdate_createdAt_idx" ON "TaskUpdate"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "TaskSyncEvent_clientEventId_key" ON "TaskSyncEvent"("clientEventId");

-- CreateIndex
CREATE INDEX "TaskSyncEvent_taskId_idx" ON "TaskSyncEvent"("taskId");

-- CreateIndex
CREATE INDEX "TaskSyncEvent_processedAt_idx" ON "TaskSyncEvent"("processedAt");

-- CreateIndex
CREATE INDEX "ResourceDelivery_requestId_idx" ON "ResourceDelivery"("requestId");

-- CreateIndex
CREATE INDEX "ResourceDelivery_campId_idx" ON "ResourceDelivery"("campId");

-- CreateIndex
CREATE INDEX "ResourceDelivery_teamId_idx" ON "ResourceDelivery"("teamId");

-- CreateIndex
CREATE INDEX "ResourceDelivery_status_idx" ON "ResourceDelivery"("status");

-- CreateIndex
CREATE INDEX "ResourceDeliveryItem_resourceId_idx" ON "ResourceDeliveryItem"("resourceId");

-- CreateIndex
CREATE UNIQUE INDEX "ResourceDeliveryItem_deliveryId_resourceId_key" ON "ResourceDeliveryItem"("deliveryId", "resourceId");

-- CreateIndex
CREATE INDEX "EmergencyContact_isActive_displayOrder_idx" ON "EmergencyContact"("isActive", "displayOrder");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_performedById_idx" ON "AuditLog"("performedById");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_managedCampId_fkey" FOREIGN KEY ("managedCampId") REFERENCES "ReliefCamp"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReliefTeamMember" ADD CONSTRAINT "ReliefTeamMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReliefTeamMember" ADD CONSTRAINT "ReliefTeamMember_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "ReliefTeam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampInventory" ADD CONSTRAINT "CampInventory_campId_fkey" FOREIGN KEY ("campId") REFERENCES "ReliefCamp"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampInventory" ADD CONSTRAINT "CampInventory_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryTransaction" ADD CONSTRAINT "InventoryTransaction_campId_fkey" FOREIGN KEY ("campId") REFERENCES "ReliefCamp"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryTransaction" ADD CONSTRAINT "InventoryTransaction_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceRequest" ADD CONSTRAINT "ResourceRequest_campId_fkey" FOREIGN KEY ("campId") REFERENCES "ReliefCamp"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceRequest" ADD CONSTRAINT "ResourceRequest_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceRequest" ADD CONSTRAINT "ResourceRequest_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceRequestItem" ADD CONSTRAINT "ResourceRequestItem_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "ResourceRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceRequestItem" ADD CONSTRAINT "ResourceRequestItem_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceRequestAssignment" ADD CONSTRAINT "ResourceRequestAssignment_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "ResourceRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceRequestAssignment" ADD CONSTRAINT "ResourceRequestAssignment_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "ReliefTeam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceRequestAssignment" ADD CONSTRAINT "ResourceRequestAssignment_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestDuplicateCheck" ADD CONSTRAINT "RequestDuplicateCheck_originalRequestId_fkey" FOREIGN KEY ("originalRequestId") REFERENCES "ResourceRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestDuplicateCheck" ADD CONSTRAINT "RequestDuplicateCheck_possibleDuplicateRequestId_fkey" FOREIGN KEY ("possibleDuplicateRequestId") REFERENCES "ResourceRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestDuplicateCheck" ADD CONSTRAINT "RequestDuplicateCheck_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "ReliefTeam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_resourceRequestId_fkey" FOREIGN KEY ("resourceRequestId") REFERENCES "ResourceRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskUpdate" ADD CONSTRAINT "TaskUpdate_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskUpdate" ADD CONSTRAINT "TaskUpdate_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskSyncEvent" ADD CONSTRAINT "TaskSyncEvent_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskSyncEvent" ADD CONSTRAINT "TaskSyncEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceDelivery" ADD CONSTRAINT "ResourceDelivery_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "ResourceRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceDelivery" ADD CONSTRAINT "ResourceDelivery_campId_fkey" FOREIGN KEY ("campId") REFERENCES "ReliefCamp"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceDelivery" ADD CONSTRAINT "ResourceDelivery_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "ReliefTeam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceDeliveryItem" ADD CONSTRAINT "ResourceDeliveryItem_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "ResourceDelivery"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceDeliveryItem" ADD CONSTRAINT "ResourceDeliveryItem_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_performedById_fkey" FOREIGN KEY ("performedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
