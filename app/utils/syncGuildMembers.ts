import {
    collection,
    getDocs,
    doc,
    setDoc,
    updateDoc,
    serverTimestamp,
  } from "firebase/firestore";
  
  import { db } from "../firebase";
  import { addGuildLog } from "./guildLogs";
  
  export async function syncGuildMembers(apiMembers: any[]) {
    const membersRef = collection(db, "members");
    const snapshot = await getDocs(membersRef);
  
    const savedMembers = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as any[];
  
    const apiNames = apiMembers;
  
    for (const name of apiMembers) {
  
      const savedMember = savedMembers.find(
        (member) => member.characterName === name
      );
  
      if (!savedMember) {
        await setDoc(doc(db, "members", name), {
          characterName: name,
          role: "신입",
          joinedAt: serverTimestamp(),
          leftAt: null,
          isActive: true,
        });
  
        await addGuildLog("join", name);
      }
  
      if (savedMember && savedMember.isActive === false) {
        await updateDoc(doc(db, "members", savedMember.id), {
          leftAt: null,
          isActive: true,
          rejoinedAt: serverTimestamp(),
        });
  
        await addGuildLog("join", name);
      }
    }
  
    for (const savedMember of savedMembers) {
      if (
        savedMember.isActive !== false &&
        !apiNames.includes(savedMember.characterName)
      ) {
        await updateDoc(doc(db, "members", savedMember.id), {
          leftAt: serverTimestamp(),
          isActive: false,
        });
  
        await addGuildLog("leave", savedMember.characterName);
      }
    }
  }