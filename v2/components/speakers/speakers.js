(() => {
const stylesheet = new URL('speakers.css', document.currentScript.src).href;
const records = [
  {
    "id": "speaker-1362ede92f57",
    "src": "https://aa25.ru/wp-content/uploads/2026/10/speaker_AlekseiV_26let_25-10-2026.mp3",
    "name": "Алексей В.",
    "description": "Алексей В., 26 лет трезвости, на группе «Вторяк», Владивосток 25/10/2026",
    "date": "2026-10-25",
    "year": "2026",
    "fellowship": "АА"
  },
  {
    "id": "speaker-dcac9e632767",
    "src": "https://aa25.ru/wp-content/uploads/2026/10/speaker_MarinaV_13_s_polovinoy_let_23-10-2026.mp3",
    "name": "Марина В.",
    "description": "Марина В., 13,5 лет трезвости, на группе «Вторяк», Владивосток 23/10/2026",
    "date": "2026-10-23",
    "year": "2026",
    "fellowship": "АА"
  },
  {
    "id": "speaker-db7875650eea",
    "src": "https://aa25.ru/wp-content/uploads/2026/09/speaker_AleksStalingrad_3_goda_5_mes_29-09-2026.mp3",
    "name": "Алекс Сталинград",
    "description": "Алекс Сталинград, город Волгоград, 3 года 5 месяцев трезвости, на группе «Вторяк», Владивосток 29/09/2026",
    "date": "2026-09-29",
    "year": "2026",
    "fellowship": "АА"
  },
  {
    "id": "speaker-e1f58cd937cd",
    "src": "https://aa25.ru/wp-content/uploads/2026/08/speaker_UlianaG_16let_27-08-2026.mp3",
    "name": "Ульяна Г.",
    "description": "Ульяна Г., город Голд Кост (Австралия), 16 лет трезвости, на группе «Вторяк», Владивосток 27/08/2026",
    "date": "2026-08-27",
    "year": "2026",
    "fellowship": "АА"
  },
  {
    "id": "speaker-d9670edc63dc",
    "src": "https://aa25.ru/wp-content/uploads/2026/07/speaker_VladimirTS_4goda_07-07-2026.mp3",
    "name": "Владимир Ц.",
    "description": "Владимир Ц., 4 года трезвости, на группе «Вторяк», Владивосток 07/07/2026",
    "date": "2026-07-07",
    "year": "2026",
    "fellowship": "АА"
  },
  {
    "id": "speaker-4425c0a8e969",
    "src": "https://aa25.ru/wp-content/uploads/2026/06/speaker_ValeriyaCh_11let_14-06-2026.mp3",
    "name": "Валерия Ч.",
    "description": "Валерия Ч., 11 лет трезвости, на группе «Маяк», Владивосток 14/06/2026",
    "date": "2026-06-14",
    "year": "2026",
    "fellowship": "АА"
  },
  {
    "id": "speaker-2b2bb9b43e72",
    "src": "https://aa25.ru/wp-content/uploads/2026/05/speaker_TatianochkaCh_3goda_28-05-2026.mp3",
    "name": "Татьяночка Ч.",
    "description": "Татьяночка Ч., 3 года трезвости, на группе «Вторяк», Владивосток 28/05/2026",
    "date": "2026-05-28",
    "year": "2026",
    "fellowship": "АА"
  },
  {
    "id": "speaker-72fbe03d7282",
    "src": "https://aa25.ru/wp-content/uploads/2026/05/speaker_IgnatS_9let_4mes_09-05-2026.mp3",
    "name": "Игнат С.",
    "description": "Игнат С., 9 лет 4 месяца трезвости, на группе «Вторяк», Владивосток 09/05/2026",
    "date": "2026-05-09",
    "year": "2026",
    "fellowship": "АА"
  },
  {
    "id": "speaker-eac7d50a72c7",
    "src": "https://aa25.ru/wp-content/uploads/2026/05/speaker_PavelM_13let_6mes_02-05-2026.mp3",
    "name": "Павел М.",
    "description": "Павел М., 13 лет 6 месяцев трезвости, на группе «Вторяк», Владивосток 02/05/2026",
    "date": "2026-05-02",
    "year": "2026",
    "fellowship": "АА"
  },
  {
    "id": "speaker-1bf6db1d05e6",
    "src": "https://aa25.ru/wp-content/uploads/2026/04/speaker_AlekseiSH_13let_10mes_25-04-2026.mp3",
    "name": "Алексей Ш.",
    "description": "Алексей Ш., 13 лет 10 месяцев трезвости, на группе «Вторяк», Владивосток 25/04/2026",
    "date": "2026-04-25",
    "year": "2026",
    "fellowship": "АА"
  },
  {
    "id": "speaker-aff187c78d97",
    "src": "https://aa25.ru/wp-content/uploads/2026/04/speaker_Arina_Bali_1god_10mes_21-04-2026.mp3",
    "name": "Арина",
    "description": "Арина, 1 год 10 месяцев трезвости, на группе «Приморочка», Владивосток-о.Бали, 21/04/2026",
    "date": "2026-04-21",
    "year": "2026",
    "fellowship": "АА"
  },
  {
    "id": "speaker-e718b79a618c",
    "src": "https://aa25.ru/wp-content/uploads/2026/04/speaker_MaksimS_na_al-anon_31-03-2026.mp3",
    "name": "Максим С.",
    "description": "Максим С. Алкоголик на Ал-Анон, Владивосток 31/03/2026",
    "date": "2026-03-31",
    "year": "2026",
    "fellowship": "Ал-Анон"
  },
  {
    "id": "speaker-09b0015a15b2",
    "src": "https://aa25.ru/wp-content/uploads/2026/03/speaker_GalinaG_AlAnon_27-03-2026.mp3",
    "name": "Галина Г.",
    "description": "Галина Г. из Ал-Анон на группе «Вторяк», Владивосток 27/03/2026",
    "date": "2026-03-27",
    "year": "2026",
    "fellowship": "Ал-Анон"
  },
  {
    "id": "speaker-1955c244a79e",
    "src": "https://aa25.ru/wp-content/uploads/2026/03/speaker_MarinaSH_3godа_21-03-2026.mp3",
    "name": "Марина Ш.",
    "description": "Марина Ш., 3 года трезвости, на группе «Наш район», Владивосток 21/03/2026",
    "date": "2026-03-21",
    "year": "2026",
    "fellowship": "АА"
  },
  {
    "id": "speaker-ad4a164821d3",
    "src": "https://aa25.ru/wp-content/uploads/2026/02/speaker_IvanS_3mes_26-02-2026.mp3",
    "name": "Иван С.",
    "description": "Иван С., 3 месяца трезвости, на группе «Вторяк», Владивосток 26/02/2026 на тему: «Спотыкаясь в верном направлении»",
    "date": "2026-02-26",
    "year": "2026",
    "fellowship": "АА"
  },
  {
    "id": "speaker-63b0b7905840",
    "src": "https://aa25.ru/wp-content/uploads/2026/02/speaker_PavelG_5let_21-02-2026.mp3",
    "name": "Павел Г.",
    "description": "Павел Г., 5 лет трезвости, на группе «Наш район», Владивосток 21/02/2026",
    "date": "2026-02-21",
    "year": "2026",
    "fellowship": "АА"
  },
  {
    "id": "speaker-0ac8282ee271",
    "src": "https://aa25.ru/wp-content/uploads/2026/02/speaker_LudmilaS_10let_13-02-2026.mp3",
    "name": "Людмила С.",
    "description": "Людмила С., 10 лет трезвости, Владивосток 13/02/2026 на темы: «Страхи. До и после. Вторая традиция»",
    "date": "2026-02-13",
    "year": "2026",
    "fellowship": "АА"
  },
  {
    "id": "speaker-8d5a47ce56f2",
    "src": "https://aa25.ru/wp-content/uploads/2026/02/speaker_ViktorR_5_let_01-02-2026.mp3",
    "name": "Виктор Р.",
    "description": "Виктор Р., 5 лет трезвости, на группе «Наш район», Владивосток 01/02/2026",
    "date": "2026-02-01",
    "year": "2026",
    "fellowship": "АА"
  },
  {
    "id": "speaker-4dc5d4b18755",
    "src": "https://aa25.ru/wp-content/uploads/2026/01/speaker_PolinaK_08-01-2026.mp3",
    "name": "Полина К.",
    "description": "Полина К. из Санкт-Петербурга на группе «Вторяк», Владивосток 08/01/2026 на тему служения",
    "date": "2026-01-08",
    "year": "2026",
    "fellowship": "АА"
  },
  {
    "id": "speaker-099f29c6e87e",
    "src": "https://aa25.ru/wp-content/uploads/2025/12/speaker_Katia_33goda_07-12-2025.mp3",
    "name": "Екатерина Е.",
    "description": "Екатерина Е., 33 года трезвости, на группе «Маяк», Владивосток 07/12/2025",
    "date": "2025-12-07",
    "year": "2025",
    "fellowship": "АА"
  },
  {
    "id": "speaker-f5a05b5dd373",
    "src": "https://aa25.ru/wp-content/uploads/2025/12/speaker_MaksimB_HBR_12let_02-12-2025.mp3",
    "name": "Максим Б.",
    "description": "Максим Б. из Хабаровска, 12 лет трезвости, на группе «Вторяк», Владивосток 02/12/2025",
    "date": "2025-12-02",
    "year": "2025",
    "fellowship": "АА"
  },
  {
    "id": "speaker-432bb2f13734",
    "src": "https://aa25.ru/wp-content/uploads/2025/11/speaker_Anna_Al-Anon_11let_27-11-2025.mp3",
    "name": "Анна",
    "description": "Анна из Ал-Анон, 11 лет, на группе «Вторяк», Владивосток 27/11/2025",
    "date": "2025-11-27",
    "year": "2025",
    "fellowship": "Ал-Анон"
  },
  {
    "id": "speaker-7795ad0c9792",
    "src": "https://aa25.ru/wp-content/uploads/2025/11/speaker_PavelM_13let_16-11-2025.mp3",
    "name": "Павел М.",
    "description": "Павел М., 13 лет трезвости, Владивосток 16/11/2025",
    "date": "2025-11-16",
    "year": "2025",
    "fellowship": "АА"
  },
  {
    "id": "speaker-30221392f027",
    "src": "https://aa25.ru/wp-content/uploads/2025/11/speaker_IgorV_27let_13-11-2025.mp3",
    "name": "Игорь В.",
    "description": "Игорь В., 27 лет трезвости, Владивосток 13/11/2025",
    "date": "2025-11-13",
    "year": "2025",
    "fellowship": "АА"
  },
  {
    "id": "speaker-df5844812a70",
    "src": "https://aa25.ru/wp-content/uploads/2025/10/speaker_MaksimS_7let_11-10-2025.mp3",
    "name": "Максим С.",
    "description": "Максим С., 7 лет трезвости, Владивосток 11/10/2025",
    "date": "2025-10-11",
    "year": "2025",
    "fellowship": "АА"
  },
  {
    "id": "speaker-723afde0b4bb",
    "src": "https://aa25.ru/wp-content/uploads/2025/10/speaker_SergeyO_Artiom_16let_30-09-2025.mp3",
    "name": "Сергей О.",
    "description": "Сергей О., 16 лет трезвости, Владивосток (Артём) 30/09/2025 на тему личной истории",
    "date": "2025-09-30",
    "year": "2025",
    "fellowship": "АА"
  },
  {
    "id": "speaker-5c1780b5b980",
    "src": "https://aa25.ru/wp-content/uploads/2025/10/speaker_ValeriiT_Hbr_20let_26-09-2025-online-audio-convert.com_.mp3",
    "name": "Валерий Т.",
    "description": "Валерий Т., 20 лет трезвости, Владивосток (Хабаровск) 26/09/2025",
    "date": "2025-09-26",
    "year": "2025",
    "fellowship": "АА"
  },
  {
    "id": "speaker-f21e1f39d583",
    "src": "https://aa25.ru/wp-content/uploads/2025/09/speaker_AlekseiB_7let_11-09-2025.mp3",
    "name": "Алексей Б.",
    "description": "Алексей Б., 7 лет трезвости, Владивосток (Ангарск) 11/09/2025 на тему I шага",
    "date": "2025-09-11",
    "year": "2025",
    "fellowship": "АА"
  },
  {
    "id": "speaker-8aa16ea1e0af",
    "src": "https://aa25.ru/wp-content/uploads/2025/09/speaker_TigranI_20let_04-09-2025.mp3",
    "name": "Тигран И.",
    "description": "Тигран И., 20 лет трезвости, Владивосток 04/09/2025 на тему IV и V шагов",
    "date": "2025-09-04",
    "year": "2025",
    "fellowship": "АА"
  },
  {
    "id": "speaker-12edda255e31",
    "src": "https://aa25.ru/wp-content/uploads/2025/08/speaker_RomanS_9let_21-08-2025.mp3",
    "name": "Роман С.",
    "description": "Роман С., 9 лет трезвости, Владивосток 21/08/2025",
    "date": "2025-08-21",
    "year": "2025",
    "fellowship": "АА"
  },
  {
    "id": "speaker-56cd8e72455d",
    "src": "https://aa25.ru/wp-content/uploads/2025/07/speaker_VladimirTS_VictoriaTS_3goda_17-07-2025.mp3",
    "name": "Владимир Ц. (3 года трезвости) с супругой Викторией Ц.",
    "description": "Владимир Ц. (3 года трезвости) с супругой Викторией Ц. из сообщества Ал-Анон, Владивосток 17/07/2025 на тему семейного выздоровления",
    "date": "2025-07-17",
    "year": "2025",
    "fellowship": "Ал-Анон"
  },
  {
    "id": "speaker-df3014a98707",
    "src": "https://aa25.ru/wp-content/uploads/2025/06/speaker_ValeriyaCh_10let_13-06-2025.mp3",
    "name": "Валерия Ч.",
    "description": "Валерия Ч., 10 лет трезвости, Владивосток 13/06/2025",
    "date": "2025-06-13",
    "year": "2025",
    "fellowship": "АА"
  },
  {
    "id": "speaker-56d23f01c589",
    "src": "https://aa25.ru/wp-content/uploads/2025/05/speaker_AnnaP_3goda_23-05-2025.mp3",
    "name": "Анна П.",
    "description": "Анна П., 3 года трезвости, Владивосток 23/05/2025",
    "date": "2025-05-23",
    "year": "2025",
    "fellowship": "АА"
  },
  {
    "id": "speaker-6694354121b6",
    "src": "https://aa25.ru/wp-content/uploads/2025/03/speaker_MarinaSH_2godа_26-03-2025.mp3",
    "name": "Марина Ш.",
    "description": "Марина Ш., 2 года трезвости, Владивосток 26/03/2025",
    "date": "2025-03-26",
    "year": "2025",
    "fellowship": "АА"
  },
  {
    "id": "speaker-29030b721de2",
    "src": "https://aa25.ru/wp-content/uploads/2025/03/speaker_AlekseiC_2godа_26-03-2025.mp3",
    "name": "Алексей Ц.",
    "description": "Алексей Ц., 2 года трезвости, Владивосток 26/03/2025",
    "date": "2025-03-26",
    "year": "2025",
    "fellowship": "АА"
  },
  {
    "id": "speaker-f1320d1d00c1",
    "src": "https://aa25.ru/wp-content/uploads/2025/03/speaker_MatveyZH_8let_08-03-2025.mp3",
    "name": "Матвей Ж.",
    "description": "Матвей Ж., 8 лет трезвости, Москва на группе «Наш район» 08/03/2025 на тему отношений",
    "date": "2025-03-08",
    "year": "2025",
    "fellowship": "АА"
  },
  {
    "id": "speaker-50cbe17e9b73",
    "src": "https://aa25.ru/wp-content/uploads/2025/02/speaker_PavelG_4goda_22-02-2025.mp3",
    "name": "Павел Г.",
    "description": "Павел Г., 4 года трезвости, Владивосток 22/02/2025",
    "date": "2025-02-22",
    "year": "2025",
    "fellowship": "АА"
  },
  {
    "id": "speaker-cc8db7371f16",
    "src": "https://aa25.ru/wp-content/uploads/2025/01/speaker_NikitaT_1god_18-01-2025.mp3",
    "name": "Никита Т.",
    "description": "Никита Т., 1 год трезвости, Владивосток 18/01/2025",
    "date": "2025-01-18",
    "year": "2025",
    "fellowship": "АА"
  },
  {
    "id": "speaker-c363137ee706",
    "src": "https://aa25.ru/wp-content/uploads/2025/01/speaker_MaksimS_7let_17-01-2025.mp3",
    "name": "Максим С.",
    "description": "Максим С., 7 лет трезвости, Владивосток 17/01/2025",
    "date": "2025-01-17",
    "year": "2025",
    "fellowship": "АА"
  },
  {
    "id": "speaker-1cb677e98e82",
    "src": "https://aa25.ru/wp-content/uploads/2024/08/speaker_RomanR_8let_18-08-2024.mp3",
    "name": "Роман С.",
    "description": "Роман С., 8 лет трезвости, Владивосток 18/08/2024",
    "date": "2024-08-18",
    "year": "2024",
    "fellowship": "АА"
  },
  {
    "id": "speaker-ade4369871b1",
    "src": "https://aa25.ru/wp-content/uploads/2024/08/speaker_SnezhanaS_11let_03-08-2024.mp3",
    "name": "Снежана С.",
    "description": "Снежана С., 11 лет трезвости, Владивосток 03/08/2024",
    "date": "2024-08-03",
    "year": "2024",
    "fellowship": "АА"
  },
  {
    "id": "speaker-6e04c828c73e",
    "src": "https://aa25.ru/wp-content/uploads/2024/06/speaker_ValeriyaCh_9let_23-06-2024.mp3",
    "name": "Валерия Ч.",
    "description": "Валерия Ч., 9 лет трезвости, Владивосток 23/06/2024",
    "date": "2024-06-23",
    "year": "2024",
    "fellowship": "АА"
  },
  {
    "id": "speaker-81a52fce327d",
    "src": "https://aa25.ru/wp-content/uploads/2024/03/speaker_AlekseiC_1god_27-03-2024.mp3",
    "name": "Алексей Ц.",
    "description": "Алексей Ц., 1 год трезвости, Владивосток 27/03/2024",
    "date": "2024-03-27",
    "year": "2024",
    "fellowship": "АА"
  },
  {
    "id": "speaker-50aad7d87985",
    "src": "https://aa25.ru/wp-content/uploads/2024/02/speaker_ViktorR_3_goda_03-02-2024.mp3",
    "name": "Виктор Р.",
    "description": "Виктор Р., 3 года трезвости, Владивосток 03/02/2024",
    "date": "2024-02-03",
    "year": "2024",
    "fellowship": "АА"
  },
  {
    "id": "speaker-d2372f89aad3",
    "src": "https://aa25.ru/wp-content/uploads/2023/12/speaker_Katia_31god_10-12-2023.mp3",
    "name": "Екатерина Е.",
    "description": "Екатерина Е., 31 год трезвости, Владивосток 10/12/2023",
    "date": "2023-12-10",
    "year": "2023",
    "fellowship": "АА"
  },
  {
    "id": "speaker-7b0d9e5cd351",
    "src": "https://aa25.ru/wp-content/uploads/2023/11/speaker_MarkT_1god_08-11-2023.mp3",
    "name": "Марк Т.",
    "description": "Марк Т., 1 год трезвости, Владивосток 08/11/2023",
    "date": "2023-11-08",
    "year": "2023",
    "fellowship": "АА"
  },
  {
    "id": "speaker-20795f14e688",
    "src": "https://aa25.ru/wp-content/uploads/2023/10/speaker_AlekseiV_23goda_24-10-2023.mp3",
    "name": "Алексей В.",
    "description": "Алексей В., 23 года трезвости, Владивосток 24/10/2023",
    "date": "2023-10-24",
    "year": "2023",
    "fellowship": "АА"
  },
  {
    "id": "speaker-8df70c5fd88d",
    "src": "https://aa25.ru/wp-content/uploads/2023/10/speaker_SnezhannaS_nAAshi_deti_18-10-2023.mp3",
    "name": "Снежана С.",
    "description": "Снежана С., Владивосток 18/10/2023 на тему нААших детей",
    "date": "2023-10-18",
    "year": "2023",
    "fellowship": "АА"
  },
  {
    "id": "speaker-9f460fc9faf2",
    "src": "https://aa25.ru/wp-content/uploads/2023/05/speaker_SergeyS_9let_13-05-2023.mp3",
    "name": "Сергей С.",
    "description": "Сергей С., 9 лет трезвости, Владивосток 13/05/2023",
    "date": "2023-05-13",
    "year": "2023",
    "fellowship": "АА"
  },
  {
    "id": "speaker-bbc6587a7750",
    "src": "https://aa25.ru/wp-content/uploads/2023/02/speaker_PavelG_2goda_18-02-2023.mp3",
    "name": "Павел Г.",
    "description": "Павел Г., 2 года трезвости, Владивосток 18/02/2023",
    "date": "2023-02-18",
    "year": "2023",
    "fellowship": "АА"
  },
  {
    "id": "speaker-5d75eafde131",
    "src": "https://aa25.ru/wp-content/uploads/2022/12/speaker_Katia_30let_09-12-2022.mp3",
    "name": "Екатерина Е.",
    "description": "Екатерина Е., 30 лет трезвости, Владивосток 09/12/2022",
    "date": "2022-12-09",
    "year": "2022",
    "fellowship": "АА"
  },
  {
    "id": "speaker-6c8bf07fc87a",
    "src": "https://aa25.ru/wp-content/uploads/2022/11/speaker_TatianaB_24goda_04-11-2022.mp3",
    "name": "Татьяна Б.",
    "description": "Татьяна Б., 24 года трезвости, Владивосток 04/11/2022",
    "date": "2022-11-04",
    "year": "2022",
    "fellowship": "АА"
  },
  {
    "id": "speaker-14cdc973ed2d",
    "src": "https://aa25.ru/wp-content/uploads/2022/10/speaker_AlekseiV_22goda_24-10-2022.mp3",
    "name": "Алексей В.",
    "description": "Алексей В., 22 года трезвости, Владивосток 24/10/2022",
    "date": "2022-10-24",
    "year": "2022",
    "fellowship": "АА"
  },
  {
    "id": "speaker-eaf6511a56ab",
    "src": "https://aa25.ru/wp-content/uploads/2022/10/speaker_DenisM_8let_23-10-2022.mp3",
    "name": "Денис М.",
    "description": "Денис М., 8 лет трезвости, Владивосток 23/10/2022",
    "date": "2022-10-23",
    "year": "2022",
    "fellowship": "АА"
  },
  {
    "id": "speaker-b908b0165df5",
    "src": "https://aa25.ru/wp-content/uploads/2022/06/speaker_LeraCh_7let_08-06-2022.mp3",
    "name": "Лера Ч.",
    "description": "Лера Ч., 7 лет трезвости, Владивосток 08/06/2022",
    "date": "2022-06-08",
    "year": "2022",
    "fellowship": "АА"
  },
  {
    "id": "speaker-7f831bc2ea6c",
    "src": "https://aa25.ru/wp-content/uploads/2022/05/speaker_AleksandrG_6let_21-05-2022.mp3",
    "name": "Александр Г.",
    "description": "Александр Г., 6 лет трезвости, Владивосток 21/05/2022",
    "date": "2022-05-21",
    "year": "2022",
    "fellowship": "АА"
  },
  {
    "id": "speaker-c5f878c3a643",
    "src": "https://aa25.ru/wp-content/uploads/2022/02/speaker_OlgaB_17let_23-02-2022.mp3",
    "name": "Ольга Б.",
    "description": "Ольга Б., 17 лет трезвости, Владивосток 23/02/2022",
    "date": "2022-02-23",
    "year": "2022",
    "fellowship": "АА"
  },
  {
    "id": "speaker-91c27c656be2",
    "src": "https://aa25.ru/wp-content/uploads/2022/02/speaker_PavelG_1god_19-02-2022.mp3",
    "name": "Павел Г.",
    "description": "Павел Г., 1 год трезвости, Владивосток 19/02/2022",
    "date": "2022-02-19",
    "year": "2022",
    "fellowship": "АА"
  },
  {
    "id": "speaker-f7acc893f0b2",
    "src": "https://aa25.ru/wp-content/uploads/2021/12/speaker_Katia_29let_12-12-2021_part1.mp3",
    "name": "Катя",
    "description": "Катя, 29 лет трезвости, Владивосток 12/12/2021 (часть 1)",
    "date": "2021-12-12",
    "year": "2021",
    "fellowship": "АА"
  },
  {
    "id": "speaker-ca430447740c",
    "src": "https://aa25.ru/wp-content/uploads/2021/12/speaker_Katia_29let_12-12-2021_part2.mp3",
    "name": "Катя",
    "description": "Катя, 29 лет трезвости, Владивосток 12/12/2021 (часть 2)",
    "date": "2021-12-12",
    "year": "2021",
    "fellowship": "АА"
  },
  {
    "id": "speaker-237b95449290",
    "src": "https://aa25.ru/wp-content/uploads/2021/10/speaker_AleksandrV_3goda_19-10-2021.mp3",
    "name": "Александр В.",
    "description": "Александр В., 3 года трезвости, Владивосток 19/10/2021",
    "date": "2021-10-19",
    "year": "2021",
    "fellowship": "АА"
  },
  {
    "id": "speaker-df8794115128",
    "src": "https://aa25.ru/wp-content/uploads/2021/10/speaker_OlesiaA_2goda_19-10-2021.mp3",
    "name": "Олеся А.",
    "description": "Олеся А., 2 года трезвости, Владивосток 19/10/2021",
    "date": "2021-10-19",
    "year": "2021",
    "fellowship": "АА"
  },
  {
    "id": "speaker-d59406c29109",
    "src": "https://aa25.ru/wp-content/uploads/2021/10/speaker_SoniaL_1god_19-10-2021.mp3",
    "name": "Соня Л.",
    "description": "Соня Л., 1 год трезвости, Владивосток 19/10/2021",
    "date": "2021-10-19",
    "year": "2021",
    "fellowship": "АА"
  },
  {
    "id": "speaker-d2fc1a4d8b69",
    "src": "https://aa25.ru/wp-content/uploads/2021/10/Спикерское_Денис_М_7_лет.mp3",
    "name": "Денис М.",
    "description": "Денис М., 7 лет трезвости, Владивосток 16/10/2021",
    "date": "2021-10-16",
    "year": "2021",
    "fellowship": "АА"
  },
  {
    "id": "speaker-a93a1ea7068e",
    "src": "https://aa25.ru/wp-content/uploads/2021/10/speaker_VitaliiSh_2goda_12-06-2021.mp3",
    "name": "Виталий Ш.",
    "description": "Виталий Ш., 2 года трезвости, Владивосток 12/06/2021",
    "date": "2021-06-12",
    "year": "2021",
    "fellowship": "АА"
  },
  {
    "id": "speaker-d2c40f7bd358",
    "src": "https://aa25.ru/wp-content/uploads/2021/10/speaker_SergeiS_7let_29-05-2021.mp3",
    "name": "Сергей С.",
    "description": "Сергей С., 7 лет трезвости, Владивосток 29/05/2021",
    "date": "2021-05-29",
    "year": "2021",
    "fellowship": "АА"
  },
  {
    "id": "speaker-06551c6ca4a2",
    "src": "https://aa25.ru/wp-content/uploads/2021/10/speaker_DimaS_3goda_26-05-2021.mp3",
    "name": "Дима С.",
    "description": "Дима С., 3 года трезвости, Владивосток 26/05/2021",
    "date": "2021-05-26",
    "year": "2021",
    "fellowship": "АА"
  }
];
class AASpeakers extends HTMLElement {
  static get observedAttributes() { return ['collapsed']; }
  attributeChangedCallback() { this.refreshMini?.(); }
  connectedCallback() {
    if (this.shadowRoot) return;
    const host = this;
    const root = this.attachShadow({mode:'open'});
    const style = document.createElement('link');
    style.rel = 'stylesheet';
    style.href = stylesheet;
    root.innerHTML = `<section class="speakers-page"><div class="wrap">
 <div class="speakers-heading"><div><span class="eyebrow">ЖИВОЙ ОПЫТ СОДРУЖЕСТВА</span><h2>Спикерские</h2><p>Истории выздоровления, опыт и надежда — в голосах людей из содружества.</p></div><span class="audio-library-mark" aria-hidden="true">АУДИО<br>ТЕКА<span>АА / ПРИМОРЬЕ</span></span></div>
 <div class="audio-deck" aria-label="Аудиоплеер спикерских"><div class="deck-topline"><span>ГОЛОСА ОПЫТА</span><span>АА · ПРИМОРСКИЙ КРАЙ</span></div><div class="deck-body"><div class="deck-display"><div class="deck-display-label"><span id="audio-state" role="status">Готово к прослушиванию</span><span class="level-meter" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span></div><h3 id="audio-title">Выберите запись</h3><p id="audio-detail"></p><div class="audio-timeline"><label class="sr-only" for="audio-seek">Позиция воспроизведения</label><input id="audio-seek" type="range" min="0" max="1000" value="0" disabled><div><span id="audio-current">0:00</span><span id="audio-duration">—:—</span></div></div></div><div class="deck-grille" aria-hidden="true"><span></span></div></div><div class="deck-controls"><div class="transport"><button type="button" id="audio-back" class="audio-small" aria-label="Назад на 15 секунд"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V3m0 6h6M4.5 8A8 8 0 1 1 4 16"/></svg><span>15</span></button><button type="button" id="audio-play" class="audio-main" aria-label="Воспроизвести"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 11 7-11 7z" fill="currentColor" stroke="none"/></svg><span>Слушать</span></button><button type="button" id="audio-forward" class="audio-small" aria-label="Вперёд на 15 секунд"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 9V3m0 6h-6m5.5-1A8 8 0 1 0 20 16"/></svg><span>15</span></button></div><div class="audio-options"><label for="audio-rate">Скорость <select id="audio-rate"><option value="0.75">0,75×</option><option value="1" selected>1×</option><option value="1.25">1,25×</option><option value="1.5">1,5×</option><option value="2">2×</option></select></label><label class="audio-volume" for="audio-volume">Громкость <input id="audio-volume" type="range" min="0" max="1" step="0.05" value="1"></label></div></div><div class="deck-footnote"><span class="deck-light" aria-hidden="true"></span><span>Каждая история — чей-то путь к трезвости</span></div></div>
 <div class="audio-catalogue"><div class="audio-catalogue-head"><h3>Записи выступлений</h3><span id="audio-count" aria-live="polite"></span></div><div class="audio-filters"><label>Поиск<input id="audio-search" type="search" placeholder="Имя, группа или тема" autocomplete="off"></label><label>Год<select id="audio-year"><option value="">Все годы</option></select></label><label>Содружество<select id="audio-fellowship"><option value="">Все записи</option><option>АА</option><option>Ал-Анон</option></select></label></div><div id="audio-records" class="audio-records"></div><button type="button" id="audio-more" class="btn line">Показать ещё</button><p class="audio-source">Записи и подписи — из архива AA25.ru. Имена сохранены в том виде, в котором указаны в источнике.</p></div>
</div></section>
<audio id="speaker-audio" preload="none"></audio>
<aside id="audio-mini" class="audio-mini" aria-label="Сейчас играет" hidden><a href="#speakers"><span>СЕЙЧАС СЛУШАЕТЕ</span><strong id="mini-title"></strong></a><span id="mini-time">0:00</span><button id="mini-play" type="button" aria-label="Пауза"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14M16 5v14"/></svg></button><button id="mini-close" type="button" aria-label="Остановить и закрыть плеер"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button></aside>`;
    root.prepend(style);
    const $ = id => root.getElementById(id);
    const audio = $('speaker-audio'), deck = root.querySelector('.audio-deck'), mini = $('audio-mini');
    mini.querySelector('a').hash = this.id || 'speakers';
    let current=records[0],limit=12,remember=0,lastSave=0,hasStarted=false,miniDismissed=false;
    this.refreshMini = showMini;
    const playIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 11 7-11 7z" fill="currentColor" stroke="none"/></svg>',pauseIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14M16 5v14" fill="none" stroke="currentColor" stroke-width="3"/></svg>';
const readStore=key=>{try{return JSON.parse(localStorage.getItem(key)||'null')}catch(e){return null}},writeStore=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value))}catch(e){}};
const saved=readStore('aa-audio-current');if(saved){current=records.find(r=>r.id===saved)||current}
const time=n=>{if(!Number.isFinite(n)||n<0)return '—:—';n=Math.floor(n);const h=Math.floor(n/3600),m=Math.floor(n%3600/60),s=String(n%60).padStart(2,'0');return h?h+':'+String(m).padStart(2,'0')+':'+s:m+':'+s};
const date=r=>r.date?new Intl.DateTimeFormat('ru-RU',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(r.date+'T12:00:00Z')):'Дата не указана';
function description(r,compact=false){let s=r.description;if(s.startsWith(r.name))s=s.slice(r.name.length).replace(/^[, .]+/,'');if(compact)s=s.replace(/,?\s*\d{2}\/\d{2}\/20\d{2}/,'').replace(/[, ]+$/,'');return s.charAt(0).toUpperCase()+s.slice(1)}
function filtered(){const q=$('audio-search').value.trim().toLocaleLowerCase('ru'),year=$('audio-year').value,f=$('audio-fellowship').value;return records.filter(r=>(!q||r.description.toLocaleLowerCase('ru').includes(q))&&(!year||r.year===year)&&(!f||r.fellowship===f))}
function renderList(){const list=filtered();$('audio-count').textContent=list.length+' из '+records.length+' записей';$('audio-records').replaceChildren();if(!list.length){const p=document.createElement('p');p.className='audio-empty';p.textContent='По этому запросу записей нет. Попробуйте другое имя, группу или год.';$('audio-records').append(p)}list.slice(0,limit).forEach((r,i)=>{const row=document.createElement('article');row.className='audio-row'+(r.id===current.id?' active':'');row.dataset.record=r.id;const number=document.createElement('span');number.className='record-number';number.textContent=String(i+1).padStart(2,'0');number.setAttribute('aria-hidden','true');const info=document.createElement('div'),h=document.createElement('h4'),p=document.createElement('p');h.textContent=r.name;p.textContent=description(r,true);info.append(h,p);const stamp=document.createElement('div');stamp.className='record-date';stamp.textContent=date(r);const kind=document.createElement('span');kind.textContent=r.fellowship;stamp.append(kind);const b=document.createElement('button');b.type='button';b.className='record-listen';const playing=r.id===current.id&&!audio.paused;b.innerHTML=(playing?pauseIcon:playIcon)+(playing?'Пауза':'Слушать');b.setAttribute('aria-label',(playing?'Пауза: ':'Слушать: ')+r.description);b.onclick=()=>{if(current.id===r.id)toggle();else select(r,true)};row.append(number,info,stamp,b);$('audio-records').append(row)});$('audio-more').hidden=limit>=list.length}
function showMini(){mini.hidden=!host.hasAttribute('collapsed')||!hasStarted||miniDismissed;}
function update(){const playing=!audio.paused&&!audio.ended;deck.classList.toggle('is-playing',playing);$('audio-play').innerHTML=(playing?pauseIcon:playIcon)+'<span>'+(playing?'Пауза':'Слушать')+'</span>';$('audio-play').setAttribute('aria-label',playing?'Пауза':'Воспроизвести');$('mini-play').innerHTML=playing?pauseIcon:playIcon;$('mini-play').setAttribute('aria-label',playing?'Пауза':'Воспроизвести');$('audio-current').textContent=time(audio.currentTime||0);$('mini-time').textContent=time(audio.currentTime||0);$('audio-duration').textContent=time(audio.duration);$('audio-seek').disabled=!Number.isFinite(audio.duration)||audio.duration<=0;if(!$('audio-seek').disabled){$('audio-seek').value=1000*audio.currentTime/audio.duration;$('audio-seek').setAttribute('aria-valuetext',time(audio.currentTime)+' из '+time(audio.duration))}showMini()}
function select(r,play=false){if(audio.currentSrc&&current)save();audio.pause();current=r;audio.removeAttribute('src');audio.load();remember=Number(readStore('aa-audio-position-'+r.id))||0;hasStarted=false;miniDismissed=false;$('audio-title').textContent=r.name;$('audio-detail').textContent=description(r);$('mini-title').textContent=r.name;$('audio-state').textContent=remember>5?'Продолжить с '+time(remember):'Готово к прослушиванию';writeStore('aa-audio-current',r.id);if('mediaSession' in navigator&&'MediaMetadata' in window)navigator.mediaSession.metadata=new MediaMetadata({title:r.name,artist:'Спикерские АА Приморья',album:date(r)});update();renderList();if(play)toggle()}
function save(){if(Number.isFinite(audio.currentTime)&&audio.currentTime>0)writeStore('aa-audio-position-'+current.id,audio.currentTime)}
async function toggle(){if(!audio.paused){audio.pause();return}const selected=current.id;if(!audio.getAttribute('src')){audio.src=current.src;audio.load()}$('audio-state').textContent='Загрузка записи…';miniDismissed=false;try{await audio.play();if(current.id===selected){hasStarted=true;update()}}catch(e){if(current.id!==selected||e.name==='AbortError')return;$('audio-state').textContent='Не удалось начать воспроизведение. Нажмите «Слушать», чтобы повторить.';update()}}
$('audio-play').onclick=toggle;$('mini-play').onclick=toggle;$('mini-close').onclick=()=>{audio.pause();miniDismissed=true;showMini()};
$('audio-back').onclick=()=>{if(audio.getAttribute('src'))audio.currentTime=Math.max(0,audio.currentTime-15)};$('audio-forward').onclick=()=>{if(Number.isFinite(audio.duration))audio.currentTime=Math.min(audio.duration,audio.currentTime+15)};
$('audio-seek').oninput=()=>{if(Number.isFinite(audio.duration))audio.currentTime=audio.duration*Number($('audio-seek').value)/1000};
$('audio-rate').value=String(readStore('aa-audio-rate')||1);audio.playbackRate=Number($('audio-rate').value)||1;$('audio-rate').onchange=()=>{audio.playbackRate=Number($('audio-rate').value);writeStore('aa-audio-rate',audio.playbackRate)};$('audio-volume').oninput=()=>{audio.volume=Number($('audio-volume').value)};
audio.addEventListener('loadedmetadata',()=>{audio.playbackRate=Number($('audio-rate').value)||1;if(remember>5&&remember<audio.duration-10)audio.currentTime=remember;remember=0;update()});
audio.addEventListener('timeupdate',()=>{update();if(Date.now()-lastSave>5000){save();lastSave=Date.now()}});
audio.addEventListener('playing',()=>{hasStarted=true;$('audio-state').textContent='Сейчас играет';update();renderList()});
audio.addEventListener('pause',()=>{save();if(hasStarted)$('audio-state').textContent='На паузе';update();renderList()});
audio.addEventListener('waiting',()=>{$('audio-state').textContent='Подгружаем запись…'});
audio.addEventListener('ended',()=>{writeStore('aa-audio-position-'+current.id,0);$('audio-state').textContent='Запись завершена';update();renderList()});
audio.addEventListener('error',()=>{if(audio.getAttribute('src'))$('audio-state').textContent='Запись не загрузилась. Проверьте соединение и попробуйте ещё раз.';update()});
[...new Set(records.map(r=>r.year).filter(Boolean))].sort().reverse().forEach(year=>{const o=document.createElement('option');o.value=year;o.textContent=year;$('audio-year').append(o)});
for(const id of ['audio-search','audio-year','audio-fellowship'])$(id).addEventListener(id==='audio-search'?'input':'change',()=>{limit=12;renderList()});$('audio-more').onclick=()=>{limit+=12;renderList()};window.addEventListener('hashchange',showMini);window.addEventListener('pagehide',save);
if('mediaSession' in navigator){for(const [action,handler]of [['play',()=>{if(audio.paused)toggle()}],['pause',()=>audio.pause()],['seekbackward',()=>{audio.currentTime=Math.max(0,audio.currentTime-15)}],['seekforward',()=>{if(Number.isFinite(audio.duration))audio.currentTime=Math.min(audio.duration,audio.currentTime+15)}]])try{navigator.mediaSession.setActionHandler(action,handler)}catch(e){}}
select(current);

  }
}
if (!customElements.get('aa-speakers')) customElements.define('aa-speakers', AASpeakers);
})();
