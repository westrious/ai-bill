import { Message, useChat } from "@ai-sdk/react";
import { fetch as expoFetch } from "expo/fetch";
import { View, TextInput, ScrollView, Text, SafeAreaView } from "react-native";
import { useAuth } from "../_layout";
import RecordCard from "@/components/RecordCard";
import { useRecords } from "./index";
import { useState } from "react";
import SpinLoading from "@/components/SpinLoading";

const renderMessage = (message: Message) => {
  if (message.role == "assistant" && message.id != "1") {
    const content = JSON.parse(message.content);
    // AI 普通文本
    if (content.text) {
      return <Text>{content.text}</Text>;
    }

    // AI 记录
    return <RecordCard record={content.record}></RecordCard>;
  }

  // 用户输入
  return <Text>{message.content}</Text>;
};

export default function AIChat() {
  const session = useAuth((state: any) => state.session);

  const fetchRecords = useRecords((state: any) => state.fetchRecords);

  const [loading, setLoading] = useState(false);

  const { messages, error, handleInputChange, input, handleSubmit } = useChat({
    fetch: expoFetch as unknown as typeof globalThis.fetch,
    api: `${process.env.EXPO_PUBLIC_API_URL}/chat`,
    onError: (error) => console.error(error, "ERROR"),
    streamProtocol: "text",
    headers: {
      Authorization: `Bearer ${session?.access_token}`,
    },
    experimental_prepareRequestBody: ({ messages }) => {
      // 只发送最后一条消息
      const lastMessage = messages[messages.length - 1];
      setLoading(true);
      return {
        messages: [lastMessage],
        user_id: session?.user?.id,
      };
    },
    initialMessages: [
      {
        id: "1",
        role: "assistant",
        content: session ? "您好，请问需要记录什么消费？" : "请先登录",
      },
    ],
    onResponse: () => {
      setLoading(false);
    },
    onFinish: (message) => {
      if (message.role === "assistant" && message.id != "1") {
        try {
          const content = JSON.parse(message.content);
          if (content.record) {
            fetchRecords(new Date(), session);
          }
        } catch (error) {
          console.error(error);
        }
      }
    },
  });

  if (error) return <Text>{error.message}</Text>;

  return (
    <SafeAreaView style={{ height: "100%" }}>
      <View
        style={{
          height: "95%",
          display: "flex",
          flexDirection: "column",
          paddingHorizontal: 8,
        }}
      >
        <ScrollView style={{ flex: 1 }}>
          {messages.map((m) => (
            <View key={m.id} style={{ marginVertical: 8 }}>
              <View>
                <View
                  className={`${m.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <Text style={{ fontWeight: 700, marginVertical: 4 }}>
                    {m.role === "user" ? "我" : "AI助手"}
                  </Text>
                </View>
                <View
                  className={`${m.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  {renderMessage(m)}
                </View>
              </View>
            </View>
          ))}
          {loading && (
            <View style={{ marginVertical: 8 }}>
              <View>
                <View>
                  <Text style={{ fontWeight: 700, marginVertical: 4 }}>
                    AI助手
                  </Text>
                </View>
                <Text>AI 正在思考...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        <View style={{ marginTop: 8, marginBottom: 15 }}>
          <TextInput
            style={{ backgroundColor: "white", padding: 8 }}
            placeholder="Say something..."
            value={input}
            onChange={(e) =>
              handleInputChange({
                ...e,
                target: {
                  ...e.target,
                  value: e.nativeEvent.text,
                },
              } as unknown as React.ChangeEvent<HTMLInputElement>)
            }
            onSubmitEditing={(e) => {
              handleSubmit(e);
              e.preventDefault();
            }}
            autoFocus={true}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
