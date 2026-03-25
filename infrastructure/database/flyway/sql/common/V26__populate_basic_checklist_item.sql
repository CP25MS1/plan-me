INSERT INTO basic_checklist_item (th_name, en_name)
VALUES
    ('กระดาษทิชชู่', 'Tissues'),
    ('ถุงขยะ', 'Trash bags'),
    ('ปลั๊กพ่วง', 'Power strip'),
    ('เสื่อ/ผ้าปูนั่ง', 'Mat/groundsheet'),
    ('ไพ่/บอร์ดเกม', 'Cards/board games'),
    ('ลำโพงบลูทูธ', 'Bluetooth speaker'),
    ('ยาสามัญ', 'Basic medicine'),
    ('ยากันยุง', 'Mosquito repellent')
ON CONFLICT (th_name, en_name) DO NOTHING;
