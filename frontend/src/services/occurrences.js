export function localDate(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
// Rebuild each calendar date locally so DST transitions do not drift by an hour.
export function occurrences(reminders, now = new Date(), horizon = 30) {
  const result = [];
  for (let day = 0; day < horizon; day++) {
    const date = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + day,
    );
    const key = localDate(date);
    for (const reminder of reminders) {
      if (
        !reminder.ativo ||
        reminder.medicamento_ativo === 0 ||
        !reminder.dias_semana.includes(date.getDay())
      )
        continue;
      if (
        key < reminder.data_inicio ||
        (reminder.data_fim && key > reminder.data_fim) ||
        (reminder.medicamento_inicio && key < reminder.medicamento_inicio) ||
        (reminder.medicamento_fim && key > reminder.medicamento_fim)
      )
        continue;
      const [hour, minute] = reminder.horario.split(":").map(Number);
      const at = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        hour,
        minute,
      );
      // A nonexistent local time during DST is skipped rather than silently changed.
      if (at > now && at.getHours() === hour && at.getMinutes() === minute)
        result.push({ reminder, at });
    }
  }
  return result.sort((a, b) => a.at - b.at || a.reminder.id - b.reminder.id);
}
