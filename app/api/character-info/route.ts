import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.NEXON_API_KEY!;

async function getOcid(characterName: string) {
  const res = await fetch(
    `https://open.api.nexon.com/maplestory/v1/id?character_name=${encodeURIComponent(characterName)}`,
    {
      headers: {
        "x-nxopen-api-key": API_KEY,
      },
      cache: "no-store",
    }
  );
  await new Promise((resolve) => setTimeout(resolve, 500));
  return res.json();
}

async function getCharacterBasic(ocid: string) {
  const res = await fetch(
    `https://open.api.nexon.com/maplestory/v1/character/basic?ocid=${ocid}`,
    {
      headers: {
        "x-nxopen-api-key": API_KEY,
      },
    }
  );

  return res.json();
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const name = searchParams.get("name");

    if (!name) {
      return NextResponse.json(
        { error: "캐릭터명이 없음" },
        { status: 400 }
      );
    }

    const ocidData = await getOcid(name);
    console.log("검색한 닉네임:", name);
console.log("OCID DATA:", ocidData);

    if (!ocidData.ocid) {
      return NextResponse.json(
        { error: "OCID 조회 실패" },
        { status: 404 }
      );
    }

    const basicData = await getCharacterBasic(ocidData.ocid);

    return NextResponse.json({
      level: basicData.character_level,
      job: basicData.character_class,
      image: basicData.character_image,
      lastLogin: basicData.character_date_last_login || "정보없음",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "캐릭터 정보 조회 실패" },
      { status: 500 }
    );
  }
}