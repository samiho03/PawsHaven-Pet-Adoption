package com.example.PostApet.Repository;

import com.example.PostApet.Model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {

    @Query("SELECT m FROM Message m WHERE m.pet.id = :petId " +
            "AND ((m.sender.id = :senderId AND m.receiver.id = :receiverId) " +
            "OR (m.sender.id = :receiverId AND m.receiver.id = :senderId)) " +
            "ORDER BY m.timestamp ASC")
    List<Message> findByPetIdAndSenderIdAndReceiverIdOrderByTimestampAsc(
            @Param("petId") Long petId,
            @Param("senderId") Long senderId,
            @Param("receiverId") Long receiverId);

    @Query("SELECT m FROM Message m WHERE m.sender.id = :senderId OR m.receiver.id = :receiverId ORDER BY m.timestamp DESC")
    List<Message> findBySenderIdOrReceiverIdOrderByTimestampDesc(
            @Param("senderId") Long senderId,
            @Param("receiverId") Long receiverId);

    @Query("SELECT m FROM Message m WHERE m.sender.id = :userId OR m.receiver.id = :userId")
    List<Message> findBySenderIdOrReceiverId(
            @Param("userId") Long userId);

    @Query("SELECT COUNT(m) FROM Message m WHERE m.receiver.id = :receiverId AND m.isRead = false")
    Long countByReceiverIdAndIsReadFalse(@Param("receiverId") Long receiverId);
}