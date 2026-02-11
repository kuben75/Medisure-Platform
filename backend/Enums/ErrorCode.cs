namespace backend.Enums; 

public enum ErrorCode
{
    InternalServerError = 1000,      // Ogólny "nie wiem co się stało"
    DatabaseConnectionError = 1001,  // Nie można połączyć się z bazą (np. zły connection string)
    DatabaseTimeout = 1002,          // Zapytanie trwało za długo
    DatabaseIntegrityError = 1003,   // Np. próba dodania rekordu z tym samym ID (błąd klucza)
    TaskCanceled = 1004,             // Operacja anulowana przez system
    
    Unauthorized = 2001,             // Nie jesteś zalogowany
    Forbidden = 2002,                // Jesteś zalogowany, ale nie masz roli Admina
    AccountLocked = 2003,            // Konto zablokowane
    InvalidTwoFactorCode = 2004,     // Nieprawidłowy kod 2FA
    InvalidCredentials = 2005,      // Nieprawidłowy email lub hasło
    AccountNotActive = 2006,          // Konto nieaktywne (np. niepotwierdzony email)
    BusinessRuleViolation = 2007,     // Naruszenie reguły biznesowej (np. próba zakupu B2B przez API)
    
    ValidationError = 3001,          // Źle wypełniony formularz
    NotFound = 3004,                 // Nie znaleziono zasobu (np. ID usera)
    
    EmailSendingFailed = 4001,       // SMTP padło
    PdfGenerationFailed = 4002       // Błąd biblioteki PDF
}