import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    serverTimestamp,
    Timestamp,
  } from "firebase/firestore";
  
  import { db } from "../firebase";
  import { getGuildWeekStart } from "./week";
  
  export async function addGuildLog(
    type: "join" | "leave",
    characterName: string
  ) {
    try {
      const logsRef = collection(db, "guildLogs");
      const weekStart = getGuildWeekStart();
  
      const q = query(
        logsRef,
        where("type", "==", type),
        where("characterName", "==", characterName),
        where("createdAt", ">=", Timestamp.fromDate(weekStart))
      );
  
      const snapshot = await getDocs(q);
  
      if (!snapshot.empty) {
        console.log("이번 주 중복 로그라 저장 안 함");
        return;
      }
  
      await addDoc(logsRef, {
        type,
        characterName,
        createdAt: serverTimestamp(),
      });
  
      console.log("로그 저장 완료");
    } catch (error) {
      console.error("로그 저장 실패:", error);
    }
  }