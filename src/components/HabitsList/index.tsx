import { useEffect, useState } from "react";
import { api } from "../../lib/axios";
import * as Checkbox from "@radix-ui/react-checkbox";
import dayjs from "dayjs";

import { Check } from "phosphor-react";

type HabitsListProps = {
  date: Date;
  handleCompletedChanged: (completed: number) => void;
};

type HabitsInfoType = {
  possibleHabits: Array<{
    id: string;
    title: string;
    created_at: string;
  }>;
  completedHabits: string[];
};

export const HabitsList = ({
  date,
  handleCompletedChanged,
}: HabitsListProps) => {
  const [habitsInfo, setHabitsInfo] = useState<HabitsInfoType>();

  useEffect(() => {
    api
      .get("/day", {
        params: {
          date: date.toISOString(),
        },
      })
      .then((response) => {
        setHabitsInfo(response.data);
      });
  }, []);

  const isDateInPast = dayjs(date).endOf("day").isBefore(new Date());

  const handleToggleHabit = async (habitID: string) => {
    const isHabitAlreadyCompleted =
      habitsInfo!.completedHabits.includes(habitID);

    await api.patch(`/habits/${habitID}/toggle`);

    let completedHabits: string[] = [];

    if (isHabitAlreadyCompleted) {
      completedHabits = habitsInfo!.completedHabits.filter(
        (id) => id !== habitID
      );
    } else {
      completedHabits = [...habitsInfo!.completedHabits, habitID];
    }

    setHabitsInfo({
      possibleHabits: habitsInfo!.possibleHabits,
      completedHabits,
    });

    handleCompletedChanged(completedHabits.length);
  };

  return (
    <>
      <div className="mt-6 flex flex-col gap-3">
        {habitsInfo?.possibleHabits.map((habit) => {
          return (
            <Checkbox.Root
              key={habit.id}
              onCheckedChange={() => handleToggleHabit(habit.id)}
              checked={habitsInfo.completedHabits.includes(habit.id)}
              className="flex items-center gap-3 group"
            >
              <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-zinc-900 border-2 border-zinc-800 group-data-[state=checked]:bg-green-500 group-data-[state=checked]:border-green-500 transition-colors">
                <Checkbox.Indicator>
                  <Check size={20} className="text-white" />
                </Checkbox.Indicator>
              </div>
              <span className="font-semibold text-xl text-white leading-tight group-data-[state=checked]:line-through group-data-[state=checked]:text-zinc-400">
                {habit.title}
              </span>
            </Checkbox.Root>
          );
        })}
      </div>
    </>
  );
};
