# ALTACO: візуальна класифікація кольорів — 15.09.2026

Власник доручив самостійно визначити кольори та узгодити сайт із джерелом.
Переглянуто 77 фото для всіх 86 товарних варіантів. Класифікатор — Codex.
Основний колір визначено за переважним фоном фото; прожилки та включення
не стають окремими кольорами фільтра. Це візуальна категорія для підбору,
не колориметричне вимірювання або специфікація виробника. Освітлення,
баланс білого, обробка поверхні та екран можуть змінювати сприйняття.

Джерело: Google Sheets 1PIYnW-LrO_mE4DYN8IVYPuwDQd6dQ5qfD9fkRGQg6ik,
аркуш «Наявність», sheetId 86749982. Зіставлення за секцією, назвою,
обробкою і трьома розмірами через чинний manifest; 86 унікальних ID.
Оновлено тільки значення C та примітки до них; ручні зразки поза каталогом
не входять у цей перегляд. Ціни, наявність та дати актуальності не звірялися.

Результат: білий 22, сірий 23, чорний 14, бежевий 17, коричневий 8,
синій 1, зелений 1. Порожніх кольорів у поточному каталозі немає.
60 значень таблиці змінено, 26 залишено після перегляду;
67 значень color у snapshot змінено, 19 залишено.

Зворотне читання підтвердило 86 кольорів і приміток; форматування та
інші прочитані поля збережені. 47/47 тести; збірка exit 0, 191 сторінка.
Контрольний імпорт із перевіреними кольорами, назвами, обробками й
розмірами та тестовими залишками/поточними публічними цінами відтворив
snapshot повністю. Це перевірка механіки, не повторний імпорт складу.
У зібраному HTML uk/en перевірено сім кольорів фільтра і колір/товщину
в усіх 172 локалізованих картках. Браузерне/мобільне приймання не повторювали;
вигляд Google-таблиці перевірено за збереженим форматуванням API, без native render.

Пограничні випадки: Ouro Brazil — бежевий із золотистими включеннями;
Palissandro Bluette — сірий із блакитним відтінком; Oregon — коричневий
із оливковим відтінком; Grey Feather і Fusion Taupe — коричневий/тауп.
Для фільтра останні віднесено до коричневого. Brown Silk за поточним фото
віднесено до сірого, а не за словом Brown у назві. Обидві Kuroka — чорні;
Gold і White описують відмінність малюнка, не основний фон.
Carbon Grey — чорний/графітовий; Mystic Grey залишається темно-сірим.

36 прапорців colorReview знято на підставі цього перегляду: зокрема
сірий для частини SM Quartz тепер свідомо прийнятий, а не пропущений
без перевірки. Наступний імпорт бере уніфікований колір із C.
Інфраструктура блокування сумнівного значення збережена для майбутніх випадків.

## Перелік рішень

| ID | Матеріал | Комірка | Було в джерелі | Основний колір | Переглянуте фото |
|---|---|---|---|---|---|
| nat-c332a398e68c | Ouro Brazil | C3 | жовтий | Бежевий | natural-29.jpeg |
| nat-6a2146473182 | Wild Silk | C4 | бежевий | Бежевий | natural-30.jpeg |
| nat-a41841c3abef | Cosmic Black | C5 | чорний | Чорний | natural-31.jpeg |
| nat-65cd9476b843 | Duetto \ кусок | C6 | коричневий | Коричневий | natural-32.jpeg |
| nat-77c25f8d40a6 | Azul Macaubas | C7 | синій | Синій | natural-33.jpeg |
| nat-a99c8a6a7ac4 | Cristallo | C8 | бежевий | Бежевий | natural-34.jpeg |
| nat-671acf94e1fb | Bianco Carrara | C9 | сірий | Білий | natural-36.jpeg |
| nat-ee7d4af8d1c6 | Versilys | C10 | сірий | Сірий | natural-37.jpeg |
| nat-af7f92429ae9 | Palissandro B&B | C11 | — | Коричневий | natural-38.jpeg |
| nat-d37837004a85 | Calacatta Gold | C12 | білий | Білий | natural-39.jpeg |
| nat-f408304985f9 | Arabescatto Classico | C13 | білий | Білий | natural-40.jpeg |
| nat-e4b710f47013 | Statuarietto | C14 | — | Білий | natural-41.jpeg |
| nat-ff10683a318a | Striato Elegante | C15 | сірий | Бежевий | natural-43.jpeg |
| nat-b2a4d9c0faff | Tundra Grey | C16 | сірий | Сірий | natural-44.jpeg |
| nat-cb7f860f7aef | Palissandro Bluette | C17 | — | Сірий | natural-45.jpeg |
| nat-d8da96e86011 | Arabescatto Orobico | C18 | — | Коричневий | natural-46.jpeg |
| nat-e9c1fe782b60 | Brown Silk | C19 | — | Сірий | natural-7.jpeg |
| nat-3a9919a5c964 | Silver Cloud | C20 | сірий | Сірий | natural-8.jpeg |
| nat-d3042ab60764 | Azul Aran Polished | C21 | сірий | Сірий | natural-9.jpeg |
| nat-120e46dfe4a5 | Azul Aran NEW | C22 | сірий | Сірий | natural-10.jpeg |
| nat-28b3f7d4b9a0 | Atlantic Stone | C23 | сірий | Сірий | natural-11.jpeg |
| nat-6277b46566a3 | Bianco Montorfano | C24 | білий | Білий | natural-12.jpeg |
| nat-7daacee24474 | Bethel White | C25 | білий | Білий | natural-14.jpeg |
| nat-c5165b056f5b | Carbon Grey | C26 | сірий | Чорний | natural-15.jpeg |
| nat-662e977d1939 | Carbon Grey \ кусок | C27 | сірий | Чорний | natural-15.jpeg |
| nat-63ea66205fc9 | Black Pepper | C28 | чорний | Чорний | natural-16.jpeg |
| nat-f24686840248 | Kuroka Gold Polished | C29 | — | Чорний | kuroka-gold-polished.jpeg |
| nat-c140bd26a211 | Nero Zimbabwe NA \ 2022 | C30 | білий | Чорний | natural-18.jpeg |
| nat-94e73a810c94 | Black Tempest Polished | C31 | сірий | Чорний | natural-20.jpeg |
| nat-2e7d947a46a9 | Kuroka White Polished | C32 | — | Чорний | natural-17.jpeg |
| nat-33a99b6d83ac | Moon Rock \ 2022 | C33 | — | Сірий | natural-21.jpeg |
| nat-43fffeeacf56 | Azul Aran Satin | C34 | сірий | Сірий | natural-9.jpeg |
| nat-7136f121dc96 | Mystic Grey 2025/1 | C35 | сірий | Сірий | natural-22.jpeg |
| nat-c21160846258 | Mystic Grey 2025/2 | C36 | сірий | Сірий | natural-22.jpeg |
| nat-51e554ee43b9 | Vittoria Regia 2025 | C37 | — | Зелений | natural-vittoria-regia.webp |
| nat-44bdad45ecef | Botticino Fiorito | C38 | — | Бежевий | natural-47.jpeg |
| nat-251fbb99c7b2 | Bottichelli | C39 | — | Бежевий | natural-48.jpeg |
| nat-9b37c484d151 | Breccia Sarda | C40 | — | Бежевий | natural-50.jpeg |
| nat-030eea1548c7 | Breche De Aubisque Extra | C41 | — | Сірий | natural-51.jpeg |
| nat-7f74a8e4d6c5 | Alpinus Vintage Bookmatch | C42 | — | Білий | natural-24.jpeg |
| nat-6b1171601a70 | Madreperla Bookmatch | C43 | — | Білий | natural-25.jpeg |
| nat-e1c99dceee5a | Sahara Roots | C44 | — | Сірий | natural-52.jpeg |
| nat-916f1e984222 | Eramosa CC | C45 | — | Коричневий | natural-53.jpeg |
| nat-9d25810e5056 | Travertino Tipo Classico | C46 | — | Бежевий | natural-travertino-tipo-classico.jpg |
| nat-346630f20f40 | Black Tempest Satin | C48 | сірий | Чорний | natural-26.jpeg |
| nat-e4241d0ff876 | Nero Zimbabwe / 2026 | C49 | — | Чорний | natural-27.jpeg |
| nat-f60f5c377fd1 | TRAVERTINO STRIATO SILVER | C54 | — | Сірий | natural-54.jpeg |
| nat-bac1e05befe6 | TRAVERTINO ROMANO CLASSICO CC | C55 | — | Бежевий | natural-55.jpeg |
| nat-a4278321ec2f | TRAVERTINO ROMANO CLASSICO VC | C56 | — | Бежевий | natural-57.jpeg |
| nat-1c42339ede1d | TRAVERTINO GRIGIO | C57 | — | Бежевий | natural-58.jpeg |
| nat-a2050e0b17c7 | TRAVERTINO GRIGIO VC ПОЛІРОВАНИЙ ТА ЗАПОВНЕНИЙ ПОЛІМЕРОМ | C58 | бежевий | Сірий | natural-59.jpeg |
| sm-1c4b7ac8220c | Nero Silk | C62 | сірий | Чорний | sm-nero.jpg |
| sm-87a8b8fb77ae | Caledonia Silk | C63 | сірий | Сірий | sm-caledonia.jpg |
| sm-71ab63240b2e | Oregon Silk | C64 | сірий | Коричневий | sm-oregon.jpg |
| sm-baf858aaf32b | Carnia Silk | C65 | сірий | Сірий | sm-carnia.jpg |
| sm-9a2586c8ebd7 | Istria Silk | C66 | сірий | Білий | sm-istria.jpg |
| sm-633dd7b99a4d | City Dark Silk | C67 | сірий | Сірий | sm-city-dark.jpg |
| sm-8ba81fb43142 | City Beige | C68 | сірий | Бежевий | sm-city-beige.jpg |
| sm-fa4b9d436faf | City Beige Silk | C69 | сірий | Бежевий | sm-city-beige.jpg |
| sm-1bbc094b494e | City White | C70 | сірий | Білий | sm-city-white.jpg |
| sm-a8fe82781c00 | City White Silk | C71 | сірий | Білий | sm-city-white.jpg |
| sm-3c7d421b349e | Zenith | C72 | сірий | Білий | sm-zenith.jpg |
| sm-a59910c9290f | Ardenne Silk | C73 | сірий | Чорний | sm-ardenne.jpg |
| sm-fdb798e6b5c7 | Sabia Beige | C74 | сірий | Бежевий | sm-sabia-beige.jpg |
| sm-babde32e37d0 | Liskamm | C75 | сірий | Білий | sm-liskamm.jpg |
| sm-f46c1943b7ea | Grigio Nube | C76 | сірий | Сірий | sm-grigio-nube.jpg |
| sm-a85046c2a75e | Metropolis Galaxy | C77 | сірий | Сірий | sm-metropolis-galaxy.jpg |
| sm-f15eadc0f288 | Metropolis Oyster | C78 | сірий | Сірий | sm-metropolis-oyster.jpg |
| sm-d102dd75fc54 | Vittoria White Silk | C79 | сірий | Білий | sm-vittoria-white.jpg |
| sm-ed32578a171b | Vittoria White Silk | C80 | сірий | Білий | sm-vittoria-white.jpg |
| sm-aba8bb629cab | Fusion Taupe Silk | C81 | сірий | Коричневий | sm-fusion-taupe.jpg |
| sm-2fa657668cc9 | Fusion Grey Silk | C82 | сірий | Сірий | sm-fusion-grey.jpg |
| sm-9817c44dde0c | Fusion Black Silk | C83 | сірий | Чорний | sm-fusion-black.jpg |
| sm-faefabfbdf99 | Vega Silk | C84 | сірий | Білий | sm-vega.jpg |
| sm-b43c2a9ee7b6 | Vega | C85 | сірий | Білий | sm-vega.jpg |
| sm-47d0613150d7 | Vermont Silk | C86 | сірий | Білий | sm-vermont.jpg |
| sm-5dd440c78d9c | Levante | C87 | сірий | Бежевий | sm-levante.jpg |
| sm-e50a6670b6b8 | Libeccio | C88 | сірий | Коричневий | sm-libeccio.jpg |
| sm-28cbd9fbdc2f | Etesia | C89 | сірий | Чорний | sm-etesia.jpg |
| sm-60bf646e4a37 | Monti | C90 | сірий | Білий | sm-monti.jpg |
| sm-ec2178c995da | Trevi | C91 | сірий | Білий | sm-trevi.jpg |
| sm-cce0cb72f93e | Trevi Silk | C92 | сірий | Білий | sm-trevi.jpg |
| sm-afb4fb0d5021 | Grey Feather | C93 | сірий | Коричневий | sm-24.jpeg |
| sm-4550c0d07833 | Light Wafer | C94 | сірий | Бежевий | sm-26.jpeg |
| sm-2cebf6c35b51 | Light Wafer Silk | C95 | сірий | Бежевий | sm-26.jpeg |
| sm-e96f3e5dd936 | Stormio | C96 | сірий | Білий | sm-30.jpeg |
