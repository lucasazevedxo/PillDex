const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const occurrenceSource = fs.readFileSync(
  "frontend/src/services/occurrences.js",
  "utf8",
);
const load = (source) =>
  import(
    "data:text/javascript;base64," + Buffer.from(source).toString("base64")
  );
test("calendário local: dias, limites inclusivos, registro inativo e próxima ocorrência", async () => {
  const { occurrences } = await load(occurrenceSource);
  const now = new Date(2026, 10, 12, 7, 0);
  const r = {
    id: 1,
    ativo: true,
    medicamento_ativo: 1,
    dias_semana: [4],
    horario: "08:00",
    data_inicio: "2026-11-12",
    data_fim: "2026-11-19",
  };
  const dates = occurrences([r], now);
  assert.equal(dates.length, 2);
  assert.equal(dates[0].at.getHours(), 8);
  assert.equal(dates[1].at.getDate(), 19);
  assert.equal(occurrences([{ ...r, ativo: false }], now).length, 0);
  assert.equal(occurrences([{ ...r, medicamento_ativo: 0 }], now).length, 0);
  assert.equal(
    occurrences([{ ...r, medicamento_fim: "2026-11-11" }], now).length,
    0,
  );
  assert.equal(occurrences([r], new Date(2026, 10, 12, 9)).length, 1);
});
test("DST: horário inexistente ignorado e horário de parede preservado", async () => {
  const previous = process.env.TZ;
  process.env.TZ = "America/New_York";
  try {
    const { occurrences } = await load(occurrenceSource);
    const r = {
      id: 1,
      ativo: true,
      dias_semana: [0, 1, 2, 3, 4, 5, 6],
      horario: "02:30",
      data_inicio: "2026-03-07",
      data_fim: "2026-03-09",
    };
    const dates = occurrences([r], new Date(2026, 2, 7));
    assert.equal(dates.length, 2);
    assert.deepEqual(
      dates.map((d) => d.at.getHours()),
      [2, 2],
    );
    assert.deepEqual(
      dates.map((d) => d.at.getDate()),
      [7, 9],
    );
  } finally {
    if (previous === undefined) delete process.env.TZ;
    else process.env.TZ = previous;
  }
});
test("reconciliação: idempotência, edição, desativação, exclusão, logout, permissão e fila", async () => {
  const scheduled = new Map();
  let permitted = true,
    calls = 0;
  const api = {
    setNotificationHandler() {},
    setNotificationChannelAsync: async () => {},
    getPermissionsAsync: async () => ({ granted: permitted }),
    getExactAlarmPermissionsAsync: async () => ({ granted: true }),
    getAllScheduledNotificationsAsync: async () => [...scheduled.values()],
    cancelScheduledNotificationAsync: async (id) => scheduled.delete(id),
    scheduleNotificationAsync: async (notification) => {
      calls++;
      assert.equal(notification.trigger.delivery, "alarmClock");
      assert.equal(
        notification.content.body,
        "Você tem um lembrete de medicamento no PillDex.",
      );
      scheduled.set(notification.identifier, notification);
      return notification.identifier;
    },
    SchedulableTriggerInputTypes: { DATE: "date" },
  };
  global.__pilldexNotificationTest = api;
  try {
    const source = fs
      .readFileSync("frontend/src/services/notifications.native.js", "utf8")
      .replace(/import\s[\s\S]*?from\s+["'][^"']+["'];\s*/g, "");
    const { reconcile } = await load(
      occurrenceSource +
        "\nconst Notifications=globalThis.__pilldexNotificationTest; const Platform={OS:'android'};const AndroidImportance={DEFAULT:5};const AndroidNotificationVisibility={PRIVATE:2};\n" +
        source,
    );
    const { localDate } = await load(occurrenceSource);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const date = localDate(tomorrow);
    const row = {
      id: 3,
      ativo: true,
      dias_semana: [0, 1, 2, 3, 4, 5, 6],
      horario: "08:00",
      data_inicio: date,
      data_fim: date,
    };
    await reconcile(1, [row]);
    assert.equal(scheduled.size, 1);
    assert.equal(calls, 1);
    await Promise.all([reconcile(1, [row]), reconcile(1, [row])]);
    assert.equal(scheduled.size, 1);
    assert.equal(calls, 1);
    await reconcile(1, [{ ...row, horario: "20:00" }]);
    assert.equal(scheduled.size, 1);
    assert.equal(calls, 2);
    await reconcile(1, [{ ...row, ativo: false }]);
    assert.equal(scheduled.size, 0);
    await reconcile(1, [row]);
    await reconcile(1, []);
    assert.equal(scheduled.size, 0);
    await reconcile(1, [row]);
    await reconcile(null);
    assert.equal(scheduled.size, 0);
    permitted = false;
    await reconcile(1, [row]);
    assert.equal(scheduled.size, 0);
    permitted = true;
    await reconcile(1, [row]);
    await reconcile(2, [row]);
    assert.ok([...scheduled.keys()].every((id) => id.startsWith("pilldex:2:")));
    await reconcile(null);
    assert.equal(scheduled.size, 0);
  } finally {
    delete global.__pilldexNotificationTest;
  }
});
