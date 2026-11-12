import * as Notifications from "expo-notifications";
import {
  AndroidImportance,
  AndroidNotificationVisibility,
} from "expo-notifications";
import { Platform } from "react-native";
import { occurrences } from "./occurrences";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});
const channelId = "pilldex-lembretes";
let queue = Promise.resolve();
export async function enableNotifications() {
  if (Platform.OS === "android")
    await Notifications.setNotificationChannelAsync(channelId, {
      name: "Lembretes de medicamentos",
      importance: AndroidImportance.DEFAULT,
      lockscreenVisibility: AndroidNotificationVisibility.PRIVATE,
    });
  const permission = await Notifications.requestPermissionsAsync();
  if (!permission.granted)
    throw Error(
      "Permissão de notificações negada. Os horários continuam salvos.",
    );
  if (Platform.OS === "android") {
    const exact = await Notifications.requestExactAlarmPermissionsAsync();
    if (!exact.granted)
      throw Error(
        "Autorize alarmes exatos nas configurações Android para agendar lembretes.",
      );
  }
}
export function reconcile(userId, reminders = []) {
  const work = async () => {
    const permission = await Notifications.getPermissionsAsync();
    const exact =
      Platform.OS === "android"
        ? await Notifications.getExactAlarmPermissionsAsync()
        : { granted: true };
    const planned =
      userId && permission.granted && exact.granted
        ? occurrences(reminders).slice(0, 60)
        : [];
    const desired = new Map(
      planned.map(({ reminder, at }) => [
        `pilldex:${userId}:${reminder.id}:${at.getTime()}`,
        at,
      ]),
    );
    const existing = await Notifications.getAllScheduledNotificationsAsync();
    const kept = new Set();
    for (const notification of existing) {
      if (notification.content.data?.pilldex !== true) continue;
      if (
        !desired.has(notification.identifier) ||
        kept.has(notification.identifier)
      )
        await Notifications.cancelScheduledNotificationAsync(
          notification.identifier,
        );
      else kept.add(notification.identifier);
    }
    if (Platform.OS === "android" && desired.size)
      await Notifications.setNotificationChannelAsync(channelId, {
        name: "Lembretes de medicamentos",
        importance: AndroidImportance.DEFAULT,
        lockscreenVisibility: AndroidNotificationVisibility.PRIVATE,
      });
    for (const [identifier, at] of desired)
      if (!kept.has(identifier))
        await Notifications.scheduleNotificationAsync({
          identifier,
          content: {
            title: "PillDex",
            body: "Você tem um lembrete de medicamento no PillDex.",
            data: { pilldex: true },
            sound: "default",
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: at,
            channelId,
            delivery: "alarmClock",
          },
        });
    if (!userId) return "Agendamentos locais cancelados.";
    if (!permission.granted || !exact.granted)
      return "Horários salvos. Ative as permissões para agendar notificações neste dispositivo.";
    const all = occurrences(reminders);
    return (
      `${desired.size} notificação(ões) agendada(s) neste dispositivo. Janela de 30 dias, limitada às próximas 60 ocorrências. Abra o aplicativo para renovar.` +
      (all.length > 60 ? " Há horários além do limite local." : "")
    );
  };
  const next = queue.catch(() => {}).then(work);
  queue = next;
  return next;
}
