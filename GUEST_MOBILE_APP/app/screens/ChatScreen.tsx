import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList, ChatMessage } from '../types';
import { apiClient } from '../utils/api';
import { socketService } from '../utils/socket';
import { useGuestStore } from '../store/guestStore';

type RouteProps = RouteProp<RootStackParamList, 'Chat'>;

export default function ChatScreen() {
  const route = useRoute<RouteProps>();
  const { requestId } = route.params;
  const { guest } = useGuestStore();
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadMessages();
    
    // Join request room for real-time updates
    socketService.joinRequestRoom(requestId);

    // Listen for new messages
    socketService.onMessageReceived((message: ChatMessage) => {
      if (message.requestId === requestId) {
        setMessages((prev) => [...prev, message]);
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    });

    return () => {
      socketService.leaveRequestRoom(requestId);
      socketService.removeListener('chat:message-received');
    };
  }, [requestId]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getMessages(requestId);
      if (response.success) {
        setMessages(response.data);
      }
    } catch (error) {
      console.error('Load messages error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      const response = await apiClient.sendMessage(requestId, messageText);
      if (response.success) {
        // Message will be added via socket event
      }
    } catch (error) {
      console.error('Send message error:', error);
      setNewMessage(messageText); // Restore message on error
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isGuest = item.senderRole === 'guest';
    const isSystem = item.senderRole === 'system';

    if (isSystem) {
      return (
        <View style={styles.systemMessage}>
          <Text style={styles.systemMessageText}>{item.message}</Text>
        </View>
      );
    }

    return (
      <View style={[styles.messageContainer, isGuest && styles.messageContainerRight]}>
        <View style={[styles.messageBubble, isGuest ? styles.guestBubble : styles.staffBubble]}>
          {!isGuest && (
            <Text style={styles.senderName}>{item.senderName}</Text>
          )}
          <Text style={[styles.messageText, isGuest && styles.guestMessageText]}>
            {item.message}
          </Text>
          <Text style={[styles.messageTime, isGuest && styles.guestMessageTime]}>
            {formatTime(item.timestamp)}
          </Text>
        </View>
      </View>
    );
  };

  const quickReplies = [
    'Thank you!',
    'How long will it take?',
    'Can you hurry please?',
    'No longer needed',
  ];

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      {messages.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbubbles-outline" size={60} color="#cbd5e1" />
          <Text style={styles.emptyText}>No messages yet</Text>
          <Text style={styles.emptySubtext}>
            Start a conversation with the staff about your request
          </Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
      )}

      {/* Quick Replies */}
      <View style={styles.quickRepliesContainer}>
        <FlatList
          horizontal
          data={quickReplies}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.quickReplyButton}
              onPress={() => setNewMessage(item)}
            >
              <Text style={styles.quickReplyText}>{item}</Text>
            </TouchableOpacity>
          )}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          placeholderTextColor="#94a3b8"
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!newMessage.trim() || sending) && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!newMessage.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Ionicons name="send" size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 8,
    textAlign: 'center',
  },
  messageList: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 12,
    maxWidth: '80%',
  },
  messageContainerRight: {
    alignSelf: 'flex-end',
  },
  messageBubble: {
    borderRadius: 16,
    padding: 12,
  },
  guestBubble: {
    backgroundColor: '#3b82f6',
    borderBottomRightRadius: 4,
  },
  staffBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 15,
    color: '#1e293b',
    lineHeight: 20,
    marginBottom: 4,
  },
  guestMessageText: {
    color: '#fff',
  },
  messageTime: {
    fontSize: 11,
    color: '#94a3b8',
  },
  guestMessageTime: {
    color: '#dbeafe',
  },
  systemMessage: {
    alignItems: 'center',
    marginVertical: 8,
  },
  systemMessageText: {
    fontSize: 12,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  quickRepliesContainer: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    backgroundColor: '#fff',
  },
  quickReplyButton: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
  },
  quickReplyText: {
    fontSize: 13,
    color: '#475569',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  input: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: '#1e293b',
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: '#3b82f6',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#cbd5e1',
  },
});
