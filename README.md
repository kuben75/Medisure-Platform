# 🛡️ Raport Techniczny: Ulepszenia Systemu i Bezpieczeństwa (Backend)

Poniższe zestawienie dokumentuje kluczowe zmiany wdrożone w architekturze backendowej systemu Medisure. Skupiono się na zapewnieniu maksymalnej stabilności, odporności na ataki typu *spojrzenie z zewnątrz* oraz pełnej spójności danych biznesowych.

---

## 🧪 Gwarancja Jakości: Testy Jednostkowe (Unit Testing)
Wprowadzono kompleksową strategię testów, która czyni system "pancernym" na regresję kodu.

* **101 Testów Jednostkowych:** Całość kluczowej logiki biznesowej została pokryta testami (**xUnit + Moq + FluentAssertions**).
* **Wydajność Ekstremalna:** Dzięki izolacji zależności (mockowanie) i bazie danych w pamięci (**InMemory**), komplet **101 testów wykonuje się w ~540ms**.
* **Pokrycie Systemów Krytycznych:**
    * **AuthController (~35 testów):** Rejestracja, logowanie, pełny cykl 2FA, resetowanie haseł.
    * **SubscriptionService (~25 testów):** Algorytmy wyceny składek względem wieku, walidacja okresów ubezpieczenia.
    * **AdminController:** Testy hierarchii uprawnień i bezpieczeństwa operacji na danych użytkowników.

---

##  Bezpieczeństwo i Tożsamość (Auth & Account)
Zastosowano podejście *Defense in Depth* w celu ochrony kont użytkowników.

* **Zaostrzone 2FA (Stateless Security):** Wyeliminowano lukę pozwalającą na autoryzację samym kodem 2FA. System wymaga teraz **jednoczesnego przesłania hasła i kodu**, co zabezpiecza przed atakami typu session hijacking.
* **Ochrona Brute-Force:** Wdrożono mechanizm `Lockout`. Po 5 nieudanych próbach logowania konto zostaje zablokowane na poziomie bazy danych.
* **Bezpieczna Zmiana Danych Wrażliwych:** Zmiana adresu e-mail wymaga teraz potwierdzenia hasłem oraz kodem 2FA, chroniąc użytkownika przed nieautoryzowanym przejęciem konta przy aktywnej sesji.
* **Case-Insensitive Identity:** System jest odporny na wielkość liter w loginach i rolach, co zapobiega powstawaniu "martwych pól" w uprawnieniach.

---

##  Ochrona przed nadużyciami (Anti-Spam & Rate Limiting)
* **Contact Controller:** Wprowadzono *Cooldown* na wysyłanie wiadomości kontaktowych, zapobiegając floodowaniu skrzynek mailowych.
* **Auth Throttling:** Nałożono limity czasowe na generowanie linków do resetu hasła oraz kodów 2FA (ochrona przed spamowaniem ofiar i kosztami API).

---

##  Zapobieganie IDOR (Insecure Direct Object References)
Wprowadzono rygorystyczną kontrolę własności zasobów, aby uniemożliwić dostęp do danych innych osób:
* **Subscriptions:** Brak możliwości pobrania polisy PDF lub anulowania subskrypcji innego użytkownika poprzez zmianę ID w żądaniu.
* **Favorites & Notifications:** Pełna izolacja danych – użytkownik widzi tylko to, co należy do jego `UserId` zaszytego w tokenie JWT.
* **Reviews:** Zablokowano możliwość edycji lub usunięcia opinii przez kogokolwiek poza autorem lub administratorem.

---

##  Administracja i Audyt (RBAC)
* **Hierarchia Uprawnień:** Zaimplementowano mechanizm `CanManageUser` – zwykły Admin nie ma technicznej możliwości modyfikacji konta **SuperAdmina**.
* **Safety-Lock:** Administratorzy mają zablokowaną możliwość usunięcia lub zablokowania samych siebie (ochrona przed błędem ludzkim).
* **System Logs (Audit Trail):** Każda istotna zmiana (zmiana roli, blokada, edycja danych) jest logowana z pełnym kontekstem: *Kto, Co, Komu, Kiedy*.

---

## ⚖️ Logika Biznesowa i Integralność Danych
* **Verified Purchase Reviews:** System pozwala wystawić opinię o pakiecie tylko tym użytkownikom, którzy faktycznie go posiadają/posiadali.
* **Dynamiczne Przeliczanie Statystyk:** Średnia ocen pakietu jest automatycznie aktualizowana przy dodaniu lub usunięciu recenzji (brak "widmowych" ocen).
* **Write-Once BirthDate:** Data urodzenia (kluczowa dla wyceny polisy) po pierwszym wprowadzeniu zostaje zablokowana do edycji, co zapobiega manipulowaniu cenami składek.
* **Relational Integrity:** Zablokowano możliwość usunięcia pakietu z oferty, jeśli jest on przypisany do jakiejkolwiek aktywnej subskrypcji.

---

## 💬 Komunikacja SignalR (Chat)
* **Thread Safety:** Wykorzystanie `ConcurrentDictionary` w zarządzaniu połączeniami zapewnia stabilność przy dużej liczbie jednoczesnych użytkowników.
* **Obsługa Gości:** Bezpieczne zarządzanie użytkownikami anonimowymi bez naruszania integralności relacji SQL.
* **Izolacja Historii:** Fizyczne rozdzielenie strumieni danych – użytkownik ma dostęp wyłącznie do swojej historii czatu z konsultantem.

---

## 🛠️ Infrastruktura i Standardy Kodowania
* **Global Exception Middleware:** System nie zwraca stack trace’ów do klienta. Zamiast tego mapuje błędy na bezpieczne obiekty JSON z dedykowanymi kodami `ErrorCode`.
* **PostgreSQL UTC Compliance:** Wymuszono format UTC dla wszystkich operacji na datach, eliminując błędy synchronizacji stref czasowych.
* **Serilog Data Masking:** Automatyczne ukrywanie danych wrażliwych w logach systemowych zgodnie z wymogami ochrony danych osobowych.

---

### 💻 Stack Techniczny Backend
| Komponent | Technologia |
| :--- | :--- |
| **Framework** | .NET 8 (LTS) |
| **Baza Danych** | PostgreSQL 15 |
| **Komunikacja** | SignalR, REST API |
| **Dokumentacja** | Swagger / OpenAPI |
| **Testy** | xUnit, Moq, FluentAssertions |

---