export type Lang = "kk" | "ru";

export const T = {
  kk: {
    elderOn: "Үлкен әріппен көру",
    elderOff: "Қалыпты көрініс",
    when: "Қашан",
    where: "Қайда",
    program: "Бағдарлама",
    openMap2gis: "2GIS-те ашу",
    openMapGoogle: "Google картасы",
    listenVoice: "▶ Шақыруды тыңдау",
    playMusic: "▶ Әнді қосу",
    pauseMusic: "❚❚ Әнді тоқтату",
    countdown: "Тойға дейін",
    days: "күн",
    hours: "сағ",
    minutes: "мин",
    rsvpTitle: "Келетініңізді растаңыз",
    coming: "Келемін",
    notComing: "Келе алмаймын",
    name: "Аты-жөніңіз",
    guests: "Неше адам келесіздер",
    phone: "Телефон (міндетті емес)",
    wish: "Тілегіңіз (міндетті емес)",
    consent: "Деректерімнің той иесіне берілуіне келісемін",
    privacy: "құпиялық саясаты",
    send: "Жіберу",
    thanksYes: "Рахмет! Сізді күтеміз.",
    thanksNo: "Хабарлағаныңызға рахмет!",
    change: "Жауапты өзгерту",
    closed: "Той иесі жауап қабылдауды жапты. Келетін болсаңыз, оған өзіңіз хабарласыңыз.",
    preview: "АЛДЫН АЛА КӨРІНІС",
    previewNote: "Бұл алдын ала көрініс. Төлегеннен кейін біз жауап батырмаларын қосамыз.",
    makeOwn: "Осындай шақыру жасау →",
    over: "Той өтті. Келген қонақтарға рахмет!",
    error: "Жібере алмадық. Интернетті тексеріп, қайта басыңыз.",
  },
  ru: {
    elderOn: "Крупный шрифт",
    elderOff: "Обычный вид",
    when: "Когда",
    where: "Где",
    program: "Программа",
    openMap2gis: "Открыть в 2GIS",
    openMapGoogle: "Google Карты",
    listenVoice: "▶ Послушать приглашение",
    playMusic: "▶ Включить музыку",
    pauseMusic: "❚❚ Выключить музыку",
    countdown: "До тоя",
    days: "дн",
    hours: "ч",
    minutes: "мин",
    rsvpTitle: "Подтвердите присутствие",
    coming: "Приду",
    notComing: "Не смогу",
    name: "Ваше имя",
    guests: "Сколько человек придёт",
    phone: "Телефон (необязательно)",
    wish: "Пожелание (необязательно)",
    consent: "Согласен(а) на передачу моих данных хозяевам тоя",
    privacy: "политика конфиденциальности",
    send: "Отправить",
    thanksYes: "Спасибо! Ждём вас.",
    thanksNo: "Спасибо, что сообщили.",
    change: "Изменить ответ",
    closed: "Хозяева тоя закрыли приём ответов. Если придёте, позвоните им сами.",
    preview: "ПРЕДПРОСМОТР",
    previewNote: "Это предпросмотр. Кнопки ответа мы включим после оплаты.",
    makeOwn: "Сделать такое приглашение →",
    over: "Той прошёл. Спасибо всем гостям!",
    error: "Не получилось отправить. Проверьте интернет и нажмите ещё раз.",
  },
} as const;

export const EVENT_LABEL: Record<string, { kk: string; ru: string }> = {
  wedding: { kk: "Үйлену той", ru: "Свадьба" },
  qyz_uzatu: { kk: "Қыз ұзату", ru: "Кыз узату" },
  sundet: { kk: "Сүндет той", ru: "Сундет той" },
  tusau_keser: { kk: "Тұсау кесер", ru: "Тусау кесер" },
  merey_toi: { kk: "Мерей той", ru: "Юбилей" },
  other: { kk: "Той", ru: "Той" },
};

// Month and weekday names are written out because many phones (old Android WebViews,
// some browsers) have no Kazakh locale data and would print "2026 M12 27, Sun".
const MONTHS = {
  kk: ["қаңтар", "ақпан", "наурыз", "сәуір", "мамыр", "маусым", "шілде", "тамыз", "қыркүйек", "қазан", "қараша", "желтоқсан"],
  ru: ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"],
};
const WEEKDAYS = {
  kk: ["жексенбі", "дүйсенбі", "сейсенбі", "сәрсенбі", "бейсенбі", "жұма", "сенбі"],
  ru: ["воскресенье", "понедельник", "вторник", "среда", "четверг", "пятница", "суббота"],
};

// Almaty is UTC+5 all year (no DST).
function almatyParts(d: Date) {
  const a = new Date(d.getTime() + 5 * 3600_000);
  return { y: a.getUTCFullYear(), m: a.getUTCMonth(), day: a.getUTCDate(), wd: a.getUTCDay(), h: a.getUTCHours(), min: a.getUTCMinutes() };
}

export function formatDate(d: Date, lang: Lang): string {
  const p = almatyParts(d);
  return lang === "kk"
    ? `${p.y} ж. ${p.day} ${MONTHS.kk[p.m]}, ${WEEKDAYS.kk[p.wd]}`
    : `${p.day} ${MONTHS.ru[p.m]} ${p.y} г., ${WEEKDAYS.ru[p.wd]}`;
}

export function formatTime(d: Date): string {
  const p = almatyParts(d);
  return `${String(p.h).padStart(2, "0")}:${String(p.min).padStart(2, "0")}`;
}
