.github/
    workflows/
        frontend-branches-ci.yml
            Проверяет любую ветку начинающиюся с frontend
            Только для пулл реквеста без деплоая на сервер
        main-deploy.yml
            Проверяет все файлы
            Только для пулл реквеста с ветки main с деплоем на сервер
            Деплоит в докер только изменяющиеся файлы
        backend-workflows/
            backend-ci

Architecture:
    Yandex Cloud:
        хранит видео (придется потратить мои последнии 11 рублей)
    Docker:
        Сервер держится на докере
        Контейнеры изолирвоаны друг от друга между ними работает nginx
    api:
        Stateless состояние сервера
        JWT Tokens для проверки пользователей
    reverse-proxy:
        Nginx выступает как обратный пркокси
        Встречает пользователей имеет доступ только к используемым им сервисами:
            frontend-service, login-service, register-service
    redis:
        redis-videos:
            Хранит в себе ярлыки недавно выпущенных видео, не сохраняется
        redis-users:
            Хранит в себе хеши (сделанные) по которым вебсокет сервисы найдут пользователя и пинганут его о видео

extra-services:
    pg-service:
        Хранит в себе пользователей и информацию о них
    redis:
        Хранит в себе информацию о текущий выложенных видео чтобы пользователь по веб соекету мог сразу узнать о видео
        Также используется для хранения сгенерированных хешей для вебсокетов юзеров

services/
    web/
        Стек:
            Использует React

        pages:
            loading-menu.tsx:
                Отвечает за загрузку между страницами

            starting-menu/
                register-menu/
                    component.tsx:
                        Регистрация UI
                    
                    handler.ts:
                        Работа регистрации

                login-menu/
                    component.tsx:
                        Логин UI
                    
                    handler.ts:
                        Работа логина
            
            platform/
                video-menu/
                    platform-menu.tsx:
                        Отвечает за весь дизайн платформы с посика (Search bar) 
                    
                    platform-menu-handler.ts:
                        Отвечает за работу хендлера
                
                video-upload-menu/
                    upload-menu.tsx:
                        Отвечает за дизайн выкладывания видео
                        Получает картинку если есть название для видео
                    
                    upload-menu-handler.ts:
                        Отвечает за работу выкладывания видео
                
    api/ 
        login-service/
            Стек: 
                TypeScript
                express
                jsonwebtoken
                pg

            Принимает запросы от пользователей чтобы те залогинились (т.e у них есть аккаунт)
            Также при заходе на сайт запрос прилетает именно к ему и он проверяет токен навалидность если не истек то пользователю не прийдется перезаходить
            Проверяет токены на ликвидность
            Проверяет у pg-service есть ли данный пользователь совпадает ли пароль, юзернейм, через промежуток не захода на аккаунт приходит код на имейл

        register-service/
            Стек: 
                TypeScript
                express
                jsonwebtoken
                pg

            Принимает запросы от пользователей чтобы те зарегались
            Выдает JWT токены
            Проверяет у pg-service есть ли данный пользователь в датабазе уже

        video-streaming-service/
            Стек:
                TypeScript
                express
                Библиотека для работы с Yandex Cloud
                jsonwebtoken
                redis

            Отвечает за выкладывание видео
            За отправление видео
            За уведомление в редисе о новом видео
            Посик видео в search bar тоже принадлижит ему

        websocket-handler-service/
            Стек:
                TypeScript
                express
                jsonwebtoken
                ws
                redis
            
            Отвечает за уведомления пользователей о новом видео слушая изменения в редисе

Work:
    Browser -> nginx -> Frontend Static
    Browser -> nginx -> register-service/login-service -> pg-service <- регистрируется или логинится
    Browser(Login)(Сразу при заходе) -> nginx -> websocket-handler-service -> redis-users <- Создается сокет 
    Browser(Login)(При выкладывании видео) -> nginx -> video-streaming-service -> yandex-cloud <- Создается видео
    Browser(Login)(При клике на видео) -> nginx -> video-streaming-service -> yandex cloud <- По http стримится видео пользователю
    websocket-handler-service -> Раз в опр время пингует пользователей if не отвечает -> redis-users -> удаляет хеш если есть такой