namespace backend.Helpers;

public static class EmailTemplates
{
    private static string GetHtmlLayout(string preheader, string content)
    {
        var year = DateTime.Now.Year;
        return $@"
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='utf-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
            <title>Medisure Notification</title>
        </head>
        <body style='margin: 0; padding: 0; background-color: #f3f4f6; font-family: ""Segoe UI"", Tahoma, Geneva, Verdana, sans-serif;'>
            <table width='100%' border='0' cellspacing='0' cellpadding='0' style='background-color: #f3f4f6; padding: 40px 0;'>
                <tr>
                    <td align='center'>
                        <div style='display:none;font-size:1px;color:#333333;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;'>
                            {preheader}
                        </div>

                        <table width='600' border='0' cellspacing='0' cellpadding='0' style='background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); max-width: 600px; width: 100%;'>
                            
                            <tr>
                                <td align='center' style='padding: 30px 40px; border-bottom: 1px solid #f0f0f0; background-color: #ffffff;'>
                                    <h2 style='color: #4E61F6; margin: 0; font-size: 26px; letter-spacing: -0.5px; font-weight: 800;'>
                                        Medisure<span style='color: #1f2937;'>.pl</span>
                                    </h2>
                                </td>
                            </tr>

                            <tr>
                                <td style='padding: 40px 40px 50px 40px;'>
                                    {content}
                                </td>
                            </tr>

                            <tr>
                                <td style='background-color: #f9fafb; padding: 20px 40px; text-align: center; border-top: 1px solid #f0f0f0;'>
                                    <p style='color: #9ca3af; font-size: 12px; margin: 0 0 5px 0;'>
                                        Wiadomość wygenerowana automatycznie. Prosimy nie odpowiadać na ten adres.
                                    </p>
                                    <p style='color: #d1d5db; font-size: 12px; margin: 0;'>
                                        &copy; {year} Medisure Polska Sp. z o.o. Wszelkie prawa zastrzeżone.
                                    </p>
                                    <div style='margin-top: 10px;'>
                                        <a href='#' style='color: #9ca3af; text-decoration: none; font-size: 11px; margin: 0 5px;'>Regulamin</a>
                                        <a href='#' style='color: #9ca3af; text-decoration: none; font-size: 11px; margin: 0 5px;'>Polityka Prywatności</a>
                                        <a href='#' style='color: #9ca3af; text-decoration: none; font-size: 11px; margin: 0 5px;'>Kontakt</a>
                                    </div>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>";
    }
    
    private static string GetButton(string text, string link, string color = "#4E61F6")
    {
        return $@"
        <table width='100%' border='0' cellspacing='0' cellpadding='0' style='margin-top: 30px; margin-bottom: 30px;'>
            <tr>
                <td align='center'>
                    <a href='{link}' style='background-color: {color}; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 10px rgba(0,0,0,0.15); font-family: sans-serif;'>
                        {text} &rarr;
                    </a>
                </td>
            </tr>
        </table>
        <p style='color: #9ca3af; font-size: 12px; text-align: center; margin-top: 10px;'>
            Jeśli przycisk nie działa, skopiuj link:<br>
            <a href='{link}' style='color: {color}; text-decoration: none;'>{link}</a>
        </p>";
    }
    

    public static string GetBaseTemplate(string title, string message, string buttonText, string buttonLink)
    {
        var content = $@"
            <h1 style='color: #1f2937; font-size: 24px; margin-bottom: 20px; text-align: center;'>{title}</h1>
            <p style='color: #4b5563; font-size: 16px; line-height: 1.6; text-align: center;'>{message}</p>
            {GetButton(buttonText, buttonLink)}";

        return GetHtmlLayout(title, content);
    }

    public static string GetChatMessageNotification(string message, string chatLink)
    {
        var content = $@"
            <h3 style='color: #1f2937; margin: 0 0 15px 0; font-size: 20px;'>Dzień dobry! 👋</h3>
            <p style='color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 25px;'>
                Otrzymałeś nową wiadomość od naszego konsultanta na czacie.
            </p>
            <div style='background-color: #F8FAFC; border-left: 4px solid #4E61F6; border-radius: 4px; padding: 20px; margin-bottom: 20px;'>
                <p style='margin: 0; color: #374151; font-style: italic; font-size: 15px; line-height: 1.6;'>
                    ""{message}""
                </p>
            </div>
            {GetButton("Odpowiedz na czacie", chatLink)}";

        return GetHtmlLayout("Nowa wiadomość na czacie", content);
    }

    public static string GetEmailChangeConfirmation(string firstName, string newEmail, string confirmLink)
    {
        var content = $@"
            <div style='text-align: center;'>
                <div style='width: 60px; height: 60px; background-color: #DBEAFE; color: #4E61F6; border-radius: 50%; line-height: 60px; font-size: 30px; margin: 0 auto 20px auto;'>✉️</div>
                <h1 style='color: #1f2937; font-size: 24px; margin-bottom: 15px;'>Zmiana adresu e-mail</h1>
                <p style='color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 20px;'>
                    Cześć <strong>{firstName}</strong>,<br>
                    Otrzymaliśmy prośbę o zmianę adresu e-mail na: <strong>{newEmail}</strong>.
                </p>
                {GetButton("Potwierdź zmianę", confirmLink)}
                <p style='color: #9ca3af; font-size: 13px; margin-top: 20px;'>
                    Jeśli to nie Ty zleciłeś tę zmianę, zignoruj tę wiadomość – Twój stary e-mail pozostanie aktywny.
                </p>
            </div>";

        return GetHtmlLayout("Potwierdź zmianę e-maila", content);
    }

    public static string GetSecurityAlert(string firstName, string newEmail)
    {
        var content = $@"
            <div style='text-align: center;'>
                <div style='width: 60px; height: 60px; background-color: #FFF7ED; color: #F59E0B; border-radius: 50%; line-height: 60px; font-size: 30px; margin: 0 auto 20px auto;'>⚠️</div>
                <h1 style='color: #92400E; font-size: 24px; margin-bottom: 15px;'>Alert bezpieczeństwa</h1>
                <p style='color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 20px;'>
                    Witaj <strong>{firstName}</strong>. Wykryliśmy prośbę o zmianę e-maila Twojego konta na: <strong>{newEmail}</strong>.
                </p>
                <div style='background-color: #FEF3C7; border: 1px solid #FCD34D; border-radius: 8px; padding: 15px; margin: 20px 0; text-align: left;'>
                    <p style='margin: 0; color: #92400E; font-weight: bold; font-size: 14px;'>To nie Ty?</p>
                    <p style='margin: 5px 0 0 0; color: #78350F; font-size: 14px;'>
                        Ktoś może znać Twoje hasło. Skontaktuj się z nami i natychmiast zmień hasło do konta.
                    </p>
                </div>
            </div>";

        return GetHtmlLayout("Alert bezpieczeństwa - zmiana danych", content);
    }

    public static string GetAccountLockedAlert(string firstName, string reason, string supportLink)
    {
        var content = $@"
            <div style='text-align: center;'>
                <h1 style='color: #991B1B; font-size: 24px; margin-bottom: 15px;'>Konto Zablokowane</h1>
                <p style='color: #4b5563; font-size: 16px; line-height: 1.6;'>
                    Witaj <strong>{firstName}</strong>. Twój dostęp do serwisu Medisure został tymczasowo zablokowany przez administratora.
                </p>
                <div style='background-color: #F3F4F6; padding: 15px; margin: 25px 0; border-radius: 8px;'>
                    <p style='margin: 0; font-size: 12px; text-transform: uppercase; color: #6B7280; font-weight: bold; letter-spacing: 1px;'>Powód blokady</p>
                    <p style='margin: 5px 0 0 0; color: #1F2937; font-weight: 600; font-size: 16px;'>{reason}</p>
                </div>
                {GetButton("Skontaktuj się z nami", supportLink, "#374151")}
            </div>";

        return GetHtmlLayout("Twoje konto zostało zablokowane", content);
    }

    public static string GetAccountUnlockedNotification(string firstName, string loginLink)
    {
        var content = $@"
            <div style='text-align: center;'>
                <div style='width: 60px; height: 60px; background-color: #D1FAE5; color: #059669; border-radius: 50%; 
                    line-height: 60px; font-size: 30px; margin: 0 auto 20px auto;'>✓</div>
                <h1 style='color: #065F46; font-size: 24px; margin-bottom: 15px;'>Konto Odblokowane</h1>
                <p style='color: #4b5563; font-size: 16px; line-height: 1.6;'>
                    Świetne wieści, <strong>{firstName}</strong>! Blokada Twojego konta została zdjęta. 
                    Możesz już w pełni korzystać z serwisu.
                </p>
                {GetButton("Zaloguj się teraz", loginLink, "#059669")}
            </div>";

        return GetHtmlLayout("Konto zostało odblokowane", content);
    }

    public static string GetContactConfirmation(string name, string topic)
    {
        var content = $@"
            <div style='text-align: center;'>
                <div style='width: 60px; height: 60px; background-color: #F3F4F6; color: #4E61F6; border-radius: 50%; line-height: 60px; font-size: 30px; margin: 0 auto 20px auto;'>📞</div>
                <h1 style='color: #1f2937; font-size: 24px; margin-bottom: 15px;'>Zgłoszenie przyjęte</h1>
                <p style='color: #4b5563; font-size: 16px; line-height: 1.6;'>
                    Cześć <strong>{name}</strong>! Dziękujemy za kontakt.
                </p>
                <div style='margin: 20px 0; text-align: left; background-color: #FAFAFA; padding: 20px; border-radius: 8px; border: 1px solid #E5E7EB;'>
                    <p style='margin: 0; color: #6B7280; font-size: 12px; text-transform: uppercase; font-weight: bold;'>Temat zgłoszenia:</p>
                    <p style='margin: 5px 0 0 0; color: #111827; font-weight: 600;'>{topic}</p>
                </div>
                <p style='color: #6B7280; font-size: 14px;'>
                    Nasz zespół skontaktuje się z Tobą w ciągu 24 godzin.
                </p>
            </div>";

        return GetHtmlLayout($"Zgłoszenie: {topic}", content);
    }

    public static string GetPurchaseConfirmation(string firstName, string transactionId, string paymentMethod, string packageName, string priceString, string startDate, string endDate, string pesel, string street, string house, string zip, string city, string termsLink, string privacyLink)
    {
        var content = $@"
            <div style='text-align: center;'>
                <div style='width: 60px; height: 60px; background-color: #D1FAE5; color: #059669; border-radius: 50%; line-height: 60px; font-size: 30px; margin: 0 auto 20px auto;'>✓</div>
                <h1 style='color: #1f2937; font-size: 24px; margin-bottom: 10px;'>Dziękujemy za zamówienie!</h1>
                <p style='color: #6b7280; margin-bottom: 30px;'>Cześć {firstName}, Twoja polisa jest już aktywna.</p>
            </div>

            <div style='background-color: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 12px; overflow: hidden;'>
                <table width='100%' border='0' cellspacing='0' cellpadding='15'>
                    <tr style='border-bottom: 1px solid #E5E7EB;'>
                        <td style='color: #6B7280; font-size: 14px;'>Nr transakcji</td>
                        <td align='right' style='color: #111827; font-weight: bold; font-size: 14px;'>{transactionId}</td>
                    </tr>
                    <tr style='border-bottom: 1px solid #E5E7EB;'>
                        <td style='color: #6B7280; font-size: 14px;'>Pakiet</td>
                        <td align='right' style='color: #4E61F6; font-weight: bold; font-size: 14px;'>{packageName}</td>
                    </tr>
                    <tr style='border-bottom: 1px solid #E5E7EB;'>
                        <td style='color: #6B7280; font-size: 14px;'>Okres ochrony</td>
                        <td align='right' style='color: #111827; font-size: 14px;'>{startDate} - {endDate}</td>
                    </tr>
                    <tr style='background-color: #F3F4F6;'>
                        <td style='color: #111827; font-weight: bold; font-size: 16px;'>RAZEM</td>
                        <td align='right' style='color: #4E61F6; font-weight: 800; font-size: 18px;'>{priceString}</td>
                    </tr>
                </table>
            </div>

            <div style='margin-top: 30px;'>
                <p style='color: #6B7280; font-size: 12px; text-transform: uppercase; font-weight: bold; margin-bottom: 10px;'>Dane ubezpieczonego</p>
                <p style='color: #374151; font-size: 14px; line-height: 1.6; background-color: #ffffff; border: 1px dashed #D1D5DB; padding: 15px; border-radius: 8px;'>
                    <strong>{firstName}</strong><br>
                    PESEL: {pesel}<br>
                    ul. {street} {house}, {zip} {city}
                </p>
            </div>";

        return GetHtmlLayout("Potwierdzenie zakupu polisy", content);
    }

    public static string GetSubscriptionExpiring(string firstName, string packageName, string endDate, string actionLink)
    {
        var content = $@"
            <div style='text-align: center;'>
                <div style='width: 60px; height: 60px; background-color: #FFF7ED; color: #F59E0B; border-radius: 50%; line-height: 60px; font-size: 30px; margin: 0 auto 20px auto;'>⏳</div>
                <h1 style='color: #1f2937; font-size: 24px; margin-bottom: 15px;'>Ochrona wkrótce wygasa</h1>
                <p style='color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 25px;'>
                    Cześć <strong>{firstName}</strong>!<br>
                    Twój pakiet <strong>{packageName}</strong> wygasa dnia <span style='color: #EF4444; font-weight: bold;'>{endDate}</span>.
                </p>
                <p style='color: #4b5563; font-size: 14px; margin-bottom: 10px;'>
                    Nie pozwól, aby Twoja opieka zdrowotna przepadła. Przedłuż pakiet już teraz.
                </p>
                {GetButton("Przedłuż teraz", actionLink, "#EA580C")}
            </div>";

        return GetHtmlLayout("Twoja polisa wkrótce wygasa", content);
    }
}