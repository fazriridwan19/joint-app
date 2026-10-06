-- Master categories for roadmap.stage_items.
-- Safe to run repeatedly: category codes are unique.

INSERT INTO roadmap.stage_item_categories
    (id, code, label_item, group_item, icon, is_active, sort_order)
VALUES
    ('10000000-0000-0000-0000-000000000001', 'HR_INTERVIEW', 'HR Interview', 'INTERVIEW', 'users', TRUE, 10),
    ('10000000-0000-0000-0000-000000000002', 'TECHNICAL_INTERVIEW', 'Technical Interview', 'INTERVIEW', 'code-2', TRUE, 20),
    ('10000000-0000-0000-0000-000000000003', 'USER_INTERVIEW', 'User Interview', 'INTERVIEW', 'user-round', TRUE, 30),
    ('10000000-0000-0000-0000-000000000004', 'MANAGER_INTERVIEW', 'Manager Interview', 'INTERVIEW', 'briefcase-business', TRUE, 40),
    ('10000000-0000-0000-0000-000000000005', 'FINAL_INTERVIEW', 'Final Interview', 'INTERVIEW', 'badge-check', TRUE, 50),

    ('20000000-0000-0000-0000-000000000001', 'CV_UPDATE', 'Update CV', 'TASK', 'file-pen-line', TRUE, 10),
    ('20000000-0000-0000-0000-000000000002', 'COVER_LETTER', 'Cover Letter', 'TASK', 'file-text', TRUE, 20),
    ('20000000-0000-0000-0000-000000000003', 'ASSESSMENT', 'Assessment', 'TASK', 'clipboard-check', TRUE, 30),
    ('20000000-0000-0000-0000-000000000004', 'PORTFOLIO', 'Portfolio', 'TASK', 'folder-kanban', TRUE, 40),
    ('20000000-0000-0000-0000-000000000005', 'FOLLOW_UP', 'Follow-up', 'TASK', 'send', TRUE, 50),

    ('30000000-0000-0000-0000-000000000001', 'STUDY_TOPIC', 'Study Topic', 'PREPARATION', 'book-open', TRUE, 10),
    ('30000000-0000-0000-0000-000000000002', 'INTERVIEW_QUESTION', 'Interview Question', 'PREPARATION', 'message-circle-question', TRUE, 20),
    ('30000000-0000-0000-0000-000000000003', 'COMPANY_RESEARCH', 'Company Research', 'PREPARATION', 'building-2', TRUE, 30),
    ('30000000-0000-0000-0000-000000000004', 'TECHNICAL_PRACTICE', 'Technical Practice', 'PREPARATION', 'braces', TRUE, 40),
    ('30000000-0000-0000-0000-000000000005', 'QUESTION_FOR_INTERVIEWER', 'Question for Interviewer', 'PREPARATION', 'circle-help', TRUE, 50),
    ('30000000-0000-0000-0000-000000000006', 'REFLECTION', 'Reflection', 'PREPARATION', 'notebook-pen', TRUE, 60)
ON CONFLICT (code) DO UPDATE SET
    label_item = EXCLUDED.label_item,
    group_item = EXCLUDED.group_item,
    icon = EXCLUDED.icon,
    is_active = EXCLUDED.is_active,
    sort_order = EXCLUDED.sort_order;