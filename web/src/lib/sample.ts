import type { InvitationData } from "@/components/InvitationView";

// Made-up sample content for template previews on the landing page (not a real client).
const SAMPLE: Record<string, Pick<InvitationData, "titleKk" | "titleRu" | "messageKk" | "messageRu">> = {
  wedding: { titleKk: "Аружан мен Мади", titleRu: "Аружан и Мади", messageKk: "Құрметті ағайын-туыс, дос-жаран! Ұлымыз Мади мен келініміз Аружанның үйлену тойына шақырамыз.", messageRu: "Дорогие родные и друзья! Приглашаем вас на свадьбу нашего сына Мади и невестки Аружан." },
  qyz_uzatu: { titleKk: "Аружанның ұзату тойы", titleRu: "Кыз узату Аружан", messageKk: "Қызымыз Аружанды ұзату тойына арналған ақ дастарханымыздың қадірлі қонағы болыңыз.", messageRu: "Приглашаем вас на кыз узату нашей дочери Аружан." },
  sundet: { titleKk: "Әлидің сүндет тойы", titleRu: "Сундет той Али", messageKk: "Ұлымыз Әлидің сүндет тойына шақырамыз. Қуанышымызды бірге бөлісейік!", messageRu: "Приглашаем вас на сундет той нашего сына Али." },
  tusau_keser: { titleKk: "Айлиннің тұсау кесері", titleRu: "Тусау кесер Айлин", messageKk: "Қызымыз Айлиннің алғашқы қадамын бірге тойлайық. Тұсау кесер тойына шақырамыз!", messageRu: "Отметим первые шаги нашей дочери Айлин. Приглашаем на тусау кесер!" },
  merey_toi: { titleKk: "Ерланның 60 жасқа толу мерейтойы", titleRu: "Юбилей Ерлана — 60 лет", messageKk: "Әкеміз Ерланның 60 жасқа толу мерейтойына шақырамыз.", messageRu: "Приглашаем на 60-летний юбилей нашего отца Ерлана." },
};

export function sampleInvitation(eventType: string): InvitationData {
  const type = eventType in SAMPLE ? eventType : "wedding";
  return {
    slug: "demo",
    eventType: type,
    languages: ["kk", "ru"],
    ...SAMPLE[type],
    hostsKk: "Той иелері: Ерлан мен Гүлнар",
    hostsRu: "Хозяева тоя: Ерлан и Гульнар",
    eventAt: "2026-08-24T13:00:00.000Z",
    venueName: "«Royal Palace» тойханасы",
    venueAddress: "Алматы, Абай даңғылы, 1",
    venueLat: null,
    venueLng: null,
    program: [
      { time: "18:00", textKk: "Қонақтарды қарсы алу", textRu: "Встреча гостей" },
      { time: "19:00", textKk: "Тойдың басталуы", textRu: "Начало тоя" },
    ],
    photoUrls: [],
    musicUrl: null,
    voiceUrl: null,
  };
}
