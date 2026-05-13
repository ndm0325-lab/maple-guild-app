import {
    collection,
    getDocs,
    query,
    where,
    Timestamp,
  } from "firebase/firestore";
  
  import { db } from "../firebase";
  import { getGuildWeekStart } from "./week";
  
  export async function getWeeklyGuildStats() {
    const weekStart = getGuildWeekStart();
  
    const logsRef = collection(db, "guildLogs");
  
    const joinQ = query(
      logsRef,
      where("type", "==", "join"),
      where("createdAt", ">=", Timestamp.fromDate(weekStart))
    );
  
    const leaveQ = query(
      logsRef,
      where("type", "==", "leave"),
      where("createdAt", ">=", Timestamp.fromDate(weekStart))
    );
  
    const [joinSnap, leaveSnap] = await Promise.all([
      getDocs(joinQ),
      getDocs(leaveQ),
    ]);
  
    return {
      weeklyJoinedCount: joinSnap.size,
      weeklyLeftCount: leaveSnap.size,
    };
  }