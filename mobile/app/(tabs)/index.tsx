import { useEffect, useState } from "react";
import { Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import RecordCard from "@/components/RecordCard";
import { useAuth } from "../_layout";
import { create } from "zustand";

export const useRecords = create((set) => ({
  records: [],
  fetchRecords: (date: Date, session: any) => {
    if (!session?.user?.id) {
      return;
    }
    fetch(`${process.env.EXPO_PUBLIC_API_URL}/record`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({
        user_id: session.user.id,
        date: date.toISOString().split("T")[0],
      }),
    })
      .then((res) => res.json())
      .then((data) => set({ records: data.records }));
  },
}));

export default function HomeScreen() {
  const session = useAuth((state: any) => state.session);

  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const records = useRecords((state: any) => state.records);
  const fetchRecords = useRecords((state: any) => state.fetchRecords);

  useEffect(() => {
    fetchRecords(date, session);
  }, [date, session]);

  return (
    <SafeAreaView className="flex-1 flex gap-4 mx-4">
      {/* 日期选择 */}
      <View className="flex flex-row justify-between">
        <Text className="font-bold">{date.toLocaleDateString()}</Text>
        <Pressable onPress={() => setShowDatePicker(true)}>
          <Text className="text-gray-500">选择日期</Text>
        </Pressable>
      </View>
      {/* 日期选择器 */}
      {showDatePicker && (
        <View className="items-center">
          <DateTimePicker
            value={date}
            mode="date"
            display="inline"
            onChange={(event, selectedDate) => {
              if (selectedDate) {
                setDate(selectedDate);
                setShowDatePicker(false);
              }
            }}
          />
        </View>
      )}
      {/* 收入支出 */}
      <View className="h-1/8 flex flex-row justify-between gap-2">
        <View className="flex-1 bg-green-50 rounded-lg p-4 flex items-center justify-center">
          <View className="w-full flex flex-row justify-between">
            <Text className="font-bold">收入</Text>
            <Text className="text-green-500">
              {records
                .filter((record: any) => record.amount > 0)
                .reduce((acc: number, record: any) => acc + record.amount, 0)}
            </Text>
          </View>
        </View>
        <View className="flex-1 bg-red-50 rounded-lg p-4 flex items-center justify-center">
          <View className="w-full flex flex-row justify-between">
            <Text className="font-bold">支出</Text>
            <Text className="text-red-500">
              {records
                .filter((record: any) => record.amount < 0)
                .reduce((acc: number, record: any) => acc + record.amount, 0)}
            </Text>
          </View>
        </View>
      </View>
      {/* 账单列表 */}
      <View className="flex-1 bg-gray-100 rounded-lg py-4 gap-2">
        <Text className="text-gray-500">详细记录</Text>
        <ScrollView className="flex-1">
          {records.map((record: any) => (
            <RecordCard record={record} key={record.id} />
          ))}
          <View className="h-12" />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
