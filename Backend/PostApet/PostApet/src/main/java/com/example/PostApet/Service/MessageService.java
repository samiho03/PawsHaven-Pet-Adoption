package com.example.PostApet.Service;

import com.example.PostApet.Model.Message;
import com.example.PostApet.Model.PetModel;
import com.example.PostApet.Model.User;
import com.example.PostApet.Repository.MessageRepository;
import com.example.PostApet.Repository.PetRepository;
import com.example.PostApet.Repository.UserRepository;
import com.example.PostApet.dto.ConversationDto;
import com.example.PostApet.dto.MessageDto;
import com.example.PostApet.dto.MessageRequest;
import com.example.PostApet.exceptions.ResourceNotFoundException;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final PetRepository petRepository;
    private final ModelMapper modelMapper;

    @PostConstruct
    public void init() {
        configureModelMapper();
    }

    public void configureModelMapper() {
        modelMapper.getConfiguration().setAmbiguityIgnored(true);
        modelMapper.typeMap(Message.class, MessageDto.class)
                .addMappings(mapper -> {
                    mapper.map(src -> src.getSender().getId(), MessageDto::setSenderId);
                    mapper.map(src -> src.getSender().getName(), MessageDto::setSenderName);
                    mapper.map(src -> src.getSender().getProfileImage(), MessageDto::setSenderProfileImage);
                    mapper.map(src -> src.getReceiver().getId(), MessageDto::setReceiverId);
                    mapper.map(src -> src.getReceiver().getName(), MessageDto::setReceiverName);
                    mapper.map(src -> src.getPet().getId(), MessageDto::setPetId);
                    mapper.map(src -> src.getPet().getPetName(), MessageDto::setPetName);
                });
    }

    public MessageDto sendMessage(MessageRequest request, User sender) {
        try {
            User receiver = userRepository.findById(request.getReceiverId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + request.getReceiverId()));

            PetModel pet = petRepository.findById(request.getPetId())
                    .orElseThrow(() -> new ResourceNotFoundException("Pet not found with id: " + request.getPetId()));

            Message message = Message.builder()
                    .sender(sender)
                    .receiver(receiver)
                    .pet(pet)
                    .content(request.getContent())
                    .timestamp(LocalDateTime.now())
                    .isRead(false)
                    .build();

            Message savedMessage = messageRepository.save(message);
            MessageDto dto = convertToDto(savedMessage);
            sendEventToUser(receiver.getId(), dto);
            return dto;
        } catch (Exception e) {
            throw new RuntimeException("Failed to send message: " + e.getMessage(), e);
        }
    }

    public List<MessageDto> getConversation(Long petId, Long senderId, Long receiverId) {
        try {
            List<Message> messages = messageRepository.findByPetIdAndSenderIdAndReceiverIdOrderByTimestampAsc(
                    petId, senderId, receiverId);

            return messages.stream()
                    .map(this::convertToDto)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            throw new RuntimeException("Failed to get conversation: " + e.getMessage(), e);
        }
    }

    public List<MessageDto> getUserMessages(Long userId) {
        try {
            List<Message> messages = messageRepository.findBySenderIdOrReceiverIdOrderByTimestampDesc(
                    userId, userId);

            return messages.stream()
                    .map(this::convertToDto)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            throw new RuntimeException("Failed to get user messages: " + e.getMessage(), e);
        }
    }

    public Long getUnreadMessageCount(Long userId) {
        try {
            return messageRepository.countByReceiverIdAndIsReadFalse(userId);
        } catch (Exception e) {
            throw new RuntimeException("Failed to get unread message count: " + e.getMessage(), e);
        }
    }

    public void markAsRead(Long messageId) {
        try {
            Message message = messageRepository.findById(messageId)
                    .orElseThrow(() -> new ResourceNotFoundException("Message not found with id: " + messageId));

            if (!message.isRead()) {
                message.setRead(true);
                messageRepository.save(message);
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to mark message as read: " + e.getMessage(), e);
        }
    }

    public List<ConversationDto> getUserConversations(Long userId) {
        List<Message> messages = messageRepository.findBySenderIdOrReceiverId(userId);

        return messages.stream()
                .collect(Collectors.groupingBy(
                        msg -> msg.getSender().getId() == userId.longValue() ?
                                msg.getReceiver().getId() : msg.getSender().getId(),
                        Collectors.groupingBy(Message::getPet)
                ))
                .entrySet().stream()
                .flatMap(entry -> entry.getValue().entrySet().stream()
                        .map(petEntry -> {
                            PetModel pet = petEntry.getKey();
                            List<Message> convMessages = petEntry.getValue();
                            Message lastMessage = convMessages.stream()
                                    .max(Comparator.comparing(Message::getTimestamp))
                                    .orElse(null);

                            if (lastMessage == null) {
                                return null;
                            }

                            return new ConversationDto(
                                    pet.getId(),
                                    pet.getPetName(),
                                    userId.longValue() == lastMessage.getSender().getId() ?
                                            lastMessage.getReceiver().getId() : lastMessage.getSender().getId(),
                                    userId.longValue() == lastMessage.getSender().getId() ?
                                            lastMessage.getReceiver().getName() : lastMessage.getSender().getName(),
                                    lastMessage.getContent(),
                                    lastMessage.getTimestamp()
                            );
                        }))
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    // SSE Implementation
    private final Map<Long, SseEmitter> emitters = new ConcurrentHashMap<>();

    public SseEmitter createSseEmitter(Long userId) {
        SseEmitter emitter = new SseEmitter(3600000L); // 1 hour timeout
        emitters.put(userId, emitter);

        emitter.onCompletion(() -> emitters.remove(userId));
        emitter.onTimeout(() -> emitters.remove(userId));

        return emitter;
    }

    public void sendEventToUser(Long userId, MessageDto message) {
        SseEmitter emitter = emitters.get(userId);
        if (emitter != null) {
            try {
                emitter.send(SseEmitter.event().data(message));
            } catch (IOException e) {
                emitter.complete();
                emitters.remove(userId);
            }
        }
    }

    private MessageDto convertToDto(Message message) {
        MessageDto dto = new MessageDto();
        dto.setId(message.getId());
        dto.setSenderId(message.getSender().getId());
        dto.setSenderName(message.getSender().getName());
        dto.setSenderProfileImage(message.getSender().getProfileImage());
        dto.setReceiverId(message.getReceiver().getId());
        dto.setReceiverName(message.getReceiver().getName());
        dto.setPetId(message.getPet().getId());
        dto.setPetName(message.getPet().getPetName());
        dto.setContent(message.getContent());
        dto.setTimestamp(message.getTimestamp());
        dto.setRead(message.isRead());
        return dto;
    }
}