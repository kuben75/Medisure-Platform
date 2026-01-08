namespace backend.Helpers;

public static class EmailTemplates
{
    public static string GetBaseTemplate(string title, string message, string buttonText, string buttonLink)
    {
        return $@"
            <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #ffffff;'>
                <div style='text-align: center; margin-bottom: 30px;'>
                    <h2 style='color: #4E61F6; margin: 0;'>Medisure.pl</h2>
                </div>
                <div style='padding: 20px; background-color: #fafafa; border-radius: 8px;'>
                    <h1 style='color: #333; font-size: 24px; margin-bottom: 20px;'>{title}</h1>
                    <p style='color: #555; line-height: 1.6; font-size: 16px;'>{message}</p>
                    <div style='text-align: center; margin: 30px 0;'>
                        <a href='{buttonLink}' style='background-color: #4E61F6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px; display: inline-block;'>{buttonText}</a>
                    </div>
                    <p style='color: #999; font-size: 12px; margin-top: 30px;'>Jeśli przycisk nie działa, skopiuj poniższy link do przeglądarki:<br/>{buttonLink}</p>
                </div>
                <div style='text-align: center; margin-top: 20px; color: #aaa; font-size: 12px;'>
                    &copy; {DateTime.Now.Year} Medisure Sp. z o.o. Wszystkie prawa zastrzeżone.
                </div>
            </div>";
    }
    public static string GetChatMessageNotification(string message, string chatLink)
    {
        return $@"
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset='utf-8'>
                <title>Nowa wiadomość</title>
            </head>
            <body style='margin: 0; padding: 0; background-color: #f3f4f6; font-family: ""Segoe UI"", Tahoma, Geneva, Verdana, sans-serif;'>
                <table width='100%' border='0' cellspacing='0' cellpadding='0' style='background-color: #f3f4f6; padding: 40px 0;'>
                    <tr>
                        <td align='center'>
                            <table width='600' border='0' cellspacing='0' cellpadding='0' style='background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);'>
                                <tr>
                                    <td align='center' style='padding: 30px 40px; border-bottom: 1px solid #f0f0f0;'>
                                        <h2 style='color: #4E61F6; margin: 0; font-size: 24px; letter-spacing: -0.5px;'>Medisure<span style='color: #1f2937;'>.pl</span></h2>
                                    </td>
                                </tr>
                                <tr>
                                    <td style='padding: 40px;'>
                                        <h3 style='color: #1f2937; margin: 0 0 15px 0; font-size: 20px;'>Dzień dobry! 👋</h3>
                                        <p style='color: #4b5563; font-size: 16px; line-height: 1.5; margin-bottom: 25px;'>
                                            Otrzymałeś nową wiadomość od naszego konsultanta na czacie.
                                        </p>
                                        <div style='background-color: #F8FAFC; border-left: 4px solid #4E61F6; border-radius: 4px; padding: 20px; margin-bottom: 30px;'>
                                            <p style='margin: 0; color: #374151; font-style: italic; font-size: 15px; line-height: 1.6;'>
                                                ""{message}""
                                            </p>
                                        </div>
                                        <table width='100%' border='0' cellspacing='0' cellpadding='0'>
                                            <tr>
                                                <td align='center'>
                                                    <a href='{chatLink}' style='background-color: #4E61F6; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 15px rgba(78, 97, 246, 0.3);'>
                                                        Odpowiedz na czacie &rarr;
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td style='background-color: #f9fafb; padding: 20px 40px; text-align: center;'>
                                        <p style='color: #9ca3af; font-size: 12px; margin: 0 0 5px 0;'>
                                            Wiadomość wysłana automatycznie.
                                        </p>
                                        <p style='color: #d1d5db; font-size: 12px; margin: 0;'>
                                            &copy; {DateTime.Now.Year} Medisure Polska Sp. z o.o.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>";
    }
    public static string GetEmailChangeConfirmation(string firstName, string newEmail, string confirmLink)
    {
        return $@"
            <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;'>
                <div style='background-color: #4E61F6; padding: 30px; text-align: center;'>
                    <h1 style='color: #ffffff; margin: 0; font-size: 24px;'>Potwierdź zmianę e-maila</h1>
                </div>
                <div style='padding: 30px; text-align: center;'>
                    <p style='color: #333; font-size: 16px; margin-bottom: 20px;'>
                        Cześć <strong>{firstName}</strong>,<br>
                        Otrzymaliśmy prośbę o zmianę adresu e-mail powiązanego z Twoim kontem Medisure.
                    </p>
                    <p style='color: #555; font-size: 14px; margin-bottom: 30px;'>
                        Aby potwierdzić nowy adres <strong>{newEmail}</strong>, kliknij poniższy przycisk:
                    </p>
                    <a href='{confirmLink}' style='background-color: #4E61F6; color: white; text-decoration: none; padding: 15px 30px; border-radius: 50px; font-weight: bold; font-size: 16px; display: inline-block;'>Potwierdź zmianę</a>
                    <p style='color: #999; font-size: 12px; margin-top: 30px;'>
                        Jeśli to nie Ty zleciłeś tę zmianę, zignoruj tę wiadomość.
                    </p>
                </div>
            </div>";
    }

    public static string GetSecurityAlert(string firstName, string newEmail)
    {
        return $@"
            <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;'>
                <div style='background-color: #F59E0B; padding: 30px; text-align: center;'>
                    <h1 style='color: #ffffff; margin: 0; font-size: 24px;'>Alert bezpieczeństwa</h1>
                </div>
                <div style='padding: 30px;'>
                    <p style='color: #333; font-size: 16px;'>Witaj, <strong>{firstName}</strong>.</p>
                    <p style='color: #333; font-size: 16px;'>
                        Zlecono zmianę adresu e-mail Twojego konta na: <strong>{newEmail}</strong>.
                    </p>
                    <p style='color: #333; font-size: 16px;'>
                        Jeśli to Twoja decyzja – nie musisz nic robić. Zmiana nastąpi po potwierdzeniu linku wysłanego na nowy adres.
                    </p>
                    <div style='background-color: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin: 20px 0;'>
                        <p style='margin: 0; color: #92400E; font-weight: bold;'>To nie Ty?</p>
                        <p style='margin: 5px 0 0 0; color: #92400E; font-size: 14px;'>Skontaktuj się z nami natychmiast i zmień hasło do konta.</p>
                    </div>
                </div>
            </div>";
    }
    public static string GetAccountLockedAlert(string firstName, string reason, string supportLink)
    {
        return $@"
            <div style='font-family: ""Segoe UI"", Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;'>
                <div style='background-color: #FEE2E2; padding: 30px; text-align: center; border-bottom: 1px solid #FECACA;'>
                    <div style='background-color: #EF4444; color: white; width: 60px; height: 60px; border-radius: 50%; line-height: 60px; font-size: 30px; margin: 0 auto 15px auto;'>!</div>
                    <h1 style='color: #991B1B; margin: 0; font-size: 24px;'>Konto Zablokowane</h1>
                </div>
                <div style='padding: 40px 30px;'>
                    <p style='color: #374151; font-size: 16px; line-height: 1.6; margin-top: 0;'>Witaj, <strong>{firstName}</strong>.</p>
                    <p style='color: #374151; font-size: 16px; line-height: 1.6;'>
                        Informujemy, że Twój dostęp do serwisu Medisure został zablokowany przez administratora.
                    </p>
                    <div style='background-color: #F3F4F6; border-left: 4px solid #6B7280; padding: 15px; margin: 25px 0;'>
                        <p style='margin: 0; font-size: 12px; text-transform: uppercase; color: #6B7280; font-weight: bold;'>Powód blokady:</p>
                        <p style='margin: 5px 0 0 0; color: #1F2937; font-weight: 500;'>{reason}</p>
                    </div>
                    <p style='color: #374151; font-size: 14px; line-height: 1.6;'>
                        Jeśli uważasz, że to pomyłka lub chcesz wyjaśnić sytuację, skontaktuj się z naszym Biurem Obsługi Klienta.
                    </p>
                    <div style='text-align: center; margin-top: 30px;'>
                        <a href='{supportLink}' style='background-color: #374151; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; font-size: 14px;'>Skontaktuj się z nami</a>
                    </div>
                </div>
                <div style='background-color: #F9FAFB; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;'>
                    <p style='margin: 0; color: #9CA3AF; font-size: 12px;'>&copy; {DateTime.Now.Year} Medisure Sp. z o.o.</p>
                </div>
            </div>";
    }

    public static string GetAccountUnlockedNotification(string firstName, string loginLink)
    {
        return $@"
            <div style='font-family: ""Segoe UI"", Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;'>
                <div style='background-color: #4E61F6; padding: 30px; text-align: center;'>
                    <div style='background-color: #ffffff; color: #4E61F6; width: 60px; height: 60px; border-radius: 50%; line-height: 60px; font-size: 30px; margin: 0 auto 15px auto;'>✓</div>
                    <h1 style='color: #ffffff; margin: 0; font-size: 24px;'>Konto Odblokowane</h1>
                </div>
                <div style='padding: 40px 30px;'>
                    <p style='color: #374151; font-size: 16px; line-height: 1.6; margin-top: 0;'>Witaj, <strong>{firstName}</strong>!</p>
                    <p style='color: #374151; font-size: 16px; line-height: 1.6;'>
                        Mamy dobre wieści. Blokada Twojego konta została zdjęta przez administratora. Możesz już w pełni korzystać z serwisu Medisure.
                    </p>
                    <div style='text-align: center; margin-top: 35px; margin-bottom: 20px;'>
                        <a href='{loginLink}' style='background-color: #4E61F6; color: white; text-decoration: none; padding: 14px 28px; border-radius: 50px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(78, 97, 246, 0.25);'>Zaloguj się teraz</a>
                    </div>
                    <p style='color: #6B7280; font-size: 14px; text-align: center; margin-top: 30px;'>
                        Jeśli przycisk nie działa, przejdź tutaj:<br>
                        <a href='{loginLink}' style='color: #4E61F6;'>{loginLink}</a>
                    </p>
                </div>
                <div style='background-color: #F9FAFB; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;'>
                    <p style='margin: 0; color: #9CA3AF; font-size: 12px;'>&copy; {DateTime.Now.Year} Medisure Sp. z o.o.</p>
                </div>
            </div>";
    }
    public static string GetContactConfirmation(string name, string topic)
    {
        return $@"
            <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;'>
                <div style='background-color: #4E61F6; padding: 30px; text-align: center;'>
                    <h1 style='color: #ffffff; margin: 0; font-size: 24px;'>Zgłoszenie przyjęte</h1>
                </div>
                <div style='padding: 30px;'>
                    <p style='color: #333; font-size: 16px;'>Cześć <strong>{name}</strong>,</p>
                    <p style='color: #333; font-size: 16px;'>
                        Dziękujemy za kontakt. Twoje zapytanie w sprawie: <strong>{topic}</strong> zostało pomyślnie zarejestrowane w naszym systemie.
                    </p>
                    <p style='color: #555; font-size: 14px; margin-top: 20px;'>
                        Nasz zespół przeanalizuje Twoją wiadomość i skontaktuje się z Tobą w ciągu najbliższych 24 godzin.
                    </p>
                    <hr style='border: 0; border-top: 1px solid #eee; margin: 30px 0;'>
                    <p style='color: #999; font-size: 12px; text-align: center;'>
                        To jest wiadomość automatyczna, prosimy na nią nie odpowiadać.
                    </p>
                </div>
            </div>";
    }
    
    public static string GetPurchaseConfirmation(string firstName, string transactionId, string paymentMethod, string packageName, string priceString, string startDate, string endDate, string pesel, string street, string house, string zip, string city, string termsLink, string privacyLink)
    {
        return $@"
        <div style='font-family: Arial, sans-serif; background-color: #f3f4f6; padding: 40px 0;'>
            <div style='max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);'>
                <div style='background-color: #4E61F6; padding: 40px 0; text-align: center;'>
                    <h1 style='color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;'>MEDISURE</h1>
                </div>
                <div style='padding: 40px;'>
                    <div style='text-align: center; margin-bottom: 30px;'>
                        <div style='width: 60px; height: 60px; background-color: #d1fae5; border-radius: 50%; display: inline-block; line-height: 60px; text-align: center; margin-bottom: 20px;'>
                            <span style='font-size: 30px; color: #059669;'>✓</span>
                        </div>
                        <h2 style='color: #1f2937; margin: 0 0 10px 0; font-size: 24px;'>Dziękujemy za zamówienie!</h2>
                        <p style='color: #6b7280; margin: 0;'>Cześć {firstName}, Twoja polisa jest już aktywna.</p>
                    </div>
                    <div style='background-color: #f9fafb; border-radius: 12px; padding: 25px;'>
                        <p><strong>Nr transakcji:</strong> {transactionId}</p>
                        <p><strong>Pakiet:</strong> {packageName}</p>
                        <p><strong>Cena:</strong> {priceString}</p>
                        <p><strong>Okres:</strong> {startDate} - {endDate}</p>
                        <hr style='border: 0; border-top: 1px solid #e5e7eb; margin: 15px 0;'>
                        <p style='font-weight: bold;'>RAZEM: <span style='color: #4E61F6;'>{priceString}</span></p>
                    </div>
                    <div style='margin-top: 30px;'>
                        <h3 style='border-left: 4px solid #4E61F6; padding-left: 10px;'>Dane nabywcy</h3>
                        <p>
                            {firstName}<br>
                            PESEL: {pesel}<br>
                            {street} {house}, {zip} {city}
                        </p>
                    </div>
                </div>
                <div style='background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #9ca3af;'>
                    <a href='{termsLink}'>Regulamin</a> | <a href='{privacyLink}'>Polityka Prywatności</a>
                </div>
            </div>
        </div>";
    }

    public static string GetSubscriptionExpiring(string firstName, string packageName, string endDate, string actionLink)
    {
        return $@"
        <div style='font-family: Arial, sans-serif; background-color: #f3f4f6; padding: 40px 0;'>
            <div style='max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden;'>
                <div style='background-color: #4E61F6; padding: 30px 0; text-align: center;'>
                    <h1 style='color: #ffffff; margin: 0;'>MEDISURE</h1>
                </div>
                <div style='padding: 40px; text-align: center;'>
                    <div style='width: 60px; height: 60px; background-color: #FFF7ED; border-radius: 50%; display: inline-block; line-height: 60px; margin-bottom: 20px;'>
                        <span style='font-size: 30px;'>⏳</span>
                    </div>
                    <h2 style='margin-bottom: 15px;'>Twoja ochrona wkrótce wygasa</h2>
                    <p style='color: #6b7280; margin-bottom: 25px;'>
                        Cześć <strong>{firstName}</strong>!<br>
                        Twój pakiet <strong>{packageName}</strong> wygasa dnia <strong>{endDate}</strong>.
                    </p>
                    <a href='{actionLink}' style='background-color: #4E61F6; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 50px; font-weight: bold; display: inline-block;'>
                        Zaloguj się i przedłuż &rarr;
                    </a>
                </div>
            </div>
        </div>";
    }
}