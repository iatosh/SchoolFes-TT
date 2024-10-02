"use client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CircleCheckBigIcon,
  CircleFadingPlusIcon,
  EraserIcon,
  XIcon,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { useRouter } from 'next/navigation';

const timeSlots = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
];

const getTimeString = (hour: number, minute: number) => {
  return `${hour.toString().padStart(2, "0")}:${minute
    .toString()
    .padStart(2, "0")}`;
};

export function BandRegistrationFormComponent() {
  const router = useRouter();
  const [members, setMembers] = useState(["", ""]);
  const [selectedColor, setSelectedColor] = useState("purple");
  const [timeSelections, setTimeSelections] = useState<{
    [key: number]: string[];
  }>({
    1: Array((timeSlots.length - 1) * 12).fill(""),
    2: Array((timeSlots.length - 1) * 12).fill(""),
    3: Array((timeSlots.length - 1) * 12).fill(""),
  });
  const isDraggingRef = useRef(false);

  const addMember = () => {
    setMembers([...members, ""]);
  };

  const removeMember = (index: number) => {
    if (index < 2) return; // Prevent removing first two members
    const newMembers = [...members];
    newMembers.splice(index, 1);
    setMembers(newMembers);
  };

  const handleMouseDown = (day: number, index: number) => {
    isDraggingRef.current = true;
    updateTimeSelection(day, index);
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleMouseEnter = (day: number, index: number) => {
    if (isDraggingRef.current) {
      updateTimeSelection(day, index);
    }
  };

  const updateTimeSelection = (day: number, index: number) => {
    setTimeSelections((prev) => ({
      ...prev,
      [day]: prev[day].map((_, i) =>
        i === index ? selectedColor : prev[day][i]
      ),
    }));
  };

  const renderTimeSlots = useCallback(
    (day: number) => {
      return timeSelections[day].map((color: string, index: number) => {
        const hour = Math.floor(index / 12) + 9;
        const minute = (index % 12) * 5;
        const showTime = index > 0 && timeSelections[day][index - 1] !== color;
        const timeString = getTimeString(hour, minute);

        return (
          <div
            key={index}
            className={`h-full w-full relative ${
              color === "purple"
                ? "bg-purple-500"
                : color === "orange"
                ? "bg-orange-400"
                : "bg-gray-100"
            }
              ${minute === 0 ? "border-l border-gray-300" : ""}
              ${hour === 17 && minute === 55 ? "border-r border-gray-300" : ""}
            `}
            onMouseDown={() => handleMouseDown(day, index)}
            onMouseEnter={() => handleMouseEnter(day, index)}
          >
            {showTime && (
              <span className="absolute bottom-full left-0 text-[8px] text-gray-500 -translate-x-1/2">
                {timeString}
              </span>
            )}
          </div>
        );
      });
    },
    [timeSelections, selectedColor]
  );

  const handleSubmit = () => {
    const bandName = document.getElementById("bandName") as HTMLInputElement;
    const performanceTime = document.getElementById("performanceTime") as HTMLSelectElement;
    const bandmaster = document.getElementById("bandmaster") as HTMLInputElement;
    const errorMessages: string[] = [];

    if (!bandName.value) errorMessages.push("バンド名を入力してください。");
    if (!performanceTime.value) errorMessages.push("演奏時間を選択してください。");
    if (!bandmaster.value) errorMessages.push("バンマス名を入力してください。");
    if (members.filter(member => member.trim() !== "").length < 2) errorMessages.push("メンバーを2人以上入力してください。");

    let hasPerformanceTime = false;
    for (let day = 1; day <= 3; day++) {
      if (timeSelections[day].some(color => color !== "")) {
        hasPerformanceTime = true;
        break;
      }
    }
    if (!hasPerformanceTime) errorMessages.push("出演可能時間を選択してください。");


    if (errorMessages.length > 0) {
      alert(errorMessages.join('\n'));
      return;
    }

    const registrationData = {
      bandName: bandName.value,
      performanceTime: performanceTime.value,
      bandmaster: bandmaster.value,
      members: members.filter(member => member.trim() !== ""),
      timeSelections: timeSelections,
    };

    console.log("登録データ:", registrationData); // ログ出力
    alert("登録が完了しました！");
    router.push('/success'); // 成功ページへリダイレクト
  };


  return (
    <div
      className="max-w-6xl mx-auto self-center p-8 space-y-8"
      onMouseUp={handleMouseUp}
    >
      <h1 className="text-3xl font-bold underline">バンド登録フォーム</h1>

      <div className="flex flex-col md:flex-row md:space-x-8">
        <div className="md:max-w-64 w-full md:w-1/3 space-y-4">
          <div>
            <Label htmlFor="bandName">バンド名</Label>
            <Input id="bandName" placeholder="バンド名を入力" />

            <div className="flex items-center justify-between w-full mt-2 pb-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="currentBand" />
                <Label htmlFor="currentBand">現役</Label>
              </div>
              <div className="flex items-center">
                <Label htmlFor="performanceTime" className="text-sm">
                  演奏時間
                </Label>
                <select
                  id="performanceTime"
                  className="ml-2 border border-gray-300 rounded p-1 text-sm"
                >
                  <option value="">--</option>
                  {Array.from({ length: 8 }, (_, i) => i + 3).map((time) => (
                    <option key={time} value={time}>
                      {time}分
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="bandmaster">バンマス</Label>
            <Input id="bandmaster" placeholder="名前を入力" />
          </div>

          {members.map((member: string, index: number) => (
            <div key={index} className="mb-4 flex items-center">
              <div className="flex-grow">
                <Label htmlFor={`member${index + 1}`}>
                  メンバー{index + 1}
                </Label>
                <Input
                  id={`member${index + 1}`}
                  value={member}
                  onChange={(e) => {
                    const newMembers = [...members];
                    newMembers[index] = e.target.value;
                    setMembers(newMembers);
                  }}
                  placeholder="名前を入力"
                />
              </div>
              {index >= 2 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="mt-6"
                  onClick={() => removeMember(index)}
                >
                  <XIcon className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}

          <Button onClick={addMember} className="w-full">
            メンバーを追加
          </Button>
        </div>

        <div className="w-full md:w-2/3 space-y-4 mt-8 md:mt-0">
          <h2 className="text-xl font-semibold">出演可能時間</h2>
          {[1, 2, 3].map((day: number) => (
            <div key={day} className="space-y-2">
              <h3 className="font-medium">{day}日目</h3>
              <div className="h-8 bg-gray-100 relative flex">
                {renderTimeSlots(day)}
              </div>
              <div className="flex space-x-timeSlot text-xs text-gray-500 -translate-x-4">
                {timeSlots.map((time: string, index: number) => (
                  <span key={index} className="text-center">
                    {time}
                  </span>
                ))}
              </div>
            </div>
          ))}

          <div className="flex flex-wrap gap-4">
            <Button
              variant="outline"
              onClick={() => setSelectedColor("purple")}
              className={`${
                selectedColor === "purple"
                  ? "bg-purple-200 hover:bg-purple-300"
                  : "hover:bg-accent"
              } flex-grow`}
            >
              <CircleFadingPlusIcon className="mr-2 h-4 w-4" /> 過半数来れる
            </Button>
            <Button
              variant="outline"
              onClick={() => setSelectedColor("orange")}
              className={`${
                selectedColor === "orange"
                  ? "bg-orange-200 hover:bg-orange-300"
                  : "hover:bg-accent"
              } flex-grow`}
            >
              <CircleCheckBigIcon className="mr-2 h-4 w-4" /> 全員来れる
            </Button>
            <Button
              variant="outline"
              onClick={() => setSelectedColor("")}
              className={`${
                selectedColor !== "orange" && selectedColor !== "purple"
                  ? "bg-gray-200 hover:bg-gray-300"
                  : "hover:bg-accent"
              } flex-grow`}
            >
              <EraserIcon className="mr-2 h-4 w-4" /> 消しゴム
            </Button>
          </div>
          <div className="flex justify-end mt-4">
            <Button
              type="button"
              onClick={handleSubmit}
              className="bg-yellow-200 text-black hover:bg-yellow-300 hover:shadow-lg hover:shadow-yellow-500/50 active:bg-yellow-100 active:shadow-none"
            >
              登録
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

