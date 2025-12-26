import React, { useState, useRef, useMemo } from 'react';
import { Upload, UserPlus, Trash2, FileText, AlertTriangle, UserCheck, Wand2 } from 'lucide-react';
import { Participant } from '../types';

interface NameInputProps {
  participants: Participant[];
  setParticipants: React.Dispatch<React.SetStateAction<Participant[]>>;
  onNext: () => void;
}

export const NameInput: React.FC<NameInputProps> = ({ participants, setParticipants, onNext }) => {
  const [inputText, setInputText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Demo data
  const handleLoadDemo = () => {
    const demoNames = [
      "孫悟空", "貝吉塔", "魯夫", "索隆", "娜美", "鳴人", "佐助", "小櫻", 
      "炭治郎", "禰豆子", "善逸", "伊之助", "虎杖", "伏黑", "釘崎", "五條悟", 
      "安妮亞", "黃昏", "約兒", "彭德", "艾連", "米卡莎", "阿爾敏", "里維",
      "芙莉蓮", "費倫", "修塔爾克", "欣梅爾", "埼玉", "傑諾斯"
    ];
    
    // Check if we should append or replace (simple confirm if list is not empty)
    if (participants.length > 0) {
      if (!window.confirm("目前已有已名單，是否要加入 30 筆範例名單？")) {
        return;
      }
    }

    const newParticipants: Participant[] = demoNames.map(name => ({
      id: crypto.randomUUID(),
      name
    }));

    setParticipants(prev => [...prev, ...newParticipants]);
  };

  const handleAddText = () => {
    if (!inputText.trim()) return;

    const names = inputText
      .split(/[\n,]+/) // Split by newline or comma
      .map(n => n.trim())
      .filter(n => n.length > 0);

    const newParticipants: Participant[] = names.map(name => ({
      id: crypto.randomUUID(),
      name
    }));

    setParticipants(prev => [...prev, ...newParticipants]);
    setInputText('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const names = text
          .split(/[\r\n]+/)
          .map(row => row.split(',')[0].trim()) // Assume first column if CSV has multiple
          .filter(n => n.length > 0);

        const newParticipants: Participant[] = names.map(name => ({
          id: crypto.randomUUID(),
          name
        }));
        
        setParticipants(prev => [...prev, ...newParticipants]);
      }
    };
    reader.readAsText(file);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const clearAll = () => {
    if (window.confirm('確定要清空所有名單嗎？')) {
      setParticipants([]);
    }
  };

  // Duplicate Logic
  const nameCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    participants.forEach(p => {
      counts[p.name] = (counts[p.name] || 0) + 1;
    });
    return counts;
  }, [participants]);

  // Fix: Cast Object.values result to number[] to avoid 'unknown' type error
  const hasDuplicates = (Object.values(nameCounts) as number[]).some(c => c > 1);

  const removeDuplicates = () => {
    const seen = new Set<string>();
    const uniqueParticipants = participants.filter(p => {
      if (seen.has(p.name)) {
        return false;
      }
      seen.add(p.name);
      return true;
    });
    setParticipants(uniqueParticipants);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-md space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-800">名單管理</h2>
        <p className="text-gray-500">請輸入參加者姓名，或上傳 CSV 檔案。</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
               <label className="block text-sm font-medium text-gray-700">
                手動輸入 (一行一個或是用逗號分隔)
              </label>
              <button 
                onClick={handleLoadDemo}
                className="text-xs flex items-center gap-1 text-brand-600 hover:text-brand-700 bg-brand-50 px-2 py-1 rounded-md transition"
              >
                <Wand2 size={12} />
                載入範例 (30人)
              </button>
            </div>
           
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              placeholder="例如：&#10;王小明&#10;李大華&#10;張美麗"
            />
            <button
              onClick={handleAddText}
              disabled={!inputText.trim()}
              className="mt-2 w-full flex items-center justify-center gap-2 py-2 px-4 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <UserPlus size={18} />
              加入名單
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">或是</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              上傳 CSV 檔案
            </label>
            <input
              type="file"
              accept=".csv,.txt"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 transition"
            >
              <Upload size={18} />
              選擇檔案
            </button>
            <p className="mt-1 text-xs text-gray-400">支援 .csv 或 .txt 格式，每行一個姓名</p>
          </div>
        </div>

        {/* List Section */}
        <div className="flex flex-col h-[400px]">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-gray-700 flex items-center gap-2">
              <FileText size={18} />
              目前名單 ({participants.length} 人)
            </h3>
            <div className="flex gap-2">
              {hasDuplicates && (
                <button
                  onClick={removeDuplicates}
                  className="text-amber-600 hover:text-amber-700 text-sm flex items-center gap-1 bg-amber-50 px-2 py-1 rounded transition"
                  title="移除所有重複的姓名，只保留一個"
                >
                  <UserCheck size={14} /> 移除重複
                </button>
              )}
              {participants.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1 px-2 py-1 rounded hover:bg-red-50 transition"
                >
                  <Trash2 size={14} /> 清空
                </button>
              )}
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto bg-gray-50 border border-gray-200 rounded-lg p-3">
            {participants.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <UserPlus size={48} className="mb-2 opacity-20" />
                <p>目前沒有參加者</p>
                <button 
                  onClick={handleLoadDemo}
                  className="mt-4 text-sm text-brand-600 underline hover:text-brand-800"
                >
                  載入範例試試看
                </button>
              </div>
            ) : (
              <ul className="space-y-1">
                {participants.map((p, idx) => {
                  const isDuplicate = nameCounts[p.name] > 1;
                  return (
                    <li 
                      key={p.id} 
                      className={`flex justify-between items-center p-2 rounded shadow-sm border transition-colors ${
                        isDuplicate 
                          ? 'bg-amber-50 border-amber-200' 
                          : 'bg-white border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <span className="text-gray-400 text-xs flex-shrink-0 w-6">{idx + 1}.</span>
                        <span className={`text-gray-800 truncate ${isDuplicate ? 'font-medium text-amber-900' : ''}`}>
                          {p.name}
                        </span>
                        {isDuplicate && (
                          <span className="flex-shrink-0 text-amber-500" title="重複的姓名">
                            <AlertTriangle size={14} />
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => setParticipants(prev => prev.filter(item => item.id !== p.id))}
                        className="text-gray-400 hover:text-red-500 flex-shrink-0 ml-2"
                      >
                        <Trash2 size={14} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-100">
        <button
          onClick={onNext}
          disabled={participants.length === 0}
          className="bg-brand-600 text-white px-8 py-3 rounded-lg text-lg font-medium shadow hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          開始使用功能 &rarr;
        </button>
      </div>
    </div>
  );
};