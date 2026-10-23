// Web Push service worker — shows a notification for each new story and
// opens the story when the notification is clicked.
self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch (e) {
    payload = { title: "নতুন খবর", body: event.data ? event.data.text() : "" };
  }
  const title = payload.title || "নতুন খবর";
  const options = {
    body: payload.body || "",
    icon: payload.icon || "/favicon.ico",
    data: { url: payload.url || "/" },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(clients.openWindow(url));
});
