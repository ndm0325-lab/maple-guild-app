import {
    db,
    collection,
    getDocs,
    setDoc,
    doc,
  } from "../../firebase";
  
  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
  
  export async function GET() {
    const apiKey = process.env.NEXON_API_KEY;
  
    const guildName = encodeURIComponent("밤바다");
    const worldName = encodeURIComponent("크로아");
  
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const date = yesterday.toISOString().split("T")[0];
  
    const guildIdRes = await fetch(
      `https://open.api.nexon.com/maplestory/v1/guild/id?guild_name=${guildName}&world_name=${worldName}`,
      { headers: { "x-nxopen-api-key": apiKey || "" } }
    );
  
    const guildIdData = await guildIdRes.json();
  
    const guildRes = await fetch(
      `https://open.api.nexon.com/maplestory/v1/guild/basic?oguild_id=${guildIdData.oguild_id}&date=${date}`,
      { headers: { "x-nxopen-api-key": apiKey || "" } }
    );
  
    const guildData = await guildRes.json();
    const members = guildData.guild_member || [];
  
    const savedSnapshot = await getDocs(collection(db, "members"));
    const savedMembers = savedSnapshot.docs.map((d) => d.data());
  
    const results = [];
  
    for (const member of members) {
      try {
        await sleep(500);
  
        const saved = savedMembers.find((m: any) => m.name === member);
  
        const ocidRes = await fetch(
          `https://open.api.nexon.com/maplestory/v1/id?character_name=${encodeURIComponent(member)}`,
          { headers: { "x-nxopen-api-key": apiKey || "" } }
        );
  
        const ocidData = await ocidRes.json();
        if (!ocidData.ocid) continue;
  
        await sleep(500);
  
        const charRes = await fetch(
          `https://open.api.nexon.com/maplestory/v1/character/basic?ocid=${ocidData.ocid}&date=${date}`,
          { headers: { "x-nxopen-api-key": apiKey || "" } }
        );
  
        const charData = await charRes.json();
        if (!charData.character_name) continue;
  
        const memberData = {
          name: charData.character_name,
          level: charData.character_level,
          job: charData.character_class,
          guild: charData.character_guild_name,
          role: saved?.role || "바다",
          updatedAt: new Date().toISOString(),
        };
  
        await setDoc(doc(db, "members", charData.character_name), memberData);
  
        results.push(memberData);
      } catch {
        continue;
      }
    }
  
    return Response.json({
      message: "길드원 자동 저장 완료",
      date,
      total: members.length,
      saved: results.length,
      results,
    });
  }