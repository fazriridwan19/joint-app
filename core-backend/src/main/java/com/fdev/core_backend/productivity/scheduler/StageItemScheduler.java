package com.fdev.core_backend.productivity.scheduler;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.fdev.core_backend.productivity.domain.Reminder;
import com.fdev.core_backend.productivity.domain.StageItem;
import com.fdev.core_backend.productivity.repository.ReminderRepository;
import com.fdev.core_backend.productivity.repository.StageItemRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class StageItemScheduler {
    private final StageItemRepository stageItemRepository;
    private final ReminderRepository reminderRepository;

    private void sendReminders() {
        try {
            LocalDate today = LocalDate.now(ZoneId.systemDefault());
            LocalDate maxDate = today.plusDays(3);

            log.info("Fetching StageItems scheduled between {} and {}", today, maxDate);
            List<StageItem> upcomingTasks = stageItemRepository.findAllAndLockUpcomingReminderTasks(today, maxDate);

            if (upcomingTasks.isEmpty()) {
                log.info("No upcoming reminder tasks found.");
                return;
            }

            List<Reminder> reminders = new ArrayList<>();
            for (StageItem task : upcomingTasks) {
                log.info("Upcoming StageItem ID: {}, Scheduled At: {}, Start Time: {}",
                        task.getId(), task.getScheduledAt(), task.getStartTime());
                LocalDateTime scheduledDateTime = LocalDateTime.of(task.getScheduledAt(), task.getStartTime());
                ZoneOffset zoneOffset = ZoneId.systemDefault().getRules()
                        .getOffset(LocalDateTime.now(ZoneId.systemDefault()));
                Reminder reminder = Reminder.builder()
                        .userId(task.getUserId())
                        .applicationId(task.getJobApplicationId())
                        .type(Reminder.Type.RECRUITMENT_STAGE)
                        .message(
                                "Reminder: Anda memiliki jadwal tugas " + task.getTitle() + " pada "
                                        + task.getScheduledAt()
                                        + " pukul " + task.getStartTime())
                        .dueAt(OffsetDateTime.of(scheduledDateTime, zoneOffset))
                        .build();
                task.setRemindedAt(today);
                reminders.add(reminder);
            }
            stageItemRepository.saveAll(upcomingTasks);
            reminderRepository.saveAll(reminders);
        } catch (Exception e) {
            log.error("Failed to send reminder", e);
        }
    }

    // @Scheduled(cron = "*/5 * * * * *", zone = "Asia/Jakarta")
    // @Transactional
    // public void sendMorningReminder() {
    //     sendReminders();
    // }

    @Scheduled(cron = "0 0 17 * * *", zone = "Asia/Jakarta")
    @Transactional
    public void sendEveningReminder() {
        sendReminders();
    }
}
