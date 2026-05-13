export async function GET() {
    const apiKey = process.env.NEXON_API_KEY;
  
    // 길드 이름 / 월드
    const guildName = encodeURIComponent("밤바다");
    const worldName = encodeURIComponent("크로아");
  
    // 1. 길드 ID 조회
    const guildIdResponse = await fetch(
      `https://open.api.nexon.com/maplestory/v1/guild/id?guild_name=${guildName}&world_name=${worldName}`,
      {
        headers: {
          "x-nxopen-api-key": apiKey || "",
        },
      }
    );
  
    const guildIdData = await guildIdResponse.json();
  
    // 길드 ID
    const oguildId = guildIdData.oguild_id;
  
    // 어제 날짜
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const date = yesterday.toISOString().split("T")[0];
  
    // 2. 길드 기본 정보 조회
    const guildResponse = await fetch(
      `https://open.api.nexon.com/maplestory/v1/guild/basic?oguild_id=${oguildId}&date=${date}`,
      {
        headers: {
          "x-nxopen-api-key": apiKey || "",
        },
      }
    );
  
    const guildData = await guildResponse.json();
  
    return Response.json(guildData);
  }