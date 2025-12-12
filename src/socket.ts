import { Server as SocketIOServer, Socket } from "socket.io";
import { PrismaClient } from ".prisma/client";

const prisma = new PrismaClient();
const TWO_DAYS_MS = 1000 * 60 * 60 * 24 * 2;

// ────────────────────────────────────────────────────────────────
// GLOBAL ONLINE TRACKERS
// ────────────────────────────────────────────────────────────────
const onlineStaff = new Map<string, string>();   // socket.id → userId   (staff can have only ONE active socket)
const onlineStudents = new Set<string>();        // userId               (students: simple presence)

// ────────────────────────────────────────────────────────────────
// UTILITIES
// ────────────────────────────────────────────────────────────────
const getRoom = (a: string, b: string) => `private_${[a, b].sort().join("_")}`;

// ────────────────────────────────────────────────────────────────
// BROADCAST: Send full staff list + who is online to EVERYONE
// ────────────────────────────────────────────────────────────────
export const broadcastStaffStatus = async (io: SocketIOServer) => {
    try {
        const staff = await prisma.user.findMany({
            where: { role: "staff" },
            select: { id: true, idNumber: true, username: true, userImg: true },
        });

        const staffList = staff.map(s => ({
            id: s.id,
            idNumber: s.idNumber || "STAFF",
            username: s.username || s.idNumber || "Staff",
            userImg: s.userImg || "/default-profile.png",
        }));

        const onlineStaffIds = Array.from(onlineStaff.values());

        console.log(`[STAFF BROADCAST] → ${staffList.length} total | ${onlineStaffIds.length} online`);

        io.emit("staff_status_update", {
            allStaff: staffList,
            onlineStaffIds,
        });
    } catch (error) {
        console.error("[ERROR] Failed to broadcast staff status:", error);
    }
};

// ────────────────────────────────────────────────────────────────
// MAIN SOCKET SETUP
// ────────────────────────────────────────────────────────────────
export const setupSocket = (io: SocketIOServer) => {
    io.on("connection", async (socket: Socket) => {
        // ────────────────────────────────────────────────────────
        // 1. AUTHENTICATION — MUST HAPPEN FIRST & BE AWAITED
        // ────────────────────────────────────────────────────────
        const incomingId = socket.handshake.query.userId as string;

        let userId: string | null = null;
        let role: "staff" | "student" | null = null;
        let idNumber: string | null = null;

        try {
            // Reject guests / missing IDs
            if (!incomingId || incomingId === "guest" || incomingId === "null") {
                console.warn("[REJECT] No valid userId provided");
                return socket.disconnect(true);
            }

            const user = await prisma.user.findUnique({
                where: { id: incomingId },
                select: { id: true, idNumber: true, role: true },
            });

            if (!user || !["staff", "student"].includes(user.role)) {
                console.warn(`[REJECT] User not found or invalid role → ${incomingId}`);
                return socket.disconnect(true);
            }
             
            // AUTH SUCCESS → assign data
            userId = user.id;
            role = user.role as "staff" | "student";
            idNumber = user.idNumber || null;

            socket.data.userId = userId;
            socket.data.role = role;
            socket.data.idNumber = idNumber;

            // Join personal room for direct messaging later if needed
            socket.join(`user_${userId}`);

            console.log(`[CONNECT] ${role.toUpperCase()} → ${idNumber || userId}`);

        } catch (err) {
            console.error("[AUTH ERROR]", err);
            return socket.disconnect(true);
        }

        // ────────────────────────────────────────────────────────
        // 2. MARK USER AS ONLINE (with cleanup for staff)
        // ────────────────────────────────────────────────────────
        if (role === "staff") {
            // Remove any old/stale sockets for this staff (important on reconnect!)
            for (const [oldSocketId, uid] of onlineStaff.entries()) {
                if (uid === userId) {
                    console.log(`[CLEANUP] Removing stale staff socket ${oldSocketId}`);
                    onlineStaff.delete(oldSocketId);
                }
            }
            onlineStaff.set(socket.id, userId);
        }

        if (role === "student") {
            onlineStudents.add(userId);
        }

        // Immediately tell everyone the updated staff status
        await broadcastStaffStatus(io);
         

        if (role === "staff") {
            try {
                const staffId = userId;

                const messages = await prisma.chatMessage.findMany({
                    where: {
                        OR: [
                            { senderId: staffId },
                            { receiverId: staffId }
                        ],
                    },
                    select: {
                        senderId: true,
                        receiverId: true,
                        text: true,
                        createdAt: true,
                    },
                    orderBy: { createdAt: "desc" },
                });

                if (messages.length === 0) {
                    socket.emit("staff_conversations_list", []);
                } else {
                    const studentMap = new Map<string, any>();

                    for (const msg of messages) {
                        const studentId = msg.senderId === staffId ? msg.receiverId : msg.senderId;

                        if (!studentMap.has(studentId)) {
                            const student = await prisma.user.findUnique({
                                where: { id: studentId },
                                select: { username: true, userImg: true, idNumber: true, role: true },
                            });

                            if (student && student.role === "student") {
                                studentMap.set(studentId, {
                                    studentId,
                                    name: student.username || student.idNumber || "Student",
                                    photo: student.userImg || "/default-profile.png",
                                    lastMessage: msg.text,
                                    time: msg.createdAt,
                                });
                            }
                        }
                    }

                    const list = Array.from(studentMap.values())
                        .sort((a: any, b: any) => b.time.getTime() - a.time.getTime());

                    socket.emit("staff_conversations_list", list);
                    console.log(`[AUTO] Sent ${list.length} conversations to staff ${idNumber || staffId}`);
                }
            } catch (err) {
                console.error("[ERROR] Auto-loading staff conversations failed:", err);
                socket.emit("staff_conversations_list", []);
            }
        }
        // ────────────────────────────────────────────────────────
        // 3. EVENT LISTENERS — only registered AFTER auth success
        // ────────────────────────────────────────────────────────

        // Open private chat → join room + load history
        socket.on("open_private_chat", async (targetUserId: string) => {
    if (!userId || !targetUserId) return;

    const room = getRoom(userId, targetUserId);
    socket.join(room);
    console.log(`[CHAT] ${role} ${idNumber || userId} opened chat with ${targetUserId}`);

    const history = await prisma.chatMessage.findMany({
        where: {
            OR: [
                { senderId: userId, receiverId: targetUserId },
                { senderId: targetUserId, receiverId: userId },
            ],
        },
        orderBy: { createdAt: "asc" },
    });

    // CACHE sender info to avoid 100 queries
    const senderCache = new Map<string, { name: string; photo: string }>();

    const messagesWithDetails = await Promise.all(
        history.map(async (m) => {
            const senderId = m.senderId;
            if (!senderCache.has(senderId)) {
                const user = await prisma.user.findUnique({
                    where: { id: senderId },
                    select: { username: true, userImg: true, idNumber: true },
                });
                senderCache.set(senderId, {
                    name: user?.username || user?.idNumber || (m.sender === "staff" ? "Staff" : "Student"),
                    photo: user?.userImg || "/default-profile.png",
                });
            }
            const { name, photo } = senderCache.get(senderId)!;

            return {
                id: m.id.toString(), // ← CRITICAL: Convert Int to String
                sender: m.sender,
                senderId: m.senderId,
                receiverId: m.receiverId,
                text: m.text,
                time: m.createdAt.toISOString(),
                senderName: name,
                senderPhoto: photo,
            };
        })
    );

    socket.emit("load_messages", messagesWithDetails);
});

        // Send private message
        // Send private message — FULLY FIXED VERSION
socket.on("send_private_message", async ({ text, to }: { text: string; to: string }) => {
  if (!text.trim() || !userId || !to || !role) return;

  try {
    const msg = await prisma.chatMessage.create({
      data: {
        sender: role,
        senderId: userId,
        receiverId: to,
        text: text.trim(),
        expiresAt: new Date(Date.now() + TWO_DAYS_MS),
      },
    });

    // Get sender info once
    const senderInfo = await prisma.user.findUnique({
      where: { id: userId },
      select: { username: true, userImg: true, idNumber: true },
    });

    const senderName = senderInfo?.username || senderInfo?.idNumber || (role === "staff" ? "Staff" : "Student");
    const senderPhoto = senderInfo?.userImg || "/default-profile.png";

    const payload = {
      id: msg.id.toString(),
      sender: role,
      senderId: userId,
      receiverId: to,
      text: msg.text,
      time: msg.createdAt.toISOString(),
      senderName,
      senderPhoto,
    };

    const room = getRoom(userId, to);

    // 1. Send message to both users (room + personal)
    io.to(room).emit("receive_message", payload);

    if (role === "student") {
      const studentInfo = await prisma.user.findUnique({
        where: { id: userId },
        select: { username: true, userImg: true, idNumber: true },
      });

      const conversationEntry = {
        studentId: userId,
        name: studentInfo?.username || studentInfo?.idNumber || "Student",
        photo: studentInfo?.userImg || "/default-profile.png",
        lastMessage: text.trim(),
        time: msg.createdAt,
        unread: 1, // staff hasn't seen it yet
      };

      // This will make the student appear IMMEDIATELY in staff sidebar
      io.to(`user_${to}`).emit("staff_new_conversation", conversationEntry);

      console.log(`[NEW CONVO] Student ${userId} → Staff ${to} | First message sent`);
    }

    console.log(`[MESSAGE] ${role} ${userId} → ${to} | "${text.trim()}"`);

  } catch (error) {
    console.error("[ERROR] Failed to send message:", error);
  }
});
        // STAFF: Get list of students who messaged me (only active chats)
socket.on("staff_request_conversations", async () => {
  if (socket.data.role !== "staff" || !socket.data.userId) return;

  const staffId = socket.data.userId;

  try {
    // Get ALL unique students this staff has EVER messaged (in either direction)
    const messages = await prisma.chatMessage.findMany({
      where: {
        OR: [
          { senderId: staffId },
          { receiverId: staffId }
        ],
        // Remove expiresAt filter OR make it much longer if you want permanent history
        // expiresAt: { gt: new Date() },
      },
      select: {
        senderId: true,
        receiverId: true,
        text: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    if (messages.length === 0) {
      return socket.emit("staff_conversations_list", []);
    }

    // Group by student and keep only the latest message
    const studentMap = new Map<string, any>();

    for (const msg of messages) {
      const studentId = msg.senderId === staffId ? msg.receiverId : msg.senderId;

      if (!studentMap.has(studentId)) {
        const student = await prisma.user.findUnique({
          where: { id: studentId },
          select: { username: true, userImg: true, idNumber: true , role: true},
        });

        if (!student || student.role !== "student") continue;

        studentMap.set(studentId, {
          studentId,
          name: student.username || student.idNumber || "Student",
          photo: student.userImg || "/default-profile.png",
          lastMessage: msg.text,
          time: msg.createdAt,
        });
      }
    }

    const list = Array.from(studentMap.values())
      .sort((a, b) => b.time.getTime() - a.time.getTime());

    socket.emit("staff_conversations_list", list);
    console.log(`[STAFF] Loaded ${list.length} active conversations`);
  } catch (err) {
    console.error("[ERROR] staff_request_conversations:", err);
    socket.emit("staff_conversations_list", []);
  }
});

        // ────────────────────────────────────────────────────────
        // 4. DISCONNECT — clean up properly
        // ────────────────────────────────────────────────────────
        socket.on("disconnect", (reason) => {
            if (!userId || !role) return; // Should never happen now

            console.log(`[DISCONNECT] ${role.toUpperCase()} → ${idNumber || userId} | Reason: ${reason}`);

            if (role === "staff") {
                onlineStaff.delete(socket.id);
            }

            if (role === "student") {
                onlineStudents.delete(userId);
            }

            // Update everyone
            broadcastStaffStatus(io);
        });

        // Optional: handle sudden transport close (more aggressive cleanup)
        socket.on("disconnecting", (reason) => {
            console.log(`[DISCONNECTING] ${role?.toUpperCase() || "?"} ${socket.id} | ${reason}`);
        });
    });

    // ────────────────────────────────────────────────────────────────
    // Optional: Debug interval — remove in production if you want
    // ────────────────────────────────────────────────────────────────
    setInterval(() => {
        console.log(`Online → Staff: ${onlineStaff.size} | Students: ${onlineStudents.size}`);
    }, 60_000);

};
