import React, { useState } from 'react';
import { Users, Shuffle, Sparkles, Download, Copy, FileDown } from 'lucide-react';
import { Participant, Group } from '../types';
import { generateCreativeTeamNames } from '../services/geminiService';

interface TeamGeneratorProps {
  participants: Participant[];
}

export const TeamGenerator: React.FC<TeamGeneratorProps> = ({ participants }) => {
  const [groupSize, setGroupSize] = useState<number>(3);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleGenerate = () => {
    if (participants.length === 0) return;

    // Shuffle
    const shuffled = [...participants].sort(() => Math.random() - 0.5);
    const newGroups: Group[] = [];
    
    // Chunk
    for (let i = 0; i < shuffled.length; i += groupSize) {
      const chunk = shuffled.slice(i, i + groupSize);
      newGroups.push({
        id: crypto.randomUUID(),
        name: `第 ${newGroups.length + 1} 組`,
        members: chunk
      });
    }

    // Handle remainders (distribute to previous groups if chunk is too small? 
    // Usually standard logic is just keep the last group small or make it larger.
    // Here we strictly follow "group size" until the end, leaving the last group potentially smaller)
    
    setGroups(newGroups);
  };

  const handleAiNaming = async () => {
    if (groups.length === 0) return;
    setIsAiLoading(true);
    try {
      const result = await generateCreativeTeamNames(groups);
      
      const updatedGroups = groups.map((g, idx) => {
        const aiGroup = result.groups.find(ag => ag.index === idx);
        if (aiGroup) {
          return { ...g, name: aiGroup.teamName, motto: aiGroup.motto };
        }
        return g;
      });
      
      setGroups(updatedGroups);
    } catch (error) {
      alert("AI 生成失敗，請檢查 API Key 或是稍後再試。");
    } finally {
      setIsAiLoading(false);
    }
  };

  const copyToClipboard = () => {
    const text = groups.map(g => {
      return `${g.name} ${g.motto ? `(${g.motto})` : ''}\n成員: ${g.members.map(m => m.name).join(', ')}`;
    }).join('\n\n');
    
    navigator.clipboard.writeText(text);
    alert("分組結果已複製到剪貼簿");
  };

  const handleDownloadCSV = () => {
    if (groups.length === 0) return;

    // BOM for Excel to recognize UTF-8
    const BOM = "\uFEFF";
    const headers = ["組別名稱", "隊呼/格言", "組員姓名"];
    
    const rows = groups.flatMap(group => 
      group.members.map(member => [
        `"${group.name}"`, // Quote to handle potential commas
        `"${group.motto || ''}"`,
        `"${member.name}"`
      ])
    );

    const csvContent = BOM + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `分組結果_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-md space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 border-b border-gray-100 pb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Users className="text-brand-600" />
              自動分組
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              總人數: {participants.length} 人
            </p>
          </div>

          <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-lg">
            <label className="text-sm font-medium text-gray-700">每組人數：</label>
            <input
              type="number"
              min="1"
              max={participants.length || 100}
              value={groupSize}
              onChange={(e) => setGroupSize(parseInt(e.target.value) || 1)}
              className="w-20 p-2 border border-gray-300 rounded focus:ring-brand-500 focus:border-brand-500 text-center"
            />
            <button
              onClick={handleGenerate}
              className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded hover:bg-brand-700 transition shadow-sm"
            >
              <Shuffle size={18} />
              開始分組
            </button>
          </div>
        </div>

        {groups.length > 0 && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex flex-wrap gap-3 justify-end">
               <button
                onClick={handleAiNaming}
                disabled={isAiLoading}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-2 rounded hover:shadow-lg hover:from-purple-600 hover:to-indigo-700 transition disabled:opacity-70"
              >
                {isAiLoading ? (
                  <span className="animate-spin">✨</span>
                ) : (
                  <Sparkles size={18} />
                )}
                {isAiLoading ? 'AI 正在發想隊名...' : 'AI 創意命名'}
              </button>
              
              <button
                onClick={handleDownloadCSV}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition shadow-sm"
              >
                <FileDown size={18} />
                下載 CSV
              </button>

              <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200 transition border border-gray-200"
              >
                <Copy size={18} />
                複製結果
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groups.map((group) => (
                <div key={group.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition duration-200">
                  <div className={`p-4 ${group.motto ? 'bg-indigo-50' : 'bg-gray-50'} border-b border-gray-100`}>
                    <h3 className="font-bold text-lg text-gray-900">{group.name}</h3>
                    {group.motto && (
                      <p className="text-xs text-indigo-600 italic mt-1 font-medium">"{group.motto}"</p>
                    )}
                  </div>
                  <div className="p-4">
                    <ul className="space-y-2">
                      {group.members.map((member) => (
                        <li key={member.id} className="flex items-center gap-2 text-gray-700">
                          <div className="w-2 h-2 rounded-full bg-brand-400"></div>
                          {member.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-gray-50 px-4 py-2 text-xs text-gray-400 text-right">
                    {group.members.length} 人
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {groups.length === 0 && participants.length > 0 && (
          <div className="text-center py-20 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <Users className="mx-auto text-gray-300 mb-2" size={48} />
            <p className="text-gray-500">設定人數並點擊「開始分組」以查看結果</p>
          </div>
        )}
      </div>
    </div>
  );
};