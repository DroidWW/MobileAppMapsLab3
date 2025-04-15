# Описание проекта
Это приложение на React Native позволяет пользователям:
   - Просматривать интерактивную карту
   - Добавлять маркеры на карту
   - Прикреплять изображения к маркерам
   - Сохранять все данные в локальной базе данных SQLite
   - Управлять состоянием приложения через React Context
   - Отслеживание местоположения устройства
   - Отправка уведомлений при приближении к маркеру

## Установка зависимостей 
    "npm install react-native-maps/uuid/expo-image-picker/expo-router/expo-sqlite/expo-location/expo-notifications/geolib"
## Запуск проекта 
    "npx expo start"
## Тестирование приложения
    Открыть приложение Expo Go на телефоне и отсканировать QR-код в терминале.

# Технологии
   - React Native
   - Expo
   - SQLite (expo-sqlite)
   - React Context API
   - Location
   - Notifications
   - geolib

# Схема базы данных

Таблица markers

CREATE TABLE markers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

Таблица markerImages

CREATE TABLE marker_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    marker_id INTEGER NOT NULL,
    uri TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (marker_id) REFERENCES markers (id) ON DELETE CASCADE
);

# Операции с базой данных
   - addMarker - добавляет новый маркер
   - deleteMarkre - удаляет маркер и связанные изображения
   - getMarker - получение всех маркеров
   - addImage - добавление изображения к маркеру
   - deleteImage - удаление изображения из маркера
   - getMarkerImages - получение изображений маркера

# Обработка ошибок
   - Ошибки инициализации баз данных (проблемы с созднием/открытием баз данных, ошибка выполнения создания таблиц)
   - Ошибки транзакций (ошибка выполнения sql запросов)
   - Ошибки подключений (пробелмы с доступом к базе данных)
   - Ошибки доступа к уведомления
   - Ошибки доступа к местоположению устройства

# Описание
    - Мониторится местоположение устройства каждые 5 секунд
    - Расчитывается расстояние от местоположения пользователя до марок 
    - Сравнивает это расстояние, если оно меньше 100 метров, то показывает уведомление, если нет то удаляет, при наличии, уведомление