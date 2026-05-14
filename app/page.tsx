"use client";

import { useEffect, useState } from "react";
import {
  db,
 collection,
  getDocs,
  doc,
  updateDoc,
  setDoc,
  addDoc,
  deleteDoc,
} from "./firebase";
import { getWeeklyGuildStats } from "./utils/guildStats";
import { syncGuildMembers } from "./utils/syncGuildMembers";

export default function Home() {
  const [page, setPage] = useState("home");
  const [members, setMembers] = useState<any[]>([]);

  return (
    <main className="min-h-screen bg-[url('/backgrounds/night-sea-bg.png')] bg-cover bg-center bg-fixed text-white">
      <div className="min-h-screen bg-[#050816]/65 backdrop-blur-[1px] pb-24">
        {page === "home" && (
          <HomePage members={members} setMembers={setMembers} />
        )}

        {page === "members" && (
          <MembersPage members={members} setMembers={setMembers} />
        )}

        {page === "fine" && <FinePage />}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-[9999] h-16 border-t border-white/10 bg-[#050816]/95 backdrop-blur-xl">
        <div className="grid h-full grid-cols-3 text-sm">
          <button
            onClick={() => setPage("home")}
            className={`py-4 ${page === "home" ? "text-purple-400" : "text-gray-400"}`}
          >
            홈
          </button>

          <button
            onClick={() => setPage("members")}
            className={`py-4 ${page === "members" ? "text-purple-400" : "text-gray-400"}`}
          >
            길드원
          </button>

          <button
            onClick={() => setPage("fine")}
            className={`py-4 ${page === "fine" ? "text-purple-400" : "text-gray-400"}`}
          >
            조각
          </button>
        </div>
      </nav>
    </main>
  );
}

function Card({
  title,
  value,
  color = "text-white",
}: {
  title: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#151c33]/90 to-[#202b4d]/90 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl transition-all duration-200 hover:scale-[1.02] hover:border-purple-400/40">
      <p className="text-sm font-bold text-gray-400">{title}</p>
      <h2 className={`mt-3 text-4xl font-extrabold ${color}`}>
        {value}
      </h2>
    </div>
  );
}

function HomePage({
  members,
  setMembers,
}: {
  members: any[];
  setMembers: React.Dispatch<React.SetStateAction<any[]>>;
}) {
  const [guild, setGuild] = useState<any>(null);
  const [weeklyJoinedCount, setWeeklyJoinedCount] = useState(0);
  const [weeklyLeftCount, setWeeklyLeftCount] = useState(0);

  useEffect(() => {
    const fetchHomeData = async () => {
      console.log("fetchHomeData 실행됨");
  
      const guildRes = await fetch("/api/nexon-test");
      const guildData = await guildRes.json();
  
      setGuild(guildData);
  
      if (members.length === 0) {
        if (guildData.guild_member) {
          await syncGuildMembers(guildData.guild_member);
        }
  
        const firebaseSnapshot = await getDocs(collection(db, "members"));
        const savedMembers = firebaseSnapshot.docs.map((doc) => doc.data());
        setMembers(savedMembers);
      }
    };
  
    const loadWeeklyStats = async () => {
      const stats = await getWeeklyGuildStats();
      setWeeklyJoinedCount(stats.weeklyJoinedCount);
      setWeeklyLeftCount(stats.weeklyLeftCount);
    };
  
    fetchHomeData();
    loadWeeklyStats();
  }, []);

  if (!guild) {
    return (
      <section className="max-w-[1800px] mx-auto p-8">
        <h1 className="text-3xl font-bold">메이플 길드관리</h1>
        <p className="text-gray-400 mt-4">길드 정보를 불러오는 중...</p>
      </section>
    );
  }

  const mainRoles = ["별빛", "달빛", "바다", "길컨x", "원양어선", "밤뚜기"];
  const subRoles = ["호수", "부캐x"];

  const mainCount = members.filter((m) => mainRoles.includes(m.role)).length;
  const subCount = members.filter((m) => subRoles.includes(m.role)).length;
  const roleCounts = members.reduce((acc, member) => {
    const role = member.role || "신입";
    acc[role] = (acc[role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
 
  return (
    <section className="p-5">
      <div className="rounded-[32px] border border-purple-400/20 bg-gradient-to-br from-[#1a2340]/90 to-[#111827]/90 p-8 shadow-2xl shadow-purple-900/20 backdrop-blur-xl">
  <div className="flex items-center justify-between">
    <div>
      <h1 className="text-5xl font-extrabold text-white tracking-tight">
        {guild.guild_name}
      </h1>

      <p className="mt-2 text-lg text-gray-400">
        {guild.world_name} · 길드 레벨 Lv.{guild.guild_level}
      </p>
    </div>

    <div className="text-right">
      <p className="text-sm text-gray-500">
        총 길드원
      </p>

      <h2 className="text-5xl font-extrabold text-purple-400">
        {guild.guild_member_count}
      </h2>
    </div>
  </div>
</div>

      <div className="grid grid-cols-3 gap-5 mt-8">
        <Card title="총 길드원" value={`${guild.guild_member_count}명`} color="text-purple-400" />
        <Card title="본캐 수" value={`${mainCount}명`} color="text-blue-400" />
        <Card title="부캐 수" value={`${subCount}명`} color="text-green-400" />
        <Card title="신입" value={`${weeklyJoinedCount}명`} color="text-yellow-400" />
        <Card title="나간사람" value={`${weeklyLeftCount}명`} color="text-red-400" />
        <Card title="길드 레벨" value={`Lv. ${guild.guild_level}`} color="text-pink-400" />
        </div>


        <div className="mt-8 rounded-[32px] border border-white/10 bg-gradient-to-br from-[#151c33]/90 to-[#202b4d]/90 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl">
  <div className="mb-5 flex items-center justify-between">
    <h2 className="text-2xl font-extrabold">
      직위별 인원
    </h2>

    <span className="rounded-full bg-purple-500/20 px-3 py-1 text-sm font-bold text-purple-300">
      전체 {members.length}명
    </span>
  </div>

  <div className="grid grid-cols-3 gap-3">
    {Object.entries(roleCounts).map(([role, count]) => (
      <div
        key={role}
        className="rounded-2xl border border-white/10 bg-black/20 p-4"
      >
        <p className="text-sm text-gray-400">{role}</p>
        <p className="mt-2 text-2xl font-extrabold">
          {String(count)}명
        </p>
      </div>
    ))}
  </div>
</div>
<div className="mt-8 grid grid-cols-2 gap-5">
  <div className="rounded-[28px] border border-red-500/20 bg-gradient-to-br from-red-500/10 to-transparent p-6 backdrop-blur-xl">
    <p className="text-sm font-bold text-red-300">
      조회 실패 캐릭터
    </p>

    <h2 className="mt-3 text-5xl font-extrabold text-red-400">
      {
        members.filter(
          (m) =>
            !m.job ||
            m.job === "조회실패" ||
            m.job === "알수없음"
        ).length
      }
    </h2>

    <p className="mt-2 text-sm text-gray-400">
      API 재조회 필요
    </p>
  </div>

  <div className="rounded-[28px] border border-yellow-500/20 bg-gradient-to-br from-yellow-500/10 to-transparent p-6 backdrop-blur-xl">
    <p className="text-sm font-bold text-yellow-300">
      신입 길드원
    </p>

    <h2 className="mt-3 text-5xl font-extrabold text-yellow-400">
      {weeklyJoinedCount}
    </h2>

    <p className="mt-2 text-sm text-gray-400">
      이번 주 가입
    </p>
  </div>
</div>
</section>
  );
} 

function MembersPage({
  members,
  setMembers,
}: {
  members: any[];
  setMembers: React.Dispatch<React.SetStateAction<any[]>>;
}) {
  const [search, setSearch] = useState("");
  const [sortType, setSortType] = useState("role");
  const [filterType, setFilterType] = useState("all");
  const [loading, setLoading] = useState(members.length === 0);

  const updateRole = async (name: string, newRole: string) => {
    try {
      await updateDoc(doc(db, "members", name), {
        role: newRole,
      });

      setMembers((prev) =>
        prev.map((member) =>
          (member.name || member.characterName) === name
            ? { ...member, role: newRole }
            : member
        )
      );
    } catch (error) {
      console.error(error);
    }
  };
  const retryFailedMembers = async () => {
    setLoading(true);
  
    const retryTargets = members.filter(
      (m) =>
        !m.job ||
        m.job === "알수없음" ||
        m.job === "조회실패" ||
        m.level === "-"
    );
  
    const updatedMembers = [...members];
  
    for (const member of retryTargets) {
      const name = member.name || member.characterName;
  
      if (!name) continue;
  
      try {
        const charRes = await fetch(
          "/api/character-info?name=" + encodeURIComponent(name)
        );
        const charData = await charRes.json();
  
        if (charData.level && charData.job) {
          const fixedMember = {
            ...member,
            name,
            characterName: name,
            level: charData.level,
            job: charData.job,
            image: charData.image || member.image || "",
            lastLogin: charData.lastLogin || "정보없음",
            status: "정상",
            errorReason: "",
          };
  
          await setDoc(doc(db, "members", name), fixedMember, {
            merge: true,
          });
  
          const index = updatedMembers.findIndex(
            (m) => (m.name || m.characterName) === name
          );
  
          if (index !== -1) {
            updatedMembers[index] = fixedMember;
          }
        } else {
          const failedMember = {
            ...member,
            name,
            characterName: name,
            job: "조회실패",
            status: "조회실패",
            errorReason: charData.error || "알 수 없는 오류",
          };
  
          await setDoc(doc(db, "members", name), failedMember, {
            merge: true,
          });
        }
      } catch (error) {
        console.error("재조회 실패:", name, error);
      }
  
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  
    setMembers(updatedMembers);
    setLoading(false);
  };
  const addSubCharacter = async (mainName: string) => {
    const subName = prompt("추가할 부캐 닉네임을 입력하세요");
  
    if (!subName) return;
  
    try {
    const charRes = await fetch(
  "/api/character-info?name=" + encodeURIComponent(subName)
);
      const charData = await charRes.json();
  
      console.log("부캐 API 결과:", charData);

      if (!charData.level && !charData.character_level) {
        alert("부캐 정보를 찾을 수 없습니다.");
        return;
      }
  
      const subCharacter = {
        name: subName,
        level: charData.level || charData.character_level,
        job: charData.job || charData.character_class || "직업정보없음",
        image: charData.image || charData.character_image || "",
      };
      const updatedMembers = members.map((member) => {
        const name = member.name || member.characterName;
  
        if (name !== mainName) return member;
  
        const oldSubs = member.subCharacters || [];

        const isDuplicate = oldSubs.some(
          (sub: any) => sub.name === subCharacter.name
        );
        
        if (isDuplicate) {
          alert("이미 등록된 부캐입니다.");
          return member;
        }
        
        return {
          ...member,
          subCharacters: [...oldSubs, subCharacter]
        };
      });
  
      const mainMember = updatedMembers.find(
        (m) => (m.name || m.characterName) === mainName
      );
  
      await setDoc(
        doc(db, "members", mainName),
        {
          subCharacters: mainMember.subCharacters,
        },
        { merge: true }
      );
  
      setMembers(updatedMembers);
    } catch (error) {
      console.error(error);
      alert("부캐 추가 중 오류가 발생했습니다.");
    }
  };
  const removeSubCharacter = async (mainName: string, subName: string) => {
    const mainMember = members.find(
      (m) => (m.name || m.characterName) === mainName
    );
  
    if (!mainMember) return;
  
    const newSubs = (mainMember.subCharacters || []).filter(
      (sub) => sub.name !== subName
    );
  
    await setDoc(
      doc(db, "members", mainName),
      {
        subCharacters: newSubs,
      },
      { merge: true }
    );
  
    setMembers((prev) =>
      prev.map((m) =>
        (m.name || m.characterName) === mainName
          ? { ...m, subCharacters: newSubs }
          : m
      )
    );
  };
  useEffect(() => {
    if (members.length > 0) {
      setLoading(false);
      return;
    }
    const fetchMembers = async () => {
      const guildRes = await fetch("/api/nexon-test");
      const guildData = await guildRes.json();

      const firebaseSnapshot = await getDocs(collection(db, "members"));
      const savedMembers = firebaseSnapshot.docs.map((doc) => doc.data());

      const guildMembers: any[] = [];

      for (const name of guildData.guild_member || []) {
        const saved = savedMembers.find(
          (m: any) => m.characterName === name || m.name === name
        );
      
        try {
          const charRes = await fetch(
           "/api/character-info?name=" + encodeURIComponent(name)
          );
      
          const charData = await charRes.json();
      
          if (charData.level && charData.job) {
            const memberData = {
              name,
              characterName: name,
              level: charData.level,
              job: charData.job,
              image: charData.image || "",
              role: saved?.role || "신입",
              lastLogin: charData.lastLogin || "정보없음",
              isActive: true,
            };
      
            await setDoc(doc(db, "members", name), memberData, {
              merge: true,
            });
      
            guildMembers.push(memberData);
          } else {
            guildMembers.push({
              name,
              characterName: name,
              level: saved?.level || "-",
              job: "조회실패",
status: "조회실패",
errorReason: charData?.error || "알 수 없는 오류",
              image: saved?.image || "",
              role: saved?.role || "신입",
            });
          }
        } catch (error) {
          guildMembers.push({
            name,
            characterName: name,
            level: saved?.level || "-",
            job: saved?.job || "알수없음",
            image: saved?.image || "",
            role: saved?.role || "신입",
          });
        }
      
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
      
      setMembers(guildMembers);
      setLoading(false);
    };

    fetchMembers();
  }, [members.length]);

  const roleOrder: Record<string, number> = {
    
    별빛: 1,
    달빛: 2,
    바다: 3,
    호수: 4,
    길컨x: 5,
    부캐x: 6,
    원양어선: 7,
    밤뚜기: 8,
    신입: 9,
  };
  const roleColors: Record<string, string> = {
    
    별빛: "text-purple-400",
    달빛: "text-blue-400",
    바다: "text-cyan-400",
    호수: "text-sky-300",
    길컨x: "text-red-400",
    부캐x: "text-gray-400",
    원양어선: "text-orange-400",
    밤뚜기: "text-pink-400",
    신입: "text-yellow-400",
  };
  const roleBadgeColors: Record<string, string> = {
    별빛: "bg-purple-500/20 text-purple-300",
    달빛: "bg-blue-500/20 text-blue-300",
    바다: "bg-cyan-500/20 text-cyan-300",
    호수: "bg-sky-500/20 text-sky-300",
    길컨x: "bg-red-500/20 text-red-300",
    부캐x: "bg-gray-500/20 text-gray-300",
    원양어선: "bg-orange-500/20 text-orange-300",
    밤뚜기: "bg-pink-500/20 text-pink-300",
    신입: "bg-yellow-500/20 text-yellow-300",
  };
  const mainRoles = ["별빛", "달빛", "바다", "길컨x", "원양어선", "밤뚜기"];
const subRoles = ["호수", "부캐x"];
const linkedSubNames = members.flatMap((m) =>
  (m.subCharacters || []).map((sub) => sub.name)
);
  const filtered = members
  .filter((m) => {
    const memberName = m.name || m.characterName || "";
  
    if (linkedSubNames.includes(memberName)) {
      return false;
    }
  
    const role = m.role || "신입";

    const matchesSearch =
      String(m.name || m.characterName || "").includes(search) ||
      String(m.job || "").includes(search) ||
      String(role).includes(search);

    if (filterType === "new") {
      return matchesSearch && role === "신입";
    }

    if (filterType === "main") {
      return matchesSearch && mainRoles.includes(role);
    }

    if (filterType === "sub") {
      return matchesSearch && subRoles.includes(role);
    }

    return matchesSearch;
  })
  .sort((a, b) => {
    const aFailed =
  a.job === "조회실패" ||
  a.job === "알수없음" ||
  a.level === "-";

const bFailed =
  b.job === "조회실패" ||
  b.job === "알수없음" ||
  b.level === "-";

if (aFailed && !bFailed) return -1;
if (!aFailed && bFailed) return 1;
    const aName = a.name || a.characterName || "";
    const bName = b.name || b.characterName || "";

    if (sortType === "level") {
      return (b.level || 0) - (a.level || 0);
    }

    if (sortType === "name") {
      return aName.localeCompare(bName, "ko");
    }

    return (roleOrder[a.role] || 99) - (roleOrder[b.role] || 99);
  });

  
  const mainCount = members.filter((m) =>
    mainRoles.includes(m.role)
  ).length;
  
  const subCount = members.filter((m) =>
    subRoles.includes(m.role)
  ).length;
  
  const newCount = members.filter(
    (m) => (m.role || "신입") === "신입"
  ).length;
  if (loading) {
    return (
      <section className="max-w-[1800px] mx-auto p-8">
        <h1 className="text-3xl font-bold">길드원</h1>
        <p className="text-gray-400 mt-4">길드원 정보를 불러오는 중...</p>
      </section>
    );
  }
  const failedCount = members.filter(
    (m) =>
      !m.job ||
      m.job === "알수없음" ||
      m.job === "조회실패" ||
      m.level === "-"
  ).length;
  return (
    <section className="p-5">
      <h1 className="text-3xl font-bold">길드원</h1>
      <p className="text-gray-400 mt-1">API + Firebase 직위 자동 정렬</p>
      <button
  onClick={() => {
    setMembers([]);
    setLoading(true);
  }}
  className="mt-4 w-full rounded-2xl bg-purple-500 py-3 font-bold text-white"
>
  길드원 새로고침
</button>
<button
  onClick={() => setSearch("알수없음")}
  className="mt-3 w-full rounded-2xl bg-red-500/20 border border-red-500/30 py-3 font-bold text-red-300"
>
  알수없음 캐릭터만 보기
  
</button>
<button
  onClick={retryFailedMembers}
  className="mt-3 w-full rounded-2xl bg-orange-500/20 border border-orange-500/30 py-3 font-bold text-orange-300"
>
조회실패 {failedCount}명 다시 조회
</button>
<div className="grid grid-cols-3 gap-2 mt-4">
  <button
    onClick={() => setSortType("role")}
    className={`rounded-xl py-2 text-sm font-bold ${
      sortType === "role"
        ? "bg-purple-500 text-white"
        : "bg-[#151c33] text-gray-400"
    }`}
  >
    직위순
  </button>

  <button
    onClick={() => setSortType("level")}
    className={`rounded-xl py-2 text-sm font-bold ${
      sortType === "level"
        ? "bg-purple-500 text-white"
        : "bg-[#151c33] text-gray-400"
    }`}
  >
    레벨순
  </button>

  <button
    onClick={() => setSortType("name")}
    className={`rounded-xl py-2 text-sm font-bold ${
      sortType === "name"
        ? "bg-purple-500 text-white"
        : "bg-[#151c33] text-gray-400"
    }`}
  >
    가나다순
  </button>
</div>
<div className="grid grid-cols-4 gap-2 mt-4">
  <div className="bg-[#151c33] rounded-xl p-3 text-center">
    <p className="text-xs text-gray-400">전체</p>
    <p className="font-bold">{members.length}</p>
  </div>

  <div className="bg-[#151c33] rounded-xl p-3 text-center">
    <p className="text-xs text-gray-400">본캐</p>
    <p className="font-bold text-blue-400">{mainCount}</p>
  </div>

  <div className="bg-[#151c33] rounded-xl p-3 text-center">
    <p className="text-xs text-gray-400">부캐</p>
    <p className="font-bold text-green-400">{subCount}</p>
  </div>

  <div className="bg-[#151c33] rounded-xl p-3 text-center">
    <p className="text-xs text-gray-400">신입</p>
    <p className="font-bold text-yellow-400">{newCount}</p>
  </div>
</div>
<div className="grid grid-cols-4 gap-2 mt-4">
  <button
    onClick={() => setFilterType("all")}
    className={`rounded-xl py-2 text-sm font-bold ${
      filterType === "all"
        ? "bg-purple-500 text-white"
        : "bg-[#151c33] text-gray-400"
    }`}
  >
    전체
  </button>

  <button
    onClick={() => setFilterType("main")}
    className={`rounded-xl py-2 text-sm font-bold ${
      filterType === "main"
        ? "bg-blue-500 text-white"
        : "bg-[#151c33] text-gray-400"
    }`}
  >
    본캐
  </button>

  <button
    onClick={() => setFilterType("sub")}
    className={`rounded-xl py-2 text-sm font-bold ${
      filterType === "sub"
        ? "bg-green-500 text-white"
        : "bg-[#151c33] text-gray-400"
    }`}
  >
    부캐
  </button>

  <button
    onClick={() => setFilterType("new")}
    className={`rounded-xl py-2 text-sm font-bold ${
      filterType === "new"
        ? "bg-yellow-500 text-black"
        : "bg-[#151c33] text-gray-400"
    }`}
  >
    신입
  </button>

</div>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="길드원 검색"
        className="mt-6 w-full rounded-2xl bg-[#151c33] px-4 py-3 outline-none border border-gray-800 focus:border-purple-400"
      />

      <div className="mt-6 space-y-3">
        {filtered.length === 0 && (
          <div className="bg-[#151c33] rounded-2xl p-5 text-center text-gray-400">
            검색 결과가 없습니다.
          </div>
        )}

{filtered.map((m) => {
  const name = m.name || m.characterName || "이름없음";

  return (
    <div
      key={name}
      className={`bg-gradient-to-r from-[#151c33]/90 via-[#18213b]/90 to-[#202b4d]/90 backdrop-blur-xl rounded-3xl p-6 min-h-[240px] overflow-visible flex justify-between items-center border shadow-lg shadow-black/20 transition-all duration-200 hover:scale-[1.01] hover:border-purple-400/50 ${
        m.job === "조회실패" || m.job === "알수없음"
  ? "border-red-500/60 bg-red-500/10 hover:shadow-red-500/20"

  : m.role === "별빛"
  ? "border-purple-400/40 hover:shadow-purple-500/20"

  : m.role === "달빛"
  ? "border-blue-400/40 hover:shadow-blue-500/20"

  : m.role === "바다"
  ? "border-cyan-400/40 hover:shadow-cyan-500/20"

  : m.role === "신입"
  ? "border-yellow-400/50 hover:shadow-yellow-500/20"

  : "border-white/5 hover:border-white/20 hover:shadow-white/10"
      }`}
    >
 <div className="flex justify-between items-center w-full gap-6">
        {m.image && (
      <img
      src={`${m.image}&resize=2`}
      alt={name}
     className="w-56 h-56 object-contain flex-shrink-0 scale-150 hover:scale-[1.7] transition-all duration-300 drop-shadow-2xl"
    />

        )}

<div className="flex-1 flex flex-col justify-center">
        <div className="flex items-center gap-2">
        <h2
  className={`text-xl font-extrabold tracking-tight ${
    roleColors[m.role] || "text-white"
  }`}
>
<div className="flex items-center gap-2">
  <h2
    className={`text-xl font-extrabold tracking-tight ${
      roleColors[m.role] || "text-white"
    }`}
  >
    {name}
  </h2>

  {(m.job === "조회실패" || m.job === "알수없음") && (
    <span className="text-red-400 text-lg">🔴</span>
  )}

  {m.job !== "조회실패" &&
    m.job !== "알수없음" && (
      <span className="text-green-400 text-lg">🟢</span>
    )}
</div>
</h2>

  <span
  className={`rounded-full px-2 py-0.5 text-xs font-bold ${
    roleBadgeColors[m.role] || "bg-white/10 text-gray-300"
  }`}
>
  {m.role || "신입"}
</span>
</div>
<p className="text-sm text-gray-300">
  <span className="text-yellow-400 font-bold">
    Lv.{m.level}
  </span>

  <span className="mx-1 text-gray-500">·</span>

  <span>{m.job}</span>
</p>
<p className="text-xs text-gray-500 mt-1">
  마지막 접속: {m.lastLogin || "정보없음"}
</p>

        </div>
      </div>
      {m.subCharacters && m.subCharacters.length > 0 && (
  <div className="grid grid-cols-3 gap-4 max-w-[620px]">
    {m.subCharacters.map((sub) => (
      <div
        key={sub.name}
        className="min-w-[180px] min-h-[220px] rounded-3xl bg-[#0f172a] border border-purple-400/20 p-5 text-center shadow-xl shadow-black/40 flex flex-col justify-center"
      >
        {sub.image && (
          <img
            src={`${sub.image}&resize=2`}
            alt={sub.name}
            className="mx-auto h-40 w-40 object-contain scale-150 drop-shadow-2xl"
          />
        )}

        <p className="truncate text-base font-extrabold text-white mt-3">
          {sub.name}
        </p>

        <p className="text-sm text-yellow-400 font-extrabold">
          Lv.{sub.level}
        </p>

        <button
          onClick={() => removeSubCharacter(name, sub.name)}
          className="mt-1 text-[10px] text-red-300"
        >
          삭제
        </button>
      </div>
    ))}
  </div>
)}
      <div className="flex flex-col gap-2 items-start">
  <select
    value={m.role || "신입"}
    onChange={(e) => updateRole(name, e.target.value)}
    className="px-3 py-1 rounded-full text-sm outline-none bg-[#1f1b2e] text-white"
  >
    <option value="신입">신입</option>
    <option value="별빛">별빛</option>
    <option value="달빛">달빛</option>
    <option value="바다">바다</option>
    <option value="호수">호수</option>
    <option value="부캐x">부캐x</option>
    <option value="길컨x">길컨x</option>
    <option value="원양어선">원양어선</option>
    <option value="밤뚜기">밤뚜기</option>
  </select>

  <button
    onClick={() => addSubCharacter(name)}
    className="rounded-full bg-purple-500/20 px-3 py-1 text-xs font-bold text-purple-300 hover:bg-purple-500/30"
  >
    부캐추가
  </button>
</div>
    </div>
  );
})}
      </div>
    </section>
  );
}
 
function GuildContentPage({ members }: { members: any[] }) {
  const [localMembers, setLocalMembers] = useState<any[]>(members);
  const [scores, setScores] = useState<any[]>([]);

  useEffect(() => {
    loadGuildScores();
    loadMembersForGuild();
  }, []);
  
  const loadGuildScores = async () => {
    const snapshot = await getDocs(collection(db, "guildScores"));
  
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  
    setScores(data);
  };
  
  const loadMembersForGuild = async () => {
    if (members.length > 0) {
      setLocalMembers(members);
      return;
    }
  
    const snapshot = await getDocs(collection(db, "members"));
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  
    setLocalMembers(data);
  };

  const updateScore = async (
    name: string,
    field: "suro" | "flag",
    value: string
  ) => {
    const num = Number(value) || 0;

    await setDoc(
      doc(db, "guildScores", name),
      {
        name,
        [field]: num,
      },
      { merge: true }
    );

    setScores((prev) => {
      const exists = prev.find((s) => s.name === name);

      if (exists) {
        return prev.map((s) =>
          s.name === name ? { ...s, [field]: num } : s
        );
      }

      return [...prev, { id: name, name, suro: 0, flag: 0, [field]: num }];
    });
  };

  const getScore = (name: string) => {
    return scores.find((s) => s.name === name);
  };

  const totalMembers = localMembers.length;

  const doneMembers = localMembers.filter((m) => {
    const name = m.name || m.characterName;
    const score = getScore(name);
  
    return (score?.suro || 0) > 0 || (score?.flag || 0) > 0;
  }).length;

  const rate =
    totalMembers === 0 ? 0 : Math.round((doneMembers / totalMembers) * 100);
    const sortedMembers = [...localMembers].sort((a, b) => {
      const aName = a.name || a.characterName;
      const bName = b.name || b.characterName;
    
      const aScore = getScore(aName);
      const bScore = getScore(bName);
    
      const aDone =
        (aScore?.suro || 0) > 0 || (aScore?.flag || 0) > 0;
    
      const bDone =
        (bScore?.suro || 0) > 0 || (bScore?.flag || 0) > 0;
    
      return Number(aDone) - Number(bDone);
    });
  return (
    <section className="p-5">
      <h1 className="text-3xl font-bold">길컨유무</h1>
      <p className="text-gray-400 mt-1">수로 / 플래그 참여 확인</p>

      <div className="grid grid-cols-3 gap-3 mt-6">
        <Card title="대상 인원" value={`${totalMembers}명`} color="text-purple-400" />
        <Card title="참여 인원" value={`${doneMembers}명`} color="text-green-400" />
        <Card title="참여율" value={`${rate}%`} color="text-yellow-400" />
      </div>

      <div className="mt-6 space-y-3">
      {sortedMembers.map((m) => {
          const name = m.name || m.characterName || "이름없음";
          const score = getScore(name);
          const suro = score?.suro || 0;
          const flag = score?.flag || 0;
          const done = suro > 0 || flag > 0;

          return (
            <div
              key={name}
              className={`rounded-2xl p-4 border ${
                done
                  ? "bg-green-500/10 border-green-500/30"
                  : "bg-red-500/10 border-red-500/30"
              }`}
            >
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold">{name}</h2>

                <span
                  className={
                    done
                      ? "text-green-400 font-bold"
                      : "text-red-400 font-bold"
                  }
                >
                  {done ? "참여" : "미참여"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4">
                <input
                  type="number"
                  value={suro}
                  onChange={(e) => updateScore(name, "suro", e.target.value)}
                  placeholder="수로 점수"
                  className="rounded-xl bg-[#151c33] px-3 py-2 outline-none"
                />

                <input
                  type="number"
                  value={flag}
                  onChange={(e) => updateScore(name, "flag", e.target.value)}
                  placeholder="플래그 점수"
                  className="rounded-xl bg-[#151c33] px-3 py-2 outline-none"
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function FinePage() {
  const [fines, setFines] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [pieces, setPieces] = useState("");

  useEffect(() => {
    loadFines();
  }, []);

  const loadFines = async () => {
    const snapshot = await getDocs(collection(db, "fines"));

    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setFines(data);
  };

  const addFine = async () => {
    if (!name || !pieces) return;

    await addDoc(collection(db, "fines"), {
      name,
      pieces: Number(pieces),
    });

    setName("");
    setPieces("");

    loadFines();
    const deleteFine = async (id: string) => {
      await deleteDoc(doc(db, "fines", id));
    
      loadFines();
    };
  };
  const deleteFine = async (id: string) => {
    await deleteDoc(doc(db, "fines", id));
  
    loadFines();
  };
  const total = fines.reduce(
    (sum, fine) => sum + (fine.pieces || 0),
    0
  );

  return (
    <section className="p-5">
      <h1 className="text-3xl font-bold">조각 / 벌금</h1>

      <div className="bg-[#151c33] rounded-2xl p-5 mt-8">
        <p className="text-gray-400">총 누적 조각</p>

        <h2 className="text-4xl font-bold mt-2 text-yellow-400">
          {total}개
        </h2>
      </div>

      <div className="mt-6 space-y-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="닉네임"
          className="w-full rounded-2xl bg-[#151c33] px-4 py-3 outline-none"
        />

        <input
          value={pieces}
          onChange={(e) => setPieces(e.target.value)}
          placeholder="조각 수"
          type="number"
          className="w-full rounded-2xl bg-[#151c33] px-4 py-3 outline-none"
        />

        <button
          onClick={addFine}
          className="w-full rounded-2xl bg-yellow-500 py-3 font-bold text-black"
        >
          벌금 추가
        </button>
      </div>

      <h2 className="text-xl font-bold mt-8 mb-4">
        벌금 목록
      </h2>

      <div className="space-y-3">
        {fines.map((f) => (
          <div
  key={f.id}
  className="bg-[#151c33] rounded-2xl p-4 flex items-center gap-8"
>
  <div>
    <p>{f.name}</p>

    <p className="text-yellow-400 text-sm">
      {f.pieces}개
    </p>
  </div>

  <button
    onClick={() => deleteFine(f.id)}
    className="rounded-xl bg-red-500 px-3 py-2 text-sm font-bold"
  >
    삭제
  </button>
</div>
        ))}
      </div>
    </section>
  );
}