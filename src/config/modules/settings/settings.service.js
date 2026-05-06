export async function getSettings(db) {
  const [rows] = await db.query(`
    SELECT setting_key AS settingKey, setting_value AS settingValue
    FROM site_settings
    ORDER BY setting_key ASC
  `);

  return rows.reduce((acc, row) => {
    acc[row.settingKey] = row.settingValue;
    return acc;
  }, {});
}

export async function updateSettings(db, settings) {
  const entries = Object.entries(settings);

  for (const [key, value] of entries) {
    await db.query(
      `
      INSERT INTO site_settings (setting_key, setting_value)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE
        setting_value = VALUES(setting_value),
        updated_at = NOW()
      `,
      [key, value ?? null]
    );
  }

  return getSettings(db);
}